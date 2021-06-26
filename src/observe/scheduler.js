import { nextTick } from "../utils";

let queue = []; // 用于缓存渲染 watcher
let has = {};   // 存放 watcher 唯一 id，用于 watcher 的查重
let pending = false;// 控制 setTimeout 只走一次

/**
 * 刷新队列：执行所有 watcher.run 并将队列清空；
 */
function flushschedulerQueue() {
  queue.forEach(watcher => watcher.run()) // 依次触发视图更新
  queue = [];       // reset
  has = {};         // reset
  pending = false;  // reset
}

/**
 * 将 watcher 进行查重并缓存，最后统一执行更新
 * @param {*} watcher 需更新的 watcher
 */
export function queueWatcher(watcher) {
  let id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    queue.push(watcher);  // 缓存住watcher,后续统一处理
    if (!pending) {       // 等效于防抖
      nextTick(flushschedulerQueue);
      pending = true;     // 首次进入被置为 true，使微任务执行完成后宏任务才执行
    }
  }
}