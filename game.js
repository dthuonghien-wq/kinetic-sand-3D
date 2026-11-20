const $=id=>document.getElementById(id);
const wrap=$('wrap'),ov=$('ov'),msg=$('msg'),stB=$('st'),sc=$('sc'),bs=$('bs'),lvE=$('lv'),lfE=$('lf'),lvB=$('lvb'),mu=$('mu'),jpB=$('jp'),fl=$('fl');
let best=0,muted=false;try{best=+localStorage.getItem('cosmicBest')||0;muted=localStorage.getItem('cosmicMute')==='1'}catch(e){}
bs.textContent=best;mu.textContent=muted?'🔇':'🔊';
mu.addEventListener('pointerdown',e=>{e.preventDefault();muted=!muted;mu.textContent=muted?'🔇':'🔊';try{localStorage.setItem('cosmicMute',muted?'1':'0')}catch(e){}});
let AC=null;
function snd(f1,f2,d,type,vol){if(muted||!AC)return;const t=AC.currentTime,o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(0.001,t+d);o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+d)}
const seq=(fs,vol)=>fs.forEach((f,i)=>setTimeout(()=>snd(f,f*1.01,0.12,'square',vol),i*80));
const sJump=()=>snd(300,750,0.16,'triangle',0.09),sMove=()=>snd(520,470,0.04,'triangle',0.05),sLand=()=>snd(140,80,0.07,'sine',0.1);
const sSmash=c=>{snd(240,60,0.28,'sawtooth',0.09);snd(900+(c||0)*120,300,0.1,'square',0.035)};
const sFruit=()=>seq([784,1047],0.08),sPin=()=>seq([392,330,262,523],0.08),sGate=()=>seq([523,659,784,1047],0.06);
const sHit=()=>snd(320,55,0.45,'sawtooth',0.14),sDie=()=>snd(400,45,0.9,'sawtooth',0.15),sLevel=()=>seq([523,659,784,1047,1319],0.08);
if(typeof THREE==='undefined'){msg.textContent='Không tải được đồ hoạ 3D, hãy mở lại khi có mạng';stB.style.display='none';throw new Error('THREE missing')}

// ---------- Khung cảnh ----------
const W=wrap.clientWidth||340,HH=Math.round(W*1.25);
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(W,HH);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;wrap.prepend(R.domElement);
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(58,W/HH,0.1,260);
const bc=document.createElement('canvas');bc.width=2;bc.height=256;{const g=bc.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#3a1460');gr.addColorStop(0.5,'#160b33');gr.addColorStop(1,'#07050f');g.fillStyle=gr;g.fillRect(0,0,2,256)}
S.background=new THREE.CanvasTexture(bc);S.fog=new THREE.Fog(0x160b33,50,105);
S.add(new THREE.HemisphereLight(0xffffff,0x3a2266,0.8));
const L=new THREE.DirectionalLight(0xffffff,0.9);L.castShadow=true;L.shadow.mapSize.set(1024,1024);Object.assign(L.shadow.camera,{left:-9,right:9,top:12,bottom:-12,near:1,far:40});S.add(L);S.add(L.target);
// Sao
{const n=1100,p=new Float32Array(n*3),col=new Float32Array(n*3),pal=[[1,1,1],[0.8,0.85,1],[1,0.9,0.7],[0.9,0.7,1]];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.random()*1.2-0.2,r=110+Math.random()*30;p[i*3]=Math.cos(a)*Math.cos(e)*r;p[i*3+1]=Math.sin(e)*r;p[i*3+2]=Math.sin(a)*Math.cos(e)*r-20;const c=pal[i%4];col.set(c,i*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));S.add(new THREE.Points(g,new THREE.PointsMaterial({size:0.7,vertexColors:true,fog:false})))}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)}
// Hành tinh
const planets=[];
function makePlanet(r,cols,ring,pos){const t=canvasTex(128,64,(g,w,h)=>{for(let y=0;y<h;y+=4){g.fillStyle=cols[Math.floor(Math.random()*cols.length)];g.fillRect(0,y,w,4+Math.random()*6)}});
const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),new THREE.MeshStandardMaterial({map:t,fog:false,roughness:0.9,emissive:0x221133}));m.position.set(...pos);m.rotation.z=0.3;
if(ring){const rg=new THREE.Mesh(new THREE.RingGeometry(r*1.4,r*2.1,64),new THREE.MeshBasicMaterial({color:ring,side:THREE.DoubleSide,transparent:true,opacity:0.55,fog:false}));rg.rotation.x=Math.PI/2.4;m.add(rg)}
S.add(m);planets.push(m)}
makePlanet(14,['#E8A15A','#D9874A','#F2C38B','#C9703C'],0xF4D9A8,[-60,32,-170]);
makePlanet(8,['#5FA8E8','#3D7FC9','#8CC8F0','#2E5E9E'],0,[70,48,-190]);
makePlanet(4,['#E070C0','#C050A0','#F0A0D8'],0xF0A0D8,[30,18,-150]);
// Sao băng
const shoot=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,9),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,fog:false}));S.add(shoot);let shootT=2,shootV=new THREE.Vector3();
// Vệt tốc độ
const streakG=new THREE.BoxGeometry(0.05,0.05,1),streakM=new THREE.MeshBasicMaterial({color:0xcfc4ff,transparent:true,opacity:0.45}),streaks=[];
for(let i=0;i<55;i++){const m=new THREE.Mesh(streakG,streakM),s=i%2?1:-1;m.position.set(s*(4.5+Math.random()*10),-3+Math.random()*10,0);S.add(m);streaks.push({m,wz:10-Math.random()*90})}

