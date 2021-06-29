import { mergeOptions } from "../utils";

export function initGlobalAPI(Vue) {
  // 全局属性：Vue.options
  // 功能：存放 mixin, component, filte, directive 属性
  Vue.options = {}; 
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options);
    console.log("打印mixin合并后的options", this.options);
    return this;  // 返回this,提供链式调用
  }
  Vue.component = function (options) {
    
  }
  Vue.filte = function (options) {
    
  }
  Vue.directive = function (options) {
    
  }
}