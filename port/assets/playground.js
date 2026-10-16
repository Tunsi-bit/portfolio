'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let effects = !reducedMotion.matches;
const motionButton = $('.motion-toggle');
let toastTimeout;
function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('show'), 2600); }
function setEffects(on) { effects = on; document.documentElement.classList.toggle('no-fx', !on); motionButton.setAttribute('aria-pressed', String(on)); $('span', motionButton).textContent = on ? 'ON' : 'OFF'; }
setEffects(effects);
motionButton.addEventListener('click', () => setEffects(!effects));
reducedMotion.addEventListener('change', event => setEffects(!event.matches));
$('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('enhanced');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  $$('.reveal').forEach(el => observer.observe(el));
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  $$('.card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) card.classList.add('visible'); });
}));
const progress = $('.scroll-progress');
function updateScroll() { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'; }
addEventListener('scroll', updateScroll, { passive: true });
addEventListener('resize', updateScroll);
if (matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove', event => { if (!effects) return; document.documentElement.style.setProperty('--mx', event.clientX + 'px'); document.documentElement.style.setProperty('--my', event.clientY + 'px'); }, { passive: true });
  $$('.card-scene').forEach(card => {
    card.addEventListener('pointermove', event => { if (!effects) return; const r = card.getBoundingClientRect(); const x = (event.clientX-r.left)/r.width-.5, y=(event.clientY-r.top)/r.height-.5; card.style.transform = `perspective(900px) rotateX(${-y*6}deg) rotateY(${x*7}deg) translateY(-5px)`; });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
// A lightweight, code-drawn globe. No external library or network request.
const canvas = $('#orb'), context = canvas.getContext('2d');
let orbWidth = 1, orbHeight = 1, orbVisible = true, pointerX = 0, pointerY = 0, lastFrame = 0;
const points = Array.from({ length: 150 }, (_, i) => { const y=1-i/149*2, radius=Math.sqrt(1-y*y), angle=i*2.3999632297; return {x:Math.cos(angle)*radius,y,z:Math.sin(angle)*radius}; });
function sizeOrb() { const rect=canvas.getBoundingClientRect();orbWidth=rect.width;orbHeight=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=orbWidth*dpr;canvas.height=orbHeight*dpr;context?.setTransform(dpr,0,0,dpr,0,0);drawOrb(0); }
function drawOrb(time) {
  if (!context) return;
  context.clearRect(0,0,orbWidth,orbHeight);
  const angle=effects?time*.00013+pointerX*.22:.5, tilt=.25+pointerY*.15, radius=Math.min(orbWidth*.43,orbHeight*.4), cx=orbWidth*.5,cy=orbHeight*.47;
  const projected=points.map(p=>{const x=p.x*Math.cos(angle)-p.z*Math.sin(angle),z=p.x*Math.sin(angle)+p.z*Math.cos(angle),y=p.y*Math.cos(tilt)-z*Math.sin(tilt),depth=p.y*Math.sin(tilt)+z*Math.cos(tilt);return {x:cx+x*radius,y:cy+y*radius,z:depth};});
  context.lineWidth=.5;
  projected.forEach((p,i)=>{for(let j=i+1;j<projected.length;j++){const q=projected[j],distance=(p.x-q.x)**2+(p.y-q.y)**2;if(distance<radius*radius*.07&&distance>40&&p.z>-.3&&q.z>-.3){context.strokeStyle=`rgba(169,139,244,${.045+(p.z+1)*.055})`;context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke();}}context.fillStyle=`rgba(${i%7===0?'190,245,191':'183,163,236'},${.12+(p.z+1)*.25})`;context.beginPath();context.arc(p.x,p.y,p.z>.4?1.6:1,0,Math.PI*2);context.fill();});
  context.strokeStyle='#ad8df52a';context.lineWidth=1;context.save();context.translate(cx,cy);context.rotate(-.45);context.beginPath();context.ellipse(0,0,radius*1.18,radius*.38,0,0,Math.PI*2);context.stroke();context.restore();
}
function orbLoop(time) { if(time-lastFrame>32&&orbVisible&&!document.hidden&&effects){drawOrb(time);lastFrame=time;}requestAnimationFrame(orbLoop); }
if (context) { new ResizeObserver(sizeOrb).observe(canvas); if('IntersectionObserver' in window)new IntersectionObserver(entries=>{orbVisible=entries[0].isIntersecting;},{threshold:0}).observe(canvas);$('.hero-stage').addEventListener('pointermove',event=>{const r=canvas.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5;});requestAnimationFrame(orbLoop); }
// Shared application window, with real original source files available offline.
const appWindow = $('#app-window'), demo = $('#demo-content'), source = $('#source-content');
const apps = {
  win32:{title:'IPCFG Studio — C / Win32',zip:'IPCFG-C.zip',source:'win32',init:initWin32},
  sort:{title:'Bubble Lab — C / Algoritmi',zip:'BubbleSort-C.zip',source:'sort',init:initSort},
  network:{title:'Network Playground — Sistemi e reti',zip:'Network-Lab.zip',init:initNetwork},
  java:{title:'YB Bank — Java / OOP',zip:'Banca-Java.zip',source:'java',init:initBank}
};
let disposeDemo = () => {}, currentApp, previousFocus;
function setView(isSource) {
  source.hidden=!isSource;demo.hidden=isSource;
  $('#demo-tab').classList.toggle('active',!isSource);$('#source-tab').classList.toggle('active',isSource);
  $('#demo-tab').setAttribute('aria-pressed',String(!isSource));$('#source-tab').setAttribute('aria-pressed',String(isSource));
}
function status(text) { $('#app-status-text').textContent=text; }
function openApp(key) {
  const app=apps[key];if(!app)return;disposeDemo();previousFocus=document.activeElement;currentApp=app;
  $('#app-title').textContent=app.title;$('#source-download').href='downloads/'+app.zip;
  appWindow.style.left='';appWindow.style.top='';appWindow.style.margin='';appWindow.classList.remove('fullscreen');$('#maximize').setAttribute('aria-label','Espandi la finestra');
  const fileSelect=$('#source-file');fileSelect.replaceChildren();
  const sources=window.PROJECT_SOURCES?.[app.source]||{};Object.keys(sources).forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;fileSelect.append(option);});
  $('#source-tab').hidden=!app.source;$('#source-code').textContent=sources[fileSelect.value]||'';
  setView(false);disposeDemo=app.init()||(()=>{});status('Sistema pronto');
  if(!appWindow.open)appWindow.showModal();document.body.style.overflow='hidden';$('#close-app').focus();
}
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>openApp(button.dataset.open)));
$('#source-file').addEventListener('change',event=>{$('#source-code').textContent=window.PROJECT_SOURCES[currentApp.source][event.target.value];});
$('#demo-tab').addEventListener('click',()=>setView(false));$('#source-tab').addEventListener('click',()=>setView(true));
$('#close-app').addEventListener('click',()=>appWindow.close());
appWindow.addEventListener('close',()=>{disposeDemo();disposeDemo=()=>{};document.body.style.overflow='';previousFocus?.focus();});
$('#maximize').addEventListener('click',()=>{appWindow.classList.toggle('fullscreen');appWindow.style.left='';appWindow.style.top='';appWindow.style.margin='';$('#maximize').setAttribute('aria-label',appWindow.classList.contains('fullscreen')?'Riduci la finestra':'Espandi la finestra');});
// Drag the title bar on desktop. Position is always kept inside the viewport.
const titlebar=$('.app-titlebar');let drag;
titlebar.addEventListener('pointerdown',event=>{if(innerWidth<701||event.target.closest('button')||appWindow.classList.contains('fullscreen'))return;const r=appWindow.getBoundingClientRect();drag={x:event.clientX-r.left,y:event.clientY-r.top};appWindow.style.margin='0';appWindow.style.left=r.left+'px';appWindow.style.top=r.top+'px';titlebar.setPointerCapture(event.pointerId);});
titlebar.addEventListener('pointermove',event=>{if(!drag)return;const maxX=innerWidth-appWindow.offsetWidth,maxY=innerHeight-appWindow.offsetHeight;appWindow.style.left=Math.max(0,Math.min(maxX,event.clientX-drag.x))+'px';appWindow.style.top=Math.max(0,Math.min(maxY,event.clientY-drag.y))+'px';});
function stopDrag(){drag=null;}titlebar.addEventListener('pointerup',stopDrag);titlebar.addEventListener('pointercancel',stopDrag);
addEventListener('resize',()=>{if(appWindow.open){appWindow.style.left='';appWindow.style.top='';appWindow.style.margin='';}});
const heading=(title,subtitle,tag)=>`<div class="demo-heading"><div><h2>${title}</h2><p>${subtitle}</p></div><span class="demo-tag">${tag}</span></div>`;
function parseIPv4(text) { if(!/^\d{1,3}(\.\d{1,3}){3}$/.test(text))return null;const parts=text.split('.').map(Number);return parts.every(n=>n>=0&&n<=255)?parts:null; }
function calculateSubnet(address,prefix) { const parts=parseIPv4(address);if(!parts||!Number.isInteger(prefix)||prefix<0||prefix>32)return null;const ip=parts.reduce((a,n)=>(a*256+n)>>>0,0),mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0,network=(ip&mask)>>>0,broadcast=(network|(~mask>>>0))>>>0;const string=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.');return {mask:string(mask),network:string(network),broadcast:string(broadcast),hosts:prefix>=31?2**(32-prefix):2**(32-prefix)-2}; }
window.YBAlgorithms={parseIPv4,calculateSubnet};
function initWin32() {
  demo.innerHTML=heading('IPCFG Studio','Una piccola utility. Tante connessioni da esplorare.','C → WEB DEMO')+`<div class="demo-tabs" role="group" aria-label="Strumenti IPCFG"><button class="active" data-ip-tab="adapter" aria-pressed="true">◉ Scheda di rete</button><button data-ip-tab="subnet" aria-pressed="false">⌘ Subnet</button><button data-ip-tab="binary" aria-pressed="false">01 Bit lab</button></div><section id="adapter-pane"><div class="ip-grid"><div class="adapter-card"><span class="adapter-icon">⌘</span><h3>Ethernet</h3><p>Realtek PCIe GBE · Scheda simulata<br>HOST: YOUSSEF-PC</p><div class="adapter-state">● Connessa · 1 Gbps</div></div><dl class="report" id="adapter-report"></dl></div><div class="demo-bottom"><button class="demo-btn accent" id="refresh-adapter">Aggiorna dati ↻</button><button class="demo-btn" id="toggle-adapter">Disconnetti</button><button class="demo-btn" id="copy-report">Copia report ⧉</button></div><p class="demo-footnote">Ambiente simulato: il browser non legge i dati della tua scheda di rete. Il sorgente C usa le API Windows.</p></section><section id="subnet-pane" hidden><div class="control-row"><label><span class="control-label">INDIRIZZO IPv4</span><input class="demo-input" id="ip-address" value="192.168.1.42" inputmode="decimal" aria-label="Indirizzo IPv4"></label><label><span class="control-label">PREFISSO CIDR (0–32)</span><input class="demo-input" id="ip-prefix" value="24" type="number" min="0" max="32" aria-label="Prefisso CIDR"></label><button class="demo-btn accent" id="calculate-subnet">Calcola ↗</button></div><div id="subnet-result" class="subnet-output" aria-live="polite"></div><p class="demo-footnote">Con /31 e /32 il conteggio segue l’uso per collegamenti punto-punto e singoli host.</p></section><section id="binary-pane" hidden><p class="demo-footnote">Tocca i bit: un byte prende forma davanti ai tuoi occhi.</p><div class="bits" role="group" aria-label="Bit del byte"></div><span class="control-label">VALORE DECIMALE</span><div class="binary-result" aria-live="polite">0</div><div class="demo-bottom"><button class="demo-btn" id="random-bits">Byte casuale ⤨</button><button class="demo-btn" id="reset-bits">Azzera ↺</button></div></section>`;
  let connected=true,lastOctet=42;const report=$('#adapter-report');
  function drawReport(){report.replaceChildren();[['IPv4',connected?'192.168.1.'+lastOctet:'—'],['Subnet','255.255.255.0'],['Gateway',connected?'192.168.1.1':'—'],['DNS',connected?'1.1.1.1':'—'],['MAC','02:59:42:10:00:2A']].forEach(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);report.append(row);});$('.adapter-state').textContent=connected?'● Connessa · 1 Gbps':'● Disconnessa';$('.adapter-state').classList.toggle('off',!connected);$('#toggle-adapter').textContent=connected?'Disconnetti':'Riconnetti';}
  drawReport();
  $('#refresh-adapter').addEventListener('click',()=>{if(!connected){status('Scheda disconnessa');toast('Riconnetti prima la scheda.');return;}lastOctet=lastOctet===42?43:42;drawReport();status('Dati aggiornati · host '+lastOctet);});
  $('#toggle-adapter').addEventListener('click',()=>{connected=!connected;drawReport();status(connected?'Connessione ripristinata':'Scheda disconnessa');});
  $('#copy-report').addEventListener('click',async()=>{const text='IPCFG — REPORT SIMULATO\n'+$$('div',report).map(row=>row.innerText).join('\n');try{await navigator.clipboard.writeText(text);toast('Report copiato.');}catch{toast('Copia non disponibile: seleziona i dati nel riquadro.');}});
  $$('[data-ip-tab]').forEach(button=>button.addEventListener('click',()=>{$$('[data-ip-tab]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});['adapter','subnet','binary'].forEach(id=>$('#'+id+'-pane').hidden=id!==button.dataset.ipTab);}));
  function subnet(){const prefixText=$('#ip-prefix').value;const result=prefixText.trim()===''?null:calculateSubnet($('#ip-address').value.trim(),Number(prefixText));const el=$('#subnet-result');el.replaceChildren();if(!result){const p=document.createElement('p');p.className='bank-message error';p.textContent='Inserisci un IPv4 valido e un prefisso intero da 0 a 32.';el.append(p);return;}[['Rete',result.network],['Broadcast',result.broadcast],['Subnet mask',result.mask],['Indirizzi utilizzabili',result.hosts.toLocaleString('it-IT')]].forEach(([label,value])=>{const box=document.createElement('div'),strong=document.createElement('strong');box.textContent=label;strong.textContent=value;box.append(strong);el.append(box);});status('Subnet calcolata /'+prefixText);}
  $('#calculate-subnet').addEventListener('click',subnet);subnet();
  const bits=$('.bits');let byte=0;
  for(let i=7;i>=0;i--){const b=document.createElement('button');b.className='bit';b.dataset.power=i;b.setAttribute('aria-label','Bit '+i+', peso '+2**i);b.setAttribute('aria-pressed','false');b.innerHTML='0<small>'+2**i+'</small>';b.addEventListener('click',()=>{byte^=1<<i;renderBits();});bits.append(b);}
  function renderBits(){$$('.bit').forEach(b=>{const on=!!(byte&(1<<Number(b.dataset.power)));b.firstChild.textContent=on?'1':'0';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});$('.binary-result').textContent=byte;status('Byte: '+byte.toString(2).padStart(8,'0'));}
  $('#random-bits').addEventListener('click',()=>{byte=Math.floor(Math.random()*256);renderBits();});$('#reset-bits').addEventListener('click',()=>{byte=0;renderBits();});
}
function initSort() {
  demo.innerHTML=heading('Bubble Lab','Lo stesso algoritmo del mio esercizio C. Ora lo vedi.','C → VISUALIZER')+`<label class="control-label" for="sort-input">NUMERI DA ORDINARE · DA 3 A 14 INTERI TRA 1 E 99</label><div class="control-row"><label><input class="demo-input" id="sort-input" value="64, 25, 82, 12, 48, 91, 33, 57" aria-label="Numeri da ordinare"></label><button class="demo-btn" id="load-sort">Carica ↵</button><button class="demo-btn" id="shuffle-sort">Mescola ⤨</button></div><div class="bars-area" role="img" aria-label="Visualizzazione dei valori dell’array"></div><div class="sort-stats"><span><strong id="comparison-count">0</strong> confronti</span><span><strong id="swap-count">0</strong> scambi</span><span id="sort-state" aria-live="polite">Pronto.</span></div><div class="sort-controls"><button class="demo-btn accent" id="run-sort">▶ Avvia</button><button class="demo-btn" id="step-sort">Un passo →</button><button class="demo-btn" id="reset-sort">Reset ↺</button><label class="speed-label">VELOCITÀ <input type="range" id="sort-speed" min="1" max="10" value="5" aria-label="Velocità animazione"></label></div>`;
  let values=[64,25,82,12,48,91,33,57],initial=[...values],i=0,j=0,comparisons=0,swaps=0,running=false,done=false,timer,highlight=[];
  function draw(){const area=$('.bars-area');area.replaceChildren();values.forEach((value,index)=>{const bar=document.createElement('div');bar.className='sort-bar'+(highlight.includes(index)?' compare':'')+(done||index>=values.length-i?' sorted':'');bar.style.height=(value/99*85+15)+'%';const label=document.createElement('span');label.textContent=value;bar.append(label);area.append(bar);});area.setAttribute('aria-label','Array: '+values.join(', '));$('#comparison-count').textContent=comparisons;$('#swap-count').textContent=swaps;$('#run-sort').textContent=running?'Ⅱ Pausa':done?'✓ Ordinato':'▶ Avvia';$('#run-sort').disabled=done;$('#step-sort').disabled=running||done;}
  function pause(){running=false;clearTimeout(timer);draw();}
  function reset(){pause();values=[...initial];i=0;j=0;comparisons=0;swaps=0;done=false;highlight=[];$('#sort-state').textContent='Pronto.';draw();}
  function step(){if(done)return;if(i>=values.length-1){done=true;running=false;highlight=[];$('#sort-state').textContent='Ordinato ✓';status('Ordinamento completato');draw();return;}highlight=[j,j+1];comparisons++;if(values[j]>values[j+1]){[values[j],values[j+1]]=[values[j+1],values[j]];swaps++;}j++;if(j>=values.length-i-1){j=0;i++;}$('#sort-state').textContent='Passata '+Math.min(i+1,values.length-1);draw();}
  function tick(){if(!running)return;step();if(running)timer=setTimeout(tick,Math.max(70,850-Number($('#sort-speed').value)*75));}
  $('#run-sort').addEventListener('click',()=>{if(running){pause();return;}if(done)return;running=true;draw();tick();});
  $('#step-sort').addEventListener('click',step);$('#reset-sort').addEventListener('click',reset);
  $('#shuffle-sort').addEventListener('click',()=>{initial=Array.from({length:8},()=>Math.ceil(Math.random()*99));$('#sort-input').value=initial.join(', ');reset();});
  $('#load-sort').addEventListener('click',()=>{const text=$('#sort-input').value.trim(),parts=text.split(/[,;\s]+/);if(parts.length<3||parts.length>14||parts.some(x=>!/^\d+$/.test(x)||Number(x)<1||Number(x)>99)){toast('Inserisci da 3 a 14 interi tra 1 e 99.');return;}initial=parts.map(Number);reset();});draw();return()=>{clearTimeout(timer);running=false;};
}
function initNetwork() {
  demo.innerHTML=heading('Packet playground','Clicca un dispositivo. Invia un ping. Interrompi una tratta.','RETE SIMULATA')+`<div class="net-layout"><svg class="topology" viewBox="0 0 500 290" role="group" aria-label="Topologia interattiva"><path class="wire" id="link-a" d="M95 220 L165 135 L250 60"/><path class="wire" id="link-b" d="M405 220 L335 135 L250 60"/><path class="wire" d="M250 60 L420 60"/><g class="node" data-node="router" role="button" tabindex="0" aria-label="Seleziona router"><rect x="213" y="36" width="74" height="48" rx="9"/><text x="250" y="64">ROUTER</text><text x="250" y="104">192.168.x.1</text></g><g class="node" data-node="switch-a" role="button" tabindex="0" aria-label="Seleziona switch VLAN 10"><rect x="131" y="118" width="68" height="37" rx="7"/><text x="165" y="141">SW-A</text></g><g class="node" data-node="switch-b" role="button" tabindex="0" aria-label="Seleziona switch VLAN 20"><rect x="301" y="118" width="68" height="37" rx="7"/><text x="335" y="141">SW-B</text></g><g class="node selected" data-node="pc-a" role="button" tabindex="0" aria-label="Seleziona PC A"><rect x="62" y="195" width="66" height="47" rx="8"/><text x="95" y="222">PC A</text><text x="95" y="263">VLAN 10</text></g><g class="node" data-node="pc-b" role="button" tabindex="0" aria-label="Seleziona PC B"><rect x="372" y="195" width="66" height="47" rx="8"/><text x="405" y="222">PC B</text><text x="405" y="263">VLAN 20</text></g><g class="node" data-node="server" role="button" tabindex="0" aria-label="Seleziona server DNS"><rect x="390" y="36" width="64" height="48" rx="8"/><text x="422" y="64">DNS</text></g><circle class="packet" r="5" cx="95" cy="220" visibility="hidden"/></svg><aside class="network-sidebar"><h3 id="node-name">PC A</h3><p id="node-info">192.168.10.10<br>VLAN 10 · Client</p><button class="demo-btn accent" id="send-ping">Invia ping A → B</button><button class="demo-btn" id="break-link">Interrompi tratta B</button></aside></div><div class="network-log" role="status" aria-live="polite">Rete pronta. Clicca un nodo per ispezionarlo.</div><p class="demo-footnote">Animazione didattica semplificata. Il laboratorio originale .pkt è scaricabile e si apre con Packet Tracer.</p>`;
  const nodes={'pc-a':['PC A','192.168.10.10','VLAN 10 · Client'],'pc-b':['PC B','192.168.20.10','VLAN 20 · Client'],'router':['Router','Gateway .1 per ogni VLAN','Routing inter-VLAN'],'switch-a':['Switch A','Trunk 802.1Q','Access · VLAN 10'],'switch-b':['Switch B','Trunk 802.1Q','Access · VLAN 20'],'server':['Server DNS','192.168.30.15','Risoluzione nomi']};
  let linkUp=true,busy=false,frame,disposed=false;const packet=$('.packet'),log=$('.network-log');
  function selectNode(node){$$('.topology .node').forEach(n=>n.classList.toggle('selected',n===node));const data=nodes[node.dataset.node];$('#node-name').textContent=data[0];$('#node-info').replaceChildren(document.createTextNode(data[1]),document.createElement('br'),document.createTextNode(data[2]));status(data[0]+' selezionato');}
  $$('.topology .node').forEach(node=>{node.addEventListener('click',()=>selectNode(node));node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectNode(node);}});});
  $('#break-link').addEventListener('click',()=>{linkUp=!linkUp;$('#link-b').classList.toggle('down',!linkUp);$('#break-link').textContent=linkUp?'Interrompi tratta B':'Ripristina tratta B';log.textContent=linkUp?'Tratta B ripristinata.':'Tratta B interrotta. Il PC B non è raggiungibile.';status(linkUp?'Collegamenti attivi':'Tratta B offline');});
  $('#send-ping').addEventListener('click',()=>{if(busy)return;busy=true;$('#send-ping').disabled=true;packet.setAttribute('visibility','visible');const waypoints=[[95,220],[165,135],[250,60],[335,135],[405,220]],start=performance.now(),duration=effects?2300:120;
    log.textContent='> ping 192.168.20.10\nPC A → Switch A → Router…';
    function finish(ok){busy=false;packet.setAttribute('visibility','hidden');$('#send-ping').disabled=false;log.textContent=ok?'> ping 192.168.20.10\nRouter → Switch B → PC B\nRisposta ricevuta ✓ · percorso simulato completato.':'> ping 192.168.20.10\nRouter → tratta B interrotta\nHost di destinazione non raggiungibile ✕';status(ok?'Ping completato':'Ping fallito · tratta B offline');}
    function animate(now){if(disposed)return;const progress=Math.min((now-start)/duration,1),segment=Math.min(Math.floor(progress*4),3),fraction=progress===1?1:progress*4-segment;if(!linkUp&&progress>=.5){finish(false);return;}packet.setAttribute('cx',waypoints[segment][0]+(waypoints[segment+1][0]-waypoints[segment][0])*fraction);packet.setAttribute('cy',waypoints[segment][1]+(waypoints[segment+1][1]-waypoints[segment][1])*fraction);if(progress<1)frame=requestAnimationFrame(animate);else finish(true);}frame=requestAnimationFrame(animate);
  });return()=>{disposed=true;cancelAnimationFrame(frame);};
}
function initBank() {
  demo.innerHTML=heading('YB Bank','Un conto corrente, qualche oggetto, tutte le azioni da provare.','JAVA → WEB DEMO')+`<div class="bank-demo-grid"><div><div class="balance-box"><small>CONTO PERSONALE · DEMO</small><strong id="bank-balance">1.250,00 €</strong><p>YOUSSEF BENCHEIKH &nbsp; / &nbsp; •••• 0042</p></div><ul class="bank-history" aria-label="Movimenti del conto"></ul></div><div class="bank-controls"><label class="control-label" for="bank-type">TIPO DI CONTO</label><select class="demo-input" id="bank-type"><option value="private">Privato · saldo minimo 0 €</option><option value="company">Società · fido 500 €</option></select><label class="control-label" for="bank-amount">IMPORTO (€)</label><input class="demo-input" id="bank-amount" type="number" min="0.01" max="1000000" step="0.01" value="100"><div class="bank-actions"><button class="demo-btn accent" id="deposit">Versa +</button><button class="demo-btn" id="withdraw">Preleva −</button></div><p class="bank-message" role="status" aria-live="polite">Scegli un importo e prova un’operazione.</p><button class="demo-btn" id="reset-bank">Ripristina demo ↺</button></div></div><p class="demo-footnote">Solo denaro virtuale. La demo illustra saldo e fido del progetto Java; nessun conto o pagamento reale.</p>`;
  let balances={private:125000,company:125000},histories={private:[],company:[]};const money=cents=>(cents/100).toLocaleString('it-IT',{style:'currency',currency:'EUR'}),current=()=>$('#bank-type').value;
  function draw(){const key=current();$('#bank-balance').textContent=money(balances[key]);$('.bank-history').replaceChildren();histories[key].slice(0,12).forEach(item=>{const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=item.label;value.textContent=(item.amount>0?'+':'−')+money(Math.abs(item.amount));if(item.amount<0)value.style.color='#e4b5c4';li.append(label,value);$('.bank-history').append(li);});}
  function transaction(direction){const raw=$('#bank-amount').value,amount=Number(raw),message=$('.bank-message');message.classList.remove('error');if(!Number.isFinite(amount)||amount<=0||amount>1000000||Math.abs(amount*100-Math.round(amount*100))>.00001){message.textContent='Inserisci un importo valido, fino a due decimali e massimo 1.000.000 €.';message.classList.add('error');return;}const cents=Math.round(amount*100),key=current(),next=balances[key]+direction*cents,min=key==='company'?-50000:0;if(next<min){message.textContent=key==='company'?'Fido superato. Il saldo può scendere fino a −500 €.':'Saldo insufficiente. Il conto privato non può andare in rosso.';message.classList.add('error');return;}balances[key]=next;histories[key].unshift({label:direction>0?'Versamento':'Prelievo',amount:direction*cents});draw();message.textContent='Operazione completata ✓';status(histories[key].length+' movimenti sul conto '+(key==='company'?'società':'privato'));}
  $('#deposit').addEventListener('click',()=>transaction(1));$('#withdraw').addEventListener('click',()=>transaction(-1));$('#bank-type').addEventListener('change',()=>{draw();$('.bank-message').textContent=current()==='company'?'Conto società: puoi utilizzare un fido di 500 €.':'Conto privato: il saldo non può scendere sotto zero.';$('.bank-message').classList.remove('error');});$('#reset-bank').addEventListener('click',()=>{balances={private:125000,company:125000};histories={private:[],company:[]};draw();$('.bank-message').textContent='Conti demo ripristinati.';$('.bank-message').classList.remove('error');});draw();
}
