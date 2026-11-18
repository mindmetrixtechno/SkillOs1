const examples=(n,offset)=>Array.from({length:n},(_,i)=>{
 const k=i+offset,bright=k%2,hot=(k>>1)%2,pir=(k>>2)%2,lamp=(k>>3)%2,fan=(k>>4)%2;
 return {x:[bright,hot?31+(k%3)+(offset?0.5:0):24+(k%3)+(offset?0.5:0),pir,lamp,fan],y:Number((bright&&lamp)||(!hot&&fan))};
});
const training=examples(40,0),test=examples(16,40);
function fit(rows,depth=0){
 const probability=xs=>xs.reduce((sum,row)=>sum+row.y,0)/xs.length;
 const impurity=xs=>{const p=probability(xs);return 2*p*(1-p)};
 const base=impurity(rows);let best;
 if(depth<5&&base){
  for(let f=0;f<5;f++){
   const values=[...new Set(rows.map(row=>row.x[f]))].sort((a,b)=>a-b);
   for(const edge of values.slice(0,-1)){
    const left=rows.filter(row=>row.x[f]<=edge),right=rows.filter(row=>row.x[f]>edge);
    const loss=(left.length*impurity(left)+right.length*impurity(right))/rows.length;
    if(!best||loss<best.loss)best={f,edge,left,right,loss};
   }
  }
 }
 if(!best||best.loss>=base)return ()=>Number(probability(rows)>=.5);
 const left=fit(best.left,depth+1),right=fit(best.right,depth+1);
 return x=>x[best.f]<=best.edge?left(x):right(x);
}
let model;
function review(){
 if(!model)return;
 const count=test.filter(row=>model(row.x)===row.y).length;
 const x=[Number($('natural').checked),Number($('temp').value),Number(motion),Number(!!outputs.lamp),Number(!!outputs.fan)];
 $('training').textContent=count+' / 16 simulated test rows matched. Current room: '+(model(x)?'Possible_Waste':'No_Clear_Waste')+'. Ask a person to review.';
}
$('train').onclick=()=>{model=fit(training);review()};
$('natural').onchange=review;
document.querySelectorAll('[data-gesture]').forEach(button=>button.onclick=()=>{
 const code=button.dataset.gesture;
 $('gesture').textContent=code==='?'?'Uncertain prediction. No command sent.':$('dryrun').checked?'Dry run. Would request light '+(code==='1'?'ON.':'OFF.'):command(code,'Gesture rehearsal')?'Light command sent.':'Command blocked. Select REMOTE.';
});
const scenes=[[2300,true],[1450,false],[1550,false],[1750,true],[1900,true],[2200,true]];
function replay(low,high){
 let on=false,onTime=0,useful=0;
 for(const [adc,natural] of scenes){
  if(adc<=low)on=true;
  else if(adc>=high)on=false;
  if(on)onTime+=50;
  if(on||natural)useful+=50;
 }
 return {onTime,useful};
}
$('compare').onclick=()=>{
 const low=Number($('low').value),high=Number($('high').value);
 if(!$('low').value||!$('high').value||!Number.isInteger(low)||!Number.isInteger(high)||low<0||high>4095||low>=high){
  $('report').textContent='Enter whole-number limits from 0 to 4095, with low below high.';return;
 }
 setMode('AUTO');
 const a=replay(1600,2000),b=replay(low,high);
 $('report').textContent='Original: '+a.onTime+' s ON, '+a.useful+' s useful light. Your rule: '+b.onTime+' s ON, '+b.useful+' s useful light. '+(a.useful===b.useful&&b.onTime<a.onTime?'Less simulated ON-time with the same useful lighting.':'Compare both measures before choosing a rule.');
};
reset();$('lesson').onchange();setInterval(tick,100);
