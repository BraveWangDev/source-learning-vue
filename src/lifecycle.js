import Watcher from "./observe/watcher";
import { patch } from "./vdom/patch";

export function mountComponent(vm) {
  // vm._render()：调用 render 方法
  // vm._update：将虚拟节点更新到页面上
  // 初始化流程
  // vm._update(vm._render());  
  // 改造
  let updateComponent = ()=>{
    vm._update(vm._render());  
  }

  // 当视图渲染前，调用钩子: beforeCreate
  callHook(vm, 'beforeCreate');

  // 渲染 watcher ：每个组件都有一个 watcher
  new Watcher(vm, updateComponent, ()=>{
    console.log('Watcher-update')
    // 视图更新后，调用钩子: created
    callHook(vm, 'created');
  },true)

   // 当视图挂载完成，调用钩子: mounted
   callHook(vm, 'mounted');
}

export function lifeCycleMixin(Vue){
  Vue.prototype._update = function (vnode) {
    console.log("_update-vnode",vnode)
    const vm = this;
    // 取上一次的 preVnode
    let preVnode = vm.preVnode;
    // 渲染前，先保存当前 vnode
    vm.preVnode = vnode;
    // preVnode 有值，说明已经有节点了，本次是更新渲染；没值就是初渲染
    if(!preVnode){// 初渲染
      // 传入当前真实元素vm.$el，虚拟节点vnode，返回新的真实元素
      vm.$el = patch(vm.$el, vnode);
    }else{// 更新渲染:新老虚拟节点做 diff 比对
      vm.$el = patch(preVnode, vnode);
    }
  }
}

/**
 * 执行生命周期钩子
 *    从$options取对应的生命周期函数数组并执行
 * @param {*} vm    vue实例
 * @param {*} hook  生命周期
 */
export function callHook(vm, hook){
  // 获取生命周期对应函数数组
  let handlers = vm.$options[hook];
  if(handlers){
    handlers.forEach(fn => {
      fn.call(vm);  // 生命周期中的 this 指向 vm 实例
    })
  }
}