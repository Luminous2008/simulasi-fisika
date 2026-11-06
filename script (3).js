'use strict';
/* ============ UTIL & STORAGE ============ */
const $=s=>document.querySelector(s),rnd=a=>a[Math.random()*a.length|0];
const nf=(x,d=2)=>(+x).toFixed(d).replace('.',',');
let DB={cfg:{theme:null,bgm:50,sfx:60},sims:{},ach:{},bonus:0};
try{const j=JSON.parse(localStorage.getItem('pp2')||'null');if(j){DB=Object.assign(DB,j);DB.cfg=Object.assign({theme:null,bgm:50,sfx:60},j.cfg)}}catch(e){}
const cfg=DB.cfg;
const persist=()=>{try{localStorage.setItem('pp2',JSON.stringify(DB))}catch(e){}};
const P=id=>DB.sims[id]||(DB.sims[id]={lv:1,done:{},pts:0,mat:0,exp:0,quiz:null,last:null,played:0,tried:0,nh:0,qb:0});
const total=()=>Object.keys(SIMS).reduce((a,k)=>a+(DB.sims[k]?DB.sims[k].pts:0),0)+DB.bonus;
const pct=id=>{const p=P(id);return Math.round(Object.keys(p.done).length/SIMS[id].lv.length*60+(p.mat?15:0)+(p.quiz?25*p.quiz.c/p.quiz.t:0))};
function applyTheme(){document.documentElement.dataset.theme=cfg.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}
applyTheme();

/* ============ ICONS (grafis, bukan emoji) ============ */
const sv=(i,s=56)=>`<svg viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true">${i}</svg>`;
const K='stroke="#2b2d5b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const IC={
gravity:sv(`<circle cx="24" cy="13" r="9" fill="#ff6b6b"/><path d="M24 26v14m-7-7 7 7 7-7" ${K}/>`),
bounce:sv(`<circle cx="24" cy="15" r="9" fill="#ff9f43"/><path d="M5 43h38" ${K}/><path d="M9 33q15-22 30 0" ${K} stroke-dasharray="3 5"/>`),
circuit:sv(`<path d="M27 3 10 27h12l-3 17 19-26H26z" fill="#ffd23f" stroke="#2b2d5b" stroke-width="3" stroke-linejoin="round"/>`),
force:sv(`<rect x="5" y="22" width="20" height="16" rx="4" fill="#c9b6ff" stroke="#2b2d5b" stroke-width="3"/><path d="M29 30h14m-6-6 6 6-6 6" ${K}/>`),
magnet:sv(`<path d="M10 8v20a14 14 0 0 0 28 0V8" fill="none" stroke="#ff6b6b" stroke-width="10"/><path d="M38 8v20" stroke="#4cc9f0" stroke-width="10" fill="none"/><rect x="5" y="3" width="10" height="9" fill="#fff"/><rect x="33" y="3" width="10" height="9" fill="#fff"/>`),
spring:sv(`<path d="M24 3v6l-11 4 22 6-22 6 22 6-11 4v6" ${K} stroke="#3aa87b"/>`),
star:sv(`<polygon points="24,4 30,18 45,19 33,29 37,44 24,36 11,44 15,29 3,19 18,18" fill="#ffd23f" stroke="#2b2d5b" stroke-width="3" stroke-linejoin="round"/>`,44),
gear:'<svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true"><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="6 5.78"/><circle cx="24" cy="24" r="11" fill="currentColor"/><circle cx="24" cy="24" r="4.5" fill="#c9b6ff"/></svg>'};
const scene=()=>`<svg class="scene" viewBox="0 0 460 190" role="img" aria-label="Ilustrasi laboratorium sains"><rect width="460" height="190" fill="#8fdcff"/><circle cx="395" cy="38" r="22" fill="#ffd23f"/><rect y="150" width="460" height="40" fill="#7ee8c0"/>
<path d="M60 150v-40l-22-40h72l-22 40v40z" fill="#c9b6ff" stroke="#2b2d5b" stroke-width="3" stroke-linejoin="round"/><path d="M44 84h60l14 0-8 14h-72z" fill="#ff9fcf" opacity=".8"/>
<circle cx="190" cy="100" r="26" fill="#fff4a8" stroke="#2b2d5b" stroke-width="3"/><rect x="178" y="124" width="24" height="26" rx="4" fill="#9aa" stroke="#2b2d5b" stroke-width="3"/>
<path d="M265 150V90a22 22 0 0 1 44 0v60" fill="none" stroke="#ff6b6b" stroke-width="16"/><path d="M309 90v60" stroke="#4cc9f0" stroke-width="16"/>
<g class="spin"><circle cx="390" cy="112" r="20" fill="none" stroke="#ff9f43" stroke-width="9" stroke-dasharray="9 6"/></g><circle cx="390" cy="112" r="8" fill="#ff9f43"/>
<circle class="bnc" cx="230" cy="40" r="14" fill="#ff9f43" stroke="#2b2d5b" stroke-width="3"/></svg>`;

/* ============ AUDIO: BACKSOUND ============ */
const BG={lobby:new Audio('assets/lobby-theme.mp3'),sim:new Audio('assets/simulation-theme.mp3')};
Object.values(BG).forEach(a=>{a.loop=true;a.preload='auto'});
const fade={lobby:0,sim:0};let area='lobby',blocked=false;
function setArea(n){area=n}
function bgTick(){for(const k in BG){const a=BG[k],o=k=='lobby'?'sim':'lobby';let t=k==area?1:0;if(t&&fade[o]>0)t=0;/* satu backsound pada satu waktu */
const d=t-fade[k];fade[k]=Math.abs(d)<.05?t:fade[k]+Math.sign(d)*.05;a.volume=Math.max(0,Math.min(1,fade[k]*cfg.bgm/100));
if(fade[k]>0&&a.paused&&!blocked){blocked=true;const r=a.play();if(r&&r.then)r.then(()=>{blocked=false}).catch(()=>{blocked=true})}
if(fade[k]==0&&!a.paused&&!a.error)a.pause()}}
setInterval(bgTick,40);
const unlock=()=>{blocked=false};['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,unlock,{passive:true}));

/* ============ AUDIO: SOUND EFFECT (Web Audio API) ============ */
let ac,lastS=0;
const SFX={click:[[660,.06]],play:[[523,.07],[784,.1]],set:[[440,.08]],act:[[392,.07],[587,.07],[880,.12]],stop:[[500,.07],[350,.1]],reset:[[600,.06],[450,.06],[330,.08]],hint:[[700,.05],[900,.08]],book:[[500,.06],[600,.06],[750,.08]],save:[[600,.06],[800,.1]],back:[[500,.06],[380,.08]],ok:[[600,.08],[900,.14]],bad:[[300,.14]],win:[[523,.1],[659,.1],[784,.1],[1047,.22]]};
function sfx(t){if(!cfg.sfx)return;const n=performance.now();if(n-lastS<70)return;lastS=n;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();let tt=ac.currentTime;(SFX[t]||SFX.click).forEach(([f,d])=>{const o=ac.createOscillator(),g=ac.createGain(),v=.2*cfg.sfx/100;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(v,tt);g.gain.exponentialRampToValueAtTime(.0001,tt+d);o.connect(g);g.connect(ac.destination);o.start(tt);o.stop(tt+d);tt+=d*.9})}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(b)sfx(b.dataset.s)});

/* ============ SETTINGS (satu sistem, dipakai menu utama & mini settings) ============ */
const slider=(k,l)=>`<div class="slr"><label for="s_${k}">${l}</label><div class="slw"><span>0</span><input id="s_${k}" type="range" min="0" max="100" step="1" data-cfg="${k}" value="${cfg[k]}"><span>100</span><b data-val="${k}">${cfg[k]}%</b></div></div>`;
const thBtn=(v,l)=>`<button class="b ${(document.documentElement.dataset.theme==v)?'on':''}" style="--c:${v=='light'?'#ffd23f':'#c9b6ff'}" data-th="${v}" data-s="set">${l}</button>`;
const settingsUI=()=>`<h3>Theme</h3><div class="row">${thBtn('light','Light Mode')}${thBtn('dark','Dark Mode')}</div><h3>Audio</h3>${slider('bgm','Background Music Volume')}${slider('sfx','Sound Effect Volume')}`;
document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.cfg;if(!k)return;cfg[k]=+e.target.value;document.querySelectorAll(`[data-cfg=${k}]`).forEach(i=>{i.value=cfg[k]});document.querySelectorAll(`[data-val=${k}]`).forEach(b=>{b.textContent=cfg[k]+'%'});persist()});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.cfg=='sfx')sfx('ok')});
document.addEventListener('click',e=>{const b=e.target.closest('[data-th]');if(!b)return;cfg.theme=b.dataset.th;applyTheme();persist();document.querySelectorAll('[data-th]').forEach(x=>x.classList.toggle('on',x.dataset.th==cfg.theme))});

