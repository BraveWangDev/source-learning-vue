// 参数：_c('标签', {属性}, ...儿子)
export function createElement(vm, tag, data={}, ...children) {
  // 返回元素的虚拟节点（元素是没有文本的）
  return vnode(vm, tag, data, children, data.key, undefined);
}
export function createText(vm, text) {
  // 返回文本的虚拟节点（文本没有标签、数据、儿子、key）
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// 通过函数返回vnode对象
// 后续元素需要做 diff 算法，需要 key 标识
function vnode(vm, tag, data, children, key, text) {
  return {
    vm,       // 谁的实例
    tag,      // 标签
    data,     // 数据
    children, // 儿子
    key,      // 标识
    text      // 文本
  }
}