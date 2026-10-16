const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', event => { if(event.key === 'Escape') {nav.classList.remove('open');menu.setAttribute('aria-expanded','false');} });
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => {b.classList.toggle('active',b === button);b.setAttribute('aria-pressed',String(b === button));});
  document.querySelectorAll('.project').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) card.classList.add('visible');
  });
}));
const projects = {
  java: {label:'JAVA / PROGRAMMAZIONE A OGGETTI',title:'La logica degli oggetti',description:'Esercizi e piccoli gestionali in Java, con esempi dedicati a banca, biblioteca, spesa e account di gioco.',items:['Classi, costruttori, incapsulamento ed ereditarietà.','Gestione di collezioni e menu da console.','Lettura e scrittura di dati in file CSV.']},
  network: {label:'SISTEMI / LABORATORIO',title:'Connessioni, con criterio',description:'Progettazione e configurazione di reti simulate in Cisco Packet Tracer, accompagnate da appunti e documentazione delle verifiche.',items:['VLAN, porte access/trunk e Router-on-a-Stick.','Indirizzamento IPv4, subnet mask, gateway e routing.','DHCP relay, DNS, RSTP e aggregazione LACP/EtherChannel.','Verifica tramite ping, tabelle e comandi show.']},
  python: {label:'PYTHON / ESPERIMENTI',title:'Automatizzare il ripetitivo',description:'Prototipi che collegano automazione del browser e interfacce web. Un modo per esercitarmi su flussi, eventi e gestione dei dati.',items:['Selenium: navigazione e attesa degli elementi.','Flask: rotte e pagine collegate a script Python.','Validazione di input e gestione dei risultati.']},
  php: {label:'PHP / PROGETTO DIDATTICO',title:'Dal browser al programma',description:'Un’interfaccia che invia codice e input a un backend PHP, compila o esegue il programma e ne presenta l’output.',items:['Form HTML e gestione delle richieste POST.','Scelta del linguaggio e distinzione tra compilazione ed esecuzione.','File temporanei, output ed errori di compilazione.','Il compilatore è descritto qui come progetto: questa pagina non esegue codice sul server.']}
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('.detail').forEach(button => button.addEventListener('click', () => {
  const data = projects[button.dataset.project];
  document.querySelector('#dialog-label').textContent=data.label;
  document.querySelector('#dialog-title').textContent=data.title;
  document.querySelector('#dialog-description').textContent=data.description;
  const list = document.querySelector('#dialog-list');list.replaceChildren();
  data.items.forEach(text => { const li=document.createElement('li');li.textContent=text;list.append(li); });
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.querySelector('#year').textContent=new Date().getFullYear();
const progress = document.querySelector('.progress');
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;progress.style.width=(range>0?scrollY/range*100:0)+'%';}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
