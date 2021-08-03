import { isSameVnode } from ".";

/**
 * 将虚拟节点转为真实节点后插入到元素中
 * @param {*} oldVnode  老的虚拟节点
 * @param {*} vnode     新的虚拟节点
 * @returns             新的真实元素
 */
export function patch(oldVnode, vnode) {
  // console.log("patch-oldVnode", oldVnode);
  // console.log("patch-newVnode", vnode);
  const isRealElement = oldVnode.nodeType;  // 元素的节点类型是1，虚拟节点无此属性
  if (isRealElement) {// 元素代表是真实节点
    // 1，根据虚拟节点创建真实节点
    const elm = createElm(vnode);
    // console.log("createElm", elm);

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
  } else {
    console.log("patch-oldVnode", oldVnode);
    console.log("patch-newVnode", vnode);
    // diff：新老虚拟节点比对
    if (!isSameVnode(oldVnode, vnode)) {// 同级比较，不是相同节点时，不考虑复用（放弃跨层复用），直接用新的替换旧的
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }

    // 相同节点，就复用节点（复用老的），再更新不一样的地方（属性），注意文本要做特殊处理，文本是没有标签名的

    // 文本的处理：文本直接更新就可以，因为文本没有儿子  组件中 Vue.component（‘xxx’）这就是组件的 tag
    let el = vnode.el = oldVnode.el;  // 节点复用：将老节点el，赋值给新节点el
    if (!oldVnode.tag) {  // 文本：没有标签名
      if (oldVnode.text !== vnode.text) {// 文本内容变化了，更新文本内容：用新的内容更新老的内容
        return el.textContent = vnode.text;
      }else{
        // 文本没变化也结束：否则会继续进入 updateProperties处理元素，再进入情况3的updateChildren
        // 但整体影响不大，会因条件不符不执行,但做好的做法还是直接 return 掉吧
        return; 
      }
    }

    // 元素的处理：相同节点，且新老节点不都是文本时
    updateProperties(vnode, oldVnode.data);

    // 比较儿子节点
    let oldChildren = oldVnode.children || {};
    let newChildren = vnode.children || {};
    // 情况 1：老的有儿子，新的没有儿子；直接把老的 dom 元素干掉即
    if (oldChildren.length > 0 && newChildren.length == 0) {
      el.innerHTML = '';//暴力写法直接清空；更好的处理是封装removeChildNodes方法：将子节点全部删掉，因为子节点可能包含组件
      // 情况 2：老的没有儿子，新的有儿子；直接将新的插入即可
    } else if (oldChildren.length == 0 && newChildren.length > 0) {
      newChildren.forEach((child) => {// 注意：这里的child是虚拟节点，需要变为真实节点
        let childElm = createElm(child); // 根据新的虚拟节点，创建一个真实节点
        el.appendChild(childElm);// 将生成的真实节点，放入 dom
      })
      // 情况 3：新老都有儿子
    } else {  // 递归: updateChildren 内部调用 patch, patch, 内部还会调用 updateChildren (patch 方法是入口)
      updateChildren(el, oldChildren, newChildren)
    }
  }
}

