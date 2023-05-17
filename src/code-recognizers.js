//common
const THRESHOLD = 0.5;
const MIN_MATCHES = 4;

const name = /([\w.]+)/;
const names = /([\w.]+)(, ?[\w.]+)*/;
const var_name = /(\w(\w|\.\w)*(\[.*\](.\w(\w|\.\w)*)?)?)/;

//python
const simple_comment = /(#.*)/;
const start_line = /^( |\t)*/;
const multi_comment = /('''(.|[\r\n])*?'''|"""(.|[\r\n])*?""")/;
const end_line = /(( |\t)*(#.*)?)$/;
const statement = /(.+?)/;
const assign = / *[+\-*\/]?= */;

const reg_import = new RegExp (`^(from [\\w.]+ )?import ${names.source}${end_line.source}`, 'mg');
const reg_func = new RegExp (`${start_line.source}def \\w+\\(${statement.source}?\\)( *-> *[\\w.\\[\\]:]+)?:${end_line.source}`, 'mg');
const reg_return = new RegExp (`${start_line.source}(return|yeild)( ${statement.source})?${end_line.source}`, 'mg');
const reg_cond = new RegExp (`${start_line.source}(if|elif|for|while) *${statement.source}:${end_line.source}`, 'mg');
const reg_else = new RegExp (`${start_line.source}else *:${end_line.source}`, 'mg');
const reg_assign = new RegExp (`${start_line.source}${var_name.source}${assign.source}${statement.source}${end_line.source}`, 'mg');
const reg_call = new RegExp (`${start_line.source}${var_name.source}\\(${statement.source}?\\)${end_line.source}`, 'mg');
const reg_class = new RegExp (`${start_line.source}class \\w+(\\(${name.source}\\))?:${end_line.source}`, 'mg');
const reg_break = new RegExp (`${start_line.source}(break|continue)${end_line.source}`, 'mg');
const reg_comment = new RegExp (`${start_line.source}${multi_comment.source}${end_line.source}`, 'mg');
const reg_empty_line = new RegExp (`${start_line.source}${simple_comment.source}?\n`, 'mg');

const python_patterns = [reg_import, reg_func, reg_return, reg_cond, reg_else, reg_assign, reg_call, reg_class, reg_break, reg_comment, reg_empty_line];

//javascript
const simple_comment_js = /(\/\/.*)/;
const start_line_js = /^[ \t]*/;
const multi_comment_js = /(\/\*(.|[\r\n])*?\*\/)/;
const end_line_js = /([ \t]*(\/\/.*)?)$/;
const var_js = /((var|let|const) +)/;
const export_js = /(export( default)? +)/;
const statement_js = /([^;]+?)/;  // maybe also not \n ?

const reg_import_js = new RegExp (`^import (${names.source}|{ *${names.source} *}) from "[\\w.]+";*${end_line_js.source}`, 'mg');
const reg_func_js = new RegExp (`${start_line_js.source}${export_js.source}?function \\w+\\(${statement_js.source}?\\) *{${end_line_js.source}`, 'mg');
const reg_return_js = new RegExp (`${start_line_js.source}return( ${statement_js.source})?;${end_line_js.source}`, 'mg');
const reg_cond_js = new RegExp (`${start_line_js.source}(if|for|while|(} *)?else if) *\\(${statement_js.source}\\)( *{)?${end_line_js.source}`, 'mg');  // allow ; in for
const reg_else_js = new RegExp (`${start_line_js.source}(} *)?else( *{)?${end_line_js.source}`, 'mg');
const reg_assign_js = new RegExp (`${start_line_js.source}(${export_js.source}?${var_js.source})?${var_name.source}${assign.source}${statement_js.source};${end_line_js.source}`, 'mg');
const reg_call_js = new RegExp (`${start_line_js.source}${var_name.source}\\(${statement_js.source}?\\) *;${end_line_js.source}`, 'mg');
const reg_class_js = new RegExp (`${start_line_js.source}class \\w+ *{${end_line_js.source}`, 'mg');
const reg_break_js = new RegExp (`${start_line_js.source}(break|continue);${end_line_js.source}`, 'mg');
const reg_comment_js = new RegExp (`${start_line_js.source}${multi_comment_js.source}${end_line_js.source}`, 'mg');
const reg_empty_line_js = new RegExp (`${start_line_js.source}[{}]?${simple_comment_js.source}?\n`, 'mg');

const js_patterns = [reg_import_js, reg_func_js, reg_return_js, reg_cond_js, reg_else_js, reg_assign_js, reg_call_js, reg_class_js, reg_break_js, reg_comment_js, reg_empty_line_js];

function isPythonCode(text) {
  return isCode(python_patterns, text);
}

function isJavaScriptCode(text) {
  return isCode(js_patterns, text);
}

function isCode(patterns, text) {
  let spans = [];
  for (let pattern of patterns) {
    let matches = [...text.matchAll(pattern)];
    spans.push(...matches.map((m) => m.index !== undefined ? [m.index, m.index + m[0].length] : null).filter(Boolean));
  }
  if (spans.length < MIN_MATCHES) {
    return false;
  }

  let united_spans = [];
  for (let [begin, end] of spans.sort(([a], [b]) => a - b)) {
    if (united_spans.length > 0 && united_spans[united_spans.length - 1][1] >= begin - 1) {
      united_spans[united_spans.length - 1] = [united_spans[united_spans.length - 1][0], end];
    } else {
      united_spans.push([begin, end]);
    }
  }
  console.log(united_spans);
  let num_detected = united_spans.reduce((sum, [start, end]) => sum + (end - start), 0);
  return num_detected / text.length > THRESHOLD;
}

if (typeof window === 'undefined') {
    module.exports = {
      isPythonCode,
      isJavaScriptCode,
    };
  }