/* Workbook arithmetic and classroom-model bookkeeping only. */
const CSLModel={
 area(length,width){return length>=0&&width>=0?length*width:null},
 mean(values){const valid=values.filter(v=>v!==''&&Number.isFinite(Number(v))&&Number(v)>=0).map(Number);return {n:valid.length,value:valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null}},
 budget(rows,delivery=0,reserve=0){return rows.reduce((sum,row)=>sum+row.quantity*row.price,0)+delivery+reserve},
 transfer(source,carried){const n=Math.max(0,Math.min(source,carried));return {remaining:source-n,target:n}},
 reconcile(allocation,paid,committed,estimate){return {difference:paid-estimate,remaining:allocation-paid-committed}}
};
if(typeof module!=='undefined')module.exports=CSLModel;
