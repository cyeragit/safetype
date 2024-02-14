//common
const THRESHOLD = 0.6;
const MIN_MATCHES = 4;

const name = /([\w.]{1,30})/;
const names = /([\w.]+)(, ?[\w.]+)*/;
const var_name = /(\w(\.?\w)*(\[.*\](.\w(\.?\w)*)?)?)/;
const assign = /[ \t]*[+\-*\/]?= */;  // FN `a(x).b = 1`

//python
const simple_comment = /(#.*)/;
const start_line = /^[ \t]{0,30}?/;
const multi_comment = /('''(.|[\r\n])*?'''|"""(.|[\r\n])*?""")/;
const end_line = /([ \t]{0,30}(#.*)?)$/;
const statement = /(.+?)/;


const pat_import = {regex: new RegExp (`^(from [\\w.]+ )?import ${names.source}${end_line.source}`, 'mg'), count: true};
const pat_func = {regex: new RegExp (`${start_line.source}def \\w+\\(${statement.source}?\\)( *-> *[\\w.\\[\\]:]+)?:${end_line.source}`, 'mg'), count: true};
const pat_return = {regex: new RegExp (`${start_line.source}(return|yeild)( ${statement.source})?${end_line.source}`, 'mg'), count: true};
const pat_cond = {regex: new RegExp (`${start_line.source}(if|elif|for|while) *${statement.source}:${end_line.source}`, 'mg'), count: true};
const pat_else = {regex: new RegExp (`${start_line.source}else *:${end_line.source}`, 'mg'), count: true};
const pat_assign = {regex: new RegExp (`${start_line.source}${var_name.source}${assign.source}${statement.source}${end_line.source}`, 'mg'), count: true};
const pat_call = {regex: new RegExp (`${start_line.source}${var_name.source}\\(${statement.source}?\\)${end_line.source}`, 'mg'), count: true};
const pat_class = {regex: new RegExp (`$class \\w+(\\(${name.source}\\))?:${end_line.source}`, 'mg'), count: true};
const pat_break = {regex: new RegExp (`${start_line.source}(break|continue)${end_line.source}`, 'mg'), count: true};
const pat_comment = {regex: new RegExp (`${start_line.source}${multi_comment.source}${end_line.source}`, 'mg'), count: false};
const pat_empty_line = {regex: new RegExp (`${start_line.source}${simple_comment.source}?$`, 'mg'), count: false};

const python_patterns = [pat_import, pat_func, pat_return, pat_cond, pat_else, pat_assign, pat_call, pat_class, pat_break, pat_comment, pat_empty_line];

//javascript
const simple_comment_js = /(\/\/.*)/;
const start_line_js = /^[ \t]*/;
const multi_comment_js = /(\/\*(.|[\r\n])*?\*\/)/;
const end_line_js = /([ \t]*(\/\/.*)?)$/;
const var_js = /((var|let|const) +)/;
const export_js = /(export( default)? +)/;
const statement_js = /([^;]+?)/;

const pat_import_js = {regex: new RegExp (`^import (${names.source}|{ *${names.source} *}) from "[\\w./-]+";*${end_line_js.source}`, 'mg'), count: true};
const pat_func_js = {regex: new RegExp (`${start_line_js.source}(${export_js.source}?function \\w+|constructor)\\(${statement_js.source}?\\) *{${end_line_js.source}`, 'mg'), count: true};
const pat_return_js = {regex: new RegExp (`${start_line_js.source}return( ${statement_js.source})?;${end_line_js.source}`, 'mg'), count: true};
const pat_cond_js = {regex: new RegExp (`${start_line_js.source}(if|for|while|(} *)?else if) *\\(${statement_js.source}\\)( *{)?${end_line_js.source}`, 'mg'), count: true};
const pat_for_js = {regex: new RegExp (`${start_line_js.source}for *\\(${statement_js.source}?;${statement_js.source}?;${statement_js.source}?\\)( *{)?${end_line_js.source}`, 'mg'), count: true};
const pat_else_js = {regex: new RegExp (`${start_line_js.source}(} *)?else( *{)?${end_line_js.source}`, 'mg'), count: true};
const pat_assign_js = {regex: new RegExp (`${start_line_js.source}(${export_js.source}?${var_js.source})?${var_name.source}${assign.source}${statement_js.source};${end_line_js.source}`, 'mg'), count: true};
const pat_call_js = {regex: new RegExp (`${start_line_js.source}${var_name.source}\\(${statement_js.source}?\\) *;${end_line_js.source}`, 'mg'), count: true};
const pat_class_js = {regex: new RegExp (`${start_line_js.source}class \\w+ *{${end_line_js.source}`, 'mg'), count: true};
const pat_break_js = {regex: new RegExp (`${start_line_js.source}(break|continue);${end_line_js.source}`, 'mg'), count: true};
const pat_comment_js = {regex: new RegExp (`${start_line_js.source}${multi_comment_js.source}${end_line_js.source}`, 'mg'), count: false};
const pat_empty_line_js = {regex: new RegExp (`${start_line_js.source}([\\[\\(\\{]*[\\]\\)\\}]*;?)${end_line_js.source}`, 'mg'), count: false};

const js_patterns = [pat_import_js, pat_func_js, pat_return_js, pat_cond_js, pat_for_js, pat_else_js, pat_assign_js, pat_call_js, pat_class_js, pat_break_js, pat_comment_js, pat_empty_line_js];

function isPythonCode(text) {
  return isCode(python_patterns, text);
}

function isJavaScriptCode(text) {
  return isCode(js_patterns, text);
}

function isCode(patterns, text) {
  let spans = [];
  let count = 0;
  for (let pattern of patterns) {
    let matches = [...text.matchAll(pattern.regex)];
    spans.push(...matches.map((m) => m.index !== undefined ? [m.index, m.index + m[0].length] : null).filter(Boolean));
    if (pattern.count) {
        count += matches.length;
    }
  }
  if (count < MIN_MATCHES) {
    return false;
  }

  let united_spans = [];
  for (let [begin, end] of spans.sort((a, b) => a[0] - b[0])) {
    if (united_spans.length > 0 && united_spans[united_spans.length - 1][1] >= begin - 1) {
      united_spans[united_spans.length - 1][1] = Math.max(end, united_spans[united_spans.length - 1][1]);
    } else {
      united_spans.push([begin, end]);
    }
  }
  let num_detected = united_spans.reduce((sum, [start, end]) => sum + (end - start), 0);
  return num_detected / text.length > THRESHOLD;
}

if (typeof window === 'undefined') {
    module.exports = {
      isPythonCode,
      isJavaScriptCode,
    };
  }