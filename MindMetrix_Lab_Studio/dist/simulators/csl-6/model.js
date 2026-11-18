/* Workbook arithmetic only; no generated growing or food-service outcomes. */
const CSLModel={
 mix(total){return {cocopeat:total*.5,vermicompost:total*.3,perlite:total*.2}},
 net(gross,bowl){return gross>=bowl&&bowl>=0?gross-bowl:null},
 harvest(grams,price,cost){const value=grams/1000*price;return {value,difference:value-cost}},
 recipe(portions){const factor=portions/3;return {chickpeas:150*factor,cucumber:75*factor,water:300*factor,lemon:15*factor}},
 kiosk(cost,made,price,sold){return {unitCost:made>0?cost/made:null,receipts:price*sold,surplus:price*sold-cost}}
};if(typeof module!=='undefined')module.exports=CSLModel;
