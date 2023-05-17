const THRESHOLD = 0.6;
const MIN_MATCHES = 4;

const simple_comment = /(#.*)/;
const start_line = /^( |\t)*/;
const multi_comment = /('''(.|[\r\n])*?'''|"""(.|[\r\n])*?""")/;
const end_line = /(( |\t)*(#.*)?)$/;
const name = /([\w.]+)/;
const names = /([\w.]+)(, ?[\w.]+)*/;
const var_name = /(\w(\w|\.\w)*(\[.*\](.\w(\w|\.\w)*)?)?)/;
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

const simple_comment_js = /(\/\/.*)/;
const start_line_js = /^[ \t]*/;
const multi_comment_js = /(\/\*(.|[\r\n])*?\*\/)/;
const end_line_js = /([ \t]*(\/\/.*)?)$/;
const var_js = /((var|let|const) +)/;
const export_js = /(export( default)? +)/;
const statement_js = /([^;]+?)/;

const reg_import_js = new RegExp (`^import (${names.source}|{ *${names.source} *}) from "[\\w.]+";*${end_line_js.source}`, 'mg');
const reg_func_js = new RegExp (`${start_line_js.source}${export_js.source}?function \\w+\\(${statement_js.source}?\\) *{${end_line_js.source}`, 'mg');
const reg_return_js = new RegExp (`${start_line_js.source}return( ${statement_js.source})?;${end_line_js.source}`, 'mg');
const reg_cond_js = new RegExp (`${start_line_js.source}(if|for|while|(} *)?else if) *\\(${statement_js.source}\\)( *{)?${end_line_js.source}`, 'mg');
const reg_else_js = new RegExp (`${start_line_js.source}(} *)?else( *{)?${end_line_js.source}`, 'mg');
const reg_assign_js = new RegExp (`${start_line_js.source}(${export_js.source}?${var_js.source})?${var_name.source}${assign.source}${statement_js.source};${end_line_js.source}`, 'mg');
const reg_call_js = new RegExp (`${start_line_js.source}${var_name.source}\\(${statement_js.source}?\\) *;${end_line_js.source}`, 'mg');
const reg_class_js = new RegExp (`${start_line_js.source}class \\w+ *{${end_line_js.source}`, 'mg');
const reg_break_js = new RegExp (`${start_line_js.source}(break|continue);${end_line_js.source}`, 'mg');
const reg_comment_js = new RegExp (`${start_line_js.source}${multi_comment_js.source}${end_line_js.source}`, 'mg');
const reg_empty_line_js = new RegExp (`${start_line_js.source}[{}]?${simple_comment_js.source}?\n`, 'mg');

const js_patterns = [reg_import_js, reg_func_js, reg_return_js, reg_cond_js, reg_else_js, reg_assign_js, reg_call_js, reg_class_js, reg_break_js, reg_comment_js, reg_empty_line_js];

function isValidPythonCode(text) {
  return isValidCode(python_patterns, text);
}

function isValidJavaScriptCode(text) {
  return isValidCode(js_patterns, text);
}

function isValidCode(patterns, text) {
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

function isValidIBANNumber(input) {
  var CODE_LENGTHS = {
    AD: 24,
    AE: 23,
    AT: 20,
    AZ: 28,
    BA: 20,
    BE: 16,
    BG: 22,
    BH: 22,
    BR: 29,
    CH: 21,
    CY: 28,
    CZ: 24,
    DE: 22,
    DK: 18,
    DO: 28,
    EE: 20,
    ES: 24,
    FI: 18,
    FO: 18,
    FR: 27,
    GB: 22,
    GI: 23,
    GL: 18,
    GR: 27,
    GT: 28,
    HR: 21,
    HU: 28,
    IE: 22,
    IL: 23,
    IS: 26,
    IT: 27,
    JO: 30,
    KW: 30,
    KZ: 20,
    LB: 28,
    LI: 21,
    LT: 20,
    LU: 20,
    LV: 21,
    MC: 27,
    MD: 24,
    ME: 22,
    MK: 19,
    MR: 27,
    MT: 31,
    MU: 30,
    NL: 18,
    NO: 15,
    PK: 24,
    PL: 28,
    PS: 29,
    PT: 25,
    QA: 29,
    RO: 24,
    RS: 22,
    SA: 24,
    SE: 24,
    SI: 19,
    SK: 24,
    SM: 27,
    TN: 24,
    TR: 26,
    AL: 28,
    BY: 28,
    CR: 22,
    EG: 29,
    GE: 22,
    IQ: 23,
    LC: 32,
    SC: 31,
    ST: 25,
    SV: 28,
    TL: 23,
    UA: 29,
    VA: 22,
    VG: 24,
    XK: 20,
  };
  var iban = String(input)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
    code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
    digits;
  // check syntax and length
  if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
    return false;
  }
  // rearrange country code and check digits, and convert chars to ints
  digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
    return letter.charCodeAt(0) - 55;
  });
  // final check
  return mod97(digits);
}

function mod97(string) {
  var checksum = string.slice(0, 2),
    fragment;
  for (var offset = 2; offset < string.length; offset += 7) {
    fragment = String(checksum) + string.substring(offset, offset + 7);
    checksum = parseInt(fragment, 10) % 97;
  }
  return checksum;
}

if (typeof window === 'undefined') {
  module.exports = {
    isValidPythonCode,
    isValidJavaScriptCode,
    isValidIBANNumber,
    mod97,
  };
}