/* ============ UI HELPERS ============ */
let tt;
const hideToast=()=>{const e=$('#toast');clearTimeout(tt);e.classList.remove('on');tt=setTimeout(()=>{e.style.display='none'},450)};
const toast=t=>{const e=$('#toast');clearTimeout(tt);e.textContent=t;e.style.display='block';void e.offsetWidth;e.classList.add('on');tt=setTimeout(hideToast,4000)};
document.addEventListener('pointerdown',e=>{if(e.target.closest('#toast'))hideToast()});
const modal=h=>{$('#md').innerHTML='<div class="mc">'+h+'<div class="row"><button class="b" data-s="click" onclick="cl()">Tutup</button></div></div>';$('#md').classList.add('on')};
const cl=()=>$('#md').classList.remove('on');
const view=h=>{cl();hideToast();$('#app').innerHTML=h};
const praise=['Great Job!','Excellent!','Amazing Experiment!',"You're a Little Scientist!"];

/* ============ ACHIEVEMENT ============ */
const ps=()=>Object.keys(SIMS).map(P);
const ACH=[
['first','First Discovery','Berhasil menyelesaikan eksperimen pertama.','Selesaikan satu eksperimen atau level pada simulasi apa pun.',()=>ps().some(p=>p.exp>0)],
['quiz','Quiz Whiz','Mendapatkan nilai sempurna pada Quiz Challenge.','Jawab semua soal satu kuis dengan benar.',()=>ps().some(p=>p.quiz&&p.quiz.c==p.quiz.t)],
['light','Light It Up!','Berhasil menyelesaikan tantangan rangkaian listrik.','Selesaikan minimal satu level Electric Circuit.',()=>Object.keys(P('circuit').done).length>0],
['explore','Science Explorer','Mencoba seluruh enam simulasi.','Tekan AKTIFKAN pada keenam simulasi.',()=>ps().every(p=>p.tried)],
['indep','Independent Scientist','Menyelesaikan tantangan tanpa menggunakan petunjuk.','Selesaikan satu level tanpa membuka PETUNJUK.',()=>ps().some(p=>p.nh>0)]];
function checkAch(){ACH.forEach(a=>{if(!DB.ach[a[0]]&&a[4]()){DB.ach[a[0]]=1;DB.bonus+=25;persist();sfx('win');const e=$('#achb');e.innerHTML=IC.star+`<div>Achievement terbuka: ${a[1]}<br><small>+25 poin</small></div>`;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),4200);hdr()}})}

/* ============ SCREENS ============ */
function lobby(){stopLoop();setArea('lobby');view(`<div class="hero"><h1>PHYSICS PLAYGROUND</h1><div class="tag">Explore, Experiment, and Learn</div>${scene()}<p>Halo, Ilmuwan Cilik. Siap bermain dan belajar fisika hari ini?</p><div class="menu"><button class="b big" style="--c:#ffd23f" data-s="play" onclick="menu()">PLAY</button><button class="b big" style="--c:#7ee8c0" data-s="click" onclick="prog()">SAVED PROGRESS</button><button class="b big" style="--c:#c9b6ff" data-s="click" onclick="settings()">SETTINGS</button></div></div>`)}
function menu(){stopLoop();setArea('lobby');view(`<div class="top"><button class="b" style="--c:#ffb3d1" data-s="back" onclick="lobby()">KEMBALI</button><span>Total poin: ${total()}</span><button class="b" style="--c:#ffd23f" data-s="click" onclick="achPage()">ACHIEVEMENT</button></div><h2 style="text-align:center">Pilih Simulasi</h2><div class="grid">${Object.entries(SIMS).map(([k,s])=>`<div class="card" style="--c:${s.c}" role="button" tabindex="0" data-s="play" onclick="openSim('${k}')">${IC[k]}${s.n}<div class="bar"><i style="width:${pct(k)}%"></i></div><small>Progres ${pct(k)}%</small></div>`).join('')}</div>`)}
function settings(){stopLoop();setArea('lobby');view(`<div class="top"><button class="b" style="--c:#ffb3d1" data-s="back" onclick="lobby()">KEMBALI</button><h2>Settings</h2><span></span></div><div class="panel">${settingsUI()}</div>`)}
function achPage(){setArea('lobby');view(`<div class="top"><button class="b" style="--c:#ffb3d1" data-s="back" onclick="menu()">KEMBALI</button><h2>Achievement</h2><span>${Object.keys(DB.ach).length}/${ACH.length}</span></div>`+ACH.map(a=>`<div class="ach ${DB.ach[a[0]]?'':'lock'}">${IC.star}<div><b>${a[1]}</b> (${DB.ach[a[0]]?'Unlocked':'Locked'})<p>${a[2]}</p><small>Kondisi: ${a[3]}</small></div></div>`).join(''))}
function prog(){stopLoop();setArea('lobby');const ks=Object.keys(SIMS).filter(k=>DB.sims[k]&&DB.sims[k].played);view(`<div class="top"><button class="b" style="--c:#ffb3d1" data-s="back" onclick="lobby()">KEMBALI</button><span>Total poin: ${total()}</span><button class="b" style="--c:#ffd23f" data-s="click" onclick="achPage()">ACHIEVEMENT</button></div><h2 style="text-align:center">Saved Progress</h2>`+(ks.length?ks.map(k=>{const s=SIMS[k],p=P(k);return `<div class="card" style="--c:${s.c};margin:10px 0;cursor:default;text-align:left"><b style="font-size:1.3rem">${s.n}</b> - ${pct(k)}%<div class="bar"><i style="width:${pct(k)}%"></i></div><p>Level terakhir: ${p.lv}. Level selesai: ${Object.keys(p.done).length} dari ${s.lv.length}. Poin: ${p.pts}.<br>Materi: ${p.mat?'sudah dipelajari':'belum'}. Eksperimen selesai: ${p.exp}.<br>Kuis: ${p.quiz?p.quiz.c+' benar, '+(p.quiz.t-p.quiz.c)+' salah':'belum dikerjakan'}.</p><div class="row"><button class="b" data-s="play" onclick="openSim('${k}',1)">CONTINUE</button><button class="b" style="--c:#ffd23f" data-s="reset" onclick="rst('${k}')">RESTART</button><button class="b" style="--c:#ff9f9f" data-s="click" onclick="del('${k}')">DELETE</button></div></div>`}).join(''):'<p style="text-align:center">Belum ada progres. Tekan PLAY untuk mulai.</p>'))}
function del(k){modal(`<h3>Hapus progres ${SIMS[k].n}?</h3><p>Semua poin, level, dan hasil kuis simulasi ini akan dihapus. Achievement yang sudah didapat tetap tersimpan.</p><div class="row"><button class="b" style="--c:#ff9f9f" data-s="bad" onclick="delOk('${k}')">Ya, hapus</button></div>`)}
function delOk(k){delete DB.sims[k];persist();prog()}
function rst(k){Object.assign(P(k),{lv:1,done:{},pts:0,mat:0,exp:0,quiz:null,last:null,qb:0,nh:0});persist();toast('Progres diulang dari awal.');prog()}

