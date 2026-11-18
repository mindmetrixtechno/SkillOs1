const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const m={exports:{}};new Function('module',fs.readFileSync('dist/simulators/csl-8/model.js','utf8'))(m);const model=m.exports;
assert.equal(model.area(3,4),12);assert.equal(model.area(-1,4),null);
assert.deepEqual(model.mean(['0','4','8']),{n:3,value:4});assert.deepEqual(model.mean(['','','']),{n:0,value:null});
assert.equal(model.budget([{quantity:3,price:10},{quantity:2,price:0}],5,2),37);
assert.deepEqual(model.transfer(10,4),{remaining:6,target:4});assert.deepEqual(model.transfer(2,9),{remaining:0,target:2});
assert.deepEqual(model.reconcile(100,60,20,80),{difference:-20,remaining:20});
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/simulators/csl-8/book-data.js','utf8')+';this.book=CSLBook',c);
assert.equal(c.book.life.length,10);assert.equal(c.book.services.length,10);
assert.equal(c.book.toolkit.life.length,8);assert.equal(c.book.toolkit.services.length,5);
let steps=0;
for(const form of ['life','services'])for(const a of c.book[form]){
 assert(a.steps.length>=5);steps+=a.steps.length;
 assert.equal(a.pages.length,a.sourcePages.length);
 for(const p of a.sourcePages)assert(fs.existsSync('dist/simulators/csl-8/book/page-'+p+'.webp'));
 for(const s of a.steps){assert(s.page>=a.sourcePages[0]&&s.page<=a.sourcePages.at(-1));for(const b of s.blocks)for(const im of b.images||[])assert(fs.existsSync('dist/simulators/csl-8/'+im))}
}
assert.equal(steps,109);assert.equal(c.book.life[0].sourcePages[0],13);assert.equal(c.book.services[0].sourcePages[0],84);
for(const form of ['life','services'])assert(fs.existsSync('dist/simulators/csl-8/'+c.book[form+'Image']));
console.log('PASS: 20 source activities; 109 numbered step headings; original page/artwork files; source arithmetic; printed-page mapping.');
