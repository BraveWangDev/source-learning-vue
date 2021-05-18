import { isArray, isObject } from "../utils";
import { arrayMethods } from "./array";

export function observe(value) {

  // 1，如果 value 不是对象，说明写错了，就不需要观测了，直接 return
  // 注意：数据也是 Object，这里就不做容错判断了，忽略使用错误传入数组的情况
  if (!isObject(value)) {
    return;
  }

  // 2，对 对象 进行观测（最外层必须是一个object!不能是数组,Vue没有这种用法）
  return new Observer(value);
}

class Observer {

  constructor(value) {
    // 对 value 是数组和对象的情况分开处理
    if(isArray(value)){
      value.__proto__ = arrayMethods;  // 更改数组的原型方法
    }else{
      // 如果value是对象，就循环对象，将对象中的属性使用Object.defineProperty重新定义一遍
      this.walk(value); // 上来就走一步，这个方法的核心就是在循环对象
    }
  }

  // 循环data对象（不需要循环data原型上的方法），使用 Object.keys()
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

  observe(value);// 递归实现深层观测
  Object.defineProperty(obj, key, {
    // get方法构成闭包：取obj属性时需返回原值value，
    // value会查找上层作用域的value，所以defineReactive函数不能被释放销毁
    get() {
      return value;
    },
    set(newValue) {
      if (newValue === value) return
      value = newValue;
    }
  })
}
