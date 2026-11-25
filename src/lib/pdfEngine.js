/* eslint-disable */
// Hand-rolled PDF writer (no dependencies), ported unchanged from the original page.
var CW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
function latin(s){return String(s==null?'':s).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/₹/g,'Rs ').replace(/[^\x20-\x7E]/g,'?');}
function pesc(s){return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
function tw(s,size,bold){var w=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);w+=(c>=32&&c<=126)?CW[c-32]:556;}return w*size/1000*(bold?1.07:1);}
function wrapText(s,size,bold,max){
 var words=s.split(/\s+/),lines=[],cur='';
 words.forEach(function(w){if(!w)return;var t=cur?cur+' '+w:w;if(tw(t,size,bold)<=max||!cur)cur=t;else{lines.push(cur);cur=w;}});
 if(cur)lines.push(cur);return lines.length?lines:[''];
}
export function makePdf(draw,meta){
 meta=meta||{};
 var PW=595,PH=842,M=48,pages=[],ops=[],y=0;
 var C={navy:'0.039 0.114 0.231',steel:'0.494 0.608 0.706',tint:'0.949 0.961 0.973',line:'0.835 0.867 0.894',sand:'0.973 0.957 0.929',orange:'0.882 0.502 0.145',teal:'0.118 0.357 0.388',stone:'0.369 0.420 0.471',white:'1 1 1',sage:'0.886 0.914 0.894'};
 function np(){if(ops.length)pages.push(ops);ops=[];y=PH-M-(pages.length?14:0);}
 np();
 function fy(v){return v.toFixed(1);}
 var P={
  C:C,PW:PW,PH:PH,M:M,
  y:function(v){if(v!==undefined)y=v;return y;},
  gap:function(h){y-=h;},
  need:function(h){if(y-h<M+14)np();},
  newPage:function(){np();},
  rect:function(x,yy,w,h,c){ops.push(c+' rg '+fy(x)+' '+fy(yy)+' '+fy(w)+' '+fy(h)+' re f');},
  line:function(x1,y1,x2,y2,c,w){ops.push(c+' RG '+(w||0.6)+' w '+fy(x1)+' '+fy(y1)+' m '+fy(x2)+' '+fy(y2)+' l S');},
  at:function(s,x,yy,o){
   o=o||{};var size=o.size||10,bold=!!o.bold;s=latin(s);
   var sp=o.sp||0,w=tw(s,size,bold)+sp*s.length;
   if(o.align==='right')x-=w;else if(o.align==='center')x-=w/2;
   ops.push(C[o.c||'navy']+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf '+(sp+' Tc ')+fy(x)+' '+fy(yy)+' Td ('+pesc(s)+') Tj ET');
  },
  fit:function(s,size,bold,max){s=latin(s);if(tw(s,size,bold)<=max)return s;while(s.length>1&&tw(s+'...',size,bold)>max)s=s.slice(0,-1);return s+'...';},
  ring:function(cx,cy,r,pc,w){
   function arc(a0,a1,c){var n=Math.max(2,Math.ceil(Math.abs(a1-a0)/4)),p=[];for(var i=0;i<=n;i++){var a=(a0+(a1-a0)*i/n)*Math.PI/180;p.push(fy(cx+r*Math.cos(a))+' '+fy(cy+r*Math.sin(a)));}
    ops.push(c+' RG '+w+' w 1 J 1 j '+p[0]+' m '+p.slice(1).map(function(q){return q+' l';}).join(' ')+' S');}
   arc(90,-270,C.line);
   if(pc>0)arc(90,90-3.6*Math.min(100,pc)*(pc>=100?0.9999:1),C.orange);
  },
  bar:function(x,yy,w,h,pc,c){P.rect(x,yy,w,h,C.line);if(pc>0)P.rect(x,yy,w*Math.min(100,pc)/100,h,C[c||'teal']);},
  tile:function(x,yy,w,h,val,lab){P.rect(x,yy,w,h,C.sand);P.rect(x,yy,3,h,C.orange);P.at(val,x+14,yy+h-28,{size:20,bold:true});P.at(lab.toUpperCase(),x+14,yy+10,{size:7,bold:true,c:'stone',sp:1});},
  text:function(s,o){
   o=o||{};var size=o.size||10,bold=!!o.bold,x=M+(o.indent||0),lh=o.lh||size*1.45;
   wrapText(latin(s),size,bold,PW-M-x).forEach(function(l){if(y-lh<M+14)np();y-=lh;P.at(l,x,y,{size:size,bold:bold,c:o.c||(o.grey?'stone':'navy')});});
  },
  label:function(s,x,yy){P.at(s.toUpperCase(),x,yy,{size:7.5,bold:true,c:'stone',sp:1.2});},
  band:function(title,right){
   P.need(40);y-=22;P.rect(M,y-5,PW-2*M,20,C.sand);P.rect(M,y-5,3,20,C.orange);
   P.at(P.fit(title,10.5,true,PW-2*M-90),M+12,y,{size:10.5,bold:true});
   P.at(right,PW-M-8,y,{size:9,bold:true,c:'teal',align:'right'});y-=10;
  },
  check:function(done,s,o){
   o=o||{};var size=9,lh=12.5,x=M+(o.indent||0);
   var lines=wrapText(latin(s),size,false,PW-M-x-22);
   P.need(lines.length*lh+2);
   var by=y-lh;
   if(done){P.rect(x,by-1.5,8.5,8.5,C.teal);ops.push('1 1 1 RG 1.2 w '+fy(x+1.9)+' '+fy(by+2)+' m '+fy(x+3.6)+' '+fy(by+0.3)+' l '+fy(x+6.8)+' '+fy(by+5.4)+' l S');}
   else ops.push(C.steel+' RG 0.8 w '+fy(x+0.4)+' '+fy(by-1.1)+' 7.7 7.7 re S');
   lines.forEach(function(l){y-=lh;P.at(l,x+16,y,{size:size,c:done?'navy':'stone'});});
   y-=1.5;
  }
 };
 draw(P);
 if(ops.length)pages.push(ops);
 var N=pages.length;
 var cs=pages.map(function(o,i){
  var a=o.slice();
  if(i>0){a.push(C.line+' RG 0.6 w '+M+' '+(PH-M+6)+' m '+(PW-M)+' '+(PH-M+6)+' l S');
   a.push(C.stone+' rg BT /F2 7 Tf 1.2 Tc '+M+' '+(PH-M+12)+' Td ('+pesc(latin((meta.label||'').toUpperCase()))+') Tj ET');
   var r=latin(meta.right||'');a.push(C.stone+' rg BT /F1 8 Tf 0 Tc '+fy(PW-M-tw(r,8,false))+' '+(PH-M+12)+' Td ('+pesc(r)+') Tj ET');}
  a.push(C.line+' RG 0.6 w '+M+' 36 m '+(PW-M)+' 36 l S');
  a.push(C.stone+' rg BT /F1 8 Tf 0 Tc '+M+' 24 Td (OwnWard  |  Home Loan Advisor Training) Tj ET');
  var pg='Page '+(i+1)+' of '+N;a.push(C.stone+' rg BT /F1 8 Tf 0 Tc '+fy(PW-M-tw(pg,8,false))+' 24 Td ('+pg+') Tj ET');
  return a.join('\n');
 });
 var out='%PDF-1.4\n',offs=[],n=4+cs.length*2;
 function add(i,body){offs[i]=out.length;out+=i+' 0 obj\n'+body+'\nendobj\n';}
 add(1,'<< /Type /Catalog /Pages 2 0 R >>');
 add(2,'<< /Type /Pages /Kids ['+cs.map(function(_,i){return (5+2*i)+' 0 R';}).join(' ')+'] /Count '+cs.length+' >>');
 add(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 add(4,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 cs.forEach(function(c,i){
  add(5+2*i,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(6+2*i)+' 0 R >>');
  add(6+2*i,'<< /Length '+c.length+' >>\nstream\n'+c+'\nendstream');
 });
 var xo=out.length;out+='xref\n0 '+(n+1)+'\n0000000000 65535 f \n';
 for(var k=1;k<=n;k++)out+=('0000000000'+offs[k]).slice(-10)+' 00000 n \n';
 out+='trailer\n<< /Size '+(n+1)+' /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF';
 var u=new Uint8Array(out.length);for(var j=0;j<out.length;j++)u[j]=out.charCodeAt(j)&255;
 return new Blob([u],{type:'application/pdf'});
}
export function fmtDate(t){return t?new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';}
export function pdfCover(P,kicker,title,sub1,sub2){
 var PW=P.PW,PH=P.PH,M=P.M;
 P.rect(0,PH-156,PW,156,P.C.navy);P.rect(M,PH-150,40,3,P.C.orange);
 P.at(kicker.toUpperCase(),M,PH-52,{size:8,bold:true,c:'steel',sp:2});
 P.at(title,M,PH-92,{size:28,bold:true,c:'white'});
 P.at(sub1,M,PH-116,{size:12,bold:true,c:'white'});
 P.at(sub2,M,PH-132,{size:9,c:'steel'});
 P.y(PH-156-26);
}
