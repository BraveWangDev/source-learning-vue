import babel from 'rollup-plugin-babel'
// 实现按照 node 方式解析文件,可以自动找到入口文件 index.js
import resolve from 'rollup-plugin-node-resolve';

// rollup 配置文件，导出一个rollup 配置对象
export default {
    input:'./src/index.js', // 打包的入口
    output:{
        file:'dist/vue.js', // 打包的出口
        format:'umd',// 常见的格式 IIFE（立即执行函数） ESM（ES6模块） CJS(Node规范) UMD（支持 AMD+CJS）
        name:'Vue', // umd模块需要配置name，会将导出的模块放到window上,
        //如果在node中使用，选用cjs；如果只是打包 webpack里面导入,esm模块;前端里 script用，使用 iife 或 umd
        //一般源码会输出多种包，output可以定义为一个数组
        sourcemap:true, // 可以进行源代码调试  调试 E5 代码报错了，我们要知道是 ES6 代码的哪一行出错了
    },
    // 使用插件转译代码
    plugins:[
        resolve(),
        babel({
            exclude:'node_modules/**' // glob写法 去掉node_modules下的所有文件夹下的所有文件（两个*）
        })
    ]
}
