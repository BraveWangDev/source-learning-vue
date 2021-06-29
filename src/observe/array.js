// 重写数组方法
// 思路：拿到原来的方法，将部分需要重写的方法重写掉

let oldArrayPrototype = Array.prototype;// 获取数组老的原型方法

// 通过arrayMethods上的链能拿到数组上的原有方法	arrayMethods.__proto__ == oldArrayPrototype
export let arrayMethods = Object.create(oldArrayPrototype);// 使arrayMethods可以通过__proto__，能获取到数组的方法

// 重写这7个会导致数组发生变化的方法（影响原数组变化的方法，会影响到视图的更新）
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]

// 为arrayMethods添加这 7 个“重写方法”
//  arrayMethods.push()  会在自己身上找到重写的push方法
//  arrayMethods.concat() 自己身上没找到，回去链上找到原来的方法
// 这种方式的好处：
//  属性的查找会先在自己身上找，找不到再去原型上找，所以会优先调用重写的方法
//  同时，只重写了 data 中数组原型的方法，不会影响到其他数组
// 数组劫持的实现，因为只劫持了这7个方法，所以修改数组的索引和长度都不能触发视图更新
methods.forEach(method => {
  // 当前的外部调用：arr.push
  arrayMethods[method] = function (...args) {
    console.log('数组的方法进行重写操作 method = ' + method)
    // AOP:before 原生方法扩展... 
    // 调用数组原生方法逻辑（绑定到当前调用上下文）
    oldArrayPrototype[method].call(this, ...args)
    // AOP::after 原生方法扩展...

    // 数组新增的属性如果是属性，要继续观测
    // 哪些方法有增加数组的功能: splice push unshift
    let inserted = null;
    let ob = this.__ob__;
    
    switch (method) {
      // arr.splice(0,0,100) 如果splice方法用于增加,一定有第三个参数,从第三个开始都是添加的内容
      case 'splice':  // 修改 删除 添加
        inserted = args.slice(2); // splice方法从第三个参数起是新增数据
      case 'push':    // 向前增加
      case 'unshift': // 向后增加
        inserted = args // push、unshift的参数就是新增
        break;
    }

    // observeArray：内部遍历inserted数组,调用observe方法，是对象就new Observer，继续深层观测
    if(inserted)ob.observeArray(inserted);// inserted 有值就是数组
    ob.dep.notify();  // 触发视图更新
  }
});

// 数组劫持的实现：劫持这 7个方法，所以修改索引和长度都是不能触发视图变化的