if (typeof window === 'undefined') {
  classify = require('../src/classifier.js');
}
const supportedRecognizers = require('../src/recognizers.js');

test('Empty classify', () => {
  expect(classify('', [], [], new Set())).toStrictEqual([]);
});

test('Email address classify', () => {
  expect(
    classify('abc@cyera.io', supportedRecognizers, [], new Set())
  ).toStrictEqual([
    {
      dataType: 'Email Address',
      kind: 'personal',
      start: 0,
      end: 12,
      kind: 'personal',
      value: 'abc@cyera.io',
    },
  ]);
});
test('Email Address long classify', () => {
  expect(
    classify(
      '11111111abjsdkdadwadwlajsdlkjaldiwiadwj37829173@gmail.com',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Email Address',
      kind: 'personal',
      start: 8,
      end: 57,
      kind: 'personal',
      value: 'abjsdkdadwadwlajsdlkjaldiwiadwj37829173@gmail.com',
    },
  ]);
});
test('Email Address too short classify', () => {
  expect(classify('d@d.df', supportedRecognizers, [], new Set())).toStrictEqual(
    []
  );
});
test('MAC Address classify', () => {
  expect(
    classify('c3:ab:5a:ff:ad:7f', supportedRecognizers, [], new Set())
  ).toStrictEqual([
    {
      dataType: 'MAC Address',
      kind: 'security',
      start: 0,
      end: 17,
      kind: 'security',
      value: 'c3:ab:5a:ff:ad:7f',
    },
  ]);
});
test('MAC Address classify FP', () => {
  expect(
    classify('ad:b3:ab:5a:ff:ad:7f', supportedRecognizers, [], new Set())
  ).toStrictEqual([]);
});
test('IP Address classify', () => {
  expect(
    classify('190.17.15.48', supportedRecognizers, [], new Set())
  ).toStrictEqual([
    {
      dataType: 'Public IP Address',
      kind: 'personal',
      start: 0,
      end: 12,
      kind: 'security',
      value: '190.17.15.48',
    },
  ]);
});
test('IBAN classify', () => {
  expect(
    classify('SE8850000000058151024062', supportedRecognizers, [], new Set())
  ).toStrictEqual([
    {
      dataType: 'IBAN',
      kind: 'financial',
      start: 0,
      end: 24,
      kind: 'financial',
      value: 'SE8850000000058151024062',
    },
  ]);
});
test('DB Connection String classify', () => {
  expect(
    classify(
      'try this Provider=sqloledb;Data Source=myServerAddress;Initial Catalog=myDataBase;User Id=myUsername;Password=myPassword;',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'DB Connection String',
      kind: 'security',
      start: 9,
      end: 121,
      kind: 'security',
      value:
        'Provider=sqloledb;Data Source=myServerAddress;Initial Catalog=myDataBase;User Id=myUsername;Password=myPassword;',
    },
  ]);
});
test('DB Connection String classify 2', () => {
  expect(
    classify(
      'db connection str: Provider=SQLOLEDB;Data Source=servername;User ID=dbuser;Password=dbpassword;Initial\n' +
        '    Catalog=database;',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'DB Connection String',
      kind: 'security',
      start: 19,
      end: 124,
      kind: 'security',
      value:
        'Provider=SQLOLEDB;Data Source=servername;User ID=dbuser;Password=dbpassword;Initial\n' +
        '    Catalog=database;',
    },
  ]);
});
test('Password classify', () => {
  expect(
    classify(
      'the password is 12341sdakl04',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Password',
      kind: 'security',
      start: 16,
      end: 28,
      kind: 'security',
      value: '12341sdakl04',
    },
  ]);
});
test('Password classify 2', () => {
  expect(
    classify(
      'os.environ["PWD"] = "ashdjk235j"',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Password',
      kind: 'security',
      start: 21,
      end: 31,
      kind: 'security',
      value: 'ashdjk235j',
    },
  ]);
});
test('Password classify exact matching', () => {
  expect(
    classify('"password": "Godke435@!"  ', supportedRecognizers, [], new Set())
  ).toStrictEqual([
    {
      dataType: 'Password',
      kind: 'security',
      start: 13,
      end: 23,
      kind: 'security',
      value: 'Godke435@!',
    },
  ]);
});
test('Password classify FP', () => {
  expect(
    classify('Your password can7 be', supportedRecognizers, [], new Set())
  ).toStrictEqual([]);
});
test('Password classify FP 2', () => {
  expect(
    classify(
      'Your password was last updated over 3 years ago',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([]);
});
test('Password classify FP 3', () => {
  expect(
    classify(
      'Your password was updated last week',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([]);
});
test('Hashed Password classify', () => {
  expect(
    classify(
      'the password hash is 40e75cf3dc081733079576b5498af7bce02e8608b3a19b48f5851d24d2f62218',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Hashed Password',
      kind: 'security',
      start: 21,
      end: 85,
      kind: 'security',
      value: '40e75cf3dc081733079576b5498af7bce02e8608b3a19b48f5851d24d2f62218',
    },
  ]);
});
test('Hashed Password FN classify', () => {
  expect(
    classify(
      'the password hash is:\n40e75cf3dc081733079576b5498af7bce02e8608b3a19b48f5851d24d2f62218',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Hashed Password',
      kind: 'security',
      start: 22,
      end: 86,
      kind: 'security',
      value: '40e75cf3dc081733079576b5498af7bce02e8608b3a19b48f5851d24d2f62218',
    },
  ]);
});
test('HTTP Cookie classify', () => {
  expect(
    classify(
      'Set-Cookie: id=a3fWa; Expires=Thu, 21 Oct 2021 07:28:00 GMT; Secure; HttpOnly',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'HTTP Cookie',
      kind: 'security',
      start: 12,
      end: 21,
      kind: 'security',
      value: 'id=a3fWa;',
    },
  ]);
});
test('Bitcoin Address classify', () => {
  expect(
    classify(
      'bitcoin 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Bitcoin Address',
      kind: 'financial',
      start: 8,
      end: 42,
      kind: 'financial',
      value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    },
  ]);
});
test('AWS Secret Key classify', () => {
  expect(
    classify(
      'aws secret key XFjRDv53Lx9xbxJ3dNQ5YFCoNQVXu9f7rd0WGFpg',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'AWS Secret Key',
      kind: 'security',
      start: 15,
      end: 55,
      kind: 'security',
      value: 'XFjRDv53Lx9xbxJ3dNQ5YFCoNQVXu9f7rd0WGFpg',
    },
  ]);
});
test('PGP Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN PGP PRIVATE KEY BLOCK-----\n' +
        'Version: GnuPG v1\n' +
        '\n' +
        'lQdGBFkW4esBEAC5GeGmDASNHTQydE9qjzjnfkuPNpAS+9SqT4WbhqE+5zQdRhzL\n' +
        'A1TE7Cub/cVlTby3gIiz3Q42mQI6vOrcCC56JP6mo9wVzJb8uhad1wI36XPygh0=\n' +
        '=N6UH\n' +
        '-----END PGP PRIVATE KEY BLOCK-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'PGP Private Key',
      start: 0,
      end: 228,
      kind: 'security',
      value:
        '-----BEGIN PGP PRIVATE KEY BLOCK-----\n' +
        'Version: GnuPG v1\n' +
        '\n' +
        'lQdGBFkW4esBEAC5GeGmDASNHTQydE9qjzjnfkuPNpAS+9SqT4WbhqE+5zQdRhzL\n' +
        'A1TE7Cub/cVlTby3gIiz3Q42mQI6vOrcCC56JP6mo9wVzJb8uhad1wI36XPygh0=\n' +
        '=N6UH\n' +
        '-----END PGP PRIVATE KEY BLOCK-----',
    },
  ]);
});
test('SSH Putty Private Key classify', () => {
  expect(
    classify(
      'PuTTY-User-Key-File-3: ssh-dss\n' +
        'Encryption: none\n' +
        'Comment: dsa-key-20210728\n' +
        'Public-Lines: 18\n' +
        'AAAAB3NzaC1kc3MAAAEBAMgEkCgV8BNhlQbJMYjEIh1gzWlVOBNkH+x+lRYEVgac\n' +
        'BNfQ9TZM97/cItCzyER+EDUlCn5lErM0ApR5fuILnXZ55BH6/Qy9llYq2zeuRPZ9\n' +
        'SJzFUhZY+i61h4zzAS+23nUJHNEd0xwczs/kVe9zCJ0eVWG3XrdLU5rf+X2E4eOo\n' +
        'gPu5IHdDw1F30VQPRrVK/2UMr0ABlLTmUbe5DyvJG+xQRJGWvgaeb7ePuAHaonKU\n' +
        'Mc3c97dAXZjxZLO94/4sl2tedVUVdfEhqEXPKdHSqj6og6C3Ed0hEhABfSCb0i0O\n' +
        'xgPQxpW88QyfCscuY8BQPRdwwOMOZda77O0/m8s1SXkAAAAVAOvBLa4m6mQZT6Cv\n' +
        '+zPzbUszx193AAABAQCf/lvMFYHL5vgYBvrYV3dp0iBPLF4ADWs1RLa2udkA0RvL\n' +
        'jsodf7f04krtviUC8tBb0NW34Ck+smgu6pZiNHXWKWdl+0Bk/cTrcTh56amudtud\n' +
        'ayEvIAvJfhHZZqV/uu0eil1fhLVFysgerWU/WWq/TPp9s73JCKoc7uwVIh5YF/VX\n' +
        'yf7BK9jxapahIAeYy/V9SASWraPW03DSHvSYqMIGoAjmIpOhqk2e9S0JaF53IW38\n' +
        'ZfQ3bBltIqui4nFk3ku3c5ZLlx90bDtkszy5XIgHDXQYGD7ujyOdxcyeKr1RPg7H\n' +
        '3WLu+ALtex6W8ezgPmzHjWem96IJ6L0YaTjRgbDMAAABAGnooAXcGj4v0aRVhBSI\n' +
        '6ZmajGe/Q9Hs2KE+GrEsW4LdZf0AmzxBeySNICfdV470gxTrt+POiLQMnckEV04J\n' +
        'Cg2/5uzlAGBusN7Hs2K/Mm17hSTD08LKgAvDNk2ZjF6vWbRn68As8o4a8nxjfjr3\n' +
        'RvBFcqVaxt4aDpW3UVjcwdfsr6i0pmP8gBdzNLXLKS9zWbc6ugWEOZxlYaFVZt7O\n' +
        'dEn93AO5cYKTploH4R000qoR35gFI7QY1M7fuf6Xy8hGwkHareWhDB4i0itBY0sY\n' +
        'MRY+To2dQO7bFZ/SwQLpMUZ8jLoj8nkcH0+EkAYFKj2gjLmx4EhePS9S8f4uTeud\n' +
        'pQU=\n' +
        'Private-Lines: 1\n' +
        'AAAAFA6jX5riYiSarfvdPOJSEO+c4NUG\n' +
        'Private-MAC: d8d43d4b87bacdcf3aae6eb0977391f860870765e5cf40c169739b9d0fa85bc1',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'SSH Putty Private Key',
      start: 0,
      end: 42,
      kind: 'security',
      value: 'PuTTY-User-Key-File-3: ssh-dss\n' + 'Encryption:',
    },
  ]);
});
test('RSA Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        'eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        'yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '-----END RSA PRIVATE KEY-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'RSA Private Key',
      start: 0,
      end: 248,
      kind: 'security',
      value:
        '-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        'eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        'yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '-----END RSA PRIVATE KEY-----',
    },
  ]);
});
test('DSA Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN DSA PRIVATE KEY-----\n' +
        '    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        '    eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        '    yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '    -----END DSA PRIVATE KEY-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'DSA Private Key',
      start: 0,
      end: 264,
      kind: 'security',
      value:
        '-----BEGIN DSA PRIVATE KEY-----\n' +
        '    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        '    eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        '    yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '    -----END DSA PRIVATE KEY-----',
    },
  ]);
});
test('ECDSA Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN EC PRIVATE KEY-----\n' +
        '    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        '    eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        '    yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '    -----END EC PRIVATE KEY-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'ECDSA Private Key',
      start: 0,
      end: 262,
      kind: 'security',
      value:
        '-----BEGIN EC PRIVATE KEY-----\n' +
        '    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        '    eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        '    yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '    -----END EC PRIVATE KEY-----',
    },
  ]);
});
test('SSH Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN OPENSSH PRIVATE KEY-----\n' +
        'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAaAAAABNlY2RzYS\n' +
        '1zaGEyLW5pc3RwMjU2AAAACG5pc3RwMjU2AAAAQQR9WZPeBSvixkhjQOh9yCXXlEx5CN9M\n' +
        'yh94CJJ1rigf8693gc90HmahIR5oMGHwlqMoS7kKrRw+4KpxqsF7LGvxAAAAqJZtgRuWbY\n' +
        'EbAAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBH1Zk94FK+LGSGNA\n' +
        '6H3IJdeUTHkI30zKH3gIknWuKB/zr3eBz3QeZqEhHmgwYfCWoyhLuQqtHD7gqnGqwXssa/\n' +
        'EAAAAgBzKpRmMyXZ4jnSt3ARz0ul6R79AXAr5gQqDAmoFeEKwAAAAOYWpAYm93aWUubG9j\n' +
        'YWwBAg==\n' +
        '-----END OPENSSH PRIVATE KEY-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'SSH Private Key',
      start: 0,
      end: 504,
      kind: 'security',
      value:
        '-----BEGIN OPENSSH PRIVATE KEY-----\n' +
        'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAaAAAABNlY2RzYS\n' +
        '1zaGEyLW5pc3RwMjU2AAAACG5pc3RwMjU2AAAAQQR9WZPeBSvixkhjQOh9yCXXlEx5CN9M\n' +
        'yh94CJJ1rigf8693gc90HmahIR5oMGHwlqMoS7kKrRw+4KpxqsF7LGvxAAAAqJZtgRuWbY\n' +
        'EbAAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBH1Zk94FK+LGSGNA\n' +
        '6H3IJdeUTHkI30zKH3gIknWuKB/zr3eBz3QeZqEhHmgwYfCWoyhLuQqtHD7gqnGqwXssa/\n' +
        'EAAAAgBzKpRmMyXZ4jnSt3ARz0ul6R79AXAr5gQqDAmoFeEKwAAAAOYWpAYm93aWUubG9j\n' +
        'YWwBAg==\n' +
        '-----END OPENSSH PRIVATE KEY-----',
    },
  ]);
});
test('PEM Private Key classify', () => {
  expect(
    classify(
      '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        'eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        'yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '-----END PRIVATE KEY-----',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'PEM Private Key',
      start: 0,
      end: 240,
      kind: 'security',
      value:
        '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiYydo27aNGO9DBUW\n' +
        'eGEPD8oNi1LZDqfxPmQlieLBjVShRANCAAQhPVJYvGxpw+ITlnXqOSikCfz/7zms\n' +
        'yODIKiSueMN+3pj9icDgDnTJl7sKcWyp4Nymc9u5s/pyliJVyd680hjK\n' +
        '-----END PRIVATE KEY-----',
    },
  ]);
});
test('Access Key classify', () => {
  expect(
    classify(
      'The access key is 0B836276FB2D45E650DA0B836276FB2D45E650DA',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Access Key',
      start: 18,
      end: 58,
      kind: 'security',
      value: '0B836276FB2D45E650DA0B836276FB2D45E650DA',
    },
  ]);
});
test('Private Key classify', () => {
  expect(
    classify(
      'the private key is B00684A2E1CA0B75CD42"',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Private Key',
      start: 19,
      end: 39,
      kind: 'security',
      value: 'B00684A2E1CA0B75CD42',
    },
  ]);
});
test('Access Token classify', () => {
  expect(
    classify(
      'The access token is S2PCJSWXPD15rVnx1WWtFY4rSuZhU4R',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Access Token',
      start: 20,
      end: 51,
      kind: 'security',
      value: 'S2PCJSWXPD15rVnx1WWtFY4rSuZhU4R',
    },
  ]);
});
test('Refresh Token classify', () => {
  expect(
    classify(
      'RefreshToken=SxQR38Khxm5sAgVLV367ms85LHSLuEuM',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Refresh Token',
      start: 13,
      end: 45,
      kind: 'security',
      value: 'SxQR38Khxm5sAgVLV367ms85LHSLuEuM',
    },
  ]);
});
test('Password Reset Token classify', () => {
  expect(
    classify(
      'To reset the password, use token: sT_ZQnmdEPCiPja8zVx2',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Password Reset Token',
      start: 34,
      end: 54,
      kind: 'security',
      value: 'sT_ZQnmdEPCiPja8zVx2',
    },
  ]);
});
test('Session Token classify', () => {
  expect(
    classify(
      'sessionToken = session_c1b50017ce25dd378c5c8fc4fcee25e2',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Session Token',
      start: 15,
      end: 55,
      kind: 'security',
      value: 'session_c1b50017ce25dd378c5c8fc4fcee25e2',
    },
  ]);
});
test('Token classify', () => {
  expect(
    classify(
      'https//m.myworkday.com/cboe/d/gateway htmid?reloadToken=e5c2d9bd904273cb3b9ad',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Token',
      start: 56,
      end: 77,
      kind: 'security',
      value: 'e5c2d9bd904273cb3b9ad',
    },
  ]);
});
test('Python Code classify', () => {
  expect(
    classify(
      'i = 1\n' +
        'while i < 6:\n' +
        '  print(i)\n' +
        '  i += 1\n' +
        'else:\n' +
        '  print("i is no longer less than 6")\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Python Code',
      start: 0,
      end: 83,
      kind: 'code',
      value:
        'i = 1\n' +
        'while i < 6:\n' +
        '  print(i)\n' +
        '  i += 1\n' +
        'else:\n' +
        '  print("i is no longer less than 6")\n',
    },
  ]);
  expect(
    classify(
      'def tri_recursion(k):\n' +
        '  if(k > 0):\n' +
        '    result = k + tri_recursion(k - 1)\n' +
        '    print(result)\n' +
        '  else:\n' +
        '    result = 0\n' +
        '  return result\n' +
        '\n' +
        'print("Recursion Example Results")\n' +
        'tri_recursion(6)\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Python Code',
      start: 0,
      end: 183,
      kind: 'code',
      value:
        'def tri_recursion(k):\n' +
        '  if(k > 0):\n' +
        '    result = k + tri_recursion(k - 1)\n' +
        '    print(result)\n' +
        '  else:\n' +
        '    result = 0\n' +
        '  return result\n' +
        '\n' +
        'print("Recursion Example Results")\n' +
        'tri_recursion(6)\n',
    },
  ]);
  expect(
    classify(
      'n = int(input())  # input() function takes input as string type\n' +
        '# int() converts it to integer type\n' +
        'fact = 1\n' +
        'i = 1\n' +
        'while i <= n:\n' +
        '    fact = fact * i\n' +
        '    i = i + 1\n' +
        'print(fact)',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Python Code',
      start: 0,
      end: 174,
      kind: 'code',
      value:
        'n = int(input())  # input() function takes input as string type\n' +
        '# int() converts it to integer type\n' +
        'fact = 1\n' +
        'i = 1\n' +
        'while i <= n:\n' +
        '    fact = fact * i\n' +
        '    i = i + 1\n' +
        'print(fact)',
    },
  ]);
  expect(
    classify(
      'def detect(text: str, patterns: list[Pattern]):\n' +
        '    spans = []\n' +
        '    x = 1\n' +
        '    return x\n' +
        'if x == 3:\n' +
        '    x += 4\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Python Code',
      start: 0,
      end: 108,
      kind: 'code',
      value:
        'def detect(text: str, patterns: list[Pattern]):\n' +
        '    spans = []\n' +
        '    x = 1\n' +
        '    return x\n' +
        'if x == 3:\n' +
        '    x += 4\n',
    },
  ]);
});
test('Javascript Code classify', () => {
  expect(
    classify(
      'function toCelsius(fahrenheit) {\n' +
        '  const x = (fahrenheit-32);\n' +
        '  return (5/9) * (fahrenheit-32);\n' +
        '}\n' +
        '\n' +
        'let value = toCelsius;\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'JavaScript Code',
      start: 0,
      end: 122,
      kind: 'code',
      value:
        'function toCelsius(fahrenheit) {\n' +
        '  const x = (fahrenheit-32);\n' +
        '  return (5/9) * (fahrenheit-32);\n' +
        '}\n' +
        '\n' +
        'let value = toCelsius;\n',
    },
  ]);
  expect(
    classify(
      'class Car {\n' +
        '  constructor(name, year) {\n' +
        '    this.name = name;\n' +
        '    this.year = year;\n' +
        '  }\n' +
        '  age(x) {\n' +
        '    return x - this.year;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'const date = new Date();\n' +
        'let year = date.getFullYear();\n' +
        '\n' +
        'const myCar = new Car("Ford", 2014);\n' +
        'document.getElementById("demo").innerHTML="My car is " + myCar.age(year) + " years old.";\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'JavaScript Code',
      start: 0,
      end: 316,
      kind: 'code',
      value:
        'class Car {\n' +
        '  constructor(name, year) {\n' +
        '    this.name = name;\n' +
        '    this.year = year;\n' +
        '  }\n' +
        '  age(x) {\n' +
        '    return x - this.year;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'const date = new Date();\n' +
        'let year = date.getFullYear();\n' +
        '\n' +
        'const myCar = new Car("Ford", 2014);\n' +
        'document.getElementById("demo").innerHTML="My car is " + myCar.age(year) + " years old.";\n',
    },
  ]);
  expect(
    classify(
      'let i = 2;\n' +
        'let len = cars.length;\n' +
        'let text = "";\n' +
        'for (; i < len; i++) {\n' +
        '  text += cars[i] + "<br>";\n' +
        '}\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'JavaScript Code',
      start: 0,
      end: 102,
      kind: 'code',
      value:
        'let i = 2;\n' +
        'let len = cars.length;\n' +
        'let text = "";\n' +
        'for (; i < len; i++) {\n' +
        '  text += cars[i] + "<br>";\n' +
        '}\n',
    },
  ]);
  expect(
    classify(
      'const THRESHOLD = 0.5;\n' +
        '\n' +
        'function detect(text, patterns) {\n' +
        '  let spans = [];\n' +
        '  for (let pattern of patterns) {\n' +
        '    let matches = [...text.matchAll(pattern)];\n' +
        '    spans.push(...matches.map((m) => [m.index, m.index + m[0].length]));\n' +
        '  }\n' +
        '\n' +
        '  if (spans.length === 0) {\n' +
        '    return false;\n' +
        '  }\n' +
        '\n' +
        '  let united_spans = [];\n' +
        '  for (let [begin, end] of spans.sort(([a], [b]) => a - b)) {\n' +
        '    if (united_spans.length > 0 && united_spans[united_spans.length - 1][1] >= begin - 1) {\n' +
        '      united_spans[united_spans.length - 1] = [united_spans[united_spans.length - 1][0], end];\n' +
        '    } else {\n' +
        '      united_spans.push([begin, end]);\n' +
        '    }\n' +
        '  }\n' +
        '\n' +
        '  let num_detected = united_spans.reduce((sum, [start, end]) => sum + (end - start), 0);\n' +
        '\n' +
        '  return num_detected / text.length > THRESHOLD;\n' +
        '}\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'JavaScript Code',
      start: 0,
      end: 764,
      kind: 'code',
      value:
        'const THRESHOLD = 0.5;\n' +
        '\n' +
        'function detect(text, patterns) {\n' +
        '  let spans = [];\n' +
        '  for (let pattern of patterns) {\n' +
        '    let matches = [...text.matchAll(pattern)];\n' +
        '    spans.push(...matches.map((m) => [m.index, m.index + m[0].length]));\n' +
        '  }\n' +
        '\n' +
        '  if (spans.length === 0) {\n' +
        '    return false;\n' +
        '  }\n' +
        '\n' +
        '  let united_spans = [];\n' +
        '  for (let [begin, end] of spans.sort(([a], [b]) => a - b)) {\n' +
        '    if (united_spans.length > 0 && united_spans[united_spans.length - 1][1] >= begin - 1) {\n' +
        '      united_spans[united_spans.length - 1] = [united_spans[united_spans.length - 1][0], end];\n' +
        '    } else {\n' +
        '      united_spans.push([begin, end]);\n' +
        '    }\n' +
        '  }\n' +
        '\n' +
        '  let num_detected = united_spans.reduce((sum, [start, end]) => sum + (end - start), 0);\n' +
        '\n' +
        '  return num_detected / text.length > THRESHOLD;\n' +
        '}\n',
    },
  ]);
});

