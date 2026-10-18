(()=>{
const R=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes=[...document.querySelectorAll('[data-scene]')],floor=document.getElementById('floor'),track=document.querySelector('.track'),root=document.documentElement;
const vp=document.createElement('div');vp.style.cssText='position:absolute;top:0;height:100svh;width:1px;visibility:hidden;pointer-events:none';document.body.appendChild(vp);let tops=[],vh=vp.offsetHeight,lw=innerWidth;
function measure(){vh=vp.offsetHeight;tops=scenes.map(s=>{const r=s.getBoundingClientRect();return[r.top+scrollY,s.offsetHeight]});
 if(track)track.parentNode.parentNode.style.setProperty('--tw',Math.max(0,track.scrollWidth-innerWidth+40)+'px')}
function frame(){const y=scrollY;
 root.style.setProperty('--sp',Math.min(1,y/(document.body.scrollHeight-vh)).toFixed(4));
 scenes.forEach((s,i)=>{const[t,h]=tops[i];let p=(y-t)/(h-vh);p=Math.min(1,Math.max(0,p));
  if(s._p===p)return;s._p=p;s.style.setProperty('--p',p.toFixed(4));
  if(s.hasAttribute('data-phrases')){const ps=s.querySelectorAll('.phr p');const k=Math.min(ps.length-1,Math.floor(p*ps.length*1.05));ps.forEach((e,j)=>e.classList.toggle('on',j===k))}
  if(s.classList.contains('s3')&&floor)floor.textContent=Math.max(1,Math.round(1+p*15));
 });ticking=false}
let ticking=false;
if(!R){measure();frame();addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(frame)}},{passive:true});addEventListener('resize',()=>{if(innerWidth!==lw){lw=innerWidth;measure();frame()}})}
else{floor&&(floor.textContent='16')}
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.25});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
document.querySelectorAll('[data-remarked]').forEach(a=>a.onclick=e=>{e.preventDefault();alert('Концепт: здесь откроется виджет бронирования Remarked')});
})();
