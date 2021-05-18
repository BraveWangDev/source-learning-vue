import { observe } from "./observe";
import { isFunction } from "./utils";

export function initState(vm) {
    // 前面将 options 挂载到 vm.$options，这里直接可以拿到
    const opts = vm.$options;

    // 如果传了data，做数据的初始化
    if (opts.data) {
        initData(vm);
    }
    // 如果传了props，做操作...
    // 如果传了watch，做操作...
    // 如果传了computed，做操作...

}

/**
 * 代理方法
 *  当取 vm.key 时，将它代理到 vm._data上去取
 * @param {*} vm        vm 实例
 * @param {*} key       属性名
 * @param {*} source    代理目标，这里是vm._data
 */
function Proxy(vm, key, source) {
    Object.defineProperty(vm, key, {
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue;
        }
    })
}

function initData(vm) {
    console.log("进入 state.js - initData，数据初始化操作")
    let data = vm.$options.data;// 拿到 vue 初始化时，用户传入的data数据

    // data 有可能是函数也有可能是对象，因此需要判断
    //  如果 data 是函数，要拿到它的返回值，执行 data 函数并绑定 this 为 vm 实例
    //  如果 data 不是函数，就是对象，不做处理
    data = vm._data = isFunction(data) ? data.call(vm) : data;

    // data 数据的响应式：遍历对象拿到所有属性，再通过Object.defineProperty 重写 data 中的所有属性  
    // 在observe方法中new Observer执行后，数组的原型方法已完成重写,此时vm._data已经是响应式数据了
    observe(data); // 观测数据
    
    // 当 vm.message 在 vm 实例上取值时，将它代理到vm._data上去取
    for(let key in data){
        Proxy(vm, key, '_data')
    }
}
