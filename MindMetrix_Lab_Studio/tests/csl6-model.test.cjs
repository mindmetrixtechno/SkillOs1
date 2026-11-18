const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const m={exports:{}};new Function('module',fs.readFileSync('dist/simulators/csl-6/model.js','utf8'))(m);const model=m.exports;
assert.deepEqual(model.mix(10),{cocopeat:5,vermicompost:3,perlite:2});
assert.equal(model.net(250,50),200);assert.equal(model.net(20,50),null);
assert.deepEqual(model.recipe(6),{chickpeas:300,cucumber:150,water:600,lemon:30});
assert.deepEqual(model.harvest(500,100,30),{value:50,difference:20});
assert.deepEqual(model.kiosk(30,6,10,3),{unitCost:5,receipts:30,surplus:0});
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/simulators/csl-6/book-data.js','utf8')+';this.book=CSLBook',c);
assert.equal(c.book.life.length,5);assert.equal(c.book.services.length,5);assert.equal(c.book.recipeCard.page,57);
assert.equal(c.book.toolkit.life.length,8);assert.equal(c.book.toolkit.services.length,6);
let steps=0;
for(const form of ['life','services'])for(const a of c.book[form]){
 assert(a.steps.length>=4);steps+=a.steps.length;assert.equal(a.sourcePages.length,a.pages.length);
 for(const p of a.sourcePages)assert(fs.existsSync('dist/simulators/csl-6/book/page-'+p+'.webp'));
 if(a.stageFigure)assert(fs.existsSync('dist/simulators/csl-6/'+a.stageFigure));
}
assert.equal(steps,49);assert.equal(c.book.life[0].sourcePages[0],16);assert.equal(c.book.services[0].sourcePages[0],48);
for(const form of ['life','services'])assert(fs.existsSync('dist/simulators/csl-6/book/'+form+'-project.webp'));
console.log('PASS: 10 source activities, 49 numbered steps, 14 toolkit entries, original page assets and workbook arithmetic.');
