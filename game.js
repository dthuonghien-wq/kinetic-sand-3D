const $=id=>document.getElementById(id);
const wrap=$('wrap'),ov=$('ov'),msg=$('msg'),stB=$('st'),sc=$('sc'),bs=$('bs'),lvE=$('lv'),lfE=$('lf'),lvB=$('lvb'),mu=$('mu'),jpB=$('jp'),slB=$('sl'),fl=$('fl'),pwE=$('pw');
let best=0,muted=false;try{best=+localStorage.getItem('cosmicBest')||0;muted=localStorage.getItem('cosmicMute')==='1'}catch(e){}
bs.textContent=best;mu.textContent=muted?'🔇':'🔊';
mu.addEventListener('pointerdown',e=>{e.preventDefault();muted=!muted;mu.textContent=muted?'🔇':'🔊';try{localStorage.setItem('cosmicMute',muted?'1':'0')}catch(e){}});
let AC=null;
function snd(f1,f2,d,type,vol){if(muted||!AC)return;const t=AC.currentTime,o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(0.001,t+d);o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+d)}
const seq=(fs,vol)=>fs.forEach((f,i)=>setTimeout(()=>snd(f,f*1.01,0.12,'square',vol),i*80));
const sJump=()=>snd(300,750,0.16,'triangle',0.09),sDbl=()=>snd(500,1300,0.14,'triangle',0.08),sMove=()=>snd(520,470,0.04,'triangle',0.05),sLand=()=>snd(140,80,0.07,'sine',0.1);
const sSmash=c=>{snd(240,60,0.28,'sawtooth',0.09);snd(900+(c||0)*120,300,0.1,'square',0.035)};
const sFruit=()=>seq([784,1047],0.08),sPin=()=>seq([392,330,262,523],0.08),sGate=()=>seq([523,659,784,1047],0.06);
const sHit=()=>snd(320,55,0.45,'sawtooth',0.14),sDie=()=>snd(400,45,0.9,'sawtooth',0.15),sLevel=()=>seq([523,659,784,1047,1319],0.08);
const sPower=()=>seq([523,784,1047,1568,2093],0.08),sBoost=()=>snd(200,1300,0.4,'triangle',0.11),sShield=()=>seq([1568,1175,880],0.07);
const sSlam=()=>{snd(200,35,0.55,'sawtooth',0.16);snd(90,30,0.45,'sine',0.25)},sThump=()=>snd(90,40,0.12,'sine',0.14);
if(typeof THREE==='undefined'){msg.textContent='Không tải được đồ hoạ 3D, hãy mở lại khi có mạng';stB.style.display='none';throw new Error('THREE missing')}

// ---------- Khung cảnh ----------
const W=wrap.clientWidth||340,HH=Math.round(W*1.25);
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(W,HH);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;wrap.prepend(R.domElement);
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(58,W/HH,0.1,260);
const bc=document.createElement('canvas');bc.width=2;bc.height=256;{const g=bc.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#3a1460');gr.addColorStop(0.5,'#160b33');gr.addColorStop(1,'#07050f');g.fillStyle=gr;g.fillRect(0,0,2,256)}
S.background=new THREE.CanvasTexture(bc);S.fog=new THREE.Fog(0x160b33,50,105);
S.add(new THREE.HemisphereLight(0xffffff,0x3a2266,0.8));
const L=new THREE.DirectionalLight(0xffffff,0.9);L.castShadow=true;L.shadow.mapSize.set(1024,1024);Object.assign(L.shadow.camera,{left:-9,right:9,top:12,bottom:-12,near:1,far:40});S.add(L);S.add(L.target);
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)}
// Sao
{const n=1100,p=new Float32Array(n*3),col=new Float32Array(n*3),pal=[[1,1,1],[0.8,0.85,1],[1,0.9,0.7],[0.9,0.7,1]];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.random()*1.2-0.2,r=110+Math.random()*30;p[i*3]=Math.cos(a)*Math.cos(e)*r;p[i*3+1]=Math.sin(e)*r;p[i*3+2]=Math.sin(a)*Math.cos(e)*r-20;col.set(pal[i%4],i*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));S.add(new THREE.Points(g,new THREE.PointsMaterial({size:0.7,vertexColors:true,fog:false})))}
// Tinh vân
const radT=canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
[[0xA05AD8,-80,40,-210,150],[0xE070C0,70,20,-220,120],[0x378ADD,10,75,-235,170],[0x3FC1C9,-130,5,-200,100]].forEach(([c,x,y,z,s])=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:radT,color:c,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s*0.6,1);S.add(sp)});
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
const shoot=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,9),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,fog:false}));S.add(shoot);let shootT=2;const shootV=new THREE.Vector3();
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
{tex:noiseTex(v=>[95+v*60,175+v*55,40+v*35],64),edge:0x4E8F2A,rep:4,rock:0x6B4A2B,crys:0x7CF3FF},
{tex:hexTex(['#F5A623','#F7C04A','#EF8A2B','#F9D56E','#E9762B'],'#B85C1A'),edge:0xB85C1A,rep:2,rock:0x7A3E14,crys:0xFFE066},
{tex:hexTex(['#3FC1C9','#5FD3D9','#2BA8B0','#8EE3E8'],'#1D7C82'),edge:0x1D7C82,rep:2,rock:0x24525A,crys:0xB8FFF5},
{tex:hexTex(['#F06EAA','#F48FC0','#E0528F','#F9B4D5'],'#A8336A'),edge:0xA8336A,rep:2,rock:0x6A2A50,crys:0xFFD1EC},
{tex:hexTex(['#E24B4A','#F4C430','#3FC1C9','#A05AD8','#7CCF3E','#F08A24'],'#2a1a40'),edge:0x5B3A9A,rep:2,rock:0x3A2A5A,crys:0xffffff}];
THEMES.forEach(t=>{const s=t.tex.clone();s.needsUpdate=true;s.repeat.set(t.rep,t.rep/4);t.tex.repeat.set(t.rep,t.rep);t.m7=new THREE.MeshStandardMaterial({map:t.tex,roughness:1});t.ms=new THREE.MeshStandardMaterial({map:s,roughness:1});t.me=new THREE.MeshStandardMaterial({color:t.edge,roughness:0.6});
t.mr=new THREE.MeshStandardMaterial({color:t.rock,roughness:0.95,flatShading:true});t.mc=new THREE.MeshStandardMaterial({color:t.crys,emissive:t.crys,emissiveIntensity:0.6,roughness:0.2})});
const tileG7=new THREE.BoxGeometry(7,0.8,7),tileGs=new THREE.BoxGeometry(7,0.8,1.75),edgeG7=new THREE.BoxGeometry(0.35,0.32,7),edgeGs=new THREE.BoxGeometry(0.35,0.32,1.75);
const rockG=new THREE.ConeGeometry(3.2,4.5,7),crysG=new THREE.OctahedronGeometry(0.22);
const COLS=[0xE24B4A,0xF4C430,0x378ADD,0xA05AD8];
const sandM=COLS.map(c=>new THREE.MeshStandardMaterial({color:c,map:sandTex,bumpMap:sandTex,bumpScale:0.08,roughness:1}));
const blockG=new THREE.BoxGeometry(1.7,1.2,1.2);
const X=[-2.2,0,2.2];

