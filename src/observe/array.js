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
  arrayMethods[method] = function () {
    console.log('数组的方法进行重写操作 method = ' + method)
  }
});
methods.forEach(method => {
  arrayMethods[method] = function () {
    console.log('数组的方法进行重写操作 method = ' + method)
  }
});

// 数组劫持的实现：劫持这 7个方法，所以修改索引和长度都是不能触发视图变化的