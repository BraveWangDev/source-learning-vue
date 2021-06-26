let id = 0;

class Dep {
  constructor(){
    this.id = id++;
    this.subs = [];
  }
  // 让 watcher 记住 dep（查重），再让 dep 记住 watcher
  depend(){
    // 相当于 watcher.addDep：使当前 watcher 记住 dep
    Dep.target.addDep(this);  
  }
  // 让 dep 记住 watcher - 在 watcher 中被调用
  addSub(watcher){
    this.subs.push(watcher);
  }
  // dep 中收集的全部 watcher 依次执行更新方法 update
  notify(){
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null;  // 静态属性，用于记录当前 watcher

export default Dep;