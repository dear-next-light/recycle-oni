// Camera coordinates are CSS pixels; physics and pathfinding stay in grid units.
export class Camera{
 constructor(){this.zoom=1;this.panX=0;this.panY=0;this.width=1;this.height=1;this.initialized=false}
 resize(w,h){if(w===this.width&&h===this.height)return;this.width=Math.max(1,w);this.height=Math.max(1,h);if(!this.initialized){this.zoom=w<h?1.6:1;this.panX=Math.max(0,(24*this.base*this.zoom-this.width)/2);this.initialized=true}this.clamp()}
 get aspect(){return this.width>this.height?Math.max(.68,Math.min(1,this.height*24/(this.width*14))):1}
 get base(){return Math.min(this.width/24,this.height/(14*this.aspect))}
 get view(){const scale=this.base*this.zoom;return{scale,scaleY:scale*this.aspect,x:(this.width-24*scale)/2+this.panX,y:Math.min(0,(this.height-14*scale*this.aspect)/2)+this.panY}}
 clamp(){const s=this.base*this.zoom;this.panX=Math.max(-Math.max(0,(24*s-this.width)/2),Math.min(Math.max(0,(24*s-this.width)/2),this.panX));this.panY=Math.max(-Math.max(0,(14*s*this.aspect-this.height)/2),Math.min(Math.max(0,(14*s*this.aspect-this.height)/2),this.panY))}
 world(x,y){const v=this.view;return{x:(x-v.x)/v.scale,y:(y-v.y)/v.scaleY}}
 zoomAt(factor,x=this.width/2,y=this.height/2){const before=this.world(x,y);this.zoom=Math.max(1,Math.min(4,this.zoom*factor));const after=this.view;this.panX+=x-(after.x+before.x*after.scale);this.panY+=y-(after.y+before.y*after.scaleY);this.clamp()}
 pan(dx,dy){this.panX+=dx;this.panY+=dy;this.clamp()}
 fit(){this.zoom=1;this.panX=this.panY=0}
 focus(x,y){const s=this.base*this.zoom;this.panX=(12-x)*s;this.panY=(7-y)*s*this.aspect;this.clamp()}
}
export function bindGestures(canvas,camera,onTap,onChange=()=>{}){
 const pointers=new Map();let gesture=false,pinch=null;
 const local=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 const pair=()=>{const [a,b]=[...pointers.values()];return{distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;const p=local(e);if(!pointers.size){gesture=false;pinch=null}pointers.set(e.pointerId,{...p,startX:p.x,startY:p.y});canvas.setPointerCapture(e.pointerId);if(pointers.size>=2){gesture=true;pinch=pair()}});
 canvas.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const p=local(e),dx=p.x-old.x,dy=p.y-old.y;pointers.set(e.pointerId,{...old,...p});if(pointers.size>=2){const next=pair();if(pinch){camera.zoomAt(next.distance/Math.max(1,pinch.distance),pinch.x,pinch.y);camera.pan(next.x-pinch.x,next.y-pinch.y)}pinch=next;gesture=true;onChange()}else if(gesture||Math.hypot(p.x-old.startX,p.y-old.startY)>7){gesture=true;camera.pan(dx,dy);onChange()}});
 const end=(e,cancelled)=>{const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!cancelled&&!gesture&&!pointers.size&&Math.hypot(p.x-p.startX,p.y-p.startY)<=7)onTap(e);if(pointers.size<2)pinch=null;if(cancelled)gesture=true};
 canvas.addEventListener('pointerup',e=>end(e,false));canvas.addEventListener('pointercancel',e=>end(e,true));canvas.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);pinch=null});
 canvas.addEventListener('wheel',e=>{e.preventDefault();const p=local(e);camera.zoomAt(Math.exp(-e.deltaY*.002),p.x,p.y);onChange()},{passive:false});
}