function noiseTex(fn,size){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),d=g.createImageData(size,size);for(let i=0;i<size*size;i++){const v=fn(Math.random());d.data[i*4]=v[0];d.data[i*4+1]=v[1];d.data[i*4+2]=v[2];d.data[i*4+3]=255}g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function hexTex(cols,line){const t=canvasTex(128,128,(g,w,h)=>{const r=11,dx=r*Math.sqrt(3),dy=r*1.5;g.fillStyle=line;g.fillRect(0,0,w,h);
for(let row=-1;row*dy<h+r;row++)for(let col=-1;col*dx<w+dx;col++){const cx=col*dx+(row%2?dx/2:0),cy=row*dy;g.fillStyle=cols[Math.floor(Math.random()*cols.length)];g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/3*k+Math.PI/6;g.lineTo(cx+Math.cos(a)*(r-1.2),cy+Math.sin(a)*(r-1.2))}g.fill()}
const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const n=(Math.random()-0.5)*26;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0)});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const sandTex=noiseTex(v=>{const k=175+v*80;return[k,k,k]},64);
// Chủ đề đường đi theo màn
const THEMES=[
{tex:noiseTex(v=>[95+v*60,175+v*55,40+v*35],64),edge:0x4E8F2A,rep:4},
{tex:hexTex(['#F5A623','#F7C04A','#EF8A2B','#F9D56E','#E9762B'],'#B85C1A'),edge:0xB85C1A,rep:2},
{tex:hexTex(['#3FC1C9','#5FD3D9','#2BA8B0','#8EE3E8'],'#1D7C82'),edge:0x1D7C82,rep:2},
{tex:hexTex(['#F06EAA','#F48FC0','#E0528F','#F9B4D5'],'#A8336A'),edge:0xA8336A,rep:2},
{tex:hexTex(['#E24B4A','#F4C430','#3FC1C9','#A05AD8','#7CCF3E','#F08A24'],'#2a1a40'),edge:0x5B3A9A,rep:2}];
THEMES.forEach(t=>{const s=t.tex.clone();s.needsUpdate=true;s.repeat.set(t.rep,t.rep/4);t.tex.repeat.set(t.rep,t.rep);t.m7=new THREE.MeshStandardMaterial({map:t.tex,roughness:1});t.ms=new THREE.MeshStandardMaterial({map:s,roughness:1});t.me=new THREE.MeshStandardMaterial({color:t.edge,roughness:0.6})});
const tileG7=new THREE.BoxGeometry(7,0.8,7),tileGs=new THREE.BoxGeometry(7,0.8,1.75),edgeG7=new THREE.BoxGeometry(0.35,0.32,7),edgeGs=new THREE.BoxGeometry(0.35,0.32,1.75);
const COLS=[0xE24B4A,0xF4C430,0x378ADD,0xA05AD8];
const sandM=COLS.map(c=>new THREE.MeshStandardMaterial({color:c,map:sandTex,bumpMap:sandTex,bumpScale:0.08,roughness:1}));
const blockG=new THREE.BoxGeometry(1.7,1.2,1.2);
const X=[-2.2,0,2.2];

