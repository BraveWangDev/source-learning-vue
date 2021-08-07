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
    console.log("***** 进入 parserHTML：将模板编译成 AST 语法树 *****");
    let stack = [];
    let root = null; // 构建父子关系

    function createASTElement(tag, attrs, parent) {
      return {
        tag,
        // 标签名
        type: 1,
        // 元素类型为 1
        children: [],
        // 儿子
        parent,
        // 父亲
        attrs // 属性

      };
    } // 开始标签,如:[div,p]


    function start(tag, attrs) {
      console.log("发射匹配到的开始标签-start,tag = " + tag + ",attrs = " + JSON.stringify(attrs)); // 遇到开始标签，就取栈中最后一个，作为父节点

      let parent = stack[stack.length - 1];
      let element = createASTElement(tag, attrs, parent); // 还没有根节点时，作为根节点

      if (root == null) root = element;

      if (parent) {
        // 父节点存在
        element.parent = parent; // 为当前节点设置父节点

        parent.children.push(element); // 同时，当前节点也称为父节点的子节点
      }

      stack.push(element);
    } // 结束标签


    function end(tagName) {
      console.log("发射匹配到的结束标签-end,tagName = " + tagName); // 如果是结束标签，就从栈中抛出

      let endTag = stack.pop(); // check:抛出的结束标签名与当前结束标签名是否一直

      if (endTag.tag != tagName) console.log("标签出错");
    } // 文本


    function text(chars) {
      console.log("发射匹配到的文本-text,chars = " + chars); // 文本直接放到前一个中 注意：文本可能有空白字符

      let parent = stack[stack.length - 1];
      chars = chars.replace(/\s/g, ""); // 将空格替换为空，即删除空格

      if (chars) {
        parent.children.push({
          type: 2,
          // 文本类型为 2
          text: chars
        });
      }
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
    return root;
  }

  function genProps(attrs) {
    let str = '';

    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];

      if (attr.name == "style") {
        // 将样式处理为对象 {name:id, value:'app'}
        let styles = {}; // <div id="app" style="color: red;background: blue;"></div>
        // 使用replace正则匹配：不断进行key 和 value替换
        // ^;: 不是分号(分割属性和值)、冒号(结尾)

        attr.value.replace(/([^;:]+):([^;:]+)/g, function () {
          styles[arguments[1]] = arguments[2];
        });
        attr.value = styles;
      }

      str += `${attr.name}:${JSON.stringify(attr.value)},`; // JSON.stringify 将 value 转为 string
    }

    return `{${str.slice(0, -1)}}`; // 去掉最后一位多余的，外边套上{}
  }

  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function gen(el) {
    console.log("===== gen ===== el = ", el);

    if (el.type == 1) {
      // 
      console.log("元素标签 tag = " + el.tag + "，generate继续递归处理");
      return generate(el); // 如果是元素就递归的生成
    } else {
      // 文本类型
      let text = el.text;
      console.log("文本类型,text = " + text);

      if (!defaultTagRE.test(text)) {
        return `_v('${text}')`; // 普通文本，包装_v
      } else {
        // 存在{{}}表达式，需进行表达式 和 普通值的拼接 
        // 目标：['aaa',_s(name),'bbb'].join('+') ==> _v('aaa' + s_(name) + 'bbb')
        let lastIndex = defaultTagRE.lastIndex = 0;
        let tokens = []; // <div>aaa {{name}} bbb</div>

        let match;

        while (match = defaultTagRE.exec(text)) {
          console.log("匹配内容" + text);
          let index = match.index; // match.index：指当前捕获到的位置

          console.log("当前的 lastIndex = " + lastIndex);
          console.log("匹配的 match.index = " + index);

          if (index > lastIndex) {
            // 将前一段 ’<div>aaa '中的 aaa 放入 tokens 中
            let preText = text.slice(lastIndex, index);
            console.log("匹配到表达式-找到表达式开始前的部分：" + preText);
            tokens.push(JSON.stringify(preText)); // 利用 JSON.stringify 加双引号
          }

          console.log("匹配到表达式：" + match[1].trim()); // 放入 match 到的表达式，如{{ name  }}（match[1]是花括号中间的部分，并处理可能存在的换行或回车）

          tokens.push(`_s(${match[1].trim()})`); // 更新 lastIndex 长度到'<div>aaa {{name}}'

          lastIndex = index + match[0].length; // 更新 lastIndex 长度到'<div>aaa {{name}}'
        } // while 循环后可能还剩余一段，如：’ bbb</div>’，需要将 bbb 放到 tokens 中


        if (lastIndex < text.length) {
          let lastText = text.slice(lastIndex);
          console.log("表达式处理完成后，还有内容需要继续处理：" + lastText);
          tokens.push(JSON.stringify(lastText)); // 从lastIndex到最后
        }

        return `_v(${tokens.join('+')})`;
      }
    }
  }

  function genChildren(el) {
    console.log("===== genChildren =====");
    let children = el.children;

    if (children) {
      console.log("存在 children, 开始遍历处理子节点．．．", children);
      let result = children.map(item => gen(item)).join(',');
      console.log("子节点处理完成，result = " + JSON.stringify(result));
      return result;
    }

    console.log("不存在 children, 直接返回 false");
    return false;
  } // _c(div,{},c1,c2,c3...)


  function generate(ast) {
    console.log("===== generate =====> 当前 ast = ");
    console.log(ast);
    let children = genChildren(ast);
    console.log("===== 开始拼装 render 函数 =====");
    let code = `_c('${ast.tag}',${ast.attrs.length ? genProps(ast.attrs) : 'undefined'}${children ? `,${children}` : ''})`;
    console.log("===== render 函数 =====> code = " + code);
    return code;
  }

  function compileToFunction(template) {
    console.log("***** 进入 compileToFunction：将 template 编译为 render 函数 *****"); // 1，将模板变成 AST 语法树

    let ast = parserHTML(template); // 2，使用 AST 生成 render 函数

    let code = generate(ast); // 生成 code

    let render = new Function(`with(this){return ${code}}`); // 包装 with + new Function
    // console.log("包装 with 生成 render 函数："+ render.toString())

    return render;
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
  let callbacks = []; // 缓存异步更新的 nextTick

  let waiting = false;

  function flushsCallbacks() {
    callbacks.forEach(fn => fn()); // 依次执行 nextTick

    callbacks = []; // reset

    waiting = false; // reset
  }
  /**
   * 将方法异步化
   * @param {*} fn 需要异步化的方法
   * @returns 
   */


  function nextTick(fn) {
    // return Promise.resolve().then(fn);
    callbacks.push(fn); // 先缓存异步更新的nextTick,后续统一处理

    if (!waiting) {
      Promise.resolve().then(flushsCallbacks);
      waiting = true; // 首次进入被置为 true,控制逻辑只走一次
    }
  }
  let strats = {}; // 存放所有策略

  let lifeCycle = ['beforeCreate', 'created', 'beforeMount', 'mounted'];
  lifeCycle.forEach(hook => {
    // 创建生命周期的合并策略
    strats[hook] = function (parentVal, childVal) {
      if (childVal) {
        // 儿子有值，需要进行合并
        if (parentVal) {
          // 父亲儿子都有值：父亲一定是数组，将儿子合入父亲
          return parentVal.concat(childVal);
        } else {
          // 儿子有值，父亲没有值：儿子放入新数组中
          // return [childVal]
          // 注意：如果传入的生命周期函数是数组，已经是数组了不能再包成数组
          if (Array.isArray(childVal)) {
            return childVal;
          } else {
            return [childVal];
          }
        }
      } else {
        // 儿子没有值，无需合并，直接返回父亲即可
        return parentVal;
      }
    };
  });
  /**
   * 对象合并:将childVal合并到parentVal中
   * @param {*} parentVal   父值-老值
   * @param {*} childVal    子值-新值
   */

  function mergeOptions(parentVal, childVal) {
    let options = {};

    for (let key in parentVal) {
      mergeFiled(key);
    }

    for (let key in childVal) {
      // 当新值存在，老值不存在时：添加到老值中
      if (!parentVal.hasOwnProperty(key)) {
        mergeFiled(key);
      }
    } // 合并当前 key 


    function mergeFiled(key) {
      // 策略模式：获取当前合并策略
      let strat = strats[key];

      if (strat) {
        options[key] = strat(parentVal[key], childVal[key]);
      } else {
        // 默认合并策略：新值覆盖老值
        options[key] = childVal[key] || parentVal[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    // 全局属性：Vue.options
    // 功能：存放 mixin, component, filte, directive 属性
    Vue.options = {};

    Vue.mixin = function (options) {
      this.options = mergeOptions(this.options, options);
      console.log("打印mixin合并后的options", this.options);
      return this; // 返回this,提供链式调用
    };

    Vue.component = function (options) {};

    Vue.filte = function (options) {};

    Vue.directive = function (options) {};
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

      ob.dep.notify(); // 触发视图更新
    };
  }); // 数组劫持的实现：劫持这 7个方法，所以修改索引和长度都是不能触发视图变化的

  let id$1 = 0;

  class Dep {
    constructor() {
      this.id = id$1++;
      this.subs = [];
    } // 让 watcher 记住 dep（查重），再让 dep 记住 watcher


    depend() {
      // 相当于 watcher.addDep：使当前 watcher 记住 dep
      Dep.target.addDep(this);
    } // 让 dep 记住 watcher - 在 watcher 中被调用


    addSub(watcher) {
      this.subs.push(watcher);
    } // dep 中收集的全部 watcher 依次执行更新方法 update


    notify() {
      this.subs.forEach(watcher => watcher.update());
    }

  }

  Dep.target = null; // 静态属性，用于记录当前 watcher

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
      // 为 Observer 实例添加 dep 用于收集依赖
      this.dep = new Dep(); // 为对象或数组本身添加了一个 dep 属性
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

        console.log(value);
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
   * 使数组中的引用类型都进行依赖收集
   * @param {*} value 需要做递归依赖收集的数组
   */


  function dependArray(value) {
    // 数组中如果有对象:[{}]或[[]]，也要做依赖收集（后续会为对象新增属性）
    for (let i = 0; i < value.length; i++) {
      let current = value[i]; // current 上如果有__ob__，说明是对象，就让 dep 收集依赖（只有对象上才有 __ob__）

      current.__ob__ && current.__ob__.dep.depend(); // 如果内部还是数组，继续递归处理

      if (Array.isArray(current)) {
        dependArray(current);
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
    let childOb = observe(value); // 递归实现深层观测

    let dep = new Dep(); // 为每个属性添加一个 dep

    Object.defineProperty(obj, key, {
      // get方法构成闭包：取obj属性时需返回原值value，
      // value会查找上层作用域的value，所以defineReactive函数不能被释放销毁
      get() {
        if (Dep.target) {
          // 对象属性的依赖收集
          dep.depend(); // 数组或对象本身的依赖收集

          if (childOb) {
            // 如果 childOb 有值，说明数据是数组或对象类型
            // observe 方法中，会通过 new Observe 为数组或对象本身添加 dep 属性
            childOb.dep.depend(); // 让数组和对象本身的 dep 记住当前 watcher

            if (Array.isArray(value)) {
              // 如果当前数据是数组类型
              // 可能数组中继续嵌套数组，需递归处理
              dependArray(value);
            }
          }
        }

        return value;
      },

      set(newValue) {
        // 确保新对象为响应式数据：如果新设置的值为对象，需要再次进行劫持
        console.log("修改了被观测属性 key = " + key + ", newValue = " + JSON.stringify(newValue));
        if (newValue === value) return;
        observe(newValue); // observe方法：如果是对象，会 new Observer 深层观测

        value = newValue;
        dep.notify(); // 通知当前 dep 中收集的所有 watcher 依次执行视图更新
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

  let queue = []; // 用于缓存渲染 watcher

  let has = {}; // 存放 watcher 唯一 id，用于 watcher 的查重

  let pending = false; // 控制 setTimeout 只走一次

  /**
   * 刷新队列：执行所有 watcher.run 并将队列清空；
   */

  function flushschedulerQueue() {
    // 更新前,执行生命周期：beforeUpdate
    queue.forEach(watcher => watcher.run()); // 依次触发视图更新

    queue = []; // reset

    has = {}; // reset

    pending = false; // reset
    // 更新完成,执行生命周期：updated
  }
  /**
   * 将 watcher 进行查重并缓存，最后统一执行更新
   * @param {*} watcher 需更新的 watcher
   */


  function queueWatcher(watcher) {
    let id = watcher.id;

    if (has[id] == null) {
      has[id] = true;
      queue.push(watcher); // 缓存住watcher,后续统一处理

      if (!pending) {
        // 等效于防抖
        nextTick(flushschedulerQueue);
        pending = true; // 首次进入被置为 true，使微任务执行完成后宏任务才执行
      }
    }
  }

  let id = 0;

  class Watcher {
    constructor(vm, fn, cb, options) {
      this.vm = vm;
      this.fn = fn;
      this.cb = cb;
      this.options = options;
      this.id = id++; // watcher 唯一标记

      this.depsId = new Set(); // 用于当前 watcher 保存 dep 实例的唯一id

      this.deps = []; // 用于当前 watcher 保存 dep 实例

      this.getter = fn; // fn 为页面渲染逻辑

      this.get();
    }

    addDep(dep) {
      let did = dep.id; // dep 查重 

      if (!this.depsId.has(did)) {
        // 让 watcher 记住 dep
        this.depsId.add(did);
        this.deps.push(dep); // 让 dep 也记住 watcher

        dep.addSub(this);
      }
    }

    get() {
      Dep.target = this; // 在触发视图渲染前，将 watcher 记录到 Dep.target 上

      this.getter(); // 调用页面渲染逻辑

      Dep.target = null; // 渲染完成后，清除 Watcher 记录
    }

    update() {
      console.log("watcher-update", "查重并缓存需要更新的 watcher");
      queueWatcher(this);
    }

    run() {
      console.log("watcher-run", "真正执行视图更新");
      this.get();
    }

  }

  // 参数：_c('标签', {属性}, ...儿子)
  function createElement(vm, tag, data = {}, ...children) {
    // 返回元素的虚拟节点（元素是没有文本的）
    return vnode(vm, tag, data, children, data.key, undefined);
  }
  function createText(vm, text) {
    // 返回文本的虚拟节点（文本没有标签、数据、儿子、key）
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  /**
   * 判断两个虚拟节点是否是同一个虚拟节点
   *  逻辑：标签名 和 key 都相同
   * @param {*} newVnode 新虚拟节点
   * @param {*} oldVnode 老虚拟节点
   * @returns 
   */

  function isSameVnode(newVnode, oldVnode) {
    return newVnode.tag === oldVnode.tag && newVnode.key === oldVnode.key;
  } // 通过函数返回vnode对象
  // 后续元素需要做 diff 算法，需要 key 标识

  function vnode(vm, tag, data, children, key, text) {
    return {
      vm,
      // 谁的实例
      tag,
      // 标签
      data,
      // 数据
      children,
      // 儿子
      key,
      // 标识
      text // 文本

    };
  }

  /**
   * 将虚拟节点转为真实节点后插入到元素中
   * @param {*} oldVnode  老的虚拟节点
   * @param {*} vnode     新的虚拟节点
   * @returns             新的真实元素
   */

  function patch(oldVnode, vnode) {
    // console.log("patch-oldVnode", oldVnode);
    // console.log("patch-newVnode", vnode);
    const isRealElement = oldVnode.nodeType; // 元素的节点类型是1，虚拟节点无此属性

    if (isRealElement) {
      // 元素代表是真实节点
      // 1，根据虚拟节点创建真实节点
      const elm = createElm(vnode); // 2，使用真实节点替换掉老节点
      // 找到元素的父亲节点

      const parentNode = oldVnode.parentNode; // 找到老节点的下一个兄弟节点（nextSibling 若不存在将返回 null）

      const nextSibling = oldVnode.nextSibling; // 将新节点 elm 插入到老节点el的下一个兄弟节点 nextSibling 的前面
      // 备注：若 nextSibling 为 null，insertBefore 等价于 appendChild

      parentNode.insertBefore(elm, nextSibling); // 删除老节点 el

      parentNode.removeChild(oldVnode);
      return elm;
    } else {
      console.log("patch-oldVnode", oldVnode);
      console.log("patch-newVnode", vnode); // diff：新老虚拟节点比对

      if (!isSameVnode(oldVnode, vnode)) {
        // 同级比较，不是相同节点时，不考虑复用（放弃跨层复用），直接用新的替换旧的
        return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      } // 相同节点，就复用节点（复用老的），再更新不一样的地方（属性），注意文本要做特殊处理，文本是没有标签名的
      // 文本的处理：文本直接更新就可以，因为文本没有儿子  组件中 Vue.component（‘xxx’）这就是组件的 tag


      let el = vnode.el = oldVnode.el; // 节点复用：将老节点el，赋值给新节点el

      if (!oldVnode.tag) {
        // 文本：没有标签名
        if (oldVnode.text !== vnode.text) {
          // 文本内容变化了，更新文本内容：用新的内容更新老的内容
          return el.textContent = vnode.text;
        } else {
          // 文本没变化也结束：否则会继续进入 updateProperties处理元素，再进入情况3的updateChildren
          // 但整体影响不大，会因条件不符不执行,但做好的做法还是直接 return 掉吧
          return;
        }
      } // 元素的处理：相同节点，且新老节点不都是文本时


      updateProperties(vnode, oldVnode.data); // 比较儿子节点

      let oldChildren = oldVnode.children || {};
      let newChildren = vnode.children || {}; // 情况 1：老的有儿子，新的没有儿子；直接把老的 dom 元素干掉即

      if (oldChildren.length > 0 && newChildren.length == 0) {
        el.innerHTML = ''; //暴力写法直接清空；更好的处理是封装removeChildNodes方法：将子节点全部删掉，因为子节点可能包含组件
        // 情况 2：老的没有儿子，新的有儿子；直接将新的插入即可
      } else if (oldChildren.length == 0 && newChildren.length > 0) {
        newChildren.forEach(child => {
          // 注意：这里的child是虚拟节点，需要变为真实节点
          let childElm = createElm(child); // 根据新的虚拟节点，创建一个真实节点

          el.appendChild(childElm); // 将生成的真实节点，放入 dom
        }); // 情况 3：新老都有儿子
      } else {
        // 递归: updateChildren 内部调用 patch, patch, 内部还会调用 updateChildren (patch 方法是入口)
        updateChildren(el, oldChildren, newChildren);
      }

      return el; // 返回新节点
    }
  }
  /**
   * 新老都有儿子时做比对，即 diff 算法核心逻辑
   * 备注：采用头尾双指针的方式；优化头头、尾尾、头尾、尾头的特殊情况；
   * @param {*} el 
   * @param {*} oldChildren  老的儿子节点
   * @param {*} newChildren  新的儿子节点
   */

  function updateChildren(el, oldChildren, newChildren) {
    // vue2中的diff算法内部做了优化，尽量提升性能，实在不行再暴力比对
    // 常见情况：在列表中，新增或删除某一项（用户很少在列表的中间添加一项）
    // 声明头尾指针
    let oldStartIndex = 0;
    let oldStartVnode = oldChildren[0];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndVnode = oldChildren[oldEndIndex];
    let newStartIndex = 0;
    let newStartVnode = newChildren[0];
    let newEndIndex = newChildren.length - 1;
    let newEndVnode = newChildren[newEndIndex];
    /**
     * 根据children创建映射
     */

    function makeKeyByIndex(children) {
      let map = {};
      children.forEach((item, index) => {
        map[item.key] = index;
      });
      return map;
    }

    let mapping = makeKeyByIndex(oldChildren); // while 循环处理，所以 diff 算法的复杂度为O(n)，只循环一遍
    // 循环结束条件：有一方遍历完了就结束；即"老的头指针和尾指针重合"或"新的头指针和尾指针重合"
    // 备注: 此while循环中主要对4种特殊情况进行优化处理,包括：头头、尾尾、头尾、尾头

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 当前循环开始时，先处理当前的oldStartVnode和oldEndVnode为空的情况； 原因：节点之前被移走时置空，直接跳过
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex]; // 头头比较：比较新老开始节点
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // isSameVnode只能判断标签和key是否一样，但还有可能属性不一样
        // 所以还需要使用patch方法比对新老虚拟节点的属性，
        // 而patch方法是递归比对的，同时还会递归比较子节点
        patch(oldStartVnode, newStartVnode); // 更新新老头指针和新老头节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; // 尾尾比较：比较新老末尾节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex]; // 头尾比较：老的头节点和新的尾节点做对比
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // patch方法只会duff比较并更新属性，但元素的位置不会变化
        patch(oldStartVnode, newEndVnode); // diff:包括递归比儿子
        // 移动节点：将当前的节点插入到最后一个节点的下一个节点的前面去

        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 移动指针

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex]; // 尾头比较
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patch(oldEndVnode, newStartVnode); // patch方法只会更新属性，元素的位置不会变化
        // 移动节点:将老的尾节点移动到老的头节点前面去

        el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将尾部插入到头部
        // 移动指针

        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // 前面4种逻辑（头头、尾尾、头尾、尾头）,主要是考虑到用户使用时的一些特殊场景，但也有非特殊情况，如：乱序排序
        // 筛查当前新的头指针对应的节点在mapping中是否存在
        let moveIndex = mapping[newStartVnode.key];

        if (moveIndex == undefined) {
          // 没有，将当前比对的新节点插入到老的头指针对用的节点前面
          // 将当前新的虚拟节点创建为真实节点，插入到老的开始节点前面
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          // 有,需要复用
          // 将当前比对的老节点移动到老的头指针前面
          let moveVnode = oldChildren[moveIndex]; // 从老的队列中找到可以被复用的这个节点
          // 复用：更新复用节点的属性，插入对应位置

          patch(moveVnode, newStartVnode);
          el.insertBefore(moveVnode.el, oldStartVnode.el); // 由于复用的节点在oldChildren中被移走了,之前的位置要标记为空(指针移动时，跳过会使用)

          oldChildren[moveIndex] = undefined;
        } // 每次处理完成后，新节点的头指针都需要向后移动
        // 备注：
        // 		无论节点是否可复用，新指针都会向后移动，所以最后统一处理；
        //    节点可复用时，老节点的指针移动会在4种特殊情况中被处理完成；


        newStartVnode = newChildren[++newStartIndex];
      }
    } // 至此，完成了相同节点的比较，下面开始处理不同的节点
    // 1，新的多（以新指针为参照）插入新增的


    if (newStartIndex <= newEndIndex) {
      // 新的开始指针和新的结束指针之间的节点
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        // 判断当前尾节点的下一个元素是否存在：
        //  1，如果存在：则插入到下一个元素的前面
        //  2，如果不存在（下一个是 null） ：就是 appendChild
        // 取参考节点anchor:决定新节点放到前边还是后边
        //  逻辑：取去newChildren的尾部+1,判断是否为 null
        //  解释：如果有值说明是向前移动的，取出此虚拟元素的真实节点el，将新节点添加到此真实节点前即可
        let anchor = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el; // // 获取对应的虚拟节点，并生成真实节点，添加到 dom 中
        // el.appendChild(createElm(newChildren[i]))
        // 逻辑合并:将 appendChild 改为 insertBefore
        //  效果：既有appendChild又有insertBefore的功能，直接将参考节点放进来即可;
        //  解释：对于insertBefore方法,如果anchor为null，等同于appendChild;如果有值，则是insertBefore;

        el.insertBefore(createElm(newChildren[i]), anchor);
      }
    } // 2，旧的多，（以旧指针为参照）删除多余的真实节点


    if (oldStartIndex <= oldEndIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        let child = oldChildren[i]; // child有值时才删除；原因：节点有可能在移走时被置为undefined

        child && el.removeChild(child.el);
      }
    }
  } // 面试：虚拟节点的实现？如何将虚拟节点渲染成真实节点


  function createElm(vnode) {
    // 虚拟节点必备的三个：标签，数据，孩子
    let {
      tag,
      data,
      children,
      text,
      vm
    } = vnode; // vnode.el:绑定真实节点与虚拟节点的映射关系，便于后续的节点更新操作

    if (typeof tag === 'string') {
      // 元素
      // 处理当前元素节点
      vnode.el = document.createElement(tag); // 创建元素的真实节点

      updateProperties(vnode, data); // 处理元素的 data 属性
      // 处理当前元素节点的儿子：递归创建儿子的真实节点，并添加到对应的父亲中

      children.forEach(child => {
        // 若不存在儿子，children为空数组
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 文本：文本中 tag 是 undefined
      vnode.el = document.createTextNode(text); // 创建文本的真实节点
    }

    return vnode.el;
  } // 循环 data 添加到 el 的属性上
  // 后续 diff 算法时进行完善，没有考虑样式等

  function updateProperties(vnode, oldProps = {}) {
    // 1,初次渲染，用oldProps给vnode的 el 赋值即可
    // 2,更新逻辑，拿到老的props和vnode中的 data 进行比对
    let el = vnode.el; // dom上的真实节点（上边复用老节点时已经赋值了）

    let newProps = vnode.data || {}; // 拿到新的数据

    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {}; //如果老的样式有，新的没有，就删掉

    for (let key in oldStyle) {
      // 老的样式有，新的没有，就把页面上的样式删除掉
      if (!newStyle[key]) {
        el.style[key] = '';
      }
    } // 新旧比对：两个对象比对差异


    for (let key in newProps) {
      // 直接用新的盖掉老的就可以了  还要注意：老的里面有，可能新的里面没有了
      // 前后两次一样，浏览器会检测，就不会更新了，不会有性能问题
      // console.log(newProps)
      if (key == 'style') {
        // 新的里面有样式，直接覆盖即可
        for (let key in newStyle) {
          // 老的样式有，新的没有，就把页面上的样式删除掉
          console.log("更新style", el.style[key], newStyle[key]);
          el.style[key] = newStyle[key];
        }
      } else {
        el.setAttribute(key, newProps[key]);
      }
    } // 处理老的里面有，可能新的里面没有的情况，需要再删掉


    for (let key in oldProps) {
      if (!newProps[key]) {
        el.removeAttribute(key);
      }
    }
  }

  function mountComponent(vm) {
    // vm._render()：调用 render 方法
    // vm._update：将虚拟节点更新到页面上
    // 初始化流程
    // vm._update(vm._render());  
    // 改造
    let updateComponent = () => {
      vm._update(vm._render());
    }; // 当视图渲染前，调用钩子: beforeCreate


    callHook(vm, 'beforeCreate'); // 渲染 watcher ：每个组件都有一个 watcher

    new Watcher(vm, updateComponent, () => {
      console.log('Watcher-update'); // 视图更新后，调用钩子: created

      callHook(vm, 'created');
    }, true); // 当视图挂载完成，调用钩子: mounted

    callHook(vm, 'mounted');
  }
  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      console.log("_update-vnode", vnode);
      const vm = this; // 取上一次的 preVnode

      let preVnode = vm.preVnode; // 渲染前，先保存当前 vnode

      vm.preVnode = vnode; // preVnode 有值，说明已经有节点了，本次是更新渲染；没值就是初渲染

      if (!preVnode) {
        // 初渲染
        // 传入当前真实元素vm.$el，虚拟节点vnode，返回新的真实元素
        vm.$el = patch(vm.$el, vnode);
      } else {
        // 更新渲染:新老虚拟节点做 diff 比对
        vm.$el = patch(preVnode, vnode);
      }
    };
  }
  /**
   * 执行生命周期钩子
   *    从$options取对应的生命周期函数数组并执行
   * @param {*} vm    vue实例
   * @param {*} hook  生命周期
   */

  function callHook(vm, hook) {
    // 获取生命周期对应函数数组
    let handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(fn => {
        fn.call(vm); // 生命周期中的 this 指向 vm 实例
      });
    }
  }

  function initMixin(Vue) {
    // 在Vue原型上扩展一个原型方法_init,进行vue初始化
    Vue.prototype._init = function (options) {
      const vm = this; // this 指向当前 vue 实例
      // vm.$options = options; // 将 Vue 实例化时用户传入的options暴露到vm实例上
      // 此时需使用 options 与 mixin 合并后的全局 options 再进行一次合并

      vm.$options = mergeOptions(vm.constructor.options, options); // 目前在 vue 实例化时，传入的 options 只有 el 和 data 两个参数

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
        opts.render = render;
        console.log("打印 compileToFunction 返回的 render = " + render.toString());
      } // 将 render 渲染到 el 上


      mountComponent(vm);
    };

    Vue.prototype.$nextTick = nextTick;
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      // createElement 创建元素型的节点
      const vm = this;
      return createElement(vm, ...arguments); // 传入 vm 及之前的所有参数
    };

    Vue.prototype._v = function (text) {
      // 创建文本的虚拟节点
      const vm = this;
      return createText(vm, text);
    };

    Vue.prototype._s = function (val) {
      // JSON.stringify
      if (isObject(val)) {
        // 是对象就转成字符串
        return JSON.stringify(val);
      } else {
        // 不是对象就直接返回
        return val;
      }
    };

    Vue.prototype._render = function () {
      const vm = this; // vm 中有所有数据  vm.xxx => vm._data.xxx

      let {
        render
      } = vm.$options;
      let vnode = render.call(vm); // 此时内部会调用_c,_v,_s，执行完成后返回虚拟节点

      return vnode;
    };
  }

  /**
   * 在vue 中所有的功能都通过原型扩展（原型模式）的方式来添加
   * @param {*} options vue 实例化传入的配置对象
   */

  function Vue(options) {
    this._init(options); // 调用Vue原型上的方法_init

  }

  initMixin(Vue);
  renderMixin(Vue); // 混合一个 render 方法

  lifeCycleMixin(Vue);
  initGlobalAPI(Vue); // 初始化 global Api

  return Vue;

})));
//# sourceMappingURL=vue.js.map
