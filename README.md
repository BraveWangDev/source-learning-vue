# source-learning-vue

### 1，环境搭建:使用 Rollup 构建 Vue2 项目；
### 2，Vue初始化流程:initMixin、initState；
### 3，对象劫持:通过Object.defineProperty实现对象数据类型的深层观测；

### 4，数组方法重写、实例取值代理实现；
### 5，实现数组类型的深层观测；
### 6，parserHTML1-匹配模板的标签和属性；
### 7，parserHTML2-构建为 AST 语法树；
### 8，ast 生成 render 函数；；
### 9，根据 vnode 创建真实节点并实现新老节点的替换；
### 10，依赖收集与视图更新流程；
### 11，nextTick 异步更新的实现；
### 12，数组的依赖收集；
### 13，生命周期与Mixin的实现；
### 14，外层diff：虚拟节点diff比对；patch方法改造支持外层diff；支持文本、元素、style更新；
### 15，diff算法的优化：针对头头、尾尾、头尾、尾头4种情况的优化处理；
### 16，diff算法的乱序比对：根据老节点创建映射关系，筛查老节点，添加新节点，删除多余节点；
### 17，diff算法的收尾：根据 preVnode 区分初渲染与更新渲染，删除模拟更新代码，实现diff更新;
### 18，组件部分-Vue.component、Vue.extend、组件合并；