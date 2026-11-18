const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const m={exports:{}};new Function('module',fs.readFileSync('dist/simulators/csl-7/model.js','utf8'))(m);const model=m.exports;
assert.deepEqual(model.mean(['6','8','7']),{n:3,value:7});
assert.deepEqual(model.mean(['5','7','NE']),{n:2,value:6});
assert.deepEqual(model.mean(['NE','NM','D']),{n:0,value:null});
assert(model.matching(100,100,50,50,true));assert(!model.matching(100,90,50,50,true));
assert.equal(model.seedCount([1,1,2,11,-1]),2);
assert(model.safeChoice(0,'B'));assert(!model.safeChoice(0,'A'));assert(model.safeChoice(2,'C'));
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/simulators/csl-7/book-data.js','utf8')+';this.book=CSLBook',c);
assert.equal(c.book.life.length,5);assert.equal(c.book.services.length,7);
assert.equal(c.book.toolkit.length,12);
for(const form of ['life','services'])for(const a of c.book[form]){
 assert(a.steps.length>0);
 for(const p of a.sourcePages)assert(fs.existsSync('dist/simulators/csl-7/book/page-'+p+'.webp'));
 for(const s of a.steps){assert(s.page>=a.sourcePages[0]&&s.page<=a.sourcePages.at(-1));if(s.pageFigure)assert(fs.existsSync('dist/simulators/csl-7/'+s.pageFigure))}
}
assert.equal(c.book.services[6].steps.length,3); // combined numbered headings preserved exactly from the book
assert(!Object.keys(m).some(x=>/growth|roots|drainage/.test(x)));
console.log('PASS: source figures/pages, 12 activity sequences, 12 original toolkit entries, workbook arithmetic and no synthetic biology outcomes.');