// Bóng
const btc=canvasTex(128,64,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#d4d4d4';for(let i=0;i<16;i++){g.beginPath();g.arc(Math.random()*w,Math.random()*h,3+Math.random()*6,0,Math.PI*2);g.fill()}g.fillRect(0,29,w,6)});
const ballM=new THREE.MeshStandardMaterial({map:btc,bumpMap:sandTex,bumpScale:0.02,roughness:0.3,metalness:0.1});
const ball=new THREE.Mesh(new THREE.SphereGeometry(0.55,32,24),ballM);ball.castShadow=true;S.add(ball);
const glow=new THREE.Mesh(new THREE.SphereGeometry(0.75,24,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0.18,depthWrite:false}));S.add(glow);
// Hiệu ứng sức mạnh quanh bóng
const fireL=new THREE.PointLight(0xff6a00,0,9);S.add(fireL);
const bubble=new THREE.Mesh(new THREE.SphereGeometry(0.95,24,18),new THREE.MeshBasicMaterial({color:0x6fd8ff,transparent:true,opacity:0.2,depthWrite:false}));
const bubbleW=new THREE.Mesh(new THREE.IcosahedronGeometry(0.99,1),new THREE.MeshBasicMaterial({color:0xaef0ff,wireframe:true,transparent:true,opacity:0.55}));bubble.add(bubbleW);bubble.visible=false;S.add(bubble);
const mag=new THREE.Group(),magG=new THREE.TorusGeometry(1.05,0.05,8,40);
[0xE24B4A,0x378ADD,0xffffff].forEach((c,i)=>{const t=new THREE.Mesh(magG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.8}));t.rotation.set(i*1.1,i*0.7,0);mag.add(t)});mag.visible=false;S.add(mag);
const aura=new THREE.Mesh(new THREE.RingGeometry(0.9,1.25,40),new THREE.MeshBasicMaterial({color:0x7CCF3E,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false}));aura.rotation.x=-Math.PI/2;aura.visible=false;S.add(aura);