// Bóng
const btc=canvasTex(128,64,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#d4d4d4';for(let i=0;i<16;i++){g.beginPath();g.arc(Math.random()*w,Math.random()*h,3+Math.random()*6,0,Math.PI*2);g.fill()}g.fillRect(0,29,w,6)});
const ballM=new THREE.MeshStandardMaterial({map:btc,bumpMap:sandTex,bumpScale:0.02,roughness:0.3,metalness:0.1});
const ball=new THREE.Mesh(new THREE.SphereGeometry(0.55,32,24),ballM);ball.castShadow=true;S.add(ball);
const glow=new THREE.Mesh(new THREE.SphereGeometry(0.75,24,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0.18,depthWrite:false}));S.add(glow);

// Ki bowling
const pinG=new THREE.LatheGeometry([[0,0],[0.18,0],[0.26,0.25],[0.3,0.5],[0.25,0.8],[0.13,1.05],[0.12,1.15],[0.17,1.3],[0.16,1.45],[0.08,1.55],[0,1.57]].map(([x,y])=>new THREE.Vector2(x,y)),18);
const bandG=new THREE.CylinderGeometry(0.128,0.128,0.08,18);
const matC={};const mat=(c,o)=>matC[c]||(matC[c]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.35},o||{})));
function makePin(body,band,s){const g=new THREE.Group(),m=new THREE.Mesh(pinG,mat(body));m.castShadow=true;g.add(m);[1.08,1.2].forEach(y=>{const b=new THREE.Mesh(bandG,mat(band));b.position.y=y;g.add(b)});g.scale.setScalar(s);return g}
// Trái cây
const appleG=new THREE.SphereGeometry(0.42,20,16),stemG=new THREE.CylinderGeometry(0.03,0.03,0.22),leafG=new THREE.BoxGeometry(0.22,0.03,0.12);
const banG=new THREE.TorusGeometry(0.5,0.13,10,20,Math.PI*0.8);
const FR=[0xE24B4A,0xF08A24,0xF4D03F];
function makeFruit(k){const g=new THREE.Group();
if(k===2){const b=new THREE.Mesh(banG,mat(0xF4D03F));b.rotation.z=Math.PI*1.1;b.castShadow=true;g.add(b)}
else{const a=new THREE.Mesh(appleG,mat(FR[k],{emissive:k?0x3a1a00:0x3a0a0a}));a.castShadow=true;g.add(a);const s=new THREE.Mesh(stemG,mat(0x5a3a1a));s.position.y=0.46;g.add(s);const l=new THREE.Mesh(leafG,mat(0x639922));l.position.set(0.1,0.5,0);l.rotation.z=0.4;g.add(l)}
return g}
// Cổng đổi màu
const postG=new THREE.BoxGeometry(0.3,3.2,0.3),barG=new THREE.BoxGeometry(7.6,0.35,0.35),veilG=new THREE.PlaneGeometry(7,2.9),orbG=new THREE.SphereGeometry(0.3,16,12);
function makeGate(ci){const g=new THREE.Group(),m=mat(COLS[ci]+1,{emissive:COLS[ci],emissiveIntensity:0.45});
[-3.65,3.65].forEach(x=>{const p=new THREE.Mesh(postG,m);p.position.set(x,1.6,0);p.castShadow=true;g.add(p);const o=new THREE.Mesh(orbG,m);o.position.set(x,3.45,0);g.add(o)});
const b=new THREE.Mesh(barG,m);b.position.y=3.2;g.add(b);
const v=new THREE.Mesh(veilG,new THREE.MeshBasicMaterial({color:COLS[ci],transparent:true,opacity:0.3,side:THREE.DoubleSide,depthWrite:false}));v.position.y=1.5;g.add(v);g.veil=v;return g}

