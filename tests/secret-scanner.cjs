'use strict';
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),crypto=require('node:crypto');
const binary=process.argv[2];assert(binary,'scanner path required');
function scan(input){return spawnSync(binary,['stdin','--redact=100','--no-banner'],{input,encoding:'utf8'});}
assert.equal(scan('const title = "Hello";').status,0,'clean input passes');
// Synthetic format only; random bytes are never a provisioned credential or written to disk.
const token=['ghp',crypto.randomBytes(18).toString('hex')].join('_');
const result=scan('const token = "'+token+'";');
assert.equal(result.status,1,'secret-shaped input must fail');
assert(!(result.stdout+result.stderr).includes(token),'scanner output must be redacted');
console.log('PASS: secret scanner rejects synthetic token and redacts output.');