// Ki bowling
const pinG=new THREE.LatheGeometry([[0,0],[0.18,0],[0.26,0.25],[0.3,0.5],[0.25,0.8],[0.13,1.05],[0.12,1.15],[0.17,1.3],[0.16,1.45],[0.08,1.55],[0,1.57]].map(([x,y])=>new THREE.Vector2(x,y)),18);
const bandG=new THREE.CylinderGeometry(0.128,0.128,0.08,18);
const matC={};const mat=(c,o)=>matC[c]||(matC[c]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.35},o||{})));
const addC={};const addM=c=>addC[c]||(addC[c]=new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
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
// Vật phẩm sức mạnh
const PW={shield:{c:0x4FC3F7,e:'🛡️',n:'Khiên!'},fire:{c:0xFF7A1A,e:'🔥',n:'Bóng lửa!',t:6},magnet:{c:0xE24B4A,e:'🧲',n:'Nam châm!',t:8},giant:{c:0x7CCF3E,e:'💪',n:'Khổng lồ!',t:6}};
const PK=Object.keys(PW),orbBig=new THREE.SphereGeometry(0.55,24,18),haloG=new THREE.TorusGeometry(0.75,0.06,8,40);
PK.forEach(k=>{const p=PW[k];p.tex=canvasTex(128,128,g=>{g.font='86px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.e,64,70)});p.om=new THREE.MeshBasicMaterial({color:p.c,transparent:true,opacity:0.35,depthWrite:false});p.hm=new THREE.MeshBasicMaterial({color:p.c})});
function makePower(k){const p=PW[k],g=new THREE.Group();g.add(new THREE.Mesh(orbBig,p.om));const s=new THREE.Sprite(new THREE.SpriteMaterial({map:p.tex,depthWrite:false}));s.scale.set(0.9,0.9,1);g.add(s);const h=new THREE.Mesh(haloG,p.hm);g.add(h);g.halo=h;return g}
// Bệ bật
const padT=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#0b3d4a';g.fillRect(0,0,w,h);g.strokeStyle='#5ff';g.lineWidth=7;g.lineCap='round';for(let i=0;i<3;i++){const y=8+i*16;g.beginPath();g.moveTo(14,y);g.lineTo(32,y+12);g.lineTo(50,y);g.stroke()}});
const padM=new THREE.MeshStandardMaterial({map:padT,emissive:0xffffff,emissiveMap:padT,emissiveIntensity:0.7}),padG=new THREE.BoxGeometry(1.7,0.12,1.7);
// Thanh kẹo lăn
const candyT=canvasTex(16,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#fff':'#E24B4A';g.fillRect(0,i*8,w,8)}});candyT.wrapT=THREE.RepeatWrapping;candyT.repeat.set(1,6);
const barCylG=new THREE.CylinderGeometry(0.3,0.3,7,20),candyM=new THREE.MeshStandardMaterial({map:candyT,roughness:0.4});
function makeBar(){const g=new THREE.Group(),pv=new THREE.Group(),c=new THREE.Mesh(barCylG,candyM);pv.rotation.z=Math.PI/2;pv.position.y=0.5;c.castShadow=true;pv.add(c);g.add(pv);g.cyl=c;
[-3.6,3.6].forEach(x=>{const p=new THREE.Mesh(postG,mat(0xffffff));p.scale.y=0.35;p.position.set(x,0.55,0);g.add(p)});return g}
// Bóng bowling khổng lồ lăn ngược
const rollG=new THREE.SphereGeometry(0.95,28,20),rollM=new THREE.MeshStandardMaterial({color:0x1d1a3a,roughness:0.15,metalness:0.5,emissive:0x220a33}),holeG=new THREE.SphereGeometry(0.13,10,8);
function makeRoller(){const g=new THREE.Group(),b=new THREE.Mesh(rollG,rollM);b.castShadow=true;g.add(b);[[0,0.2],[-0.25,0.45],[0.25,0.45]].forEach(([x,a])=>{const h=new THREE.Mesh(holeG,mat(0x000000));h.position.set(x,Math.cos(a)*0.9,Math.sin(a)*0.9);b.add(h)});g.ball=b;g.position.y=0.95;return g}

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
function part(x,y,wz,m,v,s,decay,grav){const p=new THREE.Mesh(pG,m);p.position.set(x,y,0);p.wz=wz;p.v=v;p.s0=s;p.decay=decay;p.grav=grav===undefined?14:grav;p.life=1;p.scale.setScalar(s);S.add(p);parts.push(p)}
function burst(x,y,wz,c,n,pw){pw=pw||1;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(2+Math.random()*4)*pw;part(x,y+(Math.random()-0.5)*0.6,wz,mat(c),new THREE.Vector3(Math.cos(a)*sp,(2+Math.random()*5)*pw,Math.sin(a)*sp-2),0.6+Math.random()*1.3,1.1+Math.random()*0.6)}}
function sparkle(x,y,wz,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.random()*Math.PI-Math.PI/2,sp=3+Math.random()*4;part(x,y,wz,addM(c),new THREE.Vector3(Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp+2,Math.sin(a)*Math.cos(e)*sp),0.5+Math.random()*0.7,1.6,4)}}
const ringG=new THREE.RingGeometry(0.55,0.8,40),dustG=new THREE.SphereGeometry(0.5,10,8);
function addFx(geo,c,x,y,wz,life,g0,g1,op,flat){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide}));if(flat)m.rotation.x=-Math.PI/2;m.position.set(x,y,0);m.scale.setScalar(g0);S.add(m);fx.push({m,wz,life,max:life,g0,g1,op})}
function ring(x,y,wz,c,size){addFx(ringG,c,x,y,wz,0.55,0.6,size||4,0.85,true)}
function dust(x,y,wz,c,n){for(let i=0;i<(n||5);i++)addFx(dustG,c,x+(Math.random()-0.5)*1.4,y+Math.random()*0.6,wz+(Math.random()-0.5),0.6+Math.random()*0.3,0.6,2+Math.random(),0.35,false)}
function flash(c,op){fl.style.transition='none';fl.style.background=c;fl.style.opacity=op;requestAnimationFrame(()=>requestAnimationFrame(()=>{fl.style.transition='opacity .45s';fl.style.opacity=0}))}
const pv=new THREE.Vector3();
function pop(txt,x,y,wz,col,size){pv.set(x,y,wz+dist).project(cam);const d=document.createElement('div');d.className='pp';d.textContent=txt;d.style.left=((pv.x+1)/2*100)+'%';d.style.top=((1-pv.y)/2*100)+'%';if(col)d.style.color=col;if(size)d.style.fontSize=size+'px';wrap.appendChild(d);setTimeout(()=>d.remove(),900)}
const HEX=c=>'#'+c.toString(16).padStart(6,'0');

// ---------- Màn chơi ----------
const lvLen=l=>200+l*40;
function lvAt(d){let l=1,s=0;while(d>=s+lvLen(l)){s+=lvLen(l);l++}return[l,s]}

// ---------- Trạng thái ----------
let objs=[],tiles=[],holes=[],dist=0,genWz=0,rowI=0,lastHole=false,sinceGate=0,sincePow=0,genColor=0,ballColor=0,lane=1,ballX=0,ballY=0.55,vy=0,air=false,falling=false,inv=0,speed=9,level=1,lvStart=0,lives=3,pts=0,score=0,running=false,shake=0,T=0,combo=0,comboT=0,squash=0,popS=0,trailT=0;
let dbl=false,slamming=false,flip=0,shield=false,fireT=0,magT=0,giantT=0,gs=1,fxT=0,thumpT=0,hudT=0,hudS='';
const rnd=n=>Math.floor(Math.random()*n);
function other(c){let o;do o=rnd(4);while(o===c);return o}
function addTile(wz0,len,th){const g=new THREE.Group(),sh=len<5,top=new THREE.Mesh(sh?tileGs:tileG7,sh?th.ms:th.m7);top.position.y=-0.4;top.receiveShadow=true;g.add(top);
[-3.5,3.5].forEach(x=>{const e=new THREE.Mesh(sh?edgeGs:edgeG7,th.me);e.position.set(x,0.1,0);e.receiveShadow=true;g.add(e);
if(!sh&&Math.random()<0.6){const c=new THREE.Mesh(crysG,th.mc);c.position.set(x,0.5,(Math.random()-0.5)*5);c.scale.set(1,1.7,1);c.rotation.y=Math.random()*3;g.add(c)}});
if(!sh){const r=new THREE.Mesh(rockG,th.mr);r.rotation.set(Math.PI,Math.random()*3,0);r.position.y=-3.05;r.scale.set(0.8+Math.random()*0.3,0.7+Math.random()*0.5,0.8+Math.random()*0.3);g.add(r)}
S.add(g);tiles.push({wz:wz0-len/2,len,m:g})}
function addObj(type,x,wz,m,ex){m.position.x=x;S.add(m);objs.push(Object.assign({type,x,wz,m,done:false},ex||{}))}
function addFruit(k,x,wz,y){const m=makeFruit(k);m.position.y=y;addObj('fruit',x,wz,m,{c:FR[k],y})}
function genRow(){const z0=genWz;genWz-=7;rowI++;sincePow++;const gl=lvAt(-z0)[0],th=THEMES[(gl-1)%THEMES.length];
if(rowI<6){addTile(z0,7,th);return}
if(gl>=2&&!lastHole&&Math.random()<0.07+gl*0.015){addTile(z0,1.75,th);addTile(z0-5.25,1.75,th);holes.push({a:z0-1.75,b:z0-5.25});lastHole=true;sinceGate++;return}
lastHole=false;addTile(z0,7,th);sinceGate++;
const c=z0-3.5,r=Math.random();
if(r<0.16&&sinceGate>3){genColor=other(genColor);sinceGate=0;addObj('gate',0,c,makeGate(genColor),{col:genColor});return}
if(r<0.23&&rowI>7&&sincePow>5){sincePow=0;const k=PK[rnd(4)],m=makePower(k);m.position.y=1;addObj('power',X[rnd(3)],c,m,{k});return}
if(r<0.30&&rowI>7){const l=rnd(3),pm=new THREE.Mesh(padG,padM);pm.position.y=0.06;pm.receiveShadow=true;addObj('pad',X[l],c+2.5,pm);
const sp=9+(gl-1)*1.4;[3,5.5,8,10.5,13].forEach(d=>{const t=d/sp,y=0.55+15*t-12*t*t;if(y>1.3)addFruit(rnd(3),X[l],c+2.5-d,y)});return}
if(r<0.37&&gl>=3){addObj('bar',0,c,makeBar());return}
if(r<0.43&&gl>=4){addObj('roller',X[rnd(3)],c,makeRoller());return}
if(r<0.72){const ls=[0,1,2].sort(()=>Math.random()-0.5);
if(gl>=3&&Math.random()<0.3){const col=Math.random()<0.5?genColor:other(genColor),m=new THREE.Mesh(blockG,sandM[col]);m.position.y=0.6;m.castShadow=m.receiveShadow=true;addObj('block',0,c,m,{col,slide:true,ph:Math.random()*6});return}
const n=Math.random()<0.25+gl*0.08?2:1;
for(let i=0;i<n;i++){const col=Math.random()<0.55?genColor:other(genColor),m=new THREE.Mesh(blockG,sandM[col]);m.position.y=0.6;m.rotation.y=(Math.random()-0.5)*0.15;m.castShadow=m.receiveShadow=true;addObj('block',X[ls[i]],c,m,{col})}
if(Math.random()<0.45)addFruit(rnd(3),X[ls[2]],c,0.8);
return}
if(r<0.86){const g=new THREE.Group();[[0,0.5],[-0.38,-0.2],[0.38,-0.2],[0,-0.6]].forEach(([x,z])=>{const p=makePin(0xffffff,0xE24B4A,0.8);p.position.set(x,0,z);g.add(p)});addObj('pins',X[rnd(3)],c,g);return}
const l=rnd(3),k=rnd(3);[1.8,0,-1.8].forEach(d=>addFruit(k,X[l],c+d,0.8))}
function clearAll(){objs.forEach(o=>S.remove(o.m));tiles.forEach(t=>S.remove(t.m));parts.forEach(p=>S.remove(p));flying.forEach(f=>S.remove(f.m));fx.forEach(f=>S.remove(f.m));objs=[];tiles=[];holes=[];parts.length=0;flying.length=0;fx.length=0}
function showLv(t){lvB.textContent=t;lvB.style.opacity=1;lvB.style.transform='scale(1)';clearTimeout(showLv.t);showLv.t=setTimeout(()=>{lvB.style.opacity=0;lvB.style.transform='scale(0.8)'},1300)}
function setColor(c){ballColor=c;ballM.color.setHex(COLS[c])}
function clearPowers(){shield=false;fireT=magT=giantT=0}
function reset(){clearAll();clearPowers();dist=0;genWz=14;rowI=0;lastHole=false;sinceGate=0;sincePow=0;genColor=rnd(4);setColor(genColor);lane=1;ballX=0;ballY=0.55;vy=0;air=false;falling=false;dbl=false;slamming=false;inv=0;speed=9;level=1;lvStart=0;lives=3;pts=0;score=0;combo=0;comboT=0;
sc.textContent=0;lvE.textContent=1;lfE.textContent='❤️3';pwE.innerHTML='';hudS='';while(genWz>-dist-105)genRow()}
function saveBest(){try{localStorage.setItem('cosmicBest',best)}catch(e){}}
function die(){running=false;clearPowers();shake=0.7;sDie();saveBest();flash('#E24B4A',0.5);burst(ballX,ballY,-dist,COLS[ballColor],40,1.3);msg.textContent='Hết mạng! '+score+' điểm, tới màn '+level;stB.textContent='Chơi lại';ov.style.display='flex'}
function loseLife(){lives--;lfE.textContent='❤️'+Math.max(lives,0);inv=1.6;shake=0.6;combo=0;sHit();flash('#E24B4A',0.4);pop('-1 ❤️',ballX,1.6,-dist,'#ff8080',26);if(lives<=0){die();return false}return true}
function hurt(){if(inv>0)return;if(shield){shield=false;inv=1;sShield();shake=0.35;flash('#4FC3F7',0.4);sparkle(ballX,ballY,-dist,0x6fd8ff,40);ring(ballX,ballY,-dist,0x6fd8ff,5);pop('Khiên vỡ!',ballX,2,-dist,'#9fe8ff',24);return}loseLife()}
function fallOut(){if(!loseLife())return;const bw=-dist,h=holes.find(h=>bw<h.a+0.5&&bw>h.b-0.5);if(h)dist=1.5-h.b;falling=false;air=false;slamming=false;ballY=0.55;vy=0;ring(ballX,0.05,-dist,0xffffff,3)}
function knock(o){const base=o.m.position;o.m.children.slice().forEach(p=>{const wx=base.x+p.position.x,wz=o.wz+p.position.z;o.m.remove(p);p.position.set(wx,0,0);S.add(p);flying.push({m:p,wz,v:new THREE.Vector3((wx-ballX)*4+(Math.random()-0.5)*4,5+Math.random()*5,-7-Math.random()*6),s:new THREE.Vector3(4+Math.random()*8,Math.random()*4,4+Math.random()*8),life:2})})}
function smashBlock(o,force){o.done=true;o.m.visible=false;burst(o.x,0.6,o.wz,COLS[o.col],force?30:46,1.15);dust(o.x,0.6,o.wz,COLS[o.col]);
if(force||o.col===ballColor){combo=comboT>0?combo+1:1;comboT=2.5;const g=10*level*combo;pts+=g;sSmash(combo);shake=Math.max(shake,0.18);ring(o.x,0.05,o.wz,COLS[o.col],4);pop('+'+g,o.x,1.6,o.wz,HEX(COLS[o.col]));if(combo>=2)pop('Combo x'+combo+'!',o.x,2.6,o.wz,'#fff',combo>4?30:24);return true}return false}
function breakRoller(o){o.done=true;o.m.visible=false;burst(o.x,1,o.wz,0x2a2050,40,1.3);sparkle(o.x,1,o.wz,0xA05AD8,20);pts+=30;pop('+30',o.x,2,o.wz,'#d9b3ff');sSmash(3);shake=Math.max(shake,0.3)}
function breakBar(o){o.done=true;o.m.visible=false;burst(0,0.5,o.wz,0xE24B4A,25);burst(0,0.5,o.wz,0xffffff,25);pts+=20;pop('+20',ballX,1.8,o.wz,'#fff');sSmash(2)}
function collect(o){o.done=true;o.m.visible=false;const k=o.k,p=PW[k];if(k==='shield')shield=true;else if(k==='fire')fireT=p.t;else if(k==='magnet')magT=p.t;else giantT=p.t;
sPower();popS=1;flip=1;flash(HEX(p.c),0.35);ring(ballX,0.6,-dist,p.c,5);ring(ballX,0.05,-dist,p.c,7);sparkle(ballX,1,-dist,p.c,36);pop(p.e+' '+p.n,ballX,2.5,-dist,HEX(p.c),26)}
function slamLand(){slamming=false;sSlam();shake=0.55;flash('#ffffff',0.25);const c=COLS[ballColor];ring(ballX,0.05,-dist,c,10);ring(ballX,0.05,-dist,0xffffff,6);dust(ballX,0.2,-dist,0xffffff,10);sparkle(ballX,0.3,-dist,c,30);pop('ĐẬP!',ballX,2.2,-dist,'#fff',30);
objs.forEach(o=>{if(o.done)return;const rz=o.wz+dist;if(rz<-5.5||rz>2)return;if(o.type==='block')smashBlock(o,true);else if(o.type==='pins'){o.done=true;knock(o);pts+=12;sPin()}else if(o.type==='roller')breakRoller(o);else if(o.type==='bar')breakBar(o)})}
function start(){if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(A)AC=new A()}if(AC&&AC.state==='suspended')AC.resume();reset();ov.style.display='none';running=true;showLv('Màn 1')}
function move(d){if(!running||falling)return;const n=Math.max(0,Math.min(2,lane+d));if(n!==lane){lane=n;sMove()}}
function jump(){if(!running||falling)return;if(!air){air=true;vy=9;sJump();squash=-0.6;dust(ballX,0.2,-dist,0xffffff)}else if(!dbl&&!slamming){dbl=true;vy=8.5;sDbl();flip=1;ring(ballX,ballY,-dist,0xffffff,2.5);sparkle(ballX,ballY,-dist,COLS[ballColor],12)}}
function slam(){if(!running||!air||falling||slamming)return;slamming=true;vy=-26;sDbl()}
stB.onclick=start;
document.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();move(+b.dataset.m)}));
jpB.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
slB.addEventListener('pointerdown',e=>{e.preventDefault();slam()});
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowUp'||e.key===' '){e.preventDefault();jump()}else if(e.key==='ArrowDown'){e.preventDefault();slam()}});
let tx,ty;wrap.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
wrap.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
wrap.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.max(Math.abs(dx),Math.abs(dy))<20){jump();return}if(Math.abs(dx)>Math.abs(dy))move(Math.sign(dx));else if(dy<0)jump();else slam()});
reset();