// Trang trí bay lơ lửng
const beadG=new THREE.SphereGeometry(0.4,12,10),decor=[];
function makeRibbon(){const g=new THREE.Group(),m=mat(0x8E44AD);for(let i=0;i<14;i++){const b=new THREE.Mesh(beadG,m);b.position.set(i*0.7-4.5,Math.sin(i*0.5)*0.4,Math.cos(i*0.4)*0.6);g.add(b)}return g}
for(let i=0;i<30;i++){const side=i%2?1:-1,k=i%5;let m;
if(k<3)m=makePin([0xffffff,0xF4D03F,0x2ECC71,0xA05AD8,0xE24B4A][Math.floor(Math.random()*5)],0xE24B4A,1.8+Math.random()*1.5);
else if(k===3)m=makeFruit(Math.floor(Math.random()*3)),m.scale.setScalar(2+Math.random()*1.5);
else m=makeRibbon();
m.position.set(side*(7+Math.random()*10),-3+Math.random()*9,0);m.rotation.set(Math.random(),Math.random()*3,Math.random()*0.6);
S.add(m);decor.push({m,wz:10-Math.random()*120,spin:(Math.random()-0.5)*0.8,by:m.position.y,ph:Math.random()*6})}

// ---------- Hiệu ứng ----------
const pG=new THREE.BoxGeometry(0.15,0.15,0.15),parts=[],flying=[],fx=[];
function part(x,y,wz,c,v,s,decay){const m=new THREE.Mesh(pG,mat(c));m.position.set(x,y,0);m.wz=wz;m.v=v;m.s0=s;m.decay=decay;m.life=1;m.scale.setScalar(s);S.add(m);parts.push(m)}
function burst(x,y,wz,c,n,pw){pw=pw||1;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(2+Math.random()*4)*pw;part(x,y+(Math.random()-0.5)*0.6,wz,c,new THREE.Vector3(Math.cos(a)*sp,(2+Math.random()*5)*pw,Math.sin(a)*sp-2),0.6+Math.random()*1.3,1.1+Math.random()*0.6)}}
const ringG=new THREE.RingGeometry(0.55,0.8,40),dustG=new THREE.SphereGeometry(0.5,10,8);
function addFx(geo,c,x,y,wz,life,g0,g1,op,flat){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide}));if(flat)m.rotation.x=-Math.PI/2;m.position.set(x,y,0);m.scale.setScalar(g0);S.add(m);fx.push({m,wz,life,max:life,g0,g1,op})}
function ring(x,y,wz,c,size){addFx(ringG,c,x,y,wz,0.55,0.6,size||4,0.85,true)}
function dust(x,y,wz,c){for(let i=0;i<5;i++)addFx(dustG,c,x+(Math.random()-0.5)*1.4,y+Math.random()*0.6,wz+(Math.random()-0.5),0.6+Math.random()*0.3,0.6,2+Math.random(),0.35,false)}
function flash(c,op){fl.style.transition='none';fl.style.background=c;fl.style.opacity=op;requestAnimationFrame(()=>requestAnimationFrame(()=>{fl.style.transition='opacity .45s';fl.style.opacity=0}))}
const pv=new THREE.Vector3();
function pop(txt,x,y,wz,col,size){pv.set(x,y,wz+dist).project(cam);const d=document.createElement('div');d.className='pp';d.textContent=txt;d.style.left=((pv.x+1)/2*100)+'%';d.style.top=((1-pv.y)/2*100)+'%';if(col)d.style.color=col;if(size)d.style.fontSize=size+'px';wrap.appendChild(d);setTimeout(()=>d.remove(),900)}
const HEX=c=>'#'+c.toString(16).padStart(6,'0');

