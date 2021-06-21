import { initMixin } from "./init";
import { lifeCycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

/**
 * 在vue 中所有的功能都通过原型扩展（原型模式）的方式来添加
 * @param {*} options vue 实例化传入的配置对象
 */
function Vue(options){
    this._init(options);  // 调用Vue原型上的方法_init
}

initMixin(Vue)
renderMixin(Vue)   // 混合一个 render 方法
lifeCycleMixin(Vue)

// 导出 Vue 函数供外部使用
export default Vue;