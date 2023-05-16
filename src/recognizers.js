const defaults = {
  kind: 'personal', // 'personal' / 'security' / 'financial' / 'code'
  contextDelimiters: ['.', ';', '\n', '\r'],
  prevContextLength: 30,
  nextContextLength: 10,
  mustMatchPositiveContext: false,
  mustNotMatchNegativeContext: false,
  displayRegexGroupId: 0,
  validationRegexGroupId: 0,
  filterRegexGroupId: 0,
  minCount: 1, // relevant only for 'code' kind
};

if (typeof window === 'undefined') {
  const utils = require('../src/validators.js');
  isValidIBANNumber = utils.isValidIBANNumber;
  mod97 = utils.mod97;
}

const supportedRecognizers = [
  // {
  //   ...defaults,
  //   name: 'Email Address',
  //   kind : 'personal',
  //
  //   // 1st
  //   positiveMatch: new RegExp(
  //     `(\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b)`,
  //     'gi'
  //   ),
  //   displayRegexGroupId: 0,
  //   // 2nd
  //   positiveFilter: new RegExp(
  //     `(\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b)`,
  //     'gi'
  //   ),
  //   // 3rd
  //   negativeFilter: new RegExp(
  //     `(\\b[a-zA-Z0-9._%+-]+@example\\.com\\b)`,
  //     'gi'
  //   ),
  //   validationRegexGroupId: 1,
  //   validators: [
  //     (text) => {
  //       return !text.includes('@example123.com');
  //
  //     },
  //     (text) => {
  //       if (text.includes('@test.com')) {
  //         return false;
  //       }
  //       return true;
  //     }
  //   ],
  //   positiveContext: new RegExp(
  //     `(\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b)`,
  //     'gi'
  //   ),
  //   negativeContext: new RegExp(
  //     `(\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b)`,
  //     'gi'
  //   ),
  //   // logic - positive or not negative unless it's a must
  //   anonymous: 'john.doe@example.com',
  // },
  {
    ...defaults,
    name: 'Email Address',
    kind: 'personal',

    positiveMatch: new RegExp(
      `\\b(?:[+\\-_\\d]{1,15}_?|(?:recipient|to)[\\W_]+)?([+\\-\\w]{1,50}(?:\\.{1,5}[+\\-\\w]{1,50}){0,10}[@](?:\\w{1,30})(?:[-.]\\w{1,30}){0,2}\\.(?:com|gov|io|(?:co\\.)?[A-Za-z]{2,20}))\\w{0,20}\\b`,
      'gi'
    ),
    displayRegexGroupId: 1,
    negativeFilter: new RegExp(
      `^[^@]@|@(?:[^\\.]\\.|(?:s|ex)ample\\.com\\b)`,
      'gi'
    ),
    anonymous: 'john.doe@example.com',
  },
  {
    ...defaults,
    name: 'MAC Address',
    kind: 'security',

    positiveMatch: new RegExp(
      `\\b(?:[\\da-f]{2}([:-])[\\da-f]{2}(?:\\1[\\da-f]{2}){4}|[\\dA-F]{2}([:-])[\\dA-F]{2}(?:\\2[\\dA-F]{2}){4})(?!(?:\\1|\\2)[\\da-fA-F]{2})\\b`,
      'gi'
    ),
    positiveContext: new RegExp(`mac`, 'gi'),
    negativeContext: new RegExp(`\\b(imei\\b|[\\da-fA-F]{2}[:-]$)`, 'gi'),
    anonymous: 'FF:FF:FF:FF:FF:FF',
  },
  {
    ...defaults,
    name: 'Public IP Address',
    kind: 'security',

    positiveMatch: new RegExp(
      `(?:\\b(?:2(?:[6-9]|5[0-5]?|[0-4]\\d?)?|1\\d{0,2}|[3-9]\\d?|0)(?:\\.(?:2(?:[6-9]|5[0-5]?|[0-4]\\d?)?|1\\d{0,2}|[3-9]\\d?|0)){3}|ip-(?:2(?:[6-9]|5[0-5]?|[0-4]\\d?)?|1\\d{0,2}|[3-9]\\d?|0)(?:-(?:2(?:[6-9]|5[0-5]?|[0-4]\\d?)?|1\\d{0,2}|[3-9]\\d?|0)){3})\\b|(?:\\b(?:[0-9a-fA-F]{1,4}:)(?:[0-9a-fA-F]{1,4}:){6}(?:[0-9a-fA-F]{1,4})|(?:(?:\\b[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){0,5})?::(?:[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){2,5})))\\b`,
      'gi'
    ),
    negativeFilter: new RegExp( // filter out private IP addresses
      `(?:^|ip-)(?:(?:0|127)[\\.\\-]0\\.0|10|172[\\.\\-](?:1[6-9]|2\\d|3[01])|192[\\.\\-]168|25[45])[\\.\\-]|^((?:0{1,4}:){7}0{0,3}1|f(?:c|e80))`,
      'gi'
    ),
    anonymous: '192.168.0.1',
  },
  {
    ...defaults,
    name: 'IBAN',
    kind: 'financial',

    positiveMatch: new RegExp(
      `\\b([A-Z]{2}[ \\-]?[0-9]{2})(?=(?:[ \\-]?[A-Z0-9]){9,30})((?:[ \\-]?[A-Z0-9]{3,5}){2,7})([ \\-]?[A-Z0-9]{1,3})?\\b`,
      'gi'
    ),
    validators: [
      (text) => {
        return isValidIBANNumber(text);
      },
    ],
    anonymous: 'XX12345678901234567890',
  },
  {
    ...defaults,
    name: 'DB Connection String',
    kind: 'security',

    positiveMatch: new RegExp(
      `(["']?)((?:(?:server|data.source|provider)=[^;]{1,50}; ?)(?:[^=;]{1,50}=[^;]{1,50}; ?){1,10}(?:[^=;]{1,50}=[^;\\s]{1,50};?))\\1`,
      'gi'
    ),
    displayRegexGroupId: 2,
    // mustMatchPositiveContext: true,
    // positiveContext: new RegExp(
    //   `(?:(?:mongo|maria).?db|(?:\\b|_)db(?:\\b|_|(?=[pu]))|database|(?:\\b|_)rds|postgres|mysql|mssql|aurora|oracle|sqlite|redis|sql(?:.?server)?|neo4j).{0,5}conn(?:ection)?.?str`,
    //   'gi'
    // ),
    anonymous: 'MyDBConnectionString',
  },
  {
    ...defaults,
    name: 'Password',
    kind: 'security',

    positiveMatch: new RegExp(
      `([\\"\\']?)(?:password|parole|kennwort|(?:\\b|_|^)(?:pwd|pass)(?:\\b|_|$))\\1[\\]]?(?:[ \\t]{0,10}(?:(?:is|was)(?:.?(?:updated|changed|set).?to)?|[=:\\-]+).?[ \\t]{0,10})(?:^|\\b|[\\s\\:\\-\\,\\_\\'\\"])([\\'\\"]?)([^\\s]{4,40}?)\\2?(?:$|[\\s\\:\\-\\,\\_\\'\\"])`,
      'gi'
    ),
    displayRegexGroupId: 3,
    negativeFilter: new RegExp(
      `[a-z]{2,15}(?:\\.[a-z]{2,15})?[([{].{0,20}[)\\]}]|\\d{4}([\\-\\\\/_])\\d{1,2}\\1\\d{1,2}|\\b(?:(?:migrate|hash)(?:e?[sd])?\\b|[a-f\\d]{8}(?:-[a-f\\d]{4}){3}|(?:[\\$\\:]?[^\\$\\:]{1,7}[\\$\\:]){1,2}.{10,30})|^(?:null|none|false|true|(?:un.?)?assign|(?:in.?)?valid|import|[^\\d]+|\\d+(?:(?:,\\d{3}){1,3}|\\.\\d+))(?:e?[sd])?$`,
      'gi'
    ),
    anonymous: 'MyAnonymizedPassword',
  },
  // {
  //   ...defaults,
  //   name: 'Password Permissive',
  //   kind: 'security',
  //   positiveMatch: new RegExp(
  //     `(?:^|\\b|[\\s\\:\\-\\,\\_\\'\\"])([\\'\\"]?)([^\\s]{6,40})\\1?(?:$|[\\s\\:\\-\\,\\_\\'\\"])`,
  //     'gi'
  //   ),
  //   displayRegexGroupId: 2,
  //   negativeFilter: new RegExp(
  //     `[a-z]{2,15}(?:\\.[a-z]{2,15})?[([{].{0,20}[)\\]}]|\\d{4}([\\-\\\\/_])\\d{1,2}\\1\\d{1,2}|\\b(?:(?:migrate|hash)(?:e?[sd])?\\b|[a-f\\d]{8}(?:-[a-f\\d]{4}){3}|(?:[\\$\\:]?[^\\$\\:]{1,7}[\\$\\:]){1,2}.{10,30})|^(?:null|none|false|true|(?:un.?)?assign|(?:in.?)?valid|import|[^\\d]+|[^a-z]+|\\d+(?:(?:,\\d{3}){1,3}|\\.\\d+))(?:e?[sd])?$`,
  //     'gi'
  //   ),
  //   mustMatchPositiveContext: true,
  //   positiveContext: new RegExp(
  //     `([\\"\\']?)(?:password|parole|kennwort|(?:\\b|_|^)(?:pwd|pass)(?:\\b|_|$))\\1[:\\-=]?`,
  //     'gi'
  //   ),
  //   mustNotMatchNegativeContext: true,
  //   negativeContext: new RegExp(
  //     `date|reset|last.{0,10}updated|label|type|salt`,
  //     'gi'
  //   ),
  //   anonymous: 'MyAnonymizedPassword',
  // },
  {
    ...defaults,
    name: 'Hashed Password',
    kind: 'security',

    positiveMatch: new RegExp(
      `(?:\\b|^)(?:(?:([\\$\\:]?)[^\\$]{1,7}[\\$\\:]){1,2}([a-z\\d/.]{31,240})|([a-f\\d]{32,240}))(?:\\b|$)`,
      'gi'
    ),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(
      `hasc?h.{1,5}(?:password|parole|kennwort)|(?:passwords?|parole|kennwort).{1,5}hasc?h`,
      'gi'
    ),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `date|reset|last.{0,10}updated|label|type|salt`,
      'gi'
    ),
    anonymous: 'MyHashedPassword',
  },
  {
    ...defaults,
    name: 'HTTP Cookie',
    kind: 'security',

    positiveMatch: new RegExp(
      `((?:[^()<>@,;:\\\\\\"/[\\]?={}\\s]+)=(?:[^\\s,;\\"\\\\]{5,4096});?)`,
      'gi'
    ),
    displayRegexGroupId: 1,
    negativeFilter: new RegExp(`[()<>@:/[\\]?={}][^=]*?=`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`cookie`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `recipe|dough|chocolate|monster|macaroo?n|butter|biscotti|sugar|ginger|fortune|sweet|date|reset|label|flag|time|number|type|create|insert|age|count|modif[y|ied]|version|cookieid`,
      'gi'
    ),
    anonymous: 'MyHTTPCookie',
  },
  {
    ...defaults,
    name: 'Bitcoin Address',
    kind: 'financial',

    positiveMatch: new RegExp(`\\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\\b`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`addr(ess)?|bitcoin|btc`, 'gi'),
    anonymous: 'MyBitcoinAddress',
  },
  {
    ...defaults,
    name: 'PGP Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `-----BEGIN PGP PRIVATE KEY BLOCK-----(.|\\s)+?-----END PGP PRIVATE KEY BLOCK-----`,
      'gi'
    ),
    anonymous: 'MyPGPPrivateKey',
  },
  {
    ...defaults,
    name: 'SSH Putty Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `PuTTY-User-Key-File-[^\:]{1,20}:[^\r\n]{1,50}\nEncryption:`,
      'gi'
    ),
    anonymous: 'MySSHPuttyPrivateKey',
  },
  {
    ...defaults,
    name: 'RSA Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `-----BEGIN RSA PRIVATE KEY-----[A-Za-z\\d\/+=\\s]{2,}-----END RSA PRIVATE KEY-----`,
      'gi'
    ),
    anonymous: 'MyRSAPrivateKey',
  },
  {
    ...defaults,
    name: 'DSA Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `-----BEGIN DSA PRIVATE KEY-----[A-Za-z\\d\/+=\\s]{2,}-----END DSA PRIVATE KEY-----`,
      'gi'
    ),
    anonymous: 'MyDSAPrivateKey',
  },
  {
    ...defaults,
    name: 'ECDSA Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `-----BEGIN EC PRIVATE KEY-----[A-Za-z\\d\/+=\\s]{2,}-----END EC PRIVATE KEY-----`,
      'gi'
    ),
    anonymous: 'MyECDSAPrivateKey',
  },
  {
    ...defaults,
    name: 'SSH Private Key',
    kind: 'security',
    // "b3BlbnNzaC1rZXktdjE" == base64.b64encode(b"openssh-key-v1").decode().rstrip("=")
    positiveMatch: new RegExp(
      `-----BEGIN OPENSSH PRIVATE KEY-----[A-Za-z\\d\/+=\\s]{2,}-----END OPENSSH PRIVATE KEY-----|b3BlbnNzaC1rZXktdjE[A-Za-z\d\/+=\s]*`,
      'gi'
    ),
    anonymous: 'MySSHPrivateKey',
  },
  {
    ...defaults,
    name: 'PEM Private Key',
    kind: 'security',

    positiveMatch: new RegExp(
      `-----BEGIN ((?:[A-Z]+ )?)PRIVATE KEY-----[A-Za-z\\d\/+=\\s]{2,}-----END \\1PRIVATE KEY-----`,
      'gi'
    ),
    anonymous: 'MyPEMPrivateKey',
  },
  {
    ...defaults,
    name: 'AWS Secret Key',
    kind: 'security',

    positiveMatch: new RegExp(
      // `(?<![a-z\\d/+=])([a-z\\d/+=]{40})(?![a-z\\d/+=])`,
      `\\b([a-z\\d/+=]{40})(?![a-z\\d/+=])`,
      'gi'
    ),
    positiveFilter: new RegExp(`[g-z/+=]`, 'gi'),
    negativeFilter: new RegExp(`^(?:[^\\d]+|[^a-z]+)$`, 'gi'),
    validationRegexGroupId: 1,
    // validators: [
    //   (text) => {
    //     return (text.match('\\d') || []).length > 5;
    //   },
    //   (text) => {
    //     return (text.match('[a-zA-Z]') || []).length > 5;
    //   },
    // ],
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`aws.?secret|secret.?key(?!.?word)`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(`aws.?access(?:.?key)?.?id`, 'gi'),
    anonymous: 'MyAWSSecretKey',
  },
  {
    ...defaults,
    name: 'Access Key',
    kind: 'security',
    positiveMatch: new RegExp(`(?:\\b|_)([a-z\\d/+=]{10,})(?:\\b|_)`, 'gi'),
    negativeFilter: new RegExp(`^(?:[^\\d]+|[^a-z]+)$`, 'gi'),
    displayRegexGroupId: 1,
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`access.?key`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(`aws`, 'gi'),
    anonymous: 'MyAccessKey',
  },
  {
    ...defaults,
    name: 'Private Key',
    kind: 'security',

    positiveMatch: new RegExp(`(?:\\b|_)([a-z\\d/+=]{10,})(?:\\b|_)`, 'gi'),
    negativeFilter: new RegExp(`^(?:[^\\d]+|[^a-z]+)$`, 'gi'),
    displayRegexGroupId: 1,
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`private.?key`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `-----BEGIN ((?:[A-Z]+ )?)PRIVATE KEY(?: BLOCK)?-----|-----END \\1PRIVATE KEY(?: BLOCK)?-----`,
      'gi'
    ),
    anonymous: 'MyPrivateKey',
  },
  {
    ...defaults,
    name: 'Access Token',
    kind: 'security',

    positiveMatch: new RegExp(`[\\w!@#$%^&*()\\-]{6,126}`, 'gi'),
    negativeFilter: new RegExp(`^(?:[A-Za-z]{8,16}|[^\\d]+)$`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`(?:access|oauth).{0,10}token`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `(?:\\b|_)id$|dt$|flag|(?:\\b|_)time(?:\\b|_)|number|type|date$|updated`,
      'gi'
    ),
    anonymous: 'MyAccessToken',
  },
  {
    ...defaults,
    name: 'Refresh Token',
    kind: 'security',

    positiveMatch: new RegExp(`[\\w!@#$%^&*()\\-]{6,126}`, 'gi'),
    negativeFilter: new RegExp(`^(?:[A-Za-z]{8,16}|[^\\d]+)$`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`refresh.{0,10}token`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `(?:\\b|_)id$|dt$|flag|(?:\\b|_)time(?:\\b|_)|number|type|date$|updated`,
      'gi'
    ),
    anonymous: 'MyRefreshToken',
  },
  {
    ...defaults,
    name: 'Password Reset Token',
    kind: 'security',

    positiveMatch: new RegExp(`[\\w!@#$%^&*()\\-]{6,126}`, 'gi'),
    negativeFilter: new RegExp(`^(?:[A-Za-z]{8,16}|[^\\d]+)$`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(
      `(?:pass(?:word)?.{0,10}res(?:et|tart)|res(?:et|tart).{0,10}pass(?:word)?).{0,10}token`,
      'gi'
    ),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `(?:\\b|_)id$|dt$|flag|(?:\\b|_)time(?:\\b|_)|number|type|date$|updated`,
      'gi'
    ),
    prevContextLength: 50,
    anonymous: 'MyPasswordResetToken',
  },
  {
    ...defaults,
    name: 'Session Token',
    kind: 'security',

    positiveMatch: new RegExp(`[\\w!@#$%^&*()\\-]{6,126}`, 'gi'),
    negativeFilter: new RegExp(`^(?:[A-Za-z]{8,16}|[^\\d]+)$`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`session.{0,10}token`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `(?:\\b|_)id$|dt$|flag|(?:\\b|_)time(?:\\b|_)|number|type|date$|updated`,
      'gi'
    ),
    anonymous: 'MySessionToken',
  },
  {
    ...defaults,
    name: 'Token',
    kind: 'security',

    positiveMatch: new RegExp(`[\\w!@#$%^&*()\\-]{6,126}`, 'gi'),
    negativeFilter: new RegExp(`^(?:[A-Za-z]{8,16}|[^\\d]+)$`, 'gi'),
    mustMatchPositiveContext: true,
    positiveContext: new RegExp(`token(?!s|ed|ism|ing)`, 'gi'),
    mustNotMatchNegativeContext: true,
    negativeContext: new RegExp(
      `(?:\\b|_)id$|dt$|flag|(?:\\b|_)time(?:\\b|_)|number|type|date$|updated`,
      'gi'
    ),
    anonymous: 'MyToken',
  },
  {
    ...defaults,
    name: 'Javascript Code',
    kind: 'code',
    minCount: 2,
    positiveMatch: new RegExp(
      '([a-zA-Z$_][a-zA-Z0-9$_]*)\\s*=\\s*\\([^)]*\\)\\s*=>',
      'gi'
    ),
  },
];
if (typeof window === 'undefined') {
  module.exports = supportedRecognizers;
}
