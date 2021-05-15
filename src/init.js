import { initState } from "./state";

export function initMixin(Vue) {
  // 在Vue原型上扩展一个原型方法_init,进行vue初始化
  Vue.prototype._init = function (options) {
    const vm = this;  // this 指向当前 vue 实例
    vm.$options = options; // 将 Vue 实例化时用户传入的options暴露到vm实例上

    // 目前在 vue 实例化时，传入的 options 只有 el 和 data 两个参数
    initState(vm);  // 状态的初始化

    // 如果有 el，就需要data 数据渲染到视图上
    if (vm.$options.el) {
      console.log("有el,需要挂载")
    }
  }
}