// ---------- Vòng lặp ----------
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,0.05);last=now;T+=dt;
if(running){
const tgt=Math.min(26,9+(level-1)*1.4+(dist-lvStart)/lvLen(level)*1.2);speed+=(tgt-speed)*Math.min(1,dt*1.5);
if(!falling)dist+=speed*dt;
while(genWz>-dist-105)genRow();
const[l2,s2]=lvAt(dist);if(l2>level){level=l2;lvStart=s2;lvE.textContent=level;sLevel();showLv('Màn '+level+' 🚀');flash('#ffffff',0.35);ring(ballX,0.05,-dist,0xffffff,7);for(let i=0;i<4;i++)burst(ballX,1,-dist-2,COLS[i],10,1.2)}
ballX+=(X[lane]-ballX)*Math.min(1,dt*14);
const bw=-dist,over=holes.some(h=>bw<h.a-0.25&&bw>h.b+0.25);
if(falling){vy-=30*dt;ballY+=vy*dt;if(ballY<-6)fallOut()}
else if(air){vy-=24*dt;ballY+=vy*dt;if(ballY<=0.55){if(over)falling=true;else{ballY=0.55;vy=0;air=false;dbl=false;squash=1;dust(ballX,0.15,-dist,0xffffff);if(slamming)slamLand();else{sLand();ring(ballX,0.05,-dist,COLS[ballColor],2.2)}}}}
else if(over){falling=true;air=true;vy=0}
if(inv>0)inv-=dt;if(comboT>0){comboT-=dt;if(comboT<=0)combo=0}
if(fireT>0)fireT-=dt;if(magT>0)magT-=dt;if(giantT>0)giantT-=dt;
// Vệt cát sau bóng
if(!air&&!falling&&fireT<=0){trailT-=dt;if(trailT<=0){trailT=0.03;part(ballX+(Math.random()-0.5)*0.6*gs,0.08,-dist+0.4,mat(COLS[ballColor]),new THREE.Vector3((Math.random()-0.5)*1.5,0.5+Math.random()*1.5,2+Math.random()*2),(0.5+Math.random()*0.5)*gs,2.2)}}
// Nam châm hút trái cây
if(magT>0)objs.forEach(o=>{if(o.type!=='fruit'||o.done)return;const rz=o.wz+dist;if(rz<-14||rz>1)return;o.x+=(ballX-o.x)*Math.min(1,dt*6);o.y+=(ballY+0.2-o.y)*Math.min(1,dt*4);if(Math.random()<dt*8)part(o.x,o.y,o.wz,addM(0xffe680),new THREE.Vector3((ballX-o.x)*2,0,-rz*2),0.6,3,0)});
objs.forEach(o=>{if(o.type==='roller'&&!o.done)o.wz+=7*dt});
const tol=giantT>0?2.3:1.05,big=giantT>0;
for(const o of objs){if(!running)break;if(o.done)continue;const rz=o.wz+dist,rr=o.type==='roller'?1.4:0.8;if(rz<-rr||rz>rr)continue;
if(o.type==='gate'){o.done=true;setColor(o.col);sGate();popS=1;flash(HEX(COLS[o.col]),0.3);ring(ballX,1.2,o.wz,COLS[o.col],6);burst(ballX,1.5,o.wz,COLS[o.col],22);continue}
if(o.type==='bar'){if(ballY>1.35||falling)continue;if(big||fireT>0)breakBar(o);else{o.done=true;hurt()}continue}
if(falling||Math.abs(o.x-ballX)>tol+(o.type==='roller'?0.4:0))continue;
if(o.type==='block'){if(ballY>1.7&&!big)continue;if(!smashBlock(o,big||fireT>0)){if(inv<=0)hurt();else sSmash()}}
else if(o.type==='roller'){if(ballY>2.1)continue;if(big)breakRoller(o);else{o.done=true;burst(o.x,1,o.wz,0x2a2050,20);hurt()}}
else if(o.type==='fruit'){if(Math.abs(ballY-o.y)>(big?2:1.3))continue;o.done=true;o.m.visible=false;pts+=5;sFruit();burst(o.x,o.y,o.wz,o.c,14);ring(o.x,o.y,o.wz,0xffffff,2);pop('+5',o.x,o.y+0.7,o.wz,'#ffe680')}
else if(o.type==='pins'){if(ballY>1.9&&!big)continue;o.done=true;knock(o);pts+=12;sPin();shake=Math.max(shake,0.25);pop('STRIKE! +12',o.x,2,o.wz,'#fff',24);burst(o.x,0.5,o.wz,0xffffff,14)}
else if(o.type==='pad'){if(air)continue;o.done=true;air=true;vy=15;dbl=false;sBoost();squash=-0.8;ring(o.x,0.1,o.wz,0x55ffff,4);sparkle(ballX,0.5,-dist,0x55ffff,24);pop('BAY! 🚀',ballX,2.2,-dist,'#7ff',26)}
else if(o.type==='power'){if(Math.abs(ballY-1)>(big?2.4:1.6))continue;collect(o)}}
objs=objs.filter(o=>{if(o.wz+dist>14){S.remove(o.m);return false}return true});
tiles=tiles.filter(t=>{if(t.wz-t.len/2+dist>14){S.remove(t.m);return false}return true});
holes=holes.filter(h=>h.b+dist<14);
const s=pts+Math.floor(dist/5);if(s!==score){score=s;sc.textContent=s;if(score>best){best=score;bs.textContent=best}}
ball.rotation.x-=(falling?0:speed)*dt/(0.55*gs)}
else ball.rotation.x-=dt*1.5;
// ---- Bóng và hiệu ứng sức mạnh ----
gs+=((giantT>0?1.7:1)-gs)*Math.min(1,dt*6);
squash+=(0-squash)*Math.min(1,dt*10);popS=Math.max(0,popS-dt*3);
if(flip>0){ball.rotation.x-=flip*dt*22;flip=Math.max(0,flip-dt*2.2)}
const sq=gs*(1+popS*0.35);ball.scale.set(sq*(1+squash*0.18),sq*(1-squash*0.28),sq*(1+squash*0.18));
const by=ballY+0.55*(gs-1)-squash*0.12*gs;ball.position.set(ballX,by,0);
const warn=t=>t>0&&(t>1.5||Math.sin(T*25)>0);
ball.visible=inv<=0||Math.sin(T*30)>0;
// Lửa
if(fireT>0){ballM.emissive.setHex(0xff3300);ballM.emissiveIntensity=warn(fireT)?0.55+Math.sin(T*18)*0.25:0.1;fireL.intensity=2.2+Math.sin(T*23)*0.6+Math.random()*0.4;fireL.position.set(ballX,by+0.6,0.5);
if(running){fxT-=dt;while(fxT<=0){fxT+=0.012;const c=Math.random()<0.5?0xFF7A1A:(Math.random()<0.5?0xFFD23F:0xFF3B1F);part(ballX+(Math.random()-0.5)*0.7*gs,by+(Math.random()-0.3)*0.5*gs,-dist+0.2,addM(c),new THREE.Vector3((Math.random()-0.5)*1.2,2+Math.random()*2.5,3+Math.random()*3),(0.8+Math.random()*0.9)*gs,2.6,-3)}}}
else{ballM.emissive.setHex(0);fireL.intensity=0}
// Quầng sáng
glow.material.color.setHex(fireT>0?0xFF7A1A:giantT>0?0x7CCF3E:COLS[ballColor]);glow.material.opacity=fireT>0||giantT>0?0.3:0.18;
glow.position.copy(ball.position);glow.scale.setScalar(gs*(1+Math.sin(T*6)*0.06+popS*0.6+(fireT>0?0.25+Math.sin(T*20)*0.08:0)));glow.visible=ball.visible;
// Khiên
bubble.visible=shield;if(shield){bubble.position.copy(ball.position);bubble.scale.setScalar(gs*(1+Math.sin(T*5)*0.04));bubbleW.rotation.y+=dt*1.2;bubbleW.rotation.x+=dt*0.7;bubble.material.opacity=0.16+Math.sin(T*4)*0.06;
if(running&&Math.random()<dt*10)part(ballX+(Math.random()-0.5)*1.6*gs,by+(Math.random()-0.5)*1.6*gs,-dist,addM(0x9fe8ff),new THREE.Vector3(0,0.5,1),0.5,2.5,0)}
// Nam châm
mag.visible=magT>0&&warn(magT);if(magT>0){mag.position.copy(ball.position);mag.scale.setScalar(gs*(1+Math.sin(T*8)*0.05));mag.children.forEach((t,i)=>{t.rotation.x+=dt*(2+i);t.rotation.y+=dt*(3-i)})}
// Khổng lồ
aura.visible=giantT>0&&warn(giantT);if(giantT>0){aura.position.set(ballX,0.06,0);aura.scale.setScalar(gs*(1+Math.sin(T*8)*0.1));aura.material.opacity=0.35+Math.sin(T*8)*0.15;
if(running&&!air){thumpT-=dt;if(thumpT<=0){thumpT=0.32;sThump();shake=Math.max(shake,0.15);dust(ballX,0.2,-dist,0xd9ffb0,3);ring(ballX,0.05,-dist,0x7CCF3E,3.5)}}}
// Thanh trạng thái sức mạnh
hudT-=dt;if(hudT<=0){hudT=0.1;let h='';if(shield)h+='<span>🛡️</span>';if(fireT>0)h+='<span>🔥 '+Math.ceil(fireT)+'s</span>';if(magT>0)h+='<span>🧲 '+Math.ceil(magT)+'s</span>';if(giantT>0)h+='<span>💪 '+Math.ceil(giantT)+'s</span>';if(h!==hudS){hudS=h;pwE.innerHTML=h}}
// ---- Thế giới ----
tiles.forEach(t=>t.m.position.z=t.wz+dist);
objs.forEach(o=>{const m=o.m;if(o.slide)o.x=Math.sin(T*1.5+o.ph)*2.2;m.position.z=o.wz+dist;m.position.x=o.x;
if(o.type==='fruit'){m.position.y=o.y+Math.sin(T*3+o.wz)*0.15;m.rotation.y+=dt*2}
else if(o.type==='gate')m.veil.material.opacity=0.22+Math.sin(T*5)*0.1;
else if(o.type==='block'&&!o.done){const k=1+Math.sin(T*4+o.wz)*0.03;m.scale.set(k,1/k,k)}
else if(o.type==='power'){m.position.y=1+Math.sin(T*3+o.wz)*0.2;m.halo.rotation.x+=dt*2;m.halo.rotation.y+=dt*3}
else if(o.type==='bar')m.cyl.rotation.y+=dt*6;
else if(o.type==='roller')m.ball.rotation.x+=dt*(7+(running?speed:0))/0.95});
decor.forEach(d=>{let rz=d.wz+dist;if(rz>16){d.wz-=125;rz-=125}d.m.position.z=rz;d.m.position.y=d.by+Math.sin(T*0.8+d.ph)*0.6;d.m.rotation.y+=d.spin*dt});
streaks.forEach(st=>{let rz=st.wz+dist;if(rz>12){st.wz-=95;rz-=95}st.m.position.z=rz;st.m.scale.z=1+speed*0.25});streakM.opacity=Math.min(0.6,(speed-8)*0.05+0.1);
planets.forEach((p,i)=>p.rotation.y+=dt*0.05*(i+1));
shootT-=dt;if(shootT<=0){shootT=3+Math.random()*5;shoot.position.set(-60+Math.random()*120,50+Math.random()*25,-120);shootV.set((Math.random()<0.5?-1:1)*(50+Math.random()*30),-25,0);shoot.lookAt(shoot.position.clone().add(shootV));shoot.material.opacity=1}
if(shoot.material.opacity>0){shoot.position.addScaledVector(shootV,dt);shoot.material.opacity=Math.max(0,shoot.material.opacity-dt*0.9)}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.v.y-=p.grav*dt;p.position.x+=p.v.x*dt;p.position.y+=p.v.y*dt;if(p.grav>0&&p.position.y<0.07&&p.v.y<0){p.position.y=0.07;p.v.y*=-0.3;p.v.x*=0.6}p.wz+=p.v.z*dt;p.position.z=p.wz+dist;p.rotation.x+=dt*6;p.life-=dt*p.decay;p.scale.setScalar(Math.max(p.life*p.s0,0.01));if(p.life<=0){S.remove(p);parts.splice(i,1)}}
for(let i=flying.length-1;i>=0;i--){const f=flying[i];f.v.y-=14*dt;f.m.position.x+=f.v.x*dt;f.m.position.y+=f.v.y*dt;f.wz+=f.v.z*dt;f.m.position.z=f.wz+dist;f.m.rotation.x+=f.s.x*dt;f.m.rotation.z+=f.s.z*dt;f.life-=dt;if(f.life<=0){S.remove(f.m);flying.splice(i,1)}}
for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt;const k=1-f.life/f.max;f.m.scale.setScalar(f.g0+(f.g1-f.g0)*k);f.m.material.opacity=f.op*(1-k);f.m.position.z=f.wz+dist;if(f.life<=0){S.remove(f.m);f.m.material.dispose();fx.splice(i,1)}}
if(shake>0)shake=Math.max(0,shake-dt);
const sx=(Math.random()-0.5)*shake,sy=(Math.random()-0.5)*shake;
cam.fov=58+Math.max(0,speed-9)*0.55+(gs-1)*6;cam.updateProjectionMatrix();
cam.position.set(ballX*0.45+sx,3.4+(gs-1)*1.2+Math.max(0,ballY-0.55)*0.35+sy,6.4+(gs-1)*1.5);cam.lookAt(ballX*0.6,0.4,-7);
L.position.set(ballX+5,12,5);L.target.position.set(ballX,0,-4);
R.render(S,cam);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
// HET GAME
