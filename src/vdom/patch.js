import { isSameVnode } from ".";

/**
 * 将虚拟节点转为真实节点后插入到元素中
 * @param {*} el    当前真实元素 id#app
 * @param {*} vnode 虚拟节点
 * @returns         新的真实元素
 */
export function patch(oldVnode, vnode) {
  // console.log(oldVnode, vnode)
  const isRealElement = oldVnode.nodeType;  // 元素的节点类型是1，虚拟节点无此属性
  if(isRealElement){// 元素代表是真实节点
    // 1，根据虚拟节点创建真实节点
    const elm = createElm(vnode);
    console.log("createElm", elm);

    // 2，使用真实节点替换掉老节点
    // 找到元素的父亲节点
    const parentNode = oldVnode.parentNode;
    // 找到老节点的下一个兄弟节点（nextSibling 若不存在将返回 null）
    const nextSibling = oldVnode.nextSibling;
    // 将新节点elm插入到老节点el的下一个兄弟节点nextSibling的前面
    // 备注：若nextSibling为 null，insertBefore 等价与 appendChild
    parentNode.insertBefore(elm, nextSibling); 
    // 删除老节点 el
    parentNode.removeChild(oldVnode);
    return elm;
  }else{
    // diff：新老虚拟节点比对
    // console.log(oldVnode, vnode)
    if(!isSameVnode(oldVnode, vnode)){// 同级比较，不是相同节点时，不考虑复用（放弃跨层复用），直接用新的替换旧的
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }
    
    // 相同节点，就复用节点（复用老的），再更新不一样的地方（属性），注意文本要做特殊处理，文本是没有标签名的

    // 文本的处理：文本直接更新就可以，因为文本没有儿子  组件中 Vue.component（‘xxx’）这就是组件的 tag
    let el = vnode.el = oldVnode.el;  // 节点复用：将老节点el，赋值给新节点el
    if(!oldVnode.tag){  // 文本：没有标签名
      if(oldVnode.text !== vnode.text){// 文本内容变化了，更新文本内容：用新的内容更新老的内容
        return el.textContent = vnode.text;
      }
    }
    // 元素的处理：相同节点，且新老节点不都是文本时
    updateProperties(vnode, oldVnode.data);
  }
}

// 面试：虚拟节点的实现？如何将虚拟节点渲染成真实节点
export function createElm(vnode) {
  // 虚拟节点必备的三个：标签，数据，孩子
  let{tag, data, children, text, vm} = vnode;

  // vnode.el:绑定真实节点与虚拟节点的映射关系，便于后续的节点更新操作
  if(typeof tag === 'string'){ // 元素
    // 处理当前元素节点
    vnode.el = document.createElement(tag) // 创建元素的真实节点
    updateProperties(vnode, data)  // 处理元素的 data 属性
    // 处理当前元素节点的儿子：递归创建儿子的真实节点，并添加到对应的父亲中
    children.forEach(child => { // 若不存在儿子，children为空数组
      vnode.el.appendChild(createElm(child))
    });
  } else { // 文本：文本中 tag 是 undefined
    vnode.el = document.createTextNode(text)  // 创建文本的真实节点
  }
  return vnode.el;
}

// 循环 data 添加到 el 的属性上
// 后续 diff 算法时进行完善，没有考虑样式等
function updateProperties(vnode, oldProps = {} ) { 
  // 1,初次渲染，用oldProps给vnode的 el 赋值即可
  // 2,更新逻辑，拿到老的props和vnode中的 data 进行比对
  let el = vnode.el; // dom上的真实节点（上边复用老节点时已经赋值了）

  let newProps = vnode.data || {};  // 拿到新的数据

  let newStyly = newProps.style || {};
  let oldStyly = oldProps.style || {};
  //如果老的样式有，新的没有，就删掉
  for(let key in oldStyly){ // 老的样式有，新的没有，就把页面上的样式删除掉
    if(!newStyly[key]){
      el.style[key] = '';
    }
  }

  // 新旧比对：两个对象比对差异
  for(let key in newProps){ // 直接用新的盖掉老的就可以了  还要注意：老的里面有，可能新的里面没有了
    // 前后两次一样，浏览器会检测，就不会更新了，不会有性能问题
    console.log(newProps)
    if(key == 'style'){ // 新的里面有样式，直接覆盖即可
      for(let key in newStyly){ // 老的样式有，新的没有，就把页面上的样式删除掉
          el.style[key] = newStyly[key]
      }
    }else{
      el.setAttribute(key, newProps[key])
    }
  }
  // 处理老的里面有，可能新的里面没有的情况，需要再删掉
  for(let key in oldProps){
    if(!newProps[key]){
      el.removeAttribute(key)
    }
  }
}