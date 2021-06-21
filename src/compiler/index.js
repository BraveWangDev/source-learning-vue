import { parserHTML } from "./parser";

// 将attrs数组=>{key=val,key=val,}
function genProps(attrs) {
  let str = '';
  for(let i = 0; i< attrs.length; i++){
    let attr = attrs[i];
    
    if(attr.name == "style"){ // 将样式处理为对象 {name:id, value:'app'}
      let styles = {};
      // <div id="app" style="color: red;background: blue;"></div>
      // 使用replace正则匹配：不断进行key 和 value替换
      // ^;: 不是分号(分割属性和值)、冒号(结尾)
      attr.value.replace(/([^;:]+):([^;:]+)/g, function () {
        styles[arguments[1]] = arguments[2]
      }) 
      attr.value = styles;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`// JSON.stringify 将 value 转为 string
  }
  return `{${str.slice(0, -1)}}`;// 去掉最后一位多余的，外边套上{}
 }

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function gen(el) {
  console.log("===== gen ===== el = ",el)
  if(el.type == 1){// 
    console.log("元素标签 tag = "+el.tag+"，generate继续递归处理")
    return generate(el);// 如果是元素就递归的生成
  }else{// 文本类型
    let text = el.text
    console.log("文本类型,text = " + text)
    if(!defaultTagRE.test(text)){
      return `_v('${text}')`  // 普通文本，包装_v
    }else{
      // 存在{{}}表达式，需进行表达式 和 普通值的拼接 
      // 目标：['aaa',_s(name),'bbb'].join('+') ==> _v('aaa' + s_(name) + 'bbb')
      let lastIndex = defaultTagRE.lastIndex = 0;
      let tokens = []; // <div>aaa {{name}} bbb</div>
      let match
      while(match = defaultTagRE.exec(text)){
        console.log("匹配内容" + text)
        let index = match.index;// match.index：指当前捕获到的位置
        console.log("当前的 lastIndex = " + lastIndex)
        console.log("匹配的 match.index = " + index)
        if(index > lastIndex){  // 将前一段 ’<div>aaa '中的 aaa 放入 tokens 中
          let preText = text.slice(lastIndex, index)
          console.log("匹配到表达式-找到表达式开始前的部分：" + preText)
          tokens.push(JSON.stringify(preText))// 利用 JSON.stringify 加双引号
        }

        console.log("匹配到表达式：" + match[1].trim())
        // 放入 match 到的表达式，如{{ name  }}（match[1]是花括号中间的部分，并处理可能存在的换行或回车）
        tokens.push(`_s(${match[1].trim()})`)
        // 更新 lastIndex 长度到'<div>aaa {{name}}'
        lastIndex = index + match[0].length;  // 更新 lastIndex 长度到'<div>aaa {{name}}'
      }

      // while 循环后可能还剩余一段，如：’ bbb</div>’，需要将 bbb 放到 tokens 中
      if(lastIndex < text.length){
        let lastText = text.slice(lastIndex);
        console.log("表达式处理完成后，还有内容需要继续处理："+lastText)
        tokens.push(JSON.stringify(lastText))// 从lastIndex到最后
      }
      
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(el) {
  console.log("===== genChildren =====")
  let children = el.children;
  if(children){
    console.log("存在 children, 开始遍历处理子节点．．．", children)
    let result = children.map(item => gen(item)).join(',');
    console.log("子节点处理完成，result = " + JSON.stringify(result))
    return result
  }
  console.log("不存在 children, 直接返回 false")
  return false;
}

// _c(div,{},c1,c2,c3...)
function generate(ast) {

  console.log("===== generate =====> 当前 ast = ")
  console.log(ast)
  let children = genChildren(ast);

  console.log("===== 开始拼装 render 函数 =====")
  let code = `_c('${ast.tag}',${
    ast.attrs.length? genProps(ast.attrs):'undefined'
  }${
    children?`,${children}`:''
  })`
  console.log("===== render 函数 =====> code = " + code)

  return code;
}

export function compileToFunction(template) {
  console.log("***** 进入 compileToFunction：将 template 编译为 render 函数 *****")
  
  // 1，将模板变成 AST 语法树
  let ast = parserHTML(template);
  // 2，使用 AST 生成 render 函数
  let code = generate(ast); // 生成 code
  let render = new Function(`with(this){return ${code}}`);  // 包装 with + new Function
  // console.log("包装 with 生成 render 函数："+ render.toString())
  
  return render
}