/* ============ SIMULATION FRAMEWORK ============ */
let S,st,V,run=false,cv,cx,hints=0,hstage=0,raf,last=0,T={};
function stopLoop(){cancelAnimationFrame(raf);run=false;S=null}
function openSim(id,res){stopLoop();setArea('sim');S=SIMS[id];S.id=id;const p=P(id);p.played=1;V={};S.par.forEach(q=>V[q.k]=q.v);hints=0;hstage=0;S.init();
view(`<div class="top"><h2 style="margin:0">${S.n}</h2><span id="pt"></span><div class="grp"><button class="ib" aria-label="Settings" data-s="click" onclick="modal(settingsUI())">${IC.gear}</button><button class="b" style="--c:#ffb3d1" data-s="back" onclick="back()">KEMBALI</button></div></div><div class="sgrid"><div><div class="mission" id="mis"></div><canvas id="cv" width="640" height="400"></canvas><div class="info" id="info"></div><div id="msg"></div></div><div><div class="chips" id="chips"></div><div class="row" id="cc" style="margin:0 0 10px"></div><div id="pars"></div><div class="panel" id="calc"></div><div class="btns"><button class="b" style="--c:#7ee8c0" data-s="act" onclick="go()">AKTIFKAN</button><button class="b" style="--c:#ff9f43" data-s="stop" onclick="run=false">STOP</button><button class="b" style="--c:#ffd23f" data-s="reset" onclick="doReset()">RESET</button><button class="b" style="--c:#4cc9f0" data-s="hint" onclick="howTo()">PETUNJUK</button><button class="b" style="--c:#c9b6ff" data-s="book" onclick="materi()">MATERI</button><button class="b" style="--c:#ffb3d1" data-s="save" onclick="saveSim(1)">SIMPAN</button></div></div></div>`);
cv=$('#cv');cx=cv.getContext('2d');const ev=(t,e)=>{if(!S.ptr)return;const r=cv.getBoundingClientRect();S.ptr(t,(e.clientX-r.left)*640/r.width,(e.clientY-r.top)*400/r.height)};
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);ev('d',e)};cv.onpointermove=e=>ev('m',e);cv.onpointerup=e=>ev('u',e);
$('#pars').oninput=e=>{const k=e.target.dataset.k;if(!k)return;V[k]=+e.target.value;const l=$('#v_'+k);if(l)l.textContent=nf(V[k],dec(k));S.chg&&S.chg(k);if(!run)S.init()};
$('#cc').innerHTML=S.cc?S.cc.map(([a,t])=>`<button class="b" style="--c:#fff3b0" data-s="set" onclick="S.act('${a}')">${t}</button>`).join(''):'';
if(res&&p.last){Object.assign(V,p.last.V);S.init();S.load&&S.load(p.last.x)}else S.lvs&&S.lvs(p.lv);
pars();chips();hdr();say(S.tip);last=performance.now();raf=requestAnimationFrame(loop)}
const dec=k=>{const q=S.par.find(q=>q.k==k);return((q.s+'').split('.')[1]||'').length};
function pars(){$('#pars').innerHTML=S.par.map(q=>q.o?`<label>${q.l}<select data-k="${q.k}">${q.o.map((o,i)=>`<option value="${i}" ${V[q.k]==i?'selected':''}>${o}</option>`).join('')}</select></label>`:`<label>${q.l}: <b id="v_${q.k}">${nf(V[q.k],dec(q.k))}</b> ${q.u||''}<input type="range" data-k="${q.k}" min="${q.min}" max="${q.max}" step="${q.s}" value="${V[q.k]}"></label>`).join('')}
function chips(){const p=P(S.id);$('#chips').innerHTML=S.lv.map((l,i)=>`<button class="chip ${p.done[i+1]?'ok':''} ${p.lv==i+1?'cur':''}" data-s="set" onclick="setLv(${i+1})">Level ${i+1}${p.done[i+1]?' (selesai)':''}</button>`).join('')+`<button class="chip q" data-s="click" onclick="quiz()">QUIZ CHALLENGE</button>`;$('#mis').textContent='Misi Level '+p.lv+': '+S.lv[p.lv-1][0]}
const hdr=()=>{const e=$('#pt');if(e)e.textContent='Poin: '+(S?P(S.id).pts:0)};
const say=(t,c)=>{const e=$('#msg');if(e&&e.dataset.t!=t+c){e.dataset.t=t+c;e.className=c||'';e.innerHTML=t||''}};
function setLv(n){P(S.id).lv=n;hints=0;hstage=0;doReset();chips();persist()}
function doReset(){run=false;V={};S.par.forEach(q=>V[q.k]=q.v);S.init();S.lvs&&S.lvs(P(S.id).lv);pars();say(S.tip)}
function go(){if(st.fin)doReset();run=true;const p=P(S.id);if(!p.tried){p.tried=1;persist();checkAch()}if(S.id!='circuit')say('Eksperimen berjalan. Amati perubahan angka di panel perhitungan.')}
function back(){saveSim(0);menu()}
function saveSim(show){const p=P(S.id);p.last={V:{...V},x:S.ser?S.ser():{}};persist();if(show)toast('Progres tersimpan.')}
function howTo(){hints++;modal(`<h3>Petunjuk</h3><p>${S.how}</p><p><small>Catatan: membuka petunjuk membuat level ini tidak mendapat bonus tanpa petunjuk.</small></p>`+(S.id=='circuit'?`<div id="hs">${hs()}</div><div class="row"><button class="b" style="--c:#ffd23f" data-s="hint" onclick="hstage++;$('#hs').innerHTML=hs()">Petunjuk bertahap level ini</button></div>`:''))}
function hs(){const h=S.lv[P(S.id).lv-1][2]||[];return h.slice(0,hstage).map((t,i)=>`<p>Petunjuk ${i+1}: ${t}</p>`).join('')||'<p>Belum ada petunjuk bertahap. Coba dulu sendiri, ya.</p>'}
function materi(){const p=P(S.id);if(!p.mat){p.mat=1;p.pts+=10;persist();hdr();toast('Materi dibaca. Tambah 10 poin.')}const t=['Pengenalan','Rumus dan Simbol','Contoh dalam Kehidupan Sehari-hari','Eksperimen','Kesimpulan'];modal(`<h3>Materi ${S.n}</h3>`+S.mat.map((m,i)=>`<h4>${t[i]}</h4><p>${m}</p>`).join(''))}
let Q;const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function quiz(){Q={qs:S.qz.map(q=>({q:q[0],o:shuf(q[1].map((t,i)=>({t,ok:i==q[2]}))),e:q[3]})),i:0,c:0};qr()}
function qr(){const q=Q.qs[Q.i];modal(`<h3>Quiz Challenge ${Q.i+1} dari ${Q.qs.length}</h3><p><b>${q.q}</b></p>`+q.o.map((o,j)=>`<button class="b opt" data-s="click" onclick="qa(${j})">${o.t}</button>`).join('')+'<div id="ex"></div>')}
function qa(j){const q=Q.qs[Q.i];if(q.d)return;q.d=1;const ok=q.o[j].ok;if(ok)Q.c++;sfx(ok?'ok':'bad');document.querySelectorAll('.opt').forEach((b,i)=>{if(q.o[i].ok)b.style.background='#7ee8c0';else if(i==j)b.style.background='#ff9f9f'});$('#ex').innerHTML=`<p>${ok?'Benar.':'Belum tepat.'} ${q.e}</p><button class="b" data-s="click" onclick="qn()">${Q.i<Q.qs.length-1?'Lanjut':'Lihat hasil'}</button>`}
function qn(){Q.i++;if(Q.i<Q.qs.length)return qr();const p=P(S.id),t=Q.qs.length;let g=Math.max(0,Q.c-(p.quiz?p.quiz.c:0))*5,b=0;if(Q.c/t>=.8&&!p.qb){b=20;p.qb=1}p.pts+=g+b;if(!p.quiz||Q.c>=p.quiz.c)p.quiz={c:Q.c,t};persist();hdr();chips();sfx('win');modal(`<h3>Hasil Quiz</h3><p>${rnd(praise)}</p><p>Jawaban benar: <b>${Q.c}</b><br>Jawaban salah: <b>${t-Q.c}</b><br>Poin tambahan: ${g}${b?' ditambah bonus nilai tinggi '+b:''}</p>`);checkAch()}
function evl(fin){const p=P(S.id),l=p.lv;if(p.done[l])return;if(S.lv[l-1][1](st,V)){const b=hints?0:10,pt=20*l+b;p.done[l]=1;p.pts+=pt;if(!hints)p.nh++;if(S.id=='circuit')p.exp++;persist();hdr();chips();sfx('win');toast(rnd(praise)+' Kamu berhasil menyelesaikan level '+l+'. Poin: '+pt+(b?' (termasuk bonus tanpa petunjuk).':'.'));checkAch()}else if(fin){sfx('bad');toast('Hampir berhasil. Target: '+S.lv[l-1][0]+' Coba ubah pengaturannya, ya.')}}
function loop(t){const d=Math.min(.033,(t-last)/1000||0);last=t;if(run&&!st.fin)S.step(d);S.draw(cx);$('#info').innerHTML=S.info().map(([a,b])=>`<span><i>${a}</i> <b>${b}</b></span>`).join('');
const c=$('#calc'),h='<p><b>Perhitungan langsung</b></p>'+S.calc().map(x=>`<p>${x}</p>`).join('')+`<small>${S.asm}</small>`;if(c.dataset.h!=h){c.dataset.h=h;c.innerHTML=h}
if(S.id=='circuit'){if(run&&st.an&&st.an.k=='ok')evl(0)}else if(st.fin&&!st.ev){st.ev=1;run=false;const p=P(S.id);p.exp++;persist();evl(1);checkAch()}
raf=requestAnimationFrame(loop)}
const bg=(c,a,b)=>{const g=c.createLinearGradient(0,0,0,400);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,640,400)};
const txt=(c,t,x,y,col,s,al)=>{c.fillStyle=col||'#2b2d5b';c.font='800 '+(s||14)+'px sans-serif';c.textAlign=al||'center';c.textBaseline='alphabetic';c.fillText(t,x,y)};
const disc=(c,x,y,r,f,s)=>{c.fillStyle=f;c.beginPath();c.arc(x,y,r,0,7);c.fill();if(s!==0){c.strokeStyle='#2b2d5b';c.lineWidth=2.5;c.stroke()}};
const ground=c=>{c.fillStyle='#5fd38d';c.fillRect(0,365,640,35)};
const dseg=(x,y,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy)};

/* ============ ELECTRIC CIRCUIT ENGINE (graph / analisis node) ============ */
function mk(){T={B0:{x:70,y:150},B1:{x:70,y:250},S0:{x:140,y:50},S1:{x:230,y:50}};if(st.res){T.R0={x:150,y:330};T.R1={x:260,y:330}}for(let i=1;i<=st.lamps;i++){const x=270+i*100;T['L'+i+'0']={x,y:130};T['L'+i+'1']={x,y:220}}st.wires=st.wires.filter(w=>T[w[0]]&&T[w[1]]);if(st.sel&&!T[st.sel])st.sel=null}
/* Setiap terminal adalah node. Kabel = hambatan sangat kecil, saklar tertutup = hambatan kecil, saklar terbuka = tidak ada koneksi.
   B0 (+) dipatok 6 V dan B1 (-) 0 V, node lain dihitung dengan hukum arus Kirchhoff + Hukum Ohm (eliminasi Gauss). */
