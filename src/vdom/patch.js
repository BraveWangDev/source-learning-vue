
/**
 * 将虚拟节点转为真实节点后插入到元素中
 * @param {*} el    当前真实元素 id#app
 * @param {*} vnode 虚拟节点
 * @returns         新的真实元素
 */
export function patch(el, vnode) {
  console.log(el, vnode)
  // 1，根据虚拟节点创建真实节点
  const elm = createElm(vnode);
  console.log("createElm", elm);

  // 2，使用真实节点替换掉老节点
  // 找到元素的父亲节点
  const parentNode = el.parentNode;
  // 找到老节点的下一个兄弟节点（nextSibling 若不存在将返回 null）
  const nextSibling = el.nextSibling;
  // 将新节点elm插入到老节点el的下一个兄弟节点nextSibling的前面
  // 备注：若nextSibling为 null，insertBefore 等价与 appendChild
  parentNode.insertBefore(elm, nextSibling); 
  // 删除老节点 el
  parentNode.removeChild(el);

  return elm;
}

// 面试：虚拟节点的实现？如何将虚拟节点渲染成真实节点
function createElm(vnode) {
  // 虚拟节点必备的三个：标签，数据，孩子
  let{tag, data, children, text, vm} = vnode;

  // vnode.el:绑定真实节点与虚拟节点的映射关系，便于后续的节点更新操作
  if(typeof tag === 'string'){ // 元素
    // 处理当前元素节点
    vnode.el = document.createElement(tag) // 创建元素的真实节点
    updateProperties(vnode.el, data)  // 处理元素的 data 属性
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
function updateProperties(el, props = {} ) { 
  for(let key in props){
    el.setAttribute(key, props[key])
  }
}