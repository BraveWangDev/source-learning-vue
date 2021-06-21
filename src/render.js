import { isObject } from "./utils"
import { createElement, createText } from "./vdom"

export function renderMixin(Vue) {
  Vue.prototype._c = function () {  // createElement 创建元素型的节点
    const vm = this;
    return createElement(vm, ...arguments); // 传入 vm 及之前的所有参数
  }
  Vue.prototype._v = function (text) {  // 创建文本的虚拟节点
    const vm = this;
    return createText(vm, text);
  }
  Vue.prototype._s = function (val) {  // JSON.stringify
    if(isObject(val)){  // 是对象就转成字符串
      return JSON.stringify(val)
    } else {  // 不是对象就直接返回
      return val
    }
  }
  Vue.prototype._render = function () {
    const vm = this;  // vm 中有所有数据  vm.xxx => vm._data.xxx
    let { render } = vm.$options;
    let vnode = render.call(vm);  // 此时内部会调用_c,_v,_s，执行完成后返回虚拟节点
    return vnode
  }
}