function solve(){const ids=Object.keys(T),n=ids.length,ix={};ids.forEach((k,i)=>ix[k]=i);const G=[...Array(n)].map(()=>Array(n+1).fill(0)),E=[];
const add=(a,b,R,t,r)=>{E.push({a,b,R,t,r});const g=1/R,i=ix[a],j=ix[b];G[i][i]+=g;G[j][j]+=g;G[i][j]-=g;G[j][i]-=g};
st.wires.forEach((w,j)=>add(w[0],w[1],.01,'w',j));if(st.sw)add('S0','S1',.01,'s');if(st.res)add('R0','R1',6,'r');for(let i=1;i<=st.lamps;i++)add('L'+i+'0','L'+i+'1',12,'l',i);
ids.forEach((k,i)=>G[i][i]+=1e-9);[['B0',6],['B1',0]].forEach(([k,v])=>{const i=ix[k];G[i].fill(0);G[i][i]=1;G[i][n]=v});
for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(G[r][c])>Math.abs(G[p][c]))p=r;[G[c],G[p]]=[G[p],G[c]];for(let r=0;r<n;r++)if(r!=c){const f=G[r][c]/G[c][c];if(f)for(let k=c;k<=n;k++)G[r][k]-=f*G[c][k]}}
const VV={};ids.forEach((k,i)=>VV[k]=G[i][n]/G[i][i]);E.forEach(e=>e.I=(VV[e.a]-VV[e.b])/e.R);return{E,VV}}
function cls(){const p={};const f=x=>p[x]==undefined||p[x]==x?(p[x]=x):(p[x]=f(p[x]));const u=(a,b)=>{p[f(a)]=f(b)};st.wires.forEach(w=>u(w[0],w[1]));if(st.sw)u('S0','S1');return f}
function an(){const s=solve(),w=st.wires,has=t=>w.some(x=>x.includes(t));s.It=0;s.E.forEach(e=>{if(e.a=='B0')s.It+=e.I;if(e.b=='B0')s.It-=e.I});
s.lamps=s.E.filter(e=>e.t=='l');s.lit=s.lamps.filter(e=>Math.abs(e.I)>.08);s.re=s.E.find(e=>e.t=='r');
if(s.It>3){s.k='short';s.m='<b>Hubungan singkat (short circuit).</b> Arus mengalir dari kutub + ke kutub - lewat kabel tanpa melewati lampu atau resistor, sehingga arusnya terlalu besar dan berbahaya. Simulasi dihentikan. Lepas kabel yang langsung menghubungkan jalur + dan -.'}
else if(s.It<.001){s.k='open';s.m=!has('B0')?'<b>Rangkaian terbuka:</b> kutub + (merah) baterai belum tersambung kabel.':!has('B1')?'<b>Rangkaian terbuka:</b> kutub - (biru) baterai belum tersambung kabel.':(!st.sw&&(has('S0')||has('S1')))?'<b>Saklar terbuka</b> sehingga jalur arus terputus. Klik saklar untuk menutupnya.':'<b>Rangkaian terbuka:</b> jalur arus belum lengkap. Arus harus keluar dari kutub +, melewati komponen, lalu kembali ke kutub -.'}
else{s.k='ok';const bad=[];s.lamps.forEach(e=>{if(Math.abs(e.I)<=.08){const l='L'+e.r;bad.push(w.some(x=>x.includes(l+'0')&&x.includes(l+'1'))?`Lampu ${e.r} terlewati: kedua ujungnya dihubungkan kabel, jadi arus memilih jalan tanpa hambatan.`:`Lampu ${e.r} belum berada pada jalur arus. Periksa terminal yang disambung kabelnya.`)}});
if(!s.lit.length)s.m='Arus mengalir, tetapi tidak melewati lampu. '+bad.join(' ');else if(bad.length)s.m='Sebagian lampu menyala. '+bad.join(' ');else s.m='Rangkaian tertutup. Arus mengalir dari kutub + melewati komponen dan kembali ke kutub -.'}
const f=cls(),L=s.lit,pr=(a,b)=>f(a.a)==f(b.a)&&f(a.b)==f(b.b)||f(a.a)==f(b.b)&&f(a.b)==f(b.a);
s.topo=L.length<2?(L.length?'Satu lampu':'-'):L.every((a,i)=>L.every((b,j)=>i>=j||pr(a,b)))?'Paralel':L.every((a,i)=>L.every((b,j)=>i>=j||Math.abs(a.I-b.I)<1e-6&&!pr(a,b)))?'Seri':'Campuran';return s}
function circStep(){st.an=an();const a=st.an;if(a.k=='short'){run=false;say(a.m,'err');sfx('bad');toast('Peringatan: terjadi hubungan singkat. Simulasi dihentikan.');return}say(a.m,a.k=='ok'&&a.lit.length?'okk':'err')}
function circCalc(){if(!run||!st.an)return['Susun kabel lalu tekan AKTIFKAN untuk melihat perhitungan.'];const a=st.an;if(a.k=='short')return['Perhitungan dihentikan karena terjadi hubungan singkat. Hasil arus tidak valid.'];if(a.k=='open')return['Rangkaian terbuka: arus I = 0 A karena jalur belum tertutup.'];
const ls=a.lit.length,rp=ls?1/a.lit.reduce((q)=>q+1/12,0):0,rs=a.re&&Math.abs(a.re.I)>.05?6:0,o=[];
if(a.topo=='Seri')o.push('Rt = '+a.lit.map(()=>12).join(' + ')+(rs?' + 6':'')+' = '+nf(ls*12+rs,1)+' ohm');
else if(a.topo=='Paralel')o.push('1/Rt (lampu) = '+a.lit.map(()=>'1/12').join(' + ')+', Rt lampu = '+nf(rp,1)+' ohm'+(rs?'. Resistor seri: Rt = 6 + '+nf(rp,1)+' = '+nf(rp+rs,1)+' ohm':''));
else o.push('Rt = V / I = 6 / '+nf(a.It)+' = '+nf(6/a.It,1)+' ohm');
o.push('I total = V / Rt = 6 / '+nf(6/a.It,1)+' = '+nf(a.It)+' A');a.lit.forEach(e=>o.push(`Lampu ${e.r}: V = I x R = ${nf(Math.abs(e.I))} x 12 = ${nf(Math.abs(e.I)*12)} V`));return o}

