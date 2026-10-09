const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
// This specific Sites game was made public on 2026-10-09. Allow only its
// explicit navigation href; all other hosted links/resources remain rejected.
const publicGameHref='href="https://shu3-mahjong-challenge.nagata-sh3.chatgpt.site"';
const files=walk('docs');for(const f of files){if(!/\.(js|css|html)$/.test(f))continue;const s=fs.readFileSync(f,'utf8');const checked=f==='docs/index.html'?s.split(publicGameHref).join(''):s;assert(!checked.includes('chatgpt.site'),'no unapproved/private hosted links: '+f);assert(!/chapter[23]\.js|\.openai\//.test(s),'no unpublished source');if(f.endsWith('.html')){assert(!s.includes('<base'),'no origin-root asset base');for(const m of s.matchAll(/(?:src|href)="([^"]+)"/g)){const ref=m[1].split(/[?#]/)[0];if(!ref||/^(https?:|data:)/.test(ref))continue;assert(!ref.startsWith('/'),'portable relative URLs');const target=path.resolve(path.dirname(f),ref);assert(fs.existsSync(target),'missing link '+f+' '+ref);}}}
assert(!files.some(f=>/chapter[23]|\/v2\//.test(f)));console.log('PASS: portable assets/links, only approved public hosted navigation, no unpublished chapters.');
assert.equal(fs.readFileSync('index.html','utf8'),fs.readFileSync('docs/index.html','utf8').replace('<head>','<head><base href="docs/">'),'root homepage must match docs/index.html');
