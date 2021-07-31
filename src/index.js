import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./global-api";
import { initMixin } from "./init";
import { lifeCycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { createElm, patch } from "./vdom/patch";

/**
 * 在vue 中所有的功能都通过原型扩展（原型模式）的方式来添加
 * @param {*} options vue 实例化传入的配置对象
 */
function Vue(options) {
    this._init(options);  // 调用Vue原型上的方法_init
}

initMixin(Vue)
renderMixin(Vue)   // 混合一个 render 方法
lifeCycleMixin(Vue)
initGlobalAPI(Vue) // 初始化 global Api

// 1,生成第一个虚拟节点
// new Vue会对数据进行劫持
let vm1 = new Vue({
    data() {
        return { name: 'Brave' }
    }
})
// 将模板 render1 生成为 render 函数
// let render1 = compileToFunction('<div>{{name}}</div>');// 调用 compileToFunction，将模板生成 render 函数，会解析模板，最终包成一个 function
// let render1 = compileToFunction('<div id="a">{{name}}</div>');
// let render1 = compileToFunction('<div style="color:blue">{{name}}</div>');
let render1 = compileToFunction(`<div>
    <li key="E">E</li>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
</div>`);
// 调用 render 函数，产生虚拟节点
let oldVnode = render1.call(vm1)    // oldVnode:第一次的虚拟节点
// 将虚拟节点生成真实节点
let el1 = createElm(oldVnode);
// 将真实节点渲染到页面上
document.body.appendChild(el1);
// 2，生成第二个虚拟节点
let vm2 = new Vue({
    data() {
        return { name: 'BraveWang' }
    }
})
// let render2 = compileToFunction('<p>{{name}}</p>');
// let render2 = compileToFunction('<div class="b">{{name}}</div>');
// let render2 = compileToFunction('<div style="color:red">{{name}}</div>');
let render2 = compileToFunction(`<div>
    <li key="D" style="color:pink">D</li>
    <li key="C" style="color:yellow">C</li>
    <li key="B" style="color:blue">B</li>
    <li key="A" style="color:red">A</li>
</div>`);
let newVnode = render2.call(vm2);
// 延迟看效果：初始化完成显示 el1，1 秒后移除 el1 显示 el2
setTimeout(() => {
    // let el2 = createElm(newVnode);
    // document.body.removeChild(el1);
    // document.body.appendChild(el2);
    patch(oldVnode, newVnode);  // 内部会做递归处理
}, 2000);

// 3，调用 patch 方法进行比对
// let vm = new Vue({
//     data(){
//         return {name:'Brave'}
//     }
// })
// let render = compileToFunction('<div>{{name}}</div>');
// let oldVnode = render.call(vm)
// let el = createElm(oldVnode);
// document.body.appendChild(el);
// // 数据更新后，再次调用 render 函数
// vm.name = 'BraveWang';
// let newVnode = render.call(vm);
// console.log(oldVnode, newVnode);
// setTimeout(()=>{
//     // 比对新老虚拟节点的差异，更新需要更新的节点（性能高）
//     patch(oldVnode, newVnode); 
// }, 1000);

// 导出 Vue 函数供外部使用
export default Vue;