/* ============ SIMULASI ============ */
const SIMS={
gravity:{n:'Gravity',c:'#4cc9f0',tip:'Atur gravitasi dan ketinggian, lalu tekan AKTIFKAN untuk menjatuhkan benda.',
how:'Geser slider gravitasi dan ketinggian, lalu pilih benda. Tekan AKTIFKAN untuk menjatuhkan benda dari diam. Perhatikan waktu jatuh dan kecepatan pada panel angka.',
asm:'Asumsi: benda dijatuhkan dari keadaan diam dan hambatan udara diabaikan, sehingga semua benda jatuh dengan percepatan yang sama. Jenis benda hanya mengubah tampilan.',
par:[{k:'g',l:'Gravitasi (g)',min:1,max:25,s:.1,v:9.8,u:'m/s2'},{k:'h',l:'Ketinggian awal',min:5,max:100,s:1,v:50,u:'m'},{k:'o',l:'Benda',o:['Apel','Batu','Bola','Bulu'],v:0}],
init(){st={t:0,y:V.h,v:0,d:0}},
step(d){st.t+=d;st.d=.5*V.g*st.t*st.t;st.y=V.h-st.d;st.v=V.g*st.t;if(st.y<=0){st.t=Math.sqrt(2*V.h/V.g);st.d=V.h;st.y=0;st.v=V.g*st.t;st.fin=1}},
draw(c){bg(c,'#bfe9ff','#e9f9ff');ground(c);for(let m=0;m<=100;m+=20){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(20,365-m*3,30,2);txt(c,m+' m',62,369-m*3,'#2b2d5b',11,'left')}const x=320,y=365-st.y*3-14;
if(V.o==0){disc(c,x,y,13,'#ff6b6b');c.fillStyle='#3aa87b';c.fillRect(x-1,y-20,3,8)}else if(V.o==1){c.fillStyle='#8d949c';c.beginPath();c.moveTo(x-14,y+10);c.lineTo(x-10,y-8);c.lineTo(x+4,y-13);c.lineTo(x+15,y+2);c.lineTo(x+10,y+12);c.closePath();c.fill();c.strokeStyle='#2b2d5b';c.lineWidth=2.5;c.stroke()}else if(V.o==2){disc(c,x,y,14,'#fff');disc(c,x,y,5,'#2b2d5b',0)}else{c.strokeStyle='#2b2d5b';c.fillStyle='#bfeaff';c.beginPath();c.ellipse(x,y,6,16,.5,0,7);c.fill();c.stroke()}txt(c,'t = '+nf(st.t)+' s',540,50,'#2b2d5b',18)},
info(){return[['Gravitasi',nf(V.g,1)+' m/s2'],['Ketinggian',nf(st.y)+' m'],['Waktu',nf(st.t)+' s'],['Kecepatan',nf(st.v)+' m/s']]},
calc(){return['Jarak jatuh: h = 1/2 x g x t2 = 1/2 x '+nf(V.g,1)+' x '+nf(st.t)+'2 = '+nf(st.d)+' m','Kecepatan: v = g x t = '+nf(V.g,1)+' x '+nf(st.t)+' = '+nf(st.v)+' m/s','Ketinggian sekarang = '+nf(V.h,0)+' - '+nf(st.d)+' = '+nf(st.y)+' m','Perkiraan waktu sampai tanah: t = akar(2h/g) = '+nf(Math.sqrt(2*V.h/V.g))+' s']},
lv:[['Jatuhkan benda sampai menyentuh tanah.',s=>s.fin],['Jatuhkan dari ketinggian minimal 50 m dengan gravitasi Bulan (g maksimal 2,5).',(s,v)=>s.fin&&v.h>=50&&v.g<=2.5],['Buat benda jatuh dalam waktu kurang dari 2 detik.',s=>s.fin&&s.t<2]],
mat:['Gravitasi adalah gaya tarik Bumi yang membuat benda jatuh ke bawah. Di Bumi percepatan gravitasi sekitar 9,8 m/s2. Di Bulan nilainya jauh lebih kecil, jadi astronaut bisa melompat tinggi.','h = 1/2 x g x t2 dan v = g x t. Simbol h adalah jarak jatuh (meter), g percepatan gravitasi (m/s2), t waktu (detik), v kecepatan (m/s). Rumus berlaku untuk benda yang dijatuhkan dari diam dengan hambatan udara diabaikan.','Buah apel jatuh dari pohon, air hujan jatuh, dan bola yang dilempar ke atas lalu turun kembali.','Jatuhkan benda dari 20 m dan 80 m, lalu bandingkan waktunya. Setelah itu ubah g menjadi 1,6 seperti di Bulan.','Makin tinggi benda dan makin kecil g, waktu jatuh makin lama. Tanpa hambatan udara, massa benda tidak mempengaruhi waktu jatuh.'],
qz:[['Apa yang menarik benda jatuh ke tanah?',['Gaya gravitasi','Angin','Cahaya','Suara'],0,'Gravitasi Bumi menarik semua benda ke arah pusat Bumi.'],['Tanpa hambatan udara, batu dan bulu dijatuhkan bersamaan. Mana yang sampai lebih dulu?',['Batu','Bulu','Sampai bersamaan','Tidak ada yang jatuh'],2,'Percepatan jatuh sama untuk semua benda jika hambatan udara diabaikan.'],['Benda jatuh dari diam dengan g = 10 m/s2. Berapa kecepatannya setelah 3 detik?',['3 m/s','10 m/s','30 m/s','90 m/s'],2,'v = g x t = 10 x 3 = 30 m/s.']]},
bounce:{n:'Bouncing Ball',c:'#ff9f43',tip:'Pilih bola dan elastisitas, lalu tekan AKTIFKAN. Pilih Bandingkan untuk menjatuhkan dua bola.',
how:'Pilih jenis bola (mengatur nilai e contoh), atur tinggi awal, lalu AKTIFKAN. Pilih Bandingkan: Ya untuk menjatuhkan bola B dengan elastisitas berbeda. Garis oranye menandai tinggi tiap pantulan.',
asm:'Model sederhana: koefisien restitusi e dianggap tetap, hambatan udara diabaikan, dan bola dianggap titik. Nilai e tiap jenis bola hanyalah contoh untuk belajar, bukan hasil pengukuran. Pada bola nyata, e bisa berubah.',
par:[{k:'h',l:'Tinggi awal',min:1,max:10,s:.5,v:8,u:'m'},{k:'b',l:'Jenis bola',o:['Bola basket (e contoh 0,75)','Bola tenis (e contoh 0,6)','Bola pingpong (e contoh 0,85)','Bola lilin (e contoh 0,3)'],v:0},{k:'e',l:'Koefisien restitusi A (e)',min:.1,max:.9,s:.05,v:.75},{k:'c',l:'Bandingkan dua bola',o:['Tidak','Ya'],v:0},{k:'e2',l:'Koefisien restitusi B (e)',min:.1,max:.9,s:.05,v:.3}],
chg(k){if(k=='b'){V.e=[.75,.6,.85,.3][V.b];pars()}},
init(){const m=e=>({y:V.h,v:0,e,n:0,pk:V.h,rest:0,tr:[]});st={a:m(V.e),b:m(V.e2)}},
step(d){(V.c?[st.a,st.b]:[st.a]).forEach(b=>{if(b.rest)return;for(let i=0;i<4;i++){const s=d/4;b.v-=9.8*s;b.y+=b.v*s;if(b.y<=0&&b.v<0){b.y=0;b.v=-b.v*b.e;b.n++;b.pk=b.v*b.v/19.6;b.tr.push(b.pk);if(b.v<.5){b.v=0;b.rest=1;break}}}});if((V.c?[st.a,st.b]:[st.a]).every(b=>b.rest))st.fin=1},
draw(c){bg(c,'#ffe9c9','#fff6e6');ground(c);const cl=['#ff9f43','#c6e84a','#fff','#ff8fb8'][V.b];[[st.a,200,cl,'A',V.e],[st.b,440,'#b48cff','B',V.e2]].forEach(([b,x,f,n,e])=>{if(n=='B'&&!V.c)return;b.tr.forEach(p=>{c.fillStyle='#ff9f43';c.fillRect(x+30,365-p*30,40,3)});disc(c,x,365-b.y*30-14,14,f);txt(c,'Bola '+n+' (e = '+nf(e)+')',x,388,'#2b2d5b',13)});txt(c,'Garis oranye = tinggi pantulan',470,30,'#2b2d5b',12)},
info(){const r=[['Pantulan A',st.a.n],['Tinggi pantulan A',nf(st.a.n?st.a.pk:0)+' m'],['e A',nf(V.e)]];if(V.c)r.push(['Pantulan B',st.b.n],['Tinggi pantulan B',nf(st.b.n?st.b.pk:0)+' m']);return r},
calc(){const o=[],f=(b,n,e)=>{const h1=b.n?b.pk:V.h;o.push(`Bola ${n}: h2 = e2 x h1 = ${nf(e)}2 x ${nf(h1)} = ${nf(e*e*h1)} m (pantulan berikutnya)`)};f(st.a,'A',V.e);if(V.c)f(st.b,'B',V.e2);return o},
lv:[['Jatuhkan bola sampai berhenti memantul.',s=>s.fin],['Pakai e minimal 0,8 dan buat bola memantul minimal 8 kali.',(s,v)=>s.fin&&v.e>=.8&&s.a.n>=8],['Bandingkan dua bola dengan e berbeda sampai keduanya berhenti.',(s,v)=>s.fin&&v.c==1&&v.e!=v.e2]],
mat:['Bola memantul karena permukaan mendorongnya kembali. Koefisien restitusi (e) menunjukkan seberapa lenting bola. Makin besar e, makin tinggi pantulan.','Model sederhana: h2 = e2 x h1 dan kecepatan pantul = e x kecepatan datang. h1 tinggi sebelum jatuh, h2 tinggi pantulan, e antara 0 dan 1. Ini hanya pendekatan karena e bola nyata bisa berubah.','Bola basket, bola tenis, bola karet, dan sol sepatu yang empuk.','Jatuhkan bola e = 0,9 dan e = 0,3 dari tinggi yang sama, lalu bandingkan tinggi pantulannya.','Makin besar e, makin tinggi pantulan. Sebagian energi berubah menjadi panas dan bunyi, sehingga pantulan makin rendah.'],
qz:[['Bola dengan koefisien restitusi lebih besar akan memantul...',['Lebih rendah','Lebih tinggi','Sama saja','Tidak memantul'],1,'e besar berarti energi gerak lebih banyak dipertahankan.'],['Mengapa tinggi pantulan makin lama makin kecil?',['Bola makin berat','Gravitasi hilang','Sebagian energi berubah menjadi panas dan bunyi','Lantai makin keras'],2,'Setiap tumbukan melepas sedikit energi.'],['Bola dengan e = 0,5 dijatuhkan dari 8 m. Berapa tinggi pantulan pertama menurut model sederhana?',['4 m','2 m','1 m','8 m'],1,'h2 = e2 x h1 = 0,25 x 8 = 2 m.']]},
circuit:{n:'Electric Circuit',c:'#ffd23f',tip:'Seret dari satu terminal ke terminal lain untuk memasang kabel, atau ketuk dua terminal berurutan. Ketuk kabel untuk melepasnya, ketuk saklar untuk membuka atau menutup.',
how:'Komponen sudah ada di papan tetapi belum terhubung. Seret dari satu terminal (lingkaran) ke terminal lain untuk memasang kabel, atau ketuk dua terminal berurutan. Ketuk kabel untuk melepasnya. Ketuk saklar untuk membuka atau menutupnya. Gunakan tombol Tambah Lampu, Kurangi Lampu, dan Resistor. Baterai 6 V adalah tegangan rendah khusus untuk belajar, bukan panduan listrik rumah. Tekan AKTIFKAN untuk menguji: sistem memeriksa terminal dan jalur arus yang sebenarnya.',
asm:'Asumsi: baterai ideal 6 V, tiap lampu 12 ohm, resistor 6 ohm, kabel hampir tanpa hambatan. Ini model belajar bertegangan rendah.',
par:[],cc:[['sw','Saklar'],['+','Tambah Lampu'],['-','Kurangi Lampu'],['r','Resistor Ada/Tidak'],['c','Lepas Semua Kabel']],
init(){st={wires:[],sw:false,lamps:1,res:false,an:null,drag:null,sel:null};mk()},
lvs(n){st.lamps=[1,2,2,3,2][n-1];st.res=n==5;st.sw=false;st.wires=[];mk()},
act(a){if(a=='sw')st.sw=!st.sw;if(a=='+'&&st.lamps<3)st.lamps++;if(a=='-'&&st.lamps>1)st.lamps--;if(a=='r')st.res=!st.res;if(a=='c')st.wires=[];mk()},
ser(){return{wires:st.wires,sw:st.sw,lamps:st.lamps,res:st.res}},load(x){Object.assign(st,x);mk()},
ptr(t,x,y){const hit=()=>Object.keys(T).find(k=>Math.hypot(T[k].x-x,T[k].y-y)<18),conn=(f,k)=>{if(k&&k!=f&&!st.wires.some(w=>w.includes(k)&&w.includes(f))){st.wires.push([f,k]);sfx('click');return 1}};
if(t=='d'){const k=hit();if(k){st.drag={f:k,x,y};return}if(x>155&&x<215&&y>20&&y<80){st.sw=!st.sw;sfx('click');return}const j=st.wires.findIndex(w=>dseg(x,y,T[w[0]],T[w[1]])<10);if(j>=0){st.wires.splice(j,1);sfx('stop')}else st.sel=null}
else if(t=='m'&&st.drag){st.drag.x=x;st.drag.y=y}
else if(t=='u'&&st.drag){const k=hit(),f=st.drag.f;st.drag=null;if(k&&k!=f){conn(f,k);st.sel=null}else if(k==f){if(st.sel&&st.sel!=f){conn(st.sel,f);st.sel=null}else st.sel=f}}},
step(){circStep()},
draw(c){bg(c,'#fff6d6','#fffbe9');const a=run?st.an:null,tm=performance.now()/1000;
st.wires.forEach((w,j)=>{const p=T[w[0]],q=T[w[1]],e=a&&a.E.find(e=>e.t=='w'&&e.r==j),I=e?e.I:0,on=Math.abs(I)>.01&&a.k=='ok';c.strokeStyle=on?'#ff9f43':'#8a7';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();
if(on){const L=Math.hypot(q.x-p.x,q.y-p.y),n=Math.max(1,L/22|0),dir=I>0?1:-1,sp=Math.min(1,Math.abs(I)/.5)*.8;c.fillStyle='#fff';for(let i=0;i<n;i++){const u=((i/n+tm*sp*dir)%1+1)%1;c.beginPath();c.arc(p.x+(q.x-p.x)*u,p.y+(q.y-p.y)*u,3.2,0,7);c.fill()}}});
c.fillStyle='#ffd6d6';c.fillRect(45,165,50,70);c.strokeStyle='#2b2d5b';c.lineWidth=3;c.strokeRect(45,165,50,70);txt(c,'6 V',70,205,'#2b2d5b',14);txt(c,'+',70,182,'#e63946',20);txt(c,'-',70,228,'#2b6cb0',22);txt(c,'BATERAI',70,272,'#2b2d5b',11);
c.strokeStyle='#2b2d5b';c.lineWidth=5;c.beginPath();c.moveTo(140,50);c.lineTo(st.sw?230:222,st.sw?50:18);c.stroke();txt(c,'SAKLAR '+(st.sw?'TERTUTUP':'TERBUKA'),185,80,'#2b2d5b',12);
if(st.res){c.strokeStyle='#8d5524';c.lineWidth=5;c.beginPath();c.moveTo(150,330);for(let i=0;i<8;i++)c.lineTo(160+i*13,330+(i%2?10:-10));c.lineTo(260,330);c.stroke();txt(c,'RESISTOR 6 ohm',205,362,'#2b2d5b',12)}
for(let i=1;i<=st.lamps;i++){const x=270+i*100,e=a&&a.k=='ok'&&a.lamps.find(e=>e.r==i),I=e?Math.abs(e.I):0,br=Math.min(1,I/.5);c.strokeStyle='#555';c.lineWidth=4;c.beginPath();c.moveTo(x,130);c.lineTo(x,148);c.moveTo(x,202);c.lineTo(x,220);c.stroke();
if(br>.15){const g=c.createRadialGradient(x,175,5,x,175,26+br*40);g.addColorStop(0,'rgba(255,230,80,'+br+')');g.addColorStop(1,'rgba(255,230,80,0)');c.fillStyle=g;c.fillRect(x-70,105,140,140)}
disc(c,x,175,27,br>.15?'#fff176':'#eee');c.strokeStyle='#999';c.lineWidth=2;c.beginPath();c.moveTo(x-12,185);c.lineTo(x-6,168);c.lineTo(x,185);c.lineTo(x+6,168);c.lineTo(x+12,185);c.stroke();txt(c,'Lampu '+i,x,252,'#2b2d5b',12);if(e)txt(c,nf(Math.abs(a.VV[e.a]-a.VV[e.b]),1)+' V  '+nf(I)+' A',x,268,'#2b2d5b',12)}
if(st.drag){c.strokeStyle='#4cc9f0';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.moveTo(T[st.drag.f].x,T[st.drag.f].y);c.lineTo(st.drag.x,st.drag.y);c.stroke();c.setLineDash([])}
Object.entries(T).forEach(([k,p])=>{disc(c,p.x,p.y,10,k=='B0'?'#ff6b6b':k=='B1'?'#4cc9f0':'#ffd23f');if(k==st.sel){c.strokeStyle='#2b2d5b';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,16,0,7);c.stroke()}})},
info(){const a=run&&st.an&&st.an.k=='ok'?st.an:null;return[['Tegangan','6 V'],['Arus total',a?nf(a.It)+' A':'0 A'],['Hambatan total',a?nf(6/a.It,1)+' ohm':'-'],['Jenis',a?a.topo:'-'],['Saklar',st.sw?'Tertutup':'Terbuka']]},
calc:circCalc,
lv:[['Nyalakan satu lampu menggunakan baterai.',s=>s.an.lit.length>=1,['Mulai dari kutub + baterai (titik merah).','Sambungkan + ke saklar, saklar ke lampu, lampu ke kutub -, lalu tutup saklar.']],['Buat rangkaian seri dengan dua lampu.',s=>s.an.lit.length==2&&s.an.topo=='Seri',['Seri berarti hanya satu jalur tanpa cabang.','+ ke saklar, saklar ke lampu 1, lampu 1 ke lampu 2, lampu 2 ke kutub -.']],['Buat rangkaian paralel dengan dua lampu.',s=>s.an.lit.length==2&&s.an.topo=='Paralel',['Paralel: ujung atas semua lampu disatukan, ujung bawah juga.','Ujung atas lampu 1 dan 2 ke saklar dan +, ujung bawah lampu 1 dan 2 ke -.']],['Buat rangkaian paralel dengan tiga lampu.',s=>s.an.lit.length==3&&s.an.topo=='Paralel',['Sama seperti dua lampu, tambahkan cabang ketiga.','Ujung atas ketiga lampu disatukan ke +, ujung bawah ketiganya ke -.']],['Tantangan akhir tanpa membuka PETUNJUK: dua lampu paralel dengan resistor seri di jalur utama.',s=>s.an.lit.length==2&&s.an.topo=='Paralel'&&s.an.re&&Math.abs(s.an.re.I)>.05&&hints==0,['Resistor dilewati semua arus sebelum bercabang.','+ ke saklar, saklar ke resistor, resistor ke ujung atas lampu 1 dan 2, ujung bawah lampu ke -.']]],
mat:['Rangkaian listrik adalah jalur tertutup yang dilewati arus. Arus listrik (I, ampere) adalah aliran muatan listrik. Tegangan (V, volt) adalah dorongan dari baterai. Hambatan (R, ohm) menunjukkan seberapa sulit arus mengalir. Arus hanya mengalir jika jalurnya tertutup.','Hukum Ohm: V = I x R. Rangkaian seri: Rt = R1 + R2 + R3, arus sama di semua komponen. Rangkaian paralel: 1/Rt = 1/R1 + 1/R2 + 1/R3, tegangan tiap cabang sama. Perbedaan: seri hanya punya satu jalur, paralel punya beberapa cabang sehingga satu cabang yang putus tidak mematikan cabang lain.','Senter dan lampu hias sederhana memakai rangkaian seri. Lampu yang bisa menyala sendiri-sendiri pada sebuah ruangan memakai konsep paralel. Eksperimen di sini hanya bertegangan rendah dan bukan panduan instalasi listrik rumah.','Buat rangkaian seri dua lampu lalu lepas satu kabel: semua lampu mati. Buat paralel dua lampu lalu lepas satu cabang: lampu lain tetap menyala.','Seri: satu jalur, putus di mana pun semua mati, dan lampu lebih redup. Paralel: bercabang, cabang lain tetap menyala, dan lampu lebih terang. Hukum Ohm menghubungkan tegangan, arus, dan hambatan.'],
qz:[['Apa fungsi baterai dalam rangkaian listrik?',['Memberi tegangan agar arus mengalir','Menghambat arus','Menyimpan lampu','Memutus arus'],0,'Baterai menyediakan beda potensial yang mendorong muatan listrik.'],['Apa yang terjadi jika saklar terbuka?',['Lampu makin terang','Arus berhenti dan lampu mati','Arus makin besar','Baterai bertambah'],1,'Saklar terbuka memutus jalur sehingga rangkaian tidak tertutup.'],['Apa perbedaan rangkaian seri dan paralel?',['Seri satu jalur, paralel bercabang','Seri bercabang, paralel satu jalur','Keduanya sama','Paralel tanpa baterai'],0,'Seri hanya punya satu jalur, paralel punya beberapa cabang.'],['Mengapa semua lampu pada rangkaian seri mati ketika satu jalur terputus?',['Lampu saling bergantung warna','Hanya ada satu jalur arus sehingga arus berhenti di mana pun terputus','Baterai pasti habis','Resistor menyerap lampu'],1,'Tanpa jalur lain, arus berhenti seluruhnya.']]},
force:{n:'Force and Motion',c:'#c9b6ff',tip:'Atur gaya, massa, arah, dan gesekan. Dorong kereta sampai bendera di 80 m.',
how:'Atur gaya (N), massa kereta (kg), arah gaya (0 derajat ke kanan, 180 derajat ke kiri), dan gesekan. Tekan AKTIFKAN, lalu amati percepatan, kecepatan, dan posisi. Capai bendera di 80 m.',
asm:'Asumsi: gerak lurus mendatar, gesekan kinetis konstan (mu x gaya normal), massa tetap, hambatan udara diabaikan. Gaya normal N = m x g - F sin(sudut), g = 9,8 m/s2.',
par:[{k:'F',l:'Gaya (F)',min:1,max:50,s:1,v:20,u:'N'},{k:'m',l:'Massa (m)',min:1,max:10,s:1,v:5,u:'kg'},{k:'th',l:'Arah gaya',min:0,max:180,s:5,v:0,u:'derajat'},{k:'mu',l:'Gesekan (mu)',min:0,max:.5,s:.05,v:0}],
init(){st={x:0,v:0,t:0}},
phys(){const r=V.th*Math.PI/180,Fx=V.F*Math.cos(r),N=Math.max(0,V.m*9.8-V.F*Math.sin(r)),fr=V.mu*N;let net;if(Math.abs(st.v)<1e-6&&Math.abs(Fx)<=fr)net=0;else net=Fx-Math.sign(st.v||Fx)*fr;return{Fx,N,fr,net,a:net/V.m}},
step(d){const q=this.phys(),v0=st.v;st.v+=q.a*d;if(v0!==0&&Math.sign(v0)!=Math.sign(st.v)&&q.fr>0)st.v=0;st.x+=st.v*d;st.t+=d;if(st.x<0){st.x=0;st.v=0}if(st.x>=80){st.fin=1;st.tf=st.t}},
draw(c){bg(c,'#e8defe','#f7f1ff');c.fillStyle='#b9a6ee';c.fillRect(0,320,640,80);for(let m=0;m<=100;m+=10){c.fillStyle='rgba(255,255,255,.6)';c.fillRect(40+m*6,320,2,12);txt(c,m,40+m*6,345,'#2b2d5b',10)}const fx=40+80*6;c.fillStyle='#2b2d5b';c.fillRect(fx,262,3,58);c.fillStyle='#ff6b6b';c.fillRect(fx+3,262,26,16);const x=40+st.x*6;c.fillStyle='#ff9f43';c.fillRect(x-25,285,50,28);disc(c,x-14,316,7,'#2b2d5b',0);disc(c,x+14,316,7,'#2b2d5b',0);txt(c,V.m+' kg',x,305,'#fff',12);const r=V.th*Math.PI/180,L=V.F*3+10;c.strokeStyle='#e63946';c.lineWidth=5;c.beginPath();c.moveTo(x,270);c.lineTo(x+Math.cos(r)*L,270-Math.sin(r)*L);c.stroke();txt(c,'F = '+V.F+' N',x,255-Math.sin(r)*L,'#e63946',13)},
info(){const q=this.phys();return[['Gaya F',V.F+' N'],['Massa m',V.m+' kg'],['Percepatan a',nf(q.a)+' m/s2'],['Kecepatan',nf(st.v)+' m/s'],['Posisi',nf(st.x)+' m'],['Waktu',nf(st.t)+' s']]},
calc(){const q=this.phys();return['Gaya mendatar: Fx = F x cos(sudut) = '+nf(q.Fx)+' N','Gesekan: f = mu x N = '+nf(V.mu)+' x '+nf(q.N)+' = '+nf(q.fr)+' N','Gaya total: SF = Fx - f = '+nf(q.net)+' N','Percepatan: a = SF / m = '+nf(q.net)+' / '+V.m+' = '+nf(q.a)+' m/s2','Kecepatan: v = '+nf(st.v)+' m/s dan posisi x = '+nf(st.x)+' m']},
lv:[['Dorong kereta sampai bendera di 80 m.',s=>s.fin],['Capai bendera dengan massa minimal 5 kg.',(s,v)=>s.fin&&v.m>=5],['Capai bendera dalam waktu 5 detik atau kurang.',s=>s.fin&&s.tf<=5]],
mat:['Gaya adalah dorongan atau tarikan. Jika gaya total tidak nol, kecepatan benda berubah. Makin besar gaya, makin besar percepatan. Makin besar massa, makin kecil percepatan.','SF = m x a, sehingga a = SF / m. SF adalah gaya total (newton, N), m massa (kg), a percepatan (m/s2). Gaya total adalah gaya dorong dikurangi gesekan.','Mendorong troli kosong lebih mudah daripada troli penuh. Mobil kosong lebih cepat bertambah laju daripada mobil bermuatan penuh.','Dorong kereta dengan gaya yang sama pada massa 2 kg dan 8 kg, lalu bandingkan percepatannya.','Percepatan sebanding dengan gaya total dan berbanding terbalik dengan massa (Hukum II Newton).'],
qz:[['Apa satuan gaya?',['Joule','Newton','Watt','Meter'],1,'Gaya diukur dalam newton (N).'],['Gaya sama, massa lebih besar. Percepatan menjadi...',['Lebih besar','Lebih kecil','Sama','Selalu nol'],1,'a = SF / m, jadi massa besar membuat percepatan kecil.'],['Gaya total 10 N bekerja pada massa 2 kg. Berapa percepatannya?',['20 m/s2','5 m/s2','0,2 m/s2','12 m/s2'],1,'a = SF / m = 10 / 2 = 5 m/s2.']]},
magnet:{n:'Magnet',c:'#ffb3d1',tip:'Geser magnet saat simulasi berhenti. Pilih kutub B, lalu tekan AKTIFKAN.',
how:'Geser magnet (merah kutub Utara, biru kutub Selatan) saat simulasi berhenti. Pilih kutub B yang menghadap A, lalu AKTIFKAN. Garis putus-putus adalah garis medan magnet.',
asm:'Simulasi ini kualitatif. Arah tarik atau tolak benar sesuai aturan kutub, dan interaksi digambarkan makin kuat saat magnet makin dekat. Besar gaya magnet tidak dihitung dalam angka karena model kuantitatif tidak dipakai.',
par:[{k:'s',l:'Kekuatan magnet (skala relatif 1 sampai 10)',min:1,max:10,s:1,v:5},{k:'o',l:'Kutub B yang menghadap A',o:['Utara (N)','Selatan (S)'],v:0}],
init(){st={A:170,B:430,v:0,t:0,hit:0,dr:null}},
ser(){return{A:st.A,B:st.B}},load(x){Object.assign(st,x)},
ptr(t,x,y){if(t=='d'&&!run&&Math.abs(y-200)<45){st.dr=Math.abs(x-st.A)<Math.abs(x-st.B)?'A':'B';st.dx=x-st[st.dr];st.fin=0;st.ev=0;st.hit=0;st.v=0}if(t=='m'&&st.dr){const v=x-st.dx;if(st.dr=='A')st.A=Math.max(70,Math.min(v,st.B-125));else st.B=Math.min(570,Math.max(v,st.A+125))}if(t=='u')st.dr=null},
poles(){const q=V.s,b=V.o?[-1,1]:[1,-1];return{A:[{x:st.A-50,q:-q},{x:st.A+50,q:q}],B:[{x:st.B-50,q:b[0]*q},{x:st.B+50,q:b[1]*q}]}},
force(){const p=this.poles();let F=0;p.A.forEach(i=>p.B.forEach(j=>{const r=j.x-i.x;F+=i.q*j.q*90000*Math.sign(r)/(r*r+25)/25}));return F},
step(d){const F=this.force();st.v+=F*d;st.v*=Math.exp(-.8*d);st.B+=st.v*d;st.t+=d;if(st.B-st.A<=120){st.B=st.A+120;st.hit='contact';st.fin=1}else if(st.B>=570){st.B=570;st.hit='wall';st.fin=1}else if(st.t>2&&Math.abs(F)<.5&&Math.abs(st.v)<3){st.hit='far';st.fin=1}},
draw(c){bg(c,'#ffe3f1','#fff3fa');const p=this.poles(),all=[...p.A,...p.B],fld=(x,y)=>{let fx=0,fy=0;all.forEach(o=>{const dx=x-o.x,dy=y-200,r=Math.hypot(dx,dy)+1,k=o.q/(r*r*r);fx+=k*dx;fy+=k*dy});return[fx,fy]};
c.strokeStyle='#8a5cd0';c.lineWidth=1.4;c.setLineDash([4,4]);all.filter(o=>o.q>0).forEach(o=>{for(let a=0;a<12;a++){let x=o.x+Math.cos(a*.5236)*7,y=200+Math.sin(a*.5236)*7;c.beginPath();c.moveTo(x,y);for(let i=0;i<260;i++){const[fx,fy]=fld(x,y),m=Math.hypot(fx,fy)||1;x+=fx/m*4;y+=fy/m*4;c.lineTo(x,y);if(x<0||x>640||y<0||y>400||all.some(s=>s.q<0&&Math.hypot(x-s.x,y-200)<8))break}c.stroke()}});c.setLineDash([]);
[[st.A,p.A],[st.B,p.B]].forEach(([x,ps])=>{ps.forEach((o,i)=>{c.fillStyle=o.q>0?'#ff6b6b':'#4cc9f0';c.fillRect(x-60+i*60,180,60,40);txt(c,o.q>0?'N':'S',x-30+i*60,207,'#fff',22)});c.strokeStyle='#2b2d5b';c.lineWidth=3;c.strokeRect(x-60,180,120,40)});
txt(c,this.force()<0?'saling tarik':'saling tolak',st.B,165,'#2b2d5b',14);txt(c,'Magnet A',st.A,250,'#2b2d5b',14);txt(c,'Magnet B',st.B,250,'#2b2d5b',14);txt(c,'Seret magnet untuk menggeser',320,380,'#2b2d5b',12)},
info(){return[['Jarak (skala gambar)',nf((st.B-st.A-120)/10,1)+' cm'],['Interaksi',this.force()<0?'Tarik-menarik':'Tolak-menolak'],['Kekuatan relatif',V.s+' dari 10']]},
calc(){const o=this.force()<0;return['Kutub yang berhadapan: '+(o?'berbeda (Utara dan Selatan), jadi saling tarik.':'sama, jadi saling tolak.'),'Jarak antar magnet: '+nf((st.B-st.A-120)/10,1)+' cm menurut skala gambar. Makin dekat, interaksi makin kuat.','Besar gaya magnet tidak ditampilkan sebagai angka.']},
lv:[['Buat magnet saling tarik lalu AKTIFKAN sampai menempel.',s=>s.hit=='contact'],['Buat saling tolak sampai magnet B terdorong ke dinding kanan.',s=>s.hit=='wall'],['Buat magnet menempel dengan kekuatan 4 atau kurang. Geser magnet lebih dekat dahulu.',(s,v)=>s.hit=='contact'&&v.s<=4]],
mat:['Magnet punya dua kutub, yaitu utara (N) dan selatan (S). Kutub berbeda saling tarik, kutub sama saling tolak. Di sekitar magnet ada medan magnet.','Garis medan magnet keluar dari kutub utara dan masuk ke kutub selatan. Makin dekat dua magnet, makin kuat interaksinya. Di simulasi ini besar gaya tidak dihitung dengan angka.','Magnet pintu kulkas, kompas, dan kereta maglev.','Dekatkan dua magnet dengan pasangan kutub N-S dan N-N. Rasakan perbedaan tarik dan tolaknya.','Kutub berbeda menarik, kutub sama menolak. Makin dekat magnet, makin kuat interaksinya.'],
qz:[['Dua kutub utara didekatkan. Apa yang terjadi?',['Tolak-menolak','Tarik-menarik','Diam saja','Menyala'],0,'Kutub senama saling menolak.'],['Garis medan magnet keluar dari kutub...',['Selatan','Utara','Keduanya keluar','Tidak ada'],1,'Garis keluar dari kutub utara dan masuk ke kutub selatan.'],['Jarak dua magnet dibuat makin jauh. Interaksi magnet menjadi...',['Makin kuat','Makin lemah','Tetap','Berbalik arah'],1,'Interaksi magnet melemah jika jaraknya bertambah.']]},
spring:{n:'Spring',c:'#7ee8c0',tip:'Atur massa, konstanta pegas, dan tarikan awal, lalu tekan AKTIFKAN untuk melepas beban.',
how:'Atur massa beban, konstanta pegas k, dan pertambahan panjang awal (tarikan awal). Tekan AKTIFKAN: beban dilepas dan bergerak naik turun. Garis putus-putus hijau adalah posisi seimbang.',
asm:'Asumsi: pegas ideal mengikuti Hukum Hooke, gerak hanya vertikal, dan ada redaman kecil (0,6 N s/m) agar gerakan akhirnya tenang. Arah x positif ke bawah, jadi gaya pegas bernilai negatif (ke atas).',
par:[{k:'m',l:'Massa beban (m)',min:.1,max:2,s:.1,v:.5,u:'kg'},{k:'k',l:'Konstanta pegas (k)',min:10,max:200,s:5,v:50,u:'N/m'},{k:'x0',l:'Pertambahan panjang awal (x)',min:0,max:.8,s:.05,v:.1,u:'m'}],
init(){st={x:V.x0,v:0,t:0}},
step(d){for(let i=0;i<8;i++){const s=d/8,a=9.8-(V.k*st.x+.6*st.v)/V.m;st.v+=a*s;st.x+=st.v*s}st.t+=d;if(st.t>8)st.fin=1},
draw(c){bg(c,'#d9fbee','#f1fff9');const top=24,y1=top+48+st.x*60,xe=V.m*9.8/V.k;c.fillStyle='#555';c.fillRect(250,12,140,12);c.strokeStyle='#3aa87b';c.lineWidth=5;c.lineJoin='round';c.beginPath();c.moveTo(320,top);for(let i=1;i<14;i++)c.lineTo(320+(i%2?18:-18),top+(y1-top)*i/14);c.lineTo(320,y1);c.stroke();
c.setLineDash([6,5]);c.strokeStyle='#2fb27f';c.lineWidth=2;const ye=top+48+xe*60;c.beginPath();c.moveTo(380,ye);c.lineTo(560,ye);c.stroke();c.setLineDash([]);txt(c,'posisi seimbang',500,ye-6,'#2b2d5b',12);
c.fillStyle='#ff9f43';c.fillRect(290,y1,60,40);c.strokeStyle='#2b2d5b';c.lineWidth=3;c.strokeRect(290,y1,60,40);txt(c,nf(V.m,1)+' kg',320,y1+25,'#2b2d5b',14)},
info(){return[['Massa',nf(V.m,1)+' kg'],['k',V.k+' N/m'],['x',nf(st.x)+' m'],['Gaya pegas |F|',nf(V.k*st.x)+' N']]},
calc(){const xe=V.m*9.8/V.k;return['Gaya pegas: F = -k x x = -'+V.k+' x '+nf(st.x)+' = '+nf(-V.k*st.x)+' N (tanda minus berarti ke atas)','Besar gaya: |F| = k x x = '+nf(V.k*st.x)+' N','Posisi seimbang: x = m x g / k = '+nf(V.m,1)+' x 9,8 / '+V.k+' = '+nf(xe)+' m','Periode getaran: T = 2 x pi x akar(m/k) = '+nf(2*Math.PI*Math.sqrt(V.m/V.k))+' s']},
lv:[['Lepas beban dan amati getarannya sampai selesai (8 detik).',s=>s.fin],['Pilih pegas kaku sehingga posisi seimbang kurang dari atau sama dengan 0,1 m.',(s,v)=>s.fin&&v.m*9.8/v.k<=.1],['Atur massa dan k agar posisi seimbang sekitar 0,25 m (toleransi 0,03 m).',(s,v)=>s.fin&&Math.abs(v.m*9.8/v.k-.25)<=.03]],
mat:['Pegas bisa meregang lalu kembali ke bentuk semula. Saat ditarik, pegas melawan dengan gaya pemulih. Beban yang digantung membuat pegas bertambah panjang lalu bergetar.','Hukum Hooke: F = -k x x. Untuk besar gaya: |F| = k x x. F gaya pegas (N), k konstanta pegas (N/m), x pertambahan panjang (m). Tanda minus berarti gaya melawan arah tarikan. Di posisi seimbang, k x x = m x g.','Suspensi motor, kasur pegas, timbangan pegas, dan bolpoin klik.','Ubah massa beban lalu amati posisi seimbangnya. Setelah itu ganti nilai k dan bandingkan.','Beban lebih berat membuat pegas lebih panjang. Pegas lebih kaku (k besar) membuat pertambahan panjang lebih kecil.'],
qz:[['Rumus gaya pegas menurut Hukum Hooke adalah...',['F = m x a','F = -k x x','V = I x R','h = 1/2 x g x t2'],1,'Gaya pegas sebanding dengan pertambahan panjang dan arahnya melawan.'],['Pegas dengan k = 50 N/m ditarik x = 0,2 m. Berapa besar gayanya?',['10 N','250 N','0,4 N','2,5 N'],0,'|F| = k x x = 50 x 0,2 = 10 N.'],['Beban sama, tetapi pegas lebih kaku (k lebih besar). Pertambahan panjang menjadi...',['Lebih besar','Lebih kecil','Sama','Tak terhingga'],1,'x = F / k, jadi k besar membuat x kecil.']]}
};
lobby();
