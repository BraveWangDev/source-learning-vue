export function initState(vm){
    // 前面将 options 挂载到 vm.$options，这里直接可以拿到
    const opts = vm.$options;

    // 如果传了data，做数据的初始化
    if(opts.data){
        initData(vm);
    }
    // 如果传了props，做操作...
    // 如果传了watch，做操作...
    // 如果传了computed，做操作...

}
function initData(vm){
    console.log("进入 state.js - initData，数据初始化操作")
}
