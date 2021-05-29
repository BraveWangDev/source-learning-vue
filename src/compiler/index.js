import { parserHTML } from "./parser";

export function compileToFunction(template) {
  console.log("***** 进入 compileToFunction：将 template 编译为 render 函数 *****")
  // 1，将模板变成 AST 语法树
  let ast = parserHTML(template);
  console.log("解析 HTML 返回 ast 语法树====>")
  console.log(ast)
}