'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const base='docs/election-tankyu/',data=JSON.parse(fs.readFileSync(base+'data.json','utf8')),html=fs.readFileSync(base+'index.html','utf8');
assert.equal(data.internal,false);assert.equal(data.promises.length,5);assert.equal(data.parties.length,3);
assert.deepEqual(data.parties.map(p=>data.promises.filter(x=>x.party_id===p.id).length),[2,1,2]);
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
for(const p of data.promises){assert(html.includes(escape(p.title)),p.id+' title');assert(html.includes('id="tpl-'+p.id+'"'),p.id+' detail');assert.equal(p.events.length,0);assert.equal(p.involvements.length,0);assert.equal(p.assessment_approved,false);assert.equal(p.assessment.fulfillment,'判定保留');}
for(const id of ['list','sources','rules','compare-0','compare-1','compare-2'])assert(html.includes('id="tpl-'+id+'"'));
assert.deepEqual(fs.readdirSync(base).sort(),['app.js','data.json','index.html','style.css']);
assert(!/review_targets|reviewer_id|human_attestation|AIProposal|quarantined/.test(JSON.stringify(data)));
console.log('PASS: five visible promise templates, 2/1/2 party counts, public-only data and separate assessment approvals.');
