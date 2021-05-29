// 匹配标签名：aa-xxx
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
// 命名空间标签：aa:aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 匹配标签名(索引1)：<aa:aa-xxx
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 匹配标签名(索引1)：</aa:aa-xxxdsadsa> 
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// 匹配属性（索引 1 为属性 key、索引 3、4、5 其中一直为属性值）：aaa="xxx"、aaa='xxx'、aaa=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配结束标签：> 或 />
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{   xxx    }} ，匹配到 xxx
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function parserHTML(html) {
  console.log("***** 进入 parserHTML：将模板编译成 AST 语法树 *****")
  // 开始标签
  function start(tagName, attrs) {
    console.log("发射匹配到的开始标签-start,tagName = " + tagName + ",attrs = " + JSON.stringify(attrs))
  }
  // 结束标签
  function end(tagName) {
    console.log("发射匹配到的结束标签-end,tagName = " + tagName)
  }
  // 文本
  function text(chars) {
    console.log("发射匹配到的文本-text,chars = " + chars)
  }
  /**
   * 截取字符串
   * @param {*} len 截取长度
   */
  function advance(len) {
    html = html.substring(len);
    console.log("截取匹配内容后的 html:" + html)
    console.log("===============================")
  }

  /**
   * 匹配开始标签,返回匹配结果
   */
  function parseStartTag() {
    console.log("***** 进入 parseStartTag，尝试解析开始标签，当前 html： " + html + "*****")
    // 匹配开始标签，开始标签名为索引 1
    const start = html.match(startTagOpen);
    if(start){// 匹配到开始标签再处理
      // 构造匹配结果，包含：标签名 + 属性
      const match = {
        tagName: start[1],
        attrs: []
      }
      console.log("html.match(startTagOpen) 结果:" + JSON.stringify(match))
      // 截取匹配到的结果
      advance(start[0].length)
      let end;  // 是否匹配到开始标签的结束符号>或/>
      let attr; // 存储属性匹配的结果
      // 匹配属性且不能为开始的结束标签，例如：<div>，到>就已经结束了，不再继续匹配该标签内的属性
      //    attr = html.match(attribute)  匹配属性并赋值当前属性的匹配结果
      //    !(end = html.match(startTagClose))   没有匹配到开始标签的关闭符号>或/>
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // 将匹配到的属性,push到attrs数组中，匹配到关闭符号>,while 就结束
        console.log("匹配到属性 attr = " + JSON.stringify(attr))
        // console.log("匹配到属性 name = " + attr[1] + "value = " + attr[3] || attr[4] || attr[5])
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length)// 截取匹配到的属性 xxx=xxx
      }
      // 匹配到关闭符号>,当前标签处理完成 while 结束,
      // 此时，<div id="app" 处理完成，需连同关闭符号>一起被截取掉
      if (end) {
        console.log("匹配关闭符号结果 html.match(startTagClose):" + JSON.stringify(end))
        advance(end[0].length)
      }

      // 开始标签处理完成后，返回匹配结果：tagName标签名 + attrs属性
      console.log(">>>>> 开始标签的匹配结果 startTagMatch = " + JSON.stringify(match))
      return match;
    }
    console.log("未匹配到开始标签，返回 false")
    console.log("===============================")
    return false;
  }

  // 对模板不停截取，直至全部解析完毕
  while (html) {
    // 解析标签和文本(看开头是否为<)
    let index = html.indexOf('<');
    if (index == 0) {// 标签
      console.log("解析 html：" + html + ",结果：是标签")
      // 如果是标签，继续解析开始标签和属性
      const startTagMatch = parseStartTag();// 匹配开始标签，返回匹配结果
      if (startTagMatch) {  // 匹配到了，说明是开始标签
        // 匹配到开始标签，调用start方法，传递标签名和属性
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue; // 如果是开始标签，就不需要继续向下走了，继续 while 解析后面的部分
      }
      // 如果开始标签没有匹配到，有可能是结束标签 </div>
      let endTagMatch;
      if (endTagMatch = html.match(endTag)) {// 匹配到了，说明是结束标签
        // 匹配到开始标签，调用start方法，传递标签名和属性
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue; // 如果是结束标签，也不需要继续向下走了，继续 while 解析后面的部分
      }
    } else {// 文本
      console.log("解析 html：" + html + ",结果：是文本")
    }

    // 文本：index > 0 
    if(index > 0){
      // 将文本取出来并发射出去,再从 html 中拿掉
      let chars = html.substring(0,index) // hello</div>
      text(chars);
      advance(chars.length)
    }
  }
  console.log("当前 template 模板，已全部解析完成")
}

export function compileToFunction(template) {
  console.log("***** 进入 compileToFunction：将 template 编译为 render 函数 *****")
  // 1，将模板变成 AST 语法树
  let ast = parserHTML(template);
  console.log("解析 HTML 返回 ast 语法树：" + JSON.stringify(ast))
}