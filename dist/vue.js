(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    function initState(vm) {
      // 前面将 options 挂载到 vm.$options，这里直接可以拿到
      const opts = vm.$options; // 如果传了data，做数据的初始化

      if (opts.data) {
        initData();
      } // 如果传了props，做操作...
      // 如果传了watch，做操作...
      // 如果传了computed，做操作...

    }

    function initData(vm) {
      console.log("进入 state.js - initData，数据初始化操作");
    }

    function initMixin(Vue) {
      // 在Vue原型上扩展一个原型方法_init,进行vue初始化
      Vue.prototype._init = function (options) {
        const vm = this; // this 指向当前 vue 实例

        vm.$options = options; // 将 Vue 实例化时用户传入的options暴露到vm实例上
        // 目前在 vue 实例化时，传入的 options 只有 el 和 data 两个参数

        initState(vm); // 状态的初始化
        // 如果有 el，就需要data 数据渲染到视图上

        if (vm.$options.el) {
          console.log("有el,需要挂载");
        }
      };
    }

    /**
     * 在vue 中所有的功能都通过原型扩展（原型模式）的方式来添加
     * @param {*} options vue 实例化传入的配置对象
     */

    function Vue(options) {
      this._init(options); // 调用Vue原型上的方法_init

    }

    initMixin(Vue); // 导出 Vue 函数供外部使用
    // 2.会将用户的选项放到 vm.$options上
    // 3.会对当前属性上搜素有没有data 数据   initState
    // 4.有data 判断data是不是一个函数 ，如果是函数取返回值 initData
    // 5.observe 去观测data中的数据 和 vm没关系，说明data已经变成了响应式
    // 6.vm上像取值也能取到data中的数据 vm._data = data 这样用户能取到data了  vm._data
    // 7.用户觉得有点麻烦 vm.xxx => vm._data
    // 8.如果更新对象不存在的属性，会导致视图不更新， 如果是数组更新索引和长度不会触发更新
    // 9.如果是替换成一个新对象，新对象会被进行劫持，如果是数组存放新内容 push unshift() 新增的内容也会被劫持
    // 通过__ob__ 进行标识这个对象被监控过  （在vue中被监控的对象身上都有一个__ob__ 这个属性）
    // 10如果你就想改索引 可以使用$set方法 内部就是splice()
    // 如果有el 需要挂载到页面上

    return Vue;

})));
//# sourceMappingURL=vue.js.map
