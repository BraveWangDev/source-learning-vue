import { compileToFunction } from "./compiler";
import { initState } from "./state";
import { mountComponent } from "./lifecycle";
import { mergeOptions, nextTick } from "./utils";

export function initMixin(Vue) {
  // 在Vue原型上扩展一个原型方法_init,进行vue初始化
  Vue.prototype._init = function (options) {
    const vm = this;  // this 指向当前 vue 实例
    // vm.$options = options; // 将 Vue 实例化时用户传入的options暴露到vm实例上
    // 此时需使用 options 与 mixin 合并后的全局 options 再进行一次合并
    vm.$options = mergeOptions(vm.constructor.options, options);
    // 目前在 vue 实例化时，传入的 options 只有 el 和 data 两个参数
    initState(vm);  // 状态的初始化

    if (vm.$options.el) {
      // 将数据挂在到页面上（此时,数据已经被劫持）
      vm.$mount(vm.$options.el)
    }
  }

  // 支持 new Vue({el}) 和 new Vue().$mount 两种情况
  Vue.prototype.$mount = function (el) {
    console.log("***** 进入 $mount，el = " + el + "*****")
    const vm = this;
    const opts = vm.$options;
    el = document.querySelector(el); // 获取真实的元素
    vm.$el = el; // vm.$el 表示当前页面上的真实元素
    console.log("获取真实的元素，el = " + el)

    // 如果没有 render, 看 template
    if (!opts.render) {
      console.log("options 中没有 render , 继续取 template")
      // 如果没有 template, 采用元素内容
      let template = opts.template;
      if (!template) {
        console.log("options 中没有 template, 取 el.outerHTML = " + el.outerHTML)
        // 拿到整个元素标签,将模板编译为 render 函数
        template = el.outerHTML;
      }else{
        console.log("options 中有 template = " + template)
      }

      let render = compileToFunction(template);
      opts.render = render;
      console.log("打印 compileToFunction 返回的 render = " + render.toString())
    }

    // 将 render 渲染到 el 上
    mountComponent(vm);
  }

  Vue.prototype.$nextTick = nextTick;
}
