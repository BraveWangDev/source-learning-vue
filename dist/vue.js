(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function isFunction(val) {
    return typeof val == 'function';
  }
  /**
   * 判断是否是对象：类型是object，且不能为 null
   * @param {*} val 
   * @returns 
   */

  function isObject(val) {
    return typeof val == 'object' && val !== null;
  }

  function observe(value) {
    // 1，如果 value 不是对象，说明写错了，就不需要观测了，直接 return
    // 注意：数据也是 Object，这里就不做容错判断了，忽略使用错误传入数组的情况
    if (!isObject(value)) {
      return;
    } // 2，对 对象 进行观测（最外层必须是一个object!不能是数组,Vue没有这种用法）


    return new Observer(value);
  }

  class Observer {
    constructor(value) {
      // 如果value是对象，就循环对象，将对象中的属性使用Object.defineProperty重新定义一遍
      this.walk(value); // 上来就走一步，这个方法的核心就是在循环对象
    } // 循环data对象（不需要循环data原型上的方法），使用 Object.keys()


    walk(data) {
      Object.keys(data).forEach(key => {
        // 使用Object.defineProperty重新定义data对象中的属性
        defineReactive(data, key, data[key]);
      });
    }

  }
  /**
   * 给对象Obj，定义属性key，值为value
   *  使用Object.defineProperty重新定义data对象中的属性
   *  由于Object.defineProperty性能低，所以vue2的性能瓶颈也在这里
   * @param {*} obj 需要定义属性的对象
   * @param {*} key 给对象定义的属性名
   * @param {*} value 给对象定义的属性值
   */


  function defineReactive(obj, key, value) {
    observe(value); // 递归实现深层观测

    Object.defineProperty(obj, key, {
      // get方法构成闭包：取obj属性时需返回原值value，
      // value会查找上层作用域的value，所以defineReactive函数不能被释放销毁
      get() {
        return value;
      },

      set(newValue) {
        if (newValue === value) return;
        value = newValue;
      }

    });
  }

  function initState(vm) {
    // 前面将 options 挂载到 vm.$options，这里直接可以拿到
    const opts = vm.$options; // 如果传了data，做数据的初始化

    if (opts.data) {
      initData(vm);
    } // 如果传了props，做操作...
    // 如果传了watch，做操作...
    // 如果传了computed，做操作...

  }

  function initData(vm) {
    console.log("进入 state.js - initData，数据初始化操作");
    let data = vm.$options.data; // 拿到 vue 初始化时，用户传入的data数据
    // data 有可能是函数也有可能是对象，因此需要判断
    //  如果 data 是函数，要拿到它的返回值，执行 data 函数并绑定 this 为 vm 实例
    //  如果 data 不是函数，就是对象，不做处理

    data = isFunction(data) ? data.call(vm) : data; // data 数据的响应式：遍历对象拿到所有属性，再通过Object.defineProperty 重写 data 中的所有属性  

    observe(data); // 观测数据

    console.log(data);
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

  return Vue;

})));
//# sourceMappingURL=vue.js.map