function updateChildren(el, oldChildren, newChildren) {
  // vue2中的diff算法内部做了优化，尽量提升性能，实在不行再暴力比对
  // 常见情况：在列表中，新增或删除某一项（用户很少在列表的中间添加一项）

  // 声明头尾指针
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  /**
   * 根据children创建映射
   */
  function makeKeyByIndex(children) {
     let map = {}
     children.forEach((item, index)=>{
       map[item.key] = index;
     })
     return map
  }

  let mapping = makeKeyByIndex(oldChildren);

  // while 循环处理，所以 diff 算法的复杂度为O(n)，只循环一遍
  // 循环结束条件：有一方遍历完了就结束；即"老的头指针和尾指针重合"或"新的头指针和尾指针重合"
  // 备注: 此while循环中主要对4种特殊情况进行优化处理,包括：头头、尾尾、头尾、尾头
  debugger
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 当前循环开始时，先处理当前的oldStartVnode和oldEndVnode为空的情况； 原因：节点之前被移走时置空，直接跳过
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartIndex];
    }else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex];
    // 头头比较：比较新老开始节点
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // isSameVnode只能判断标签和key是否一样，但还有可能属性不一样
      // 所以还需要使用patch方法比对新老虚拟节点的属性，
      // 而patch方法是递归比对的，同时还会递归比较子节点
      patch(oldStartVnode, newStartVnode);
      // 更新新老头指针和新老头节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    // 尾尾比较：比较新老末尾节点
    }else if(isSameVnode(oldEndVnode, newEndVnode)){
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    // 头尾比较：老的头节点和新的尾节点做对比
    }else if(isSameVnode(oldStartVnode, newEndVnode)){
      // patch方法只会duff比较并更新属性，但元素的位置不会变化
      patch(oldStartVnode, newEndVnode);// diff:包括递归比儿子
      // 移动节点：将当前的节点插入到最后一个节点的下一个节点的前面去
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      // 移动指针
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    // 尾头比较
    }else if(isSameVnode(oldEndVnode, newStartVnode)){
      patch(oldEndVnode, newStartVnode);  // patch方法只会更新属性，元素的位置不会变化
      // 移动节点:将老的尾节点移动到老的头节点前面去
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);// 将尾部插入到头部
      // 移动指针
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }else{
      // 前面4种逻辑（头头、尾尾、头尾、尾头）,主要是考虑到用户使用时的一些特殊场景，但也有非特殊情况，如：乱序排序
      // 筛查当前新的头指针对应的节点在mapping中是否存在
      let moveIndex = mapping[newStartVnode.key]
      if(moveIndex == undefined){// 没有，将当前比对的新节点插入到老的头指针对用的节点前面
        // 将当前新的虚拟节点创建为真实节点，插入到老的开始节点前面
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }else{  // 有,需要复用
        // 将当前比对的老节点移动到老的头指针前面
        let moveVnode = oldChildren[moveIndex];// 从老的队列中找到可以被复用的这个节点
        // 复用：更新复用节点的属性，插入对应位置
        patch(moveVnode, newStartVnode)
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        // 由于复用的节点在oldChildren中被移走了,之前的位置要标记为空(指针移动时，跳过会使用)
        oldChildren[moveIndex] = undefined;
      }
      // 每次处理完成后，新节点的头指针都需要向后移动
      // 备注：
      // 		无论节点是否可复用，新指针都会向后移动，所以最后统一处理；
      //    节点可复用时，老节点的指针移动会在4种特殊情况中被处理完成；
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 至此，完成了相同节点的比较，下面开始处理不同的节点

  // 1，新的多（以新指针为参照）插入新增的
  if (newStartIndex <= newEndIndex) {
    // 新的开始指针和新的结束指针之间的节点
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 判断当前尾节点的下一个元素是否存在：
      //  1，如果存在：则插入到下一个元素的前面
      //  2，如果不存在（下一个是 null） ：就是 appendChild
      // 取参考节点anchor:决定新节点放到前边还是后边
      //  逻辑：取去newChildren的尾部+1,判断是否为 null
      //  解释：如果有值说明是向前移动的，取出此虚拟元素的真实节点el，将新节点添加到此真实节点前即可
      let anchor = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      // // 获取对应的虚拟节点，并生成真实节点，添加到 dom 中
      // el.appendChild(createElm(newChildren[i]))
      // 逻辑合并:将 appendChild 改为 insertBefore
      //  效果：既有appendChild又有insertBefore的功能，直接将参考节点放进来即可;
      //  解释：对于insertBefore方法,如果anchor为null，等同于appendChild;如果有值，则是insertBefore;
      el.insertBefore(createElm(newChildren[i]),anchor)
    }
  }
  // 2，旧的多，（以旧指针为参照）删除多余的真实节点
  if(oldStartIndex <= oldEndIndex){
    for(let i = oldStartIndex; i <= oldEndIndex; i++){
      let child = oldChildren[i];
      // child有值时才删除；原因：节点有可能在移走时被置为undefined
      child && el.removeChild(child.el);
    }
  }
}

// 面试：虚拟节点的实现？如何将虚拟节点渲染成真实节点
export function createElm(vnode) {
  // 虚拟节点必备的三个：标签，数据，孩子
  let { tag, data, children, text, vm } = vnode;

  // vnode.el:绑定真实节点与虚拟节点的映射关系，便于后续的节点更新操作
  if (typeof tag === 'string') { // 元素
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
function updateProperties(vnode, oldProps = {}) {
  // 1,初次渲染，用oldProps给vnode的 el 赋值即可
  // 2,更新逻辑，拿到老的props和vnode中的 data 进行比对
  let el = vnode.el; // dom上的真实节点（上边复用老节点时已经赋值了）
  let newProps = vnode.data || {};  // 拿到新的数据

  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};

  //如果老的样式有，新的没有，就删掉
  for (let key in oldStyle) { // 老的样式有，新的没有，就把页面上的样式删除掉
    if (!newStyle[key]) {
      el.style[key] = '';
    }
  }

  // 新旧比对：两个对象比对差异
  for (let key in newProps) { // 直接用新的盖掉老的就可以了  还要注意：老的里面有，可能新的里面没有了
    // 前后两次一样，浏览器会检测，就不会更新了，不会有性能问题
    // console.log(newProps)
    if (key == 'style') { // 新的里面有样式，直接覆盖即可
      for (let key in newStyle) { // 老的样式有，新的没有，就把页面上的样式删除掉
        console.log("更新style", el.style[key], newStyle[key])
        el.style[key] = newStyle[key]
      }
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
  // 处理老的里面有，可能新的里面没有的情况，需要再删掉
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }
}