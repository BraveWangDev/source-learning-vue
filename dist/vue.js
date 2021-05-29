(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  // 匹配标签名：aa-xxx
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 命名空间标签：aa:aa-xxx

  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 匹配标签名(索引1)：<aa:aa-xxx

  const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签名(索引1)：</aa:aa-xxxdsadsa> 

  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配属性（索引 1 为属性 key、索引 3、4、5 其中一直为属性值）：aaa="xxx"、aaa='xxx'、aaa=xxx

  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配结束标签：> 或 />

  const startTagClose = /^\s*(\/?)>/; // 匹配 {{   xxx    }} ，匹配到 xxx

  function parserHTML(html) {
    console.log("***** 进入 parserHTML：将模板编译成 AST 语法树 *****"); // 开始标签

    function start(tagName, attrs) {
      console.log("发射匹配到的开始标签-start,tagName = " + tagName + ",attrs = " + JSON.stringify(attrs));
    } // 结束标签


    function end(tagName) {
      console.log("发射匹配到的结束标签-end,tagName = " + tagName);
    } // 文本


    function text(chars) {
      console.log("发射匹配到的文本-text,chars = " + chars);
    }
    /**
     * 截取字符串
     * @param {*} len 截取长度
     */


    function advance(len) {
      html = html.substring(len);
      console.log("截取匹配内容后的 html:" + html);
      console.log("===============================");
    }
    /**
     * 匹配开始标签,返回匹配结果
     */


    function parseStartTag() {
      console.log("***** 进入 parseStartTag，尝试解析开始标签，当前 html： " + html + "*****"); // 匹配开始标签，开始标签名为索引 1

      const start = html.match(startTagOpen);

      if (start) {
        // 匹配到开始标签再处理
        // 构造匹配结果，包含：标签名 + 属性
        const match = {
          tagName: start[1],
          attrs: []
        };
        console.log("html.match(startTagOpen) 结果:" + JSON.stringify(match)); // 截取匹配到的结果

        advance(start[0].length);
        let end; // 是否匹配到开始标签的结束符号>或/>

        let attr; // 存储属性匹配的结果
        // 匹配属性且不能为开始的结束标签，例如：<div>，到>就已经结束了，不再继续匹配该标签内的属性
        //    attr = html.match(attribute)  匹配属性并赋值当前属性的匹配结果
        //    !(end = html.match(startTagClose))   没有匹配到开始标签的关闭符号>或/>

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 将匹配到的属性,push到attrs数组中，匹配到关闭符号>,while 就结束
          console.log("匹配到属性 attr = " + JSON.stringify(attr)); // console.log("匹配到属性 name = " + attr[1] + "value = " + attr[3] || attr[4] || attr[5])

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); // 截取匹配到的属性 xxx=xxx
        } // 匹配到关闭符号>,当前标签处理完成 while 结束,
        // 此时，<div id="app" 处理完成，需连同关闭符号>一起被截取掉


        if (end) {
          console.log("匹配关闭符号结果 html.match(startTagClose):" + JSON.stringify(end));
          advance(end[0].length);
        } // 开始标签处理完成后，返回匹配结果：tagName标签名 + attrs属性


        console.log(">>>>> 开始标签的匹配结果 startTagMatch = " + JSON.stringify(match));
        return match;
      }

      console.log("未匹配到开始标签，返回 false");
      console.log("===============================");
      return false;
    } // 对模板不停截取，直至全部解析完毕


    while (html) {
      // 解析标签和文本(看开头是否为<)
      let index = html.indexOf('<');

      if (index == 0) {
        // 标签
        console.log("解析 html：" + html + ",结果：是标签"); // 如果是标签，继续解析开始标签和属性

        const startTagMatch = parseStartTag(); // 匹配开始标签，返回匹配结果

        if (startTagMatch) {
          // 匹配到了，说明是开始标签
          // 匹配到开始标签，调用start方法，传递标签名和属性
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue; // 如果是开始标签，就不需要继续向下走了，继续 while 解析后面的部分
        } // 如果开始标签没有匹配到，有可能是结束标签 </div>


        let endTagMatch;

        if (endTagMatch = html.match(endTag)) {
          // 匹配到了，说明是结束标签
          // 匹配到开始标签，调用start方法，传递标签名和属性
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue; // 如果是结束标签，也不需要继续向下走了，继续 while 解析后面的部分
        }
      } else {
        // 文本
        console.log("解析 html：" + html + ",结果：是文本");
      } // 文本：index > 0 


      if (index > 0) {
        // 将文本取出来并发射出去,再从 html 中拿掉
        let chars = html.substring(0, index); // hello</div>

        text(chars);
        advance(chars.length);
      }
    }

    console.log("当前 template 模板，已全部解析完成");
  }

  function compileToFunction(template) {
    console.log("***** 进入 compileToFunction：将 template 编译为 render 函数 *****"); // 1，将模板变成 AST 语法树

    let ast = parserHTML(template);
    console.log("解析 HTML 返回 ast 语法树：" + JSON.stringify(ast));
  }

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

      if (vm.$options.el) {
        // 将数据挂在到页面上（此时,数据已经被劫持）
        vm.$mount(vm.$options.el);
      }
    }; // 支持 new Vue({el}) 和 new Vue().$mount 两种情况


    Vue.prototype.$mount = function (el) {
      console.log("***** 进入 $mount，el = " + el + "*****");
      const vm = this;
      const opts = vm.$options;
      el = document.querySelector(el); // 获取真实的元素

      vm.$el = el; // vm.$el 表示当前页面上的真实元素

      console.log("获取真实的元素，el = " + el); // 如果没有 render, 看 template

      if (!opts.render) {
        console.log("options 中没有 render , 继续取 template"); // 如果没有 template, 采用元素内容

        let template = opts.template;

        if (!template) {
          console.log("options 中没有 template, 取 el.outerHTML = " + el.outerHTML); // 拿到整个元素标签,将模板编译为 render 函数

          template = el.outerHTML;
        } else {
          console.log("options 中有 template = " + template);
        }

        let render = compileToFunction(template);
        console.log("打印 compileToFunction 返回的 render = " + JSON.stringify(render));
        opts.render = render;
      } // console.log(opts.render)

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