test('Password in DB Connection String classify', () => {
  expect(
    classify(
      "conn = pymysql.connect(host='localhost', user='root', password='pa12331', database='database')",
      supportedRecognizers,
      ['DB Connection String'],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Password',
      start: 64,
      end: 71,
      kind: 'security',
      value: 'pa12331', // Fix match
    },
  ]);
});
test('Password in DB connection string classify 2', () => {
  expect(
    classify(
      "conn = pymysql.connect(host='localhost', user='root', password='password1', database='database')",
      supportedRecognizers,
      ['DB Connection String'],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Password',
      start: 64,
      end: 73,
      kind: 'security',
      value: 'password1',
    },
  ]);
});
test('Email Address and Password classify', () => {
  expect(
    classify(
      'my email is singing.pisga4@gmail.com and my password is TT%3s8',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Email Address',
      start: 12,
      end: 36,
      kind: 'personal',
      value: 'singing.pisga4@gmail.com',
    },
    {
      dataType: 'Password',
      start: 56,
      end: 62,
      kind: 'security',
      value: 'TT%3s8',
    },
  ]);
});
test('Email Address and Password classify FN', () => {
  expect(
    classify(
      'Write a script that uses blud@gmail.com as the email and p@s5w0rd as the password to log into gmail\n',
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'Email Address',
      start: 25,
      end: 39,
      kind: 'personal',
      value: 'blud@gmail.com',
    },
    // Password FN
    // {
    //   dataType: 'Password',
    //   start: 57,
    //   end: 65,
    //   value: 'p@s5w0rd',
    // },
  ]);
});
test('General Classify FP', () => {
  expect(
    classify(
      "I just finished a long day at work and can't wait to relax. My password is lost, but please don't tell anyone.",
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([]);
});

test('Javascript Code long classify', () => {
  expect(
    classify(
      `import DbCollection from "./db-collection";
import IdentityManager from "./identity-manager";
import cloneDeep from "lodash.clonedeep";

/**
  Your Mirage server has a database which you can interact with in your route handlers. You’ll typically use models to interact with your database data, but you can always reach into the db directly in the event you want more control.

  Access the db from your route handlers via

  @class Db
  @constructor
  @public
  */
class Db {
  constructor(initialData, identityManagers) {
    this._collections = [];

    this.registerIdentityManagers(identityManagers);

    if (initialData) {
      this.loadData(initialData);
    }
  }

  /**
    Loads an object of data into Mirage's database.

    The keys of the object correspond to the DbCollections, and the values are arrays of records

    As with , IDs will automatically be created for records that don't have them.

    @method loadData
    @param {Object} data - Data to load
    @public
    */
  loadData(data) {
    for (let key in data) {
      this.createCollection(key, cloneDeep(data[key]));
    }
  }

  /**
   Logs out the contents of the Db.

    @method dump
    @public
    */
  dump() {
    return this._collections.reduce((data, collection) => {
      data[collection.name] = collection.all();

      return data;
    }, {});
  }
`,
      supportedRecognizers,
      [],
      new Set()
    )
  ).toStrictEqual([
    {
      dataType: 'JavaScript Code',
      start: 0,
      end: 1342,
      kind: 'code',
      value: `import DbCollection from "./db-collection";
import IdentityManager from "./identity-manager";
import cloneDeep from "lodash.clonedeep";

/**
  Your Mirage server has a database which you can interact with in your route handlers. You’ll typically use models to interact with your database data, but you can always reach into the db directly in the event you want more control.

  Access the db from your route handlers via

  @class Db
  @constructor
  @public
  */
class Db {
  constructor(initialData, identityManagers) {
    this._collections = [];

    this.registerIdentityManagers(identityManagers);

    if (initialData) {
      this.loadData(initialData);
    }
  }

  /**
    Loads an object of data into Mirage's database.

    The keys of the object correspond to the DbCollections, and the values are arrays of records

    As with , IDs will automatically be created for records that don't have them.

    @method loadData
    @param {Object} data - Data to load
    @public
    */
  loadData(data) {
    for (let key in data) {
      this.createCollection(key, cloneDeep(data[key]));
    }
  }

  /**
   Logs out the contents of the Db.

    @method dump
    @public
    */
  dump() {
    return this._collections.reduce((data, collection) => {
      data[collection.name] = collection.all();

      return data;
    }, {});
  }
`,
    },
  ]);
});
