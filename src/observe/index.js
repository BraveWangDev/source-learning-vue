import { isArray, isObject } from "../utils";
import { arrayMethods } from "./array";
import Dep from "./dep";

export function observe(value) {

  // 1，如果 value 不是对象，说明写错了，就不需要观测了，直接 return
  // 注意：数据也是 Object，这里就不做容错判断了，忽略使用错误传入数组的情况
  if (!isObject(value)) {
    return;
  }

  // 通过__ob__属性判断对象是否已经被观测，如果已经被观测，就不再重复观测了；
  if(value.__ob__){
    return;
  }
  // 2，对 对象 进行观测（最外层必须是一个object!不能是数组,Vue没有这种用法）
  return new Observer(value);
}

class Observer {

  constructor(value) {
    // 为 Observer 实例添加 dep 用于收集依赖
    this.dep = new Dep();// 为对象或数组本身添加了一个 dep 属性
    // value：为数组或对象添加自定义属性__ob__ = this，
    // this：为当前 Observer 类的实例，实例上就有 observeArray 方法；
    // value.__ob__ = this;	// 可被遍历枚举，会造成死循环
    // 定义__ob__ 属性为不可被枚举，防止对象在进入walk都继续defineProperty，造成死循环
    Object.defineProperty(value, '__ob__', {
      value:this,
      enumerable:false  // 不可被枚举
    });
    // 对 value 是数组和对象的情况分开处理
    if (isArray(value)) {
      value.__proto__ = arrayMethods;  // 更改数组的原型方法
      console.log(value)
      this.observeArray(value);	// 数组的深层观测处理
    } else {
      // 如果value是对象，就循环对象，将对象中的属性使用Object.defineProperty重新定义一遍
      this.walk(value); // 上来就走一步，这个方法的核心就是在循环对象
    }
  }

  /**
   * 遍历对象
   *  循环data对象（不需要循环data原型上的方法），使用 Object.keys()
   * @param {*} data 
   */
  walk(data) {
    Object.keys(data).forEach(key => {
      // 使用Object.defineProperty重新定义data对象中的属性
      defineReactive(data, key, data[key]);
    });
  }

  /**
   * 遍历数组，对数组中的对象进行递归观测
   *  1）[[]] 数组套数组
   *  2）[{}] 数组套对象
   * @param {*} data 
   */
  observeArray(data) {
    // observe方法内，如果是对象类型，继续 new Observer 进行递归处理
    data.forEach(item => observe(item))
  }
}

/**
 * 使数组中的引用类型都进行依赖收集
 * @param {*} value 需要做递归依赖收集的数组
 */
function dependArray(value) {
  // 数组中如果有对象:[{}]或[[]]，也要做依赖收集（后续会为对象新增属性）
  for(let i = 0; i < value.length; i++){
    let current = value[i];
    // current 上如果有__ob__，说明是对象，就让 dep 收集依赖（只有对象上才有 __ob__）
    current.__ob__ && current.__ob__.dep.depend();
    // 如果内部还是数组，继续递归处理
    if(Array.isArray(current)){
      dependArray(current)
    }
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
  // childOb 是数据组进行观测后返回的结果，内部 new Observe 只处理数组或对象类型
  let childOb = observe(value);// 递归实现深层观测
  let dep = new Dep();  // 为每个属性添加一个 dep
  Object.defineProperty(obj, key, {
    // get方法构成闭包：取obj属性时需返回原值value，
    // value会查找上层作用域的value，所以defineReactive函数不能被释放销毁
    get() {
      if(Dep.target){
        // 对象属性的依赖收集
        dep.depend();
        // 数组或对象本身的依赖收集
        if(childOb){  // 如果 childOb 有值，说明数据是数组或对象类型
          // observe 方法中，会通过 new Observe 为数组或对象本身添加 dep 属性
          childOb.dep.depend();    // 让数组和对象本身的 dep 记住当前 watcher
          if(Array.isArray(value)){// 如果当前数据是数组类型
            // 可能数组中继续嵌套数组，需递归处理
            dependArray(value)
          }  
        }
      }
      return value;
    },
    set(newValue) { // 确保新对象为响应式数据：如果新设置的值为对象，需要再次进行劫持
      console.log("修改了被观测属性 key = " + key + ", newValue = " + JSON.stringify(newValue))
      if (newValue === value) return
      observe(newValue);  // observe方法：如果是对象，会 new Observer 深层观测
      value = newValue;
      dep.notify(); // 通知当前 dep 中收集的所有 watcher 依次执行视图更新
    }
  })
}