// ---------- Màn chơi ----------
const lvLen=l=>200+l*40;
function lvAt(d){let l=1,s=0;while(d>=s+lvLen(l)){s+=lvLen(l);l++}return[l,s]}

// ---------- Trạng thái ----------
let objs=[],tiles=[],holes=[],dist=0,genWz=0,rowI=0,lastHole=false,sinceGate=0,genColor=0,ballColor=0,lane=1,ballX=0,ballY=0.55,vy=0,air=false,falling=false,inv=0,speed=9,level=1,lvStart=0,lives=3,pts=0,score=0,running=false,shake=0,T=0,combo=0,comboT=0,squash=0,popS=0,trailT=0;
const rnd=n=>Math.floor(Math.random()*n);
function other(c){let o;do o=rnd(4);while(o===c);return o}
function addTile(wz0,len,th){const g=new THREE.Group(),sh=len<5,top=new THREE.Mesh(sh?tileGs:tileG7,sh?th.ms:th.m7);top.position.y=-0.4;top.receiveShadow=true;g.add(top);
[-3.5,3.5].forEach(x=>{const e=new THREE.Mesh(sh?edgeGs:edgeG7,th.me);e.position.set(x,0.1,0);e.receiveShadow=true;g.add(e)});S.add(g);tiles.push({wz:wz0-len/2,len,m:g})}
function addObj(type,x,wz,m,ex){m.position.x=x;S.add(m);objs.push(Object.assign({type,x,wz,m,done:false},ex||{}))}
function genRow(){const z0=genWz;genWz-=7;rowI++;const gl=lvAt(-z0)[0],th=THEMES[(gl-1)%THEMES.length];
if(rowI<6){addTile(z0,7,th);return}
if(gl>=2&&!lastHole&&Math.random()<0.07+gl*0.015){addTile(z0,1.75,th);addTile(z0-5.25,1.75,th);holes.push({a:z0-1.75,b:z0-5.25});lastHole=true;sinceGate++;return}
lastHole=false;addTile(z0,7,th);sinceGate++;
const c=z0-3.5,r=Math.random();
if(r<0.2&&sinceGate>3){genColor=other(genColor);sinceGate=0;addObj('gate',0,c,makeGate(genColor),{col:genColor});return}
if(r<0.66){const ls=[0,1,2].sort(()=>Math.random()-0.5),n=Math.random()<0.25+gl*0.08?2:1;
for(let i=0;i<n;i++){const col=Math.random()<0.55?genColor:other(genColor),m=new THREE.Mesh(blockG,sandM[col]);m.position.y=0.6;m.rotation.y=(Math.random()-0.5)*0.15;m.castShadow=m.receiveShadow=true;addObj('block',X[ls[i]],c,m,{col})}
if(Math.random()<0.45){const m=makeFruit(rnd(3));m.position.y=0.8;addObj('fruit',X[ls[2]],c,m,{c:0xF4D03F})}
return}
if(r<0.82){const g=new THREE.Group();[[0,0.5],[-0.38,-0.2],[0.38,-0.2],[0,-0.6]].forEach(([x,z])=>{const p=makePin(0xffffff,0xE24B4A,0.8);p.position.set(x,0,z);g.add(p)});addObj('pins',X[rnd(3)],c,g);return}
const l=rnd(3),k=rnd(3);[1.8,0,-1.8].forEach(d=>{const m=makeFruit(k);m.position.y=0.8;addObj('fruit',X[l],c+d,m,{c:FR[k]})})}
function clearAll(){objs.forEach(o=>S.remove(o.m));tiles.forEach(t=>S.remove(t.m));parts.forEach(p=>S.remove(p));flying.forEach(f=>S.remove(f.m));fx.forEach(f=>S.remove(f.m));objs=[];tiles=[];holes=[];parts.length=0;flying.length=0;fx.length=0}
function showLv(t){lvB.textContent=t;lvB.style.opacity=1;lvB.style.transform='scale(1)';clearTimeout(showLv.t);showLv.t=setTimeout(()=>{lvB.style.opacity=0;lvB.style.transform='scale(0.8)'},1300)}
function setColor(c){ballColor=c;ballM.color.setHex(COLS[c]);glow.material.color.setHex(COLS[c])}
function reset(){clearAll();dist=0;genWz=14;rowI=0;lastHole=false;sinceGate=0;genColor=rnd(4);setColor(genColor);lane=1;ballX=0;ballY=0.55;vy=0;air=false;falling=false;inv=0;speed=9;level=1;lvStart=0;lives=3;pts=0;score=0;combo=0;comboT=0;
sc.textContent=0;lvE.textContent=1;lfE.textContent='❤️3';while(genWz>-dist-105)genRow()}
function saveBest(){try{localStorage.setItem('cosmicBest',best)}catch(e){}}
function die(){running=false;shake=0.7;sDie();saveBest();flash('#E24B4A',0.5);burst(ballX,ballY,-dist,COLS[ballColor],40,1.3);msg.textContent='Hết mạng! '+score+' điểm, tới màn '+level;stB.textContent='Chơi lại';ov.style.display='flex'}
function loseLife(){lives--;lfE.textContent='❤️'+Math.max(lives,0);inv=1.6;shake=0.6;combo=0;sHit();flash('#E24B4A',0.4);pop('-1 ❤️',ballX,1.6,-dist,'#ff8080',26);if(lives<=0){die();return false}return true}
function fallOut(){if(!loseLife())return;const bw=-dist,h=holes.find(h=>bw<h.a+0.5&&bw>h.b-0.5);if(h)dist=1.5-h.b;falling=false;air=false;ballY=0.55;vy=0;ring(ballX,0.05,-dist,0xffffff,3)}
function knock(o){const base=o.m.position;o.m.children.slice().forEach(p=>{const wx=base.x+p.position.x,wz=o.wz+p.position.z;o.m.remove(p);p.position.set(wx,0,0);S.add(p);flying.push({m:p,wz,v:new THREE.Vector3((wx-ballX)*4+(Math.random()-0.5)*4,5+Math.random()*5,-7-Math.random()*6),s:new THREE.Vector3(4+Math.random()*8,Math.random()*4,4+Math.random()*8),life:2})})}
function start(){if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(A)AC=new A()}if(AC&&AC.state==='suspended')AC.resume();reset();ov.style.display='none';running=true;showLv('Màn 1')}
function move(d){if(!running||falling)return;const n=Math.max(0,Math.min(2,lane+d));if(n!==lane){lane=n;sMove()}}
function jump(){if(!running||air||falling)return;air=true;vy=9;sJump();squash=-0.6;dust(ballX,0.2,-dist,0xffffff)}
stB.onclick=start;
document.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();move(+b.dataset.m)}));
jpB.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowUp'||e.key===' '){e.preventDefault();jump()}});
let tx,ty;wrap.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
wrap.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
wrap.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.max(Math.abs(dx),Math.abs(dy))<20){jump();return}if(Math.abs(dx)>Math.abs(dy))move(Math.sign(dx));else if(dy<0)jump()});
reset();

