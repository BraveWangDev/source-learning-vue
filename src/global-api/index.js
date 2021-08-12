import { isObject, mergeOptions } from "../utils";

export function initGlobalAPI(Vue) {
  // 全局属性：Vue.options
  // 功能：存放 mixin, component, filte, directive 属性
  Vue.options = {}; // 每个组件初始化时，将这些属性放入组件
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options);
    console.log("打印mixin合并后的options", this.options);
    return this;  // 返回this,提供链式调用
  }

  /**
   * 使用基础的 Vue 构造器，创造一个子类
   *  new 子类时，执行组件的初始化 _init
   * @param {*} definition 
   */
  Vue.extend = function (opt) {
    // 父类：Vue 即当前 this;
    const Super = this;
    // 创建子类，继承父类
    const Sub = function (options) {
      // new 组件时，执行组件初始化
      this._init(options);
    }

    // // Object.create 实现原理
    // // 调用create就会产生一个新的实例，这个实例上具备父类的原型
    // function create(parentPrototype) {
    //   const Fn = function () {}
    //   Fn.prototype = parentPrototype;
    //   return new Fn();
    // }

    // 父类原型：Super.prototype 
    // 继承父类的原型方法：Object.create(Super.prototype)
    // Object.create(Super.prototype) 等同于：Sub.prototype.__proto__ = Supper.prototype
    Sub.prototype = Object.create(Super.prototype);
    // 修复 constructor 指向问题：Object.create 会产生一个新的实例作为子类的原型，导致constructor指向错误
    Sub.prototype.constructor = Sub;
    // 合并父类和子类的选项:需要让子类能拿到 Vue 定义的全局组件
    Sub.options = mergeOptions(Super.options, opt);
    // 其他
    Sub.mixin = Vue.mixin;

    return Sub;
  }

  Vue.options.components = {};// 存放全局组件
  /**
   * Vue.component
   * @param {*} id          组件名（默认）
   * @param {*} definition  组件定义：可能是对象或函数
   */
  Vue.component = function (id, definition) {

    // 获取组件名 name:优先使用definition.name，默认使用 id
    let name = definition.name || id;
    definition.name = name;

    // 如果传入的 definition 是对象，需要用Vue.extends包裹
    if(isObject(definition)){
      definition = Vue.extend(definition)
    }

    // 将 definition 对象保存到全局：Vue.options.components
    Vue.options.components[name] = definition;

  }
}