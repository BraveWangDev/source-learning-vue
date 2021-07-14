export function isFunction(val){
  return typeof val == 'function'
}

/**
 * 判断是否是对象：类型是object，且不能为 null
 * @param {*} val 
 * @returns 
 */
export function isObject(val) {
  return typeof val == 'object' && val !== null
}

/**
 * 判断是否是数组
 * @param {*} val 
 * @returns 
 */
export function isArray(val) {
  return Array.isArray(val)
}

let callbacks = []; // 缓存异步更新的 nextTick
let waiting = false;
function flushsCallbacks() {
  callbacks.forEach(fn => fn()) // 依次执行 nextTick
  callbacks = [];   // reset
  waiting = false;  // reset
}

/**
 * 将方法异步化
 * @param {*} fn 需要异步化的方法
 * @returns 
 */
export function nextTick(fn) {
  // return Promise.resolve().then(fn);
  callbacks.push(fn); // 先缓存异步更新的nextTick,后续统一处理
  if(!waiting){
    Promise.resolve().then(flushsCallbacks);
    waiting = true; // 首次进入被置为 true,控制逻辑只走一次
  }
}

let strats = {};  // 存放所有策略
let lifeCycle = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted'
];
lifeCycle.forEach(hook => {
  // 创建生命周期的合并策略
  strats[hook] = function (parentVal, childVal) {
    if(childVal){ // 儿子有值，需要进行合并
      if(parentVal){
        // 父亲儿子都有值：父亲一定是数组，将儿子合入父亲
        return parentVal.concat(childVal);  
      }else{
        // 儿子有值，父亲没有值：儿子放入新数组中
        // return [childVal]
        // 注意：如果传入的生命周期函数是数组，已经是数组了不能再包成数组
        if(Array.isArray(childVal)){
          return childVal;
        }else{
          return [childVal];
        }
      }
    }else{  // 儿子没有值，无需合并，直接返回父亲即可
      return parentVal;
    }
  }
})

/**
 * 对象合并:将childVal合并到parentVal中
 * @param {*} parentVal   父值-老值
 * @param {*} childVal    子值-新值
 */
export function mergeOptions(parentVal, childVal) {
  let options = {};
  for(let key in parentVal){
    mergeFiled(key);
  }
  for(let key in childVal){
    // 当新值存在，老值不存在时：添加到老值中
    if(!parentVal.hasOwnProperty(key)){
      mergeFiled(key);
    }
  }
  // 合并当前 key 
  function mergeFiled(key) {
    // 策略模式：获取当前合并策略
    let strat = strats[key];
    if(strat){  
      options[key] = strat(parentVal[key], childVal[key]);
    }else{  // 默认合并策略：新值覆盖老值
      options[key] = childVal[key] || parentVal[key];
    }
    
    
  }

  return options;
}