// ---------- Vòng lặp ----------
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,0.05);last=now;T+=dt;
if(running){
// Tốc độ: chậm ở màn đầu, tăng dần trong mỗi màn và qua từng màn
const tgt=Math.min(26,9+(level-1)*1.4+(dist-lvStart)/lvLen(level)*1.2);speed+=(tgt-speed)*Math.min(1,dt*1.5);
if(!falling)dist+=speed*dt;
while(genWz>-dist-105)genRow();
const[l2,s2]=lvAt(dist);if(l2>level){level=l2;lvStart=s2;lvE.textContent=level;sLevel();showLv('Màn '+level+' 🚀');flash('#ffffff',0.35);ring(ballX,0.05,-dist,0xffffff,7);for(let i=0;i<4;i++)burst(ballX,1,-dist-2,COLS[i],10,1.2)}
ballX+=(X[lane]-ballX)*Math.min(1,dt*14);
const bw=-dist,over=holes.some(h=>bw<h.a-0.25&&bw>h.b+0.25);
if(falling){vy-=30*dt;ballY+=vy*dt;if(ballY<-6)fallOut()}
else if(air){vy-=24*dt;ballY+=vy*dt;if(ballY<=0.55){if(over)falling=true;else{ballY=0.55;vy=0;air=false;sLand();squash=1;dust(ballX,0.15,-dist,0xffffff);ring(ballX,0.05,-dist,COLS[ballColor],2.2)}}}
else if(over){falling=true;air=true;vy=0}
if(inv>0)inv-=dt;if(comboT>0){comboT-=dt;if(comboT<=0)combo=0}
// Vệt cát sau bóng
if(!air&&!falling){trailT-=dt;if(trailT<=0){trailT=0.03;part(ballX+(Math.random()-0.5)*0.6,0.08,-dist+0.4,COLS[ballColor],new THREE.Vector3((Math.random()-0.5)*1.5,0.5+Math.random()*1.5,2+Math.random()*2),0.5+Math.random()*0.5,2.2)}}
for(const o of objs){if(!running)break;if(o.done)continue;const rz=o.wz+dist;if(rz<-0.8||rz>0.8)continue;
if(o.type==='gate'){o.done=true;setColor(o.col);sGate();popS=1;flash(HEX(COLS[o.col]),0.3);ring(ballX,1.2,o.wz,COLS[o.col],6);burst(ballX,1.5,o.wz,COLS[o.col],22);continue}
if(Math.abs(o.x-ballX)>1.05||falling)continue;
if(o.type==='block'){if(ballY>1.7)continue;o.done=true;o.m.visible=false;burst(o.x,0.6,o.wz,COLS[o.col],46,1.15);dust(o.x,0.6,o.wz,COLS[o.col]);
if(o.col===ballColor){combo=comboT>0?combo+1:1;comboT=2.5;const g=10*level*combo;pts+=g;sSmash(combo);shake=Math.max(shake,0.18);ring(o.x,0.05,o.wz,COLS[o.col],4);pop('+'+g,o.x,1.6,o.wz,HEX(COLS[o.col]));if(combo>=2)pop('Combo x'+combo+'!',o.x,2.6,o.wz,'#fff',combo>4?30:24)}
else if(inv<=0)loseLife();else sSmash()}
else if(o.type==='fruit'){if(ballY>2.2)continue;o.done=true;o.m.visible=false;pts+=5;sFruit();burst(o.x,0.8,o.wz,o.c,14);ring(o.x,0.8,o.wz,0xffffff,2);pop('+5',o.x,1.5,o.wz,'#ffe680')}
else if(o.type==='pins'){if(ballY>1.9)continue;o.done=true;knock(o);pts+=12;sPin();shake=Math.max(shake,0.25);pop('STRIKE! +12',o.x,2,o.wz,'#fff',24);burst(o.x,0.5,o.wz,0xffffff,14)}}
objs=objs.filter(o=>{if(o.wz+dist>14){S.remove(o.m);return false}return true});
tiles=tiles.filter(t=>{if(t.wz-t.len/2+dist>14){S.remove(t.m);return false}return true});
holes=holes.filter(h=>h.b+dist<14);
const s=pts+Math.floor(dist/5);if(s!==score){score=s;sc.textContent=s;if(score>best){best=score;bs.textContent=best}}
ball.rotation.x-=(falling?0:speed)*dt/0.55}
else ball.rotation.x-=dt*1.5;
// Bóng: nảy, bẹp khi tiếp đất, phồng khi đổi màu
squash+=(0-squash)*Math.min(1,dt*10);popS=Math.max(0,popS-dt*3);
const sq=1+popS*0.35;ball.scale.set(sq*(1+squash*0.18),sq*(1-squash*0.28),sq*(1+squash*0.18));
ball.position.set(ballX,ballY-squash*0.12,0);ball.visible=inv<=0||Math.sin(T*30)>0;
glow.position.copy(ball.position);glow.scale.setScalar(1+Math.sin(T*6)*0.06+popS*0.6);glow.visible=ball.visible;
tiles.forEach(t=>t.m.position.z=t.wz+dist);
objs.forEach(o=>{o.m.position.z=o.wz+dist;if(o.type==='fruit'){o.m.position.y=0.8+Math.sin(T*3+o.wz)*0.15;o.m.rotation.y+=dt*2}else if(o.type==='gate')o.m.veil.material.opacity=0.22+Math.sin(T*5)*0.1;else if(o.type==='block'&&!o.done){const k=1+Math.sin(T*4+o.wz)*0.03;o.m.scale.set(k,1/k,k)}});
decor.forEach(d=>{let rz=d.wz+dist;if(rz>16){d.wz-=125;rz-=125}d.m.position.z=rz;d.m.position.y=d.by+Math.sin(T*0.8+d.ph)*0.6;d.m.rotation.y+=d.spin*dt});
streaks.forEach(st=>{let rz=st.wz+dist;if(rz>12){st.wz-=95;rz-=95}st.m.position.z=rz;st.m.scale.z=1+speed*0.25});streakM.opacity=Math.min(0.6,(speed-8)*0.05+0.1);
planets.forEach((p,i)=>p.rotation.y+=dt*0.05*(i+1));
shootT-=dt;if(shootT<=0){shootT=3+Math.random()*5;shoot.position.set(-60+Math.random()*120,50+Math.random()*25,-120);shootV.set((Math.random()<0.5?-1:1)*(50+Math.random()*30),-25,0);shoot.lookAt(shoot.position.clone().add(shootV));shoot.material.opacity=1}
if(shoot.material.opacity>0){shoot.position.addScaledVector(shootV,dt);shoot.material.opacity=Math.max(0,shoot.material.opacity-dt*0.9)}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.v.y-=14*dt;p.position.x+=p.v.x*dt;p.position.y+=p.v.y*dt;if(p.position.y<0.07&&p.v.y<0){p.position.y=0.07;p.v.y*=-0.3;p.v.x*=0.6}p.wz+=p.v.z*dt;p.position.z=p.wz+dist;p.rotation.x+=dt*6;p.life-=dt*p.decay;p.scale.setScalar(Math.max(p.life*p.s0,0.01));if(p.life<=0){S.remove(p);parts.splice(i,1)}}
for(let i=flying.length-1;i>=0;i--){const f=flying[i];f.v.y-=14*dt;f.m.position.x+=f.v.x*dt;f.m.position.y+=f.v.y*dt;f.wz+=f.v.z*dt;f.m.position.z=f.wz+dist;f.m.rotation.x+=f.s.x*dt;f.m.rotation.z+=f.s.z*dt;f.life-=dt;if(f.life<=0){S.remove(f.m);flying.splice(i,1)}}
for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt;const k=1-f.life/f.max;f.m.scale.setScalar(f.g0+(f.g1-f.g0)*k);f.m.material.opacity=f.op*(1-k);f.m.position.z=f.wz+dist;if(f.life<=0){S.remove(f.m);f.m.material.dispose();fx.splice(i,1)}}
if(shake>0)shake=Math.max(0,shake-dt);
const sx=(Math.random()-0.5)*shake,sy=(Math.random()-0.5)*shake;
cam.fov=58+Math.max(0,speed-9)*0.55;cam.updateProjectionMatrix();
cam.position.set(ballX*0.45+sx,3.4+Math.max(0,ballY-0.55)*0.35+sy,6.4);cam.lookAt(ballX*0.6,0.4,-7);
L.position.set(ballX+5,12,5);L.target.position.set(ballX,0,-4);
R.render(S,cam);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
// HET GAME

