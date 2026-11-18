/* Calculations from the workbook only. No generated biology results. */
const CSLModel={
 mean(values){const measured=values.filter(x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0).map(Number);return {n:measured.length,value:measured.length?measured.reduce((a,b)=>a+b,0)/measured.length:null}},
 matching(soilA,soilB,waterA,waterB,filters){return soilA===100&&soilB===100&&waterA===50&&waterB===50&&filters},
 seedCount(indices){return new Set(indices.filter(x=>Number.isInteger(x)&&x>=1&&x<=10)).size},
 safeChoice(station,value){return ['B','facts','C'][station]===value}
};
if(typeof module!=='undefined')module.exports=CSLModel;
