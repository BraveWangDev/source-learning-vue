(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function isFunction(val) {
    return typeof val == 'function';
  }
  /**
   * 判断是否是对象：类型是object，且不能为 null
   * @param {*} val 
   * @returns 
   */

  function isObject(val) {
    return typeof val == 'object' && val !== null;
  }
  /**
   * 判断是否是数组
   * @param {*} val 
   * @returns 
   */

  function isArray(val) {
    return Array.isArray(val);
  }

  // 重写数组方法
  // 思路：拿到原来的方法，将部分需要重写的方法重写掉
  let oldArrayPrototype = Array.prototype; // 获取数组老的原型方法
  // 通过arrayMethods上的链能拿到数组上的原有方法	arrayMethods.__proto__ == oldArrayPrototype

  let arrayMethods = Object.create(oldArrayPrototype); // 使arrayMethods可以通过__proto__，能获取到数组的方法
  // 重写这7个会导致数组发生变化的方法（影响原数组变化的方法，会影响到视图的更新）

  let methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // 为arrayMethods添加这 7 个“重写方法”
  //  arrayMethods.push()  会在自己身上找到重写的push方法
  //  arrayMethods.concat() 自己身上没找到，回去链上找到原来的方法
  // 这种方式的好处：
  //  属性的查找会先在自己身上找，找不到再去原型上找，所以会优先调用重写的方法
  //  同时，只重写了 data 中数组原型的方法，不会影响到其他数组
  // 数组劫持的实现，因为只劫持了这7个方法，所以修改数组的索引和长度都不能触发视图更新

  methods.forEach(method => {
    // 当前的外部调用：arr.push
    arrayMethods[method] = function (...args) {
      console.log('数组的方法进行重写操作 method = ' + method); // AOP:before 原生方法扩展... 
      // 调用数组原生方法逻辑（绑定到当前调用上下文）

      oldArrayPrototype[method].call(this, ...args); // AOP::after 原生方法扩展...
      // 数组新增的属性如果是属性，要继续观测
      // 哪些方法有增加数组的功能: splice push unshift

      let inserted = null;
      let ob = this.__ob__;

      switch (method) {
        // arr.splice(0,0,100) 如果splice方法用于增加,一定有第三个参数,从第三个开始都是添加的内容
        case 'splice':
          // 修改 删除 添加
          inserted = args.slice(2);
        // splice方法从第三个参数起是新增数据

        case 'push': // 向前增加

        case 'unshift':
          // 向后增加
          inserted = args; // push、unshift的参数就是新增

          break;
      } // observeArray：内部遍历inserted数组,调用observe方法，是对象就new Observer，继续深层观测


      if (inserted) ob.observeArray(inserted); // inserted 有值就是数组
    };
  }); // 数组劫持的实现：劫持这 7个方法，所以修改索引和长度都是不能触发视图变化的

  function observe(value) {
    // 1，如果 value 不是对象，说明写错了，就不需要观测了，直接 return
    // 注意：数据也是 Object，这里就不做容错判断了，忽略使用错误传入数组的情况
    if (!isObject(value)) {
      return;
    } // 通过__ob__属性判断对象是否已经被观测，如果已经被观测，就不再重复观测了；


    if (value.__ob__) {
      return;
    } // 2，对 对象 进行观测（最外层必须是一个object!不能是数组,Vue没有这种用法）


    return new Observer(value);
  }

  class Observer {
    constructor(value) {
      // value：为数组或对象添加自定义属性__ob__ = this，
      // this：为当前 Observer 类的实例，实例上就有 observeArray 方法；
      // value.__ob__ = this;	// 可被遍历枚举，会造成死循环
      // 定义__ob__ 属性为不可被枚举，防止对象在进入walk都继续defineProperty，造成死循环
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false // 不可被枚举

      }); // 对 value 是数组和对象的情况分开处理

      if (isArray(value)) {
        value.__proto__ = arrayMethods; // 更改数组的原型方法

        this.observeArray(value); // 数组的深层观测处理
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
      data.forEach(item => observe(item));
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
    observe(value); // 递归实现深层观测

    Object.defineProperty(obj, key, {
      // get方法构成闭包：取obj属性时需返回原值value，
      // value会查找上层作用域的value，所以defineReactive函数不能被释放销毁
      get() {
        return value;
      },

      set(newValue) {
        // 确保新对象为响应式数据：如果新设置的值为对象，需要再次进行劫持
        console.log("修改了被观测属性 key = " + key + ", newValue = " + JSON.stringify(newValue));
        if (newValue === value) return;
        observe(newValue); // observe方法：如果是对象，会 new Observer 深层观测

        value = newValue;
      }

    });
  }

  function initState(vm) {
    // 前面将 options 挂载到 vm.$options，这里直接可以拿到
    const opts = vm.$options; // 如果传了data，做数据的初始化

    if (opts.data) {
      initData(vm);
    } // 如果传了props，做操作...
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
      get() {
        return vm[source][key];
      },

      set(newValue) {
        vm[source][key] = newValue;
      }

    });
  }

  function initData(vm) {
    console.log("进入 state.js - initData，数据初始化操作");
    let data = vm.$options.data; // 拿到 vue 初始化时，用户传入的data数据
    // data 有可能是函数也有可能是对象，因此需要判断
    //  如果 data 是函数，要拿到它的返回值，执行 data 函数并绑定 this 为 vm 实例
    //  如果 data 不是函数，就是对象，不做处理

    data = vm._data = isFunction(data) ? data.call(vm) : data; // data 数据的响应式：遍历对象拿到所有属性，再通过Object.defineProperty 重写 data 中的所有属性  
    // 在observe方法中new Observer执行后，数组的原型方法已完成重写,此时vm._data已经是响应式数据了

    observe(data); // 观测数据
    // 当 vm.message 在 vm 实例上取值时，将它代理到vm._data上去取

    for (let key in data) {
      Proxy(vm, key, '_data');
    }
  }

  function initMixin(Vue) {
    // 在Vue原型上扩展一个原型方法_init,进行vue初始化
    Vue.prototype._init = function (options) {
      const vm = this; // this 指向当前 vue 实例

      vm.$options = options; // 将 Vue 实例化时用户传入的options暴露到vm实例上
      // 目前在 vue 实例化时，传入的 options 只有 el 和 data 两个参数

      initState(vm); // 状态的初始化
      // 如果有 el，就需要data 数据渲染到视图上

      if (vm.$options.el) {
        console.log("有el,需要挂载");
      }
    };
  }

  /**
   * 在vue 中所有的功能都通过原型扩展（原型模式）的方式来添加
   * @param {*} options vue 实例化传入的配置对象
   */

  function Vue(options) {
    this._init(options); // 调用Vue原型上的方法_init

  }

  initMixin(Vue); // 导出 Vue 函数供外部使用

  return Vue;

})));
//# sourceMappingURL=vue.js.map
