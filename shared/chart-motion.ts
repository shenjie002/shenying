export const chartProgress=(frame:number,start:number|undefined,duration:number,mode:'none'|'grow'|'sequence'|undefined,count:number,index:number,moving=true)=>{
 if(!mode||mode==='none'||start===undefined)return 1;
 const p=Math.max(0,Math.min(1,(frame-start)/duration));if(!moving)return 1;
 return mode==='grow'?p:Math.max(0,Math.min(1,p*count-index));
};
