// 07-boss.js — L'Odyssée du Savoir
'use strict';

// Boss (enrage/fury/attaques), collection aventure (carnets par matière),
// journal d'aventure, décor de zone.
// (Extrait de 07-game.js.)

const _ADV_MAT_ORDER = ['cp','ce1','ce2','cm1','cm2','final']; // rouge→indigo
const _ADV_COL_ORDER = ['cp','ce1','ce2','cm1','cm2','final']; // jambes→casque
const _ADV_COL_PIECES = [
 { key:'legL',  name:'Jambière gauche', power:'Aplomb',       eff:'stabilité',        gem:'radial-gradient(circle at 35% 30%,#ff5a6e,#7a0016)' },
 { key:'legR',  name:'Jambière droite', power:'Élan',         eff:'combo',            gem:'radial-gradient(circle at 35% 30%,#4da3ff,#0a2f7a)' },
 { key:'armL',  name:'Brassard gauche', power:'Égide',        eff:'défense',          gem:'radial-gradient(circle at 35% 30%,#3ddc84,#0a5a2a)' },
 { key:'armR',  name:'Brassard droit',  power:'Frappe',       eff:'puissance',        gem:'radial-gradient(circle at 35% 30%,#b06cff,#3a0a7a)' },
 { key:'torso', name:'Cuirasse',        power:'Cœur d\'Or',   eff:'vitalité',         gem:'radial-gradient(circle at 35% 30%,#ffb13d,#7a4400)' },
 { key:'helm',  name:'Heaume',          power:'Clairvoyance', eff:'lit les attaques', gem:'radial-gradient(circle at 35% 30%,#bfe9ff,#4f86b0)' },
];
// v11.5.4 — Table de correspondance aventure→carnet (dette technique corrigée :
// remplace l'ancien enchaînement d'if/else en dur). Pour ajouter une nouvelle
// odyssée dédiée, ajouter une seule entrée ici (nom de fonction en chaîne pour
// tolérer que la fonction soit définie plus bas dans ce même fichier).
const _ADV_COLLECTION_FN = {
 matfr:    '_advBookHtml',
 primfr:   '_advBadgeHtml',
 colfr:    '_advLibraryHtml',
 mat:      '_advRainbowHtml',
 col:      '_advArmorHtml',
 primhist: '_advHistLibraryHtml',
};
function _advCollectionHtml(){
 try{
  const adv = (typeof GM!=='undefined' && GM && GM.adventure) || 'prim';
  const fnName = _ADV_COLLECTION_FN[adv] || '_advTalismanHtml';
  const fn = globalThis[fnName];
  return (typeof fn==='function') ? fn() : _advTalismanHtml();
 }catch(e){ return ''; }
}
// ── Carnet maternelle : Mon Arc-en-ciel ─────────────────────────────
function _advRainbowHtml(){
 const seen = (P && P.storySeen) || [];
 const got = _ADV_MAT_ORDER.map(rid => _regionConquered(rid));
 const violet = seen.includes('mat_epilogue');
 const n = got.filter(Boolean).length + (violet?1:0);
 const happy = got.slice(0,6).every(Boolean);
 const BANDS = [ // [d, couleur, largeur] — rouge extérieur → violet intérieur
  ['M40 210 A110 110 0 0 1 260 210','#ff6b6b',13],
  ['M55 210 A95 95 0 0 1 245 210','#ffa94d',12],
  ['M70 210 A80 80 0 0 1 230 210','#ffd43b',12],
  ['M85 210 A65 65 0 0 1 215 210','#69db7c',11],
  ['M100 210 A50 50 0 0 1 200 210','#4dabf7',11],
  ['M115 210 A35 35 0 0 1 185 210','#7c8cf8',10],
  ['M130 210 A20 20 0 0 1 170 210','#c08cf8',10],
 ];
 const on = [...got, violet]; // 7 états dans l'ordre des bandes
 const bands = BANDS.map((b,i)=> on[i]
  ? `<path d="${b[0]}" fill="none" stroke="${b[1]}" stroke-width="${b[2]}" stroke-linecap="round" class="advcol-band-on"/>`
  : `<path d="${b[0]}" fill="none" stroke="#d9d4e8" stroke-width="${Math.max(4,b[2]-6)}" stroke-linecap="round" stroke-dasharray="2 9" opacity=".55"/>`
 ).join('');
 const taleSeen = seen.includes('mat_tale_rainbow');
 const clickable = violet ? `onclick="_openTaleIllus(_MAT_TALE_RAINBOW)" role="button" tabindex="0" title="Lire l'histoire du trésor" style="cursor:pointer"` : '';
 const cloudFill = happy ? '#ffffff' : '#cfd6e6';
 const mouth = happy ? 'M-11 13 q11 12 22 0' : 'M-9 16 q9 -2 18 0';
 const sparks = (violet)
  ? `<g fill="#fff3b0" stroke="#ffd84d" stroke-width="1" class="advcol-spark">
      <path d="M150 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z"/>
      <path d="M196 52 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z"/>
      <path d="M104 52 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z"/></g>` : '';
 const msg = violet ? (taleSeen ? "Arc-en-ciel complet — touche-le pour relire l'histoire du trésor 📖" : "Arc-en-ciel complet ! Touche-le pour lire l'histoire du trésor 🌈✨")
  : happy ? 'Six couleurs ! Le nuage sourit… une surprise t\'attend ✨'
  : n>0 ? `${n} couleur${n>1?'s':''} retrouvée${n>1?'s':''} — continue !`
  : 'Rapporte les couleurs, île après île !';
 return `
  <div class="advlog-section-title">🌈 Mon Arc-en-ciel</div>
  <div class="advcol-box advcol-mat${violet?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 300 226" class="advcol-svg" aria-label="Arc-en-ciel : ${n} couleurs sur 7">
    ${bands}
    <path d="M-10 212 q60 -26 120 0 t140 0 t80 0 V230 H-10 Z" fill="#b5e3b0"/>
    <path d="M-10 218 q80 -16 160 0 t160 0 V230 H-10 Z" fill="#9bd69a"/>
    <g transform="translate(150 78)">
     <g fill="${cloudFill}" ${happy?'filter="drop-shadow(0 3px 8px rgba(255,210,120,.5))"':''}>
      <circle cx="-26" cy="6" r="20"/><circle cx="0" cy="-6" r="26"/><circle cx="28" cy="6" r="20"/>
      <rect x="-44" y="2" width="88" height="22" rx="11"/>
     </g>
     <circle cx="-12" cy="2" r="3.2" fill="#5a5570"/><circle cx="12" cy="2" r="3.2" fill="#5a5570"/>
     <path d="${mouth}" fill="none" stroke="#5a5570" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    ${sparks}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 7</b></div>
  </div>`;
}
// ── Carnet français (maternelle) : Le Grand Livre du Conteur ────────
// Les pages se retrouvent monde après monde ; une fois le Livre complet,
// un clic dessus ouvre l'Histoire B (le conte du Livre).
// ── Lecteur d'histoire illustré (grande image + texte + lecture vocale) ─
function _markTaleSeen(id){ try{ if(P && P.storySeen && P.storySeen.indexOf(id)<0){ P.storySeen.push(id); if(typeof saveProfile==='function') saveProfile(); } }catch(e){} }
function _openTaleIllus(tale){
 try{
  if(!tale || !tale.pages || !tale.pages.length) return;
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(function(){ _renderTaleIllus(tale); }, 300);
 }catch(e){}
}
function _renderTaleIllus(tale){
 const pages=tale.pages, total=pages.length; let step=0;
 _markTaleSeen(tale.id);
 const ov=document.createElement('div'); ov.className='story-overlay';
 function _hero(){ try{ return (typeof P!=='undefined'&&P&&P.name)?String(P.name):'mon ami'; }catch(e){ return 'mon ami'; } }
 function _fill(s){ s=String(s||''); const h=_hero().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return s.replace(/\{hero\}/g,h); }
 function sayCur(){ try{ if(typeof speak==='function'){ const t=_fill(pages[step].text||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); speak(t); } }catch(e){} }
 function stopSay(){ try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){} }
 function close(){ stopSay(); ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
 function render(){
  const p=pages[step];
  ov.innerHTML='<div class="story-parchment" style="max-width:560px;border-top:6px solid '+(tale.accent||'#7c5bd0')+';">'
   +'<div style="text-align:center;font-family:Georgia,serif;font-weight:700;color:'+(tale.accent||'#7c5bd0')+';font-size:15px;margin-bottom:8px;">'+tale.title+'</div>'
   +(p.illus?('<div style="background:#fffaf0;border:2px solid #e6d3a3;border-radius:12px;padding:6px;overflow:hidden;">'+p.illus+'</div>'):'')
   +'<div style="font-family:Georgia,serif;font-size:18px;line-height:1.55;color:#3a2a18;text-align:center;margin:12px 8px 6px;">'+_fill(p.text||'')+'</div>'
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn ti-prev">‹ Avant</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:54%;">'+pages.map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn ti-next">'+(step===total-1?'Fin ✨':'Après ›')+'</button>'
   +'</div>'
   +'<div style="text-align:center;margin-top:6px;"><button class="story-btn ti-read">🔊 Relire</button> <span style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-left:8px;">page '+(step+1)+' / '+total+'</span></div>'
   +'</div>';
  const nx=ov.querySelector('.ti-next'); nx.onclick=function(){ stopSay(); if(step<total-1){ step++; render(); if(tale.autoSpeak) sayCur(); } else close(); };
  const pv=ov.querySelector('.ti-prev'); if(pv) pv.onclick=function(){ stopSay(); if(step>0){ step--; render(); if(tale.autoSpeak) sayCur(); } };
  ov.querySelector('.ti-read').onclick=sayCur;
  if(typeof beep==='function'){ try{ beep(560,'sine',.08,.04); }catch(e){} }
 }
 render(); document.body.appendChild(ov); if(tale.autoSpeak) setTimeout(sayCur,260);
}

// ── Histoire maternelle (maths) : « Le Trésor au bout de l'Arc-en-ciel » ─
// Débloquée au clic sur l'arc-en-ciel reconstitué. Niveau fin de GS.
const _MAT_TALE_RAINBOW = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#dff0ff')+'"/>';
 const ground=(y,c)=>'<path d="M-5 '+y+' q80 -20 155 0 t160 0 V205 H-5 Z" fill="'+(c||'#9bd69a')+'"/>';
 const sun=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#ffe066"/><circle cx="'+x+'" cy="'+y+'" r="'+(r+5)+'" fill="#ffe066" opacity=".25"/>';
 const rainbow=(cx,cy,s)=>{ const C=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#7c8cf8','#c08cf8']; let p=''; for(let i=0;i<7;i++){ const r=(72-i*8)*s; p+='<path d="M'+(cx-r)+' '+cy+' a'+r+' '+r+' 0 0 1 '+(2*r)+' 0" fill="none" stroke="'+C[i]+'" stroke-width="'+(7*s)+'"/>'; } return p; };
 const pim=(x,y,s)=>{ s=s||1; return '<g transform="translate('+x+' '+y+') scale('+s+')">'
  +'<ellipse cx="0" cy="40" rx="15" ry="4" fill="#000" opacity=".12"/>'
  +'<rect x="-8" y="34" width="5" height="8" rx="2" fill="#5a3a1a"/><rect x="3" y="34" width="5" height="8" rx="2" fill="#5a3a1a"/>'
  +'<path d="M-12 38 L-9 18 L9 18 L12 38 Z" fill="#2e8b57"/>'
  +'<rect x="-12" y="30" width="24" height="3" fill="#d4af37"/>'
  +'<circle cx="0" cy="11" r="9" fill="#f2c79b"/>'
  +'<path d="M-8 14 q8 13 16 0 q-8 5 -16 0 Z" fill="#f0f0f0"/>'
  +'<circle cx="-3" cy="10" r="1.2" fill="#2a1a0a"/><circle cx="3" cy="10" r="1.2" fill="#2a1a0a"/>'
  +'<path d="M-1 12 q1 1.4 2 0" fill="none" stroke="#c0884a" stroke-width="1"/>'
  +'<path d="M-11 4 q11 -7 22 0 Z" fill="#1f6b3a"/><rect x="-7" y="-8" width="14" height="9" rx="2" fill="#2e8b57"/><rect x="-7" y="-2" width="14" height="3" fill="#d4af37"/>'
  +'</g>'; };
 const pot=(x,y,s,open)=>{ s=s||1; let g='<g transform="translate('+x+' '+y+') scale('+s+')">'
  +'<ellipse cx="0" cy="28" rx="26" ry="5" fill="#000" opacity=".15"/>'
  +'<path d="M-24 4 Q-27 28 0 30 Q27 28 24 4 Z" fill="#2b2b33"/>'
  +'<ellipse cx="0" cy="4" rx="24" ry="7" fill="#1c1c22"/>';
  if(open) g+='<ellipse cx="0" cy="2" rx="20" ry="5.5" fill="#ffd84d"/><circle cx="-9" cy="0" r="3.4" fill="#ffe680"/><circle cx="0" cy="-2" r="3.4" fill="#ffe680"/><circle cx="9" cy="0" r="3.4" fill="#ffd84d"/><circle cx="-3" cy="2" r="3.4" fill="#ffd84d"/><circle cx="5" cy="2" r="3.4" fill="#ffe680"/>';
  else g+='<ellipse cx="0" cy="3" rx="20" ry="5" fill="#3a3a44"/>';
  return g+'</g>'; };
 const coin=(x,y,num,r)=>{ r=r||11; return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#e0a81f"/><circle cx="'+x+'" cy="'+y+'" r="'+(r-2.4)+'" fill="#ffd84d"/><text x="'+x+'" y="'+(y+r*0.42)+'" text-anchor="middle" font-family="Georgia,serif" font-size="'+(r*1.05)+'" font-weight="700" fill="#9a6a12">'+num+'</text>'; };
 const lady=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="6" ry="5.2" fill="#e23b3b"/><line x1="'+x+'" y1="'+(y-5)+'" x2="'+x+'" y2="'+(y+5)+'" stroke="#3a1010" stroke-width="1"/><circle cx="'+x+'" cy="'+(y-6)+'" r="2.6" fill="#222"/><circle cx="'+(x-2.5)+'" cy="'+(y-1)+'" r="1" fill="#3a1010"/><circle cx="'+(x+2.5)+'" cy="'+(y+1.5)+'" r="1" fill="#3a1010"/></g>';
 const fly=(x,y,c)=>'<g><ellipse cx="'+(x-3.5)+'" cy="'+(y-2)+'" rx="3.6" ry="4.4" fill="'+c+'"/><ellipse cx="'+(x+3.5)+'" cy="'+(y-2)+'" rx="3.6" ry="4.4" fill="'+c+'"/><ellipse cx="'+(x-3)+'" cy="'+(y+3)+'" rx="3" ry="3.4" fill="'+c+'" opacity=".85"/><ellipse cx="'+(x+3)+'" cy="'+(y+3)+'" rx="3" ry="3.4" fill="'+c+'" opacity=".85"/><rect x="'+(x-0.6)+'" y="'+(y-4)+'" width="1.2" height="9" rx="0.6" fill="#5a3a1a"/></g>';
 const chick=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="6" ry="5.5" fill="#ffd84d"/><circle cx="'+x+'" cy="'+(y-5)+'" r="4.2" fill="#ffe066"/><path d="M'+(x+4)+' '+(y-5)+' l4 -1 -4 -1 Z" fill="#f0922a"/><circle cx="'+(x+1)+'" cy="'+(y-6)+'" r="0.9" fill="#2a1a0a"/><line x1="'+(x-2)+'" y1="'+(y+5)+'" x2="'+(x-2)+'" y2="'+(y+8)+'" stroke="#f0922a" stroke-width="1"/><line x1="'+(x+2)+'" y1="'+(y+5)+'" x2="'+(x+2)+'" y2="'+(y+8)+'" stroke="#f0922a" stroke-width="1"/></g>';
 const frog=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="7" ry="5" fill="#5fbf57"/><circle cx="'+(x-3)+'" cy="'+(y-4)+'" r="2.6" fill="#5fbf57"/><circle cx="'+(x+3)+'" cy="'+(y-4)+'" r="2.6" fill="#5fbf57"/><circle cx="'+(x-3)+'" cy="'+(y-4)+'" r="1.1" fill="#1a1a1a"/><circle cx="'+(x+3)+'" cy="'+(y-4)+'" r="1.1" fill="#1a1a1a"/><path d="M'+(x-3)+' '+(y+2)+' q3 2 6 0" fill="none" stroke="#2f7a30" stroke-width="1"/></g>';
 const pad=(x,y)=>'<ellipse cx="'+x+'" cy="'+(y+6)+'" rx="11" ry="4" fill="#3f9a55"/>';
 const fish=(x,y,c)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="7" ry="4.4" fill="'+c+'"/><path d="M'+(x+6)+' '+y+' l6 -4 0 8 Z" fill="'+c+'"/><circle cx="'+(x-3)+'" cy="'+(y-1)+'" r="1" fill="#fff"/></g>';
 const firefly=(x,y)=>'<g><circle cx="'+x+'" cy="'+y+'" r="5" fill="#fff3b0" opacity=".55"/><circle cx="'+x+'" cy="'+y+'" r="2.3" fill="#ffe066"/></g>';
 const row=(n,fn,x0,dx,y,jit)=>{ let s=''; for(let i=0;i<n;i++){ s+=fn(x0+i*dx, y+((i%2)?(jit||0):0)); } return s; };

 const P=[];
 P.push({ text:"<b>Le Trésor au bout de l'Arc-en-ciel</b>", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+rainbow(150,150,1.05)+pot(150,120,1.1,false)+pim(214,118,1.15)+sun(258,40,16)) });
 P.push({ text:"Après la grosse pluie, un magnifique arc-en-ciel apparaît dans le ciel. {hero} lève la tête : « Qu'y a-t-il, tout au bout ? »", illus:SV(bg('#dff0ff')+ground(158,'#9bd69a')+rainbow(150,158,1.1)+'<circle cx="60" cy="130" r="10" fill="#f2c79b"/><rect x="54" y="140" width="12" height="22" rx="5" fill="#e8533f"/>'+sun(255,38,15)) });
 P.push({ text:"Soudain, un petit lutin surgit ! Il s'appelle <b>Pim</b>. « Au bout de l'arc-en-ciel se cache un trésor… mais il faut grimper mes <b>sept couleurs</b> ! »", illus:SV(bg('#eaf6ff')+ground(155,'#9bd69a')+rainbow(180,155,0.9)+pim(95,120,2.0)) });
 P.push({ text:"La première couleur, c'est le <b>ROUGE</b> ! Dans le pré rouge, compte les coccinelles avec moi : 1, 2, 3, 4, 5. <b>Cinq</b> coccinelles !", illus:SV(bg('#ffe3e3')+ground(150,'#e86b6b')+row(5,lady,70,42,120,-8)) });
 P.push({ text:"Voici l'<b>ORANGE</b> ! Six papillons orange dansent dans l'air. Comptons-les : 1, 2, 3, 4, 5, 6. <b>Six</b> papillons !", illus:SV(bg('#fff0e0')+ground(155,'#f0a35a')+row(6,(x,y)=>fly(x,y,'#ff922b'),58,40,95,16)) });
 P.push({ text:"Le <b>JAUNE</b>, comme le soleil ! Sept poussins suivent maman poule. 1, 2, 3, 4, 5, 6, 7. <b>Sept</b> poussins !", illus:SV(bg('#fff8d6')+ground(150,'#ffd84d')+sun(40,38,16)+row(7,chick,46,36,125,-7)) });
 P.push({ text:"Le <b>VERT</b> du gazon ! Sur les nénuphars tout ronds, combien de grenouilles ? 1 à 8. <b>Huit</b> grenouilles !", illus:SV(bg('#e3f7e0')+ground(150,'#5fbf57')+row(8,pad,40,32,128,0)+row(8,frog,40,32,124,-6)) });
 P.push({ text:"Le <b>BLEU</b> de l'eau fraîche ! Neuf petits poissons nagent. Compte-les avec Pim : 1 à 9. <b>Neuf</b> poissons !", illus:SV(bg('#d6efff')+'<rect x="0" y="120" width="300" height="85" fill="#4dabf7"/>'+row(9,(x,y)=>fish(x,y,'#ff8f3f'),34,30,150,-12)) });
 P.push({ text:"L'<b>INDIGO</b> du soir qui tombe ! Dix lucioles s'allument une à une, jusqu'à <b>dix</b>. 1, 2, 3… 10 !", illus:SV(bg('#2a2d6a')+ground(160,'#23265a')+row(10,firefly,28,27,120,-16)+'<circle cx="270" cy="35" r="12" fill="#fdf6c3"/>') });
 P.push({ text:"Et enfin le <b>VIOLET</b>, la dernière couleur ! {hero} a grimpé les <b>sept</b> couleurs de l'arc-en-ciel. Bravo, quel courage !", illus:SV(bg('#efe3ff')+ground(155,'#9b6fdf')+rainbow(150,155,1.05)+'<g fill="#a86fd6">'+row(6,(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="4"/><circle cx="'+(x-4)+'" cy="'+(y+3)+'" r="3"/><circle cx="'+(x+4)+'" cy="'+(y+3)+'" r="3"/>',60,36,140,0)+'</g>') });
 P.push({ text:"Tout en haut brille le trésor : un grand <b>chaudron d'or</b> ! Mais il est fermé. Pim demande : « Combien de couleurs as-tu grimpées ? » — « SEPT ! » répond {hero}.", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+pot(150,118,1.5,false)+pim(225,120,1.2)) });
 P.push({ text:"Clic ! Le chaudron s'ouvre. Il déborde de <b>pièces d'or</b>, et sur chacune, un chiffre : 1, 2, 3… jusqu'à 10 !", illus:SV(bg('#fff6df')+ground(155,'#9bd69a')+pot(150,120,1.5,true)+coin(96,150,1)+coin(120,158,2)+coin(150,162,3)+coin(180,158,4)+coin(204,150,5)+coin(110,170,6)+coin(140,174,7)+coin(170,174,8)+coin(200,170,9)+coin(150,150,10)) });
 P.push({ text:"Mais Pim baisse les yeux et soupire. « Ce trésor… je le garde tout seul. Depuis très, très longtemps. Je n'ai personne avec qui jouer. »", illus:SV(bg('#e9eef6')+ground(150,'#9bd69a')+pot(95,120,1.3,true)+pim(180,122,1.6)+'<path d="M186 112 q3 4 0 7" stroke="#6aa6e0" stroke-width="2" fill="none"/>') });
 P.push({ text:"{hero} a une idée. « Et si on <b>partageait</b> ? » Pim appelle tous les amis de la forêt : l'ours, les canetons, le mouton et le hibou !", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')
   +'<g><circle cx="60" cy="120" r="13" fill="#a06a34"/><circle cx="51" cy="108" r="5" fill="#a06a34"/><circle cx="69" cy="108" r="5" fill="#a06a34"/><circle cx="56" cy="118" r="1.6" fill="#2a1a0a"/><circle cx="64" cy="118" r="1.6" fill="#2a1a0a"/></g>'
   +chick(110,130)+chick(124,130)
   +'<g><ellipse cx="175" cy="124" rx="14" ry="11" fill="#f3f3f3"/><circle cx="175" cy="110" r="8" fill="#f3f3f3"/><ellipse cx="170" cy="123" rx="3" ry="4" fill="#3a3a3a"/></g>'
   +'<g><ellipse cx="230" cy="120" rx="12" ry="13" fill="#b07a3a"/><circle cx="225" cy="114" r="4" fill="#fff"/><circle cx="235" cy="114" r="4" fill="#fff"/><circle cx="225" cy="114" r="1.6" fill="#000"/><circle cx="235" cy="114" r="1.6" fill="#000"/><path d="M228 120 l4 0 -2 3 Z" fill="#f0922a"/></g>'
   +pim(20,124,1.0)) });
 P.push({ text:"On partage les pièces : une pour l'ours, deux pour les canetons, trois pour les oiseaux… Chacun reçoit sa part. <b>Partager</b>, c'est joyeux !", illus:SV(bg('#fff6df')+ground(150,'#9bd69a')+coin(60,118,1,12)+coin(120,118,2,12)+coin(150,118,2,12)+coin(200,116,3,12)+coin(218,124,3,12)+'<circle cx="60" cy="150" r="11" fill="#a06a34"/>'+chick(126,150)+chick(146,150)+'<g><ellipse cx="210" cy="150" rx="11" ry="12" fill="#b07a3a"/></g>') });
 P.push({ text:"Pim sourit enfin, de toutes ses dents. « Le <b>vrai trésor</b>, dit-il, c'est d'avoir des amis avec qui partager ! »", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+pim(150,108,2.2)+'<g fill="#ffd84d">'+row(5,(x,y)=>'<path d="M'+x+' '+(y-4)+' l1.2 3 3.2 0 -2.6 2 1 3 -2.8-1.8 -2.8 1.8 1-3 -2.6-2 3.2 0 Z"/>',70,40,70,-6)+'</g>') });
 P.push({ text:"Alors l'arc-en-ciel se met à briller plus fort que jamais, et tout le monde danse de joie sous ses sept couleurs.", illus:SV(bg('#fff0d0')+ground(155,'#9bd69a')+rainbow(150,155,1.15)+pim(110,128,1.0)+chick(150,138)+'<circle cx="190" cy="124" r="11" fill="#a06a34"/>') });
 P.push({ text:"{hero} garde une seule petite pièce d'or, en souvenir. Car le plus beau des trésors, c'était l'<b>amitié</b>. ✨ <b>FIN</b>", illus:SV(bg('#efe3ff')+ground(155,'#9bd69a')+'<circle cx="150" cy="120" r="12" fill="#f2c79b"/><rect x="142" y="132" width="16" height="26" rx="6" fill="#e8533f"/>'+coin(176,120,1,12)+'<path d="M150 86 q8 -10 16 0 q0 9 -8 14 q-8 -5 -8 -14 Z" fill="#ff6b8a"/>') });
 return { id:'mat_tale_rainbow', title:"Le Trésor au bout de l'Arc-en-ciel", accent:'#c08cf8', autoSpeak:true, pages:P };
})();

// ── Histoire primaire (maths) : « La Grande Histoire des Nombres » ──────
// Débloquée au clic sur le Talisman de Calcultopia complet. Niveau fin CM2.
// Fond historique vérifié ; forme romancée et illustrée.
const _PRIM_TALE_NUMBERS = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#f3ecdb')+'"/>';
 const digit=(x,y,n,s,c)=>'<text x="'+x+'" y="'+y+'" font-family="Georgia,serif" font-size="'+(s||18)+'" font-weight="700" fill="'+(c||'#b9893a')+'" text-anchor="middle">'+n+'</text>';
 const tally=(x,y,n)=>{ let s='<g stroke="#5a3a1a" stroke-width="2" stroke-linecap="round">'; for(let i=0;i<n;i++){ s+='<line x1="'+(x+i*6)+'" y1="'+y+'" x2="'+(x+i*6)+'" y2="'+(y+16)+'"/>'; } return s+'</g>'; };
 const spiral=(cx,cy)=>{ const C=['#e0584f','#e7943f','#e9c33d','#56b96a','#3f8fd0','#7a6bd0','#b06cff']; let s=''; for(let i=0;i<7;i++){ const a=i*0.9, r=8+i*7; s+='<circle cx="'+(cx+r*Math.cos(a)).toFixed(1)+'" cy="'+(cy+r*Math.sin(a)).toFixed(1)+'" r="9" fill="'+C[i]+'"/>'+digit((cx+r*Math.cos(a)),(cy+r*Math.sin(a)+4),i+1,11,'#fff'); } return s; };

 const P=[];
 P.push({ text:"<b>La Grande Histoire des Nombres</b> — Les nombres n'ont pas toujours existé. Voici leur incroyable voyage, à travers le monde et les siècles.", illus:SV(bg('#10204a')+spiral(150,100)+'<g fill="#ffe07a">'+'<path d="M40 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z"/><path d="M262 150 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z"/></g>') });
 P.push({ text:"Il y a très longtemps, on ne savait compter que « un, deux… beaucoup ». Pour suivre leur troupeau, les hommes traçaient une encoche par bête sur un bâton ou un os.", illus:SV(bg('#caa86f')+'<path d="M0 130 q150 -40 300 0 V200 H0 Z" fill="#8a6a3a"/><ellipse cx="150" cy="150" rx="110" ry="14" fill="#6e5230"/>'+tally(96,120,5)+tally(140,120,5)+tally(184,120,3)+'<circle cx="60" cy="120" r="10" fill="#3a2a18"/><circle cx="62" cy="116" r="2" fill="#fff"/>') });
 P.push({ text:"Près du lac Édouard, en Afrique, on a retrouvé un os vieux d'environ <b>20 000 ans</b>, couvert d'entailles rangées en colonnes : l'<b>os d'Ishango</b>, peut-être le plus ancien outil de comptage du monde !", illus:SV(bg('#e7d8b0')+'<g transform="rotate(-8 150 110)"><rect x="60" y="92" width="180" height="34" rx="16" fill="#d8c69a" stroke="#9a855a" stroke-width="2"/><rect x="232" y="96" width="14" height="26" rx="5" fill="#b9b6c4"/>'+'<g stroke="#5a4a2a" stroke-width="1.6">'+(function(){let s='';const groups=[3,6,4,8,5,7];let x=78;groups.forEach(g=>{for(let i=0;i<g;i++){s+='<line x1="'+x+'" y1="98" x2="'+x+'" y2="120"/>';x+=4;}x+=8;});return s;})()+'</g></g>') });
 P.push({ text:"Bien plus tard, à Sumer puis à <b>Babylone</b>, les marchands notaient leurs comptes en pressant un roseau dans des <b>tablettes d'argile</b>. Surprise : ils comptaient par paquets de <b>60</b> !", illus:SV(bg('#cdb083')+'<rect x="78" y="44" width="144" height="112" rx="10" fill="#b48a52" stroke="#7a5a2e" stroke-width="3"/>'+'<g fill="#5a3f1e">'+(function(){let s='';for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=98+c*24,y=66+r*22;s+='<path d="M'+x+' '+y+' l4 6 -4 6 -4 -6 Z"/><rect x="'+(x+4)+'" y="'+(y-1)+'" width="9" height="2.4"/>';}return s;})()+'</g>') });
 P.push({ text:"Cette idée nous suit encore aujourd'hui : c'est pour cela qu'une heure dure <b>60 minutes</b>, une minute <b>60 secondes</b>, et qu'un tour complet fait <b>360 degrés</b> !", illus:SV(bg('#dff0ff')+'<circle cx="100" cy="100" r="56" fill="#fff" stroke="#3f6ad0" stroke-width="4"/>'+(function(){let s='<g stroke="#3f6ad0" stroke-width="2">';for(let i=0;i<12;i++){const a=i*30*Math.PI/180;s+='<line x1="'+(100+48*Math.cos(a)).toFixed(1)+'" y1="'+(100+48*Math.sin(a)).toFixed(1)+'" x2="'+(100+54*Math.cos(a)).toFixed(1)+'" y2="'+(100+54*Math.sin(a)).toFixed(1)+'"/>';}return s+'</g>';})()+'<line x1="100" y1="100" x2="100" y2="64" stroke="#16306e" stroke-width="3"/><line x1="100" y1="100" x2="128" y2="100" stroke="#16306e" stroke-width="3"/>'+'<circle cx="225" cy="100" r="40" fill="none" stroke="#e0843a" stroke-width="3" stroke-dasharray="3 4"/>'+digit(225,106,'360°',15,'#c0631a')) });
 P.push({ text:"En <b>Égypte</b>, chaque année, le Nil débordait et effaçait les champs. Des « arpenteurs » les re-mesuraient avec une corde à nœuds. Mesurer la terre, en grec, se dit <b>géométrie</b>.", illus:SV(bg('#f4e3b0')+'<path d="M0 150 q150 -16 300 0 V200 H0 Z" fill="#7ab06a"/><path d="M120 0 q-10 100 0 200 l40 0 q-10 -100 0 -200 Z" fill="#4da3d0"/>'+'<g stroke="#7a5a2e" stroke-width="2"><polyline points="190,150 215,120 245,140" fill="none"/></g><circle cx="190" cy="150" r="2.6" fill="#5a3a1a"/><circle cx="215" cy="120" r="2.6" fill="#5a3a1a"/><circle cx="245" cy="140" r="2.6" fill="#5a3a1a"/>'+'<circle cx="60" cy="120" r="9" fill="#c8945a"/><rect x="54" y="129" width="12" height="22" rx="4" fill="#e8d28a"/>') });
 P.push({ text:"Les Égyptiens écrivaient leurs nombres avec de petits dessins (des <b>hiéroglyphes</b>) et adoraient les <b>fractions</b> : un pain se partageait en 1/2, puis 1/4, puis 1/8…", illus:SV(bg('#efe2bd')+'<g stroke="#8a5a2a" stroke-width="2.4" fill="none"><path d="M50 60 v26"/><path d="M70 62 a10 10 0 1 0 0.1 0"/><path d="M96 58 q8 8 0 28 q-8 -20 0 -28"/></g>'+'<g><circle cx="210" cy="95" r="44" fill="#e8c98a" stroke="#b9893a" stroke-width="2"/><line x1="210" y1="51" x2="210" y2="139" stroke="#b9893a" stroke-width="2"/><line x1="166" y1="95" x2="254" y2="95" stroke="#b9893a" stroke-width="2"/><path d="M210 95 L254 95 A44 44 0 0 0 210 51 Z" fill="#d4a85a"/>'+digit(232,80,'¼',13,'#7a5320')+'</g>') });
 P.push({ text:"En <b>Grèce</b>, le savant <b>Pythagore</b> et ses élèves formaient une école presque secrète. Leur devise : « <b>Tout est nombre !</b> » On leur doit le célèbre théorème du triangle rectangle.", illus:SV(bg('#eef3f7')+'<polygon points="90,150 90,80 150,150" fill="#cfe0f0" stroke="#3f6ad0" stroke-width="2"/><rect x="90" y="138" width="12" height="12" fill="none" stroke="#3f6ad0" stroke-width="1.5"/>'+'<rect x="60" y="80" width="30" height="30" fill="#a7c8ec" opacity=".8"/><rect x="90" y="150" width="60" height="30" fill="#f0c98a" opacity=".8"/>'+digit(150,70,'a² + b² = c²',14,'#2a4a86')) });
 P.push({ text:"Les Grecs poursuivirent un nombre mystérieux, caché dans tous les cercles : <b>π</b> (pi), un peu plus que 3, et dont les chiffres après la virgule ne s'arrêtent jamais !", illus:SV(bg('#fff3df')+'<circle cx="110" cy="100" r="58" fill="none" stroke="#e0843a" stroke-width="4"/><line x1="52" y1="100" x2="168" y2="100" stroke="#16306e" stroke-width="2.4" stroke-dasharray="5 4"/>'+digit(232,96,'π',40,'#c0631a')+digit(232,128,'≈ 3,14…',13,'#7a4a18')) });
 P.push({ text:"Mais il manquait encore un nombre très étrange : le nombre de… <b>rien</b> ! Comment écrire « il ne reste rien » ? Et comment différencier <b>25</b> de <b>205</b> ?", illus:SV(bg('#eceff5')+'<rect x="40" y="70" width="80" height="60" rx="8" fill="#fff" stroke="#9aa6c0" stroke-width="2" stroke-dasharray="5 4"/>'+digit(80,108,'?',30,'#9aa6c0')+digit(210,95,'25',26,'#2a4a86')+digit(210,135,'205',26,'#c0631a')) });
 P.push({ text:"La réponse vint d'<b>Inde</b>. En <b>628</b>, le savant <b>Brahmagupta</b> donna enfin des règles au <b>zéro</b> et en fit un vrai nombre. On l'appelait « sunya » : le vide.", illus:SV(bg('#f1e6d0')+'<circle cx="200" cy="100" r="50" fill="none" stroke="#b9893a" stroke-width="10"/><circle cx="200" cy="100" r="50" fill="none" stroke="#e9c33d" stroke-width="3"/>'+'<g><circle cx="80" cy="86" r="16" fill="#d8a36a"/><path d="M62 150 q18 -34 36 0 Z" fill="#7a4fa0"/><path d="M66 78 q14 -12 28 0" stroke="#3a2a18" stroke-width="2" fill="none"/></g>'+digit(80,140,'628',12,'#5a3a1a')) });
 P.push({ text:"Génial : avec le zéro et la <b>position</b> des chiffres (unités, dizaines, centaines…), on peut écrire <b>tous</b> les nombres avec seulement dix signes : 0 1 2 3 4 5 6 7 8 9 !", illus:SV(bg('#eef3f7')+'<g>'+['centaines','dizaines','unités'].map((t,i)=>{const x=70+i*80;return '<rect x="'+(x-30)+'" y="60" width="60" height="60" rx="6" fill="#fff" stroke="#3f6ad0" stroke-width="2"/>'+digit(x,104,[2,0,5][i],30,'#2a4a86')+'<text x="'+x+'" y="138" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#3f6ad0">'+t+'</text>';}).join('')+'</g>'+digit(150,168,'= 205',16,'#c0631a')) });
 P.push({ text:"À <b>Bagdad</b>, dans la « <b>Maison de la Sagesse</b> », le savant <b>Al-Khwarizmi</b> rassembla ces idées vers l'an 820. De son livre « al-jabr » vient le mot <b>algèbre</b> ; et de son nom vient le mot <b>algorithme</b> !", illus:SV(bg('#f3e7c8')+'<rect x="70" y="80" width="160" height="76" fill="#caa86f" stroke="#7a5a2e" stroke-width="2"/><path d="M60 80 L150 40 L240 80 Z" fill="#9a6a3a" stroke="#7a5a2e" stroke-width="2"/><path d="M150 100 a16 16 0 0 1 0 56 Z" fill="#8a5a2a"/><path d="M150 100 a16 16 0 0 0 0 56 Z" fill="#7a4a1f"/>'+'<rect x="96" y="110" width="36" height="44" rx="3" fill="#3f6ad0"/>'+digit(112,138,'الجبر',12,'#fff')) });
 P.push({ text:"En Europe, on s'embrouillait avec les lourds <b>chiffres romains</b>. En <b>1202</b>, l'Italien <b>Léonard de Pise</b>, dit <b>Fibonacci</b>, publia un livre qui fit découvrir les <b>chiffres « arabes »</b>, bien plus pratiques.", illus:SV(bg('#eef3f7')+'<rect x="30" y="60" width="110" height="80" rx="6" fill="#f6efe0" stroke="#b08a4a" stroke-width="2"/>'+digit(85,108,'MCMXIV',16,'#8a6a3a')+'<text x="85" y="130" text-anchor="middle" font-size="10" fill="#b08a4a">compliqué…</text>'+'<rect x="160" y="60" width="110" height="80" rx="6" fill="#dff0ff" stroke="#3f6ad0" stroke-width="2"/>'+digit(215,110,'1914',24,'#2a4a86')+'<text x="215" y="130" text-anchor="middle" font-size="10" fill="#3f6ad0">facile !</text>') });
 P.push({ text:"Dans ce livre, une drôle d'énigme : si un couple de lapins en fait naître un autre chaque mois… combien à la fin de l'année ? La réponse forme une suite magique : <b>1, 1, 2, 3, 5, 8, 13…</b>, qu'on retrouve jusque dans les fleurs !", illus:SV(bg('#eaf6e6')+'<g fill="#f3f3f3" stroke="#cfcfcf">'+[[55,140],[80,140],[110,135],[150,130]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="9" ry="7"/><circle cx="'+(p[0]-6)+'" cy="'+(p[1]-7)+'" r="3"/><circle cx="'+(p[0]-2)+'" cy="'+(p[1]-9)+'" r="3"/>').join('')+'</g>'+(function(){const seq=[1,1,2,3,5,8,13];let s='';seq.forEach((n,i)=>{s+=digit(190+i*15,70,n,12,'#2a7a4a');});return s;})()+'<path d="M210 150 a26 26 0 1 1 -26 -26" fill="none" stroke="#e0a83a" stroke-width="3"/>') });
 P.push({ text:"Le changement ne fut pas facile : méfiantes, certaines villes <b>interdirent</b> même le zéro, qu'elles trouvaient « louche » ! Mais les chiffres arabes l'emportèrent : on calculait dix fois plus vite.", illus:SV(bg('#f1e6d0')+'<circle cx="120" cy="100" r="44" fill="none" stroke="#caa64e" stroke-width="8"/>'+digit(120,114,'0',42,'#b9893a')+'<circle cx="120" cy="100" r="56" fill="none" stroke="#cc3b3b" stroke-width="6"/><line x1="84" y1="64" x2="156" y2="136" stroke="#cc3b3b" stroke-width="6"/>'+'<g fill="#2a7a4a">'+digit(225,90,'+',16)+digit(225,120,'×',16)+'</g>') });
 P.push({ text:"Puis vinrent les <b>machines</b> : la <b>Pascaline</b> de Blaise Pascal (1642), puis, bien plus tard, les <b>ordinateurs</b>… qui calculent avec seulement deux chiffres : <b>0 et 1</b> !", illus:SV(bg('#e7e2d4')+'<rect x="40" y="90" width="90" height="46" rx="5" fill="#8a6a3a" stroke="#5a3f1e" stroke-width="2"/>'+(function(){let s='<g fill="#caa86f">';for(let i=0;i<4;i++)s+='<circle cx="'+(54+i*22)+'" cy="113" r="8"/>';return s+'</g>';})()+digit(85,82,'1642',11,'#5a3f1e')+'<rect x="180" y="74" width="86" height="60" rx="5" fill="#2a3450" stroke="#16306e" stroke-width="2"/><rect x="188" y="82" width="70" height="44" fill="#0c2a5a"/>'+digit(223,112,'0 1 0 1',13,'#5fd0ff')+'<rect x="206" y="134" width="34" height="10" fill="#2a3450"/>') });
 P.push({ text:"Des encoches sur un vieil os jusqu'aux ordinateurs, les nombres ont voyagé à travers le monde et les siècles. Et toi, quand tu calcules aujourd'hui, tu écris la suite de cette grande histoire ! ✨ <b>FIN</b>", illus:SV(bg('#10204a')+spiral(150,100)+'<g fill="#ffe07a"><path d="M150 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z"/></g>') });
 return { id:'prim_tale_numbers', title:"La Grande Histoire des Nombres", accent:'#3f6ad0', autoSpeak:false, pages:P };
})();

// ── Histoire collège (maths) : « La Saga des Porteurs de l'Armure » ─────
// Débloquée au clic sur l'Armure Solaire complète, le Titan Léthéas vaincu.
// Niveau fin de 3e. Chronique épique (mythologie du jeu).
const _COL_TALE_ARMOR = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#15131f')+'"/>';
 const titan=(cx,by,s,glow)=>{ s=s||1; const g='<g transform="translate('+cx+' '+by+') scale('+s+')">'
  +'<path d="M0 0 C-46 -6 -58 -70 -40 -120 C-30 -148 -16 -160 0 -162 C16 -160 30 -148 40 -120 C58 -70 46 -6 0 0 Z" fill="#0c0a16"/>'
  +'<path d="M-22 -150 q22 -22 44 0 q-10 -6 -22 -6 q-12 0 -22 6 Z" fill="#0c0a16"/>'
  +'<circle cx="-12" cy="-128" r="4.5" fill="'+(glow||'#b06cff')+'"/><circle cx="12" cy="-128" r="4.5" fill="'+(glow||'#b06cff')+'"/>'
  +'<g stroke="#2a2440" stroke-width="3" stroke-linecap="round" opacity=".7"><line x1="-44" y1="-70" x2="-72" y2="-58"/><line x1="44" y1="-70" x2="72" y2="-58"/></g>'
  +'</g>'; return g; };
 const armor=(cx,cy,s)=>{ s=s||1; return '<g transform="translate('+cx+' '+cy+') scale('+s+')">'
  +'<ellipse cx="0" cy="86" rx="40" ry="7" fill="#000" opacity=".3"/>'
  +'<circle cx="0" cy="-58" r="16" fill="#e8c24a" stroke="#fff6cc" stroke-width="1.5"/><path d="M-12 -62 a12 12 0 0 1 24 0 Z" fill="#caa23a"/>'
  +'<path d="M-26 -40 Q0 -50 26 -40 L30 36 Q0 50 -30 36 Z" fill="#f0c44a" stroke="#fff6cc" stroke-width="1.6"/>'
  +'<path d="M-26 -40 Q0 -50 26 -40 L24 -30 Q0 -40 -24 -30 Z" fill="#fffdf0" opacity=".5"/>'
  +'<circle cx="0" cy="-6" r="9" fill="#ffe89a" stroke="#7a5200" stroke-width="1.2"/><circle cx="0" cy="-6" r="4.5" fill="#ff8a3d"/>'
  +'<path d="M-26 -38 l-16 6 -2 50 16 2 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/><path d="M26 -38 l16 6 2 50 -16 2 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'<path d="M-18 38 q9 6 18 0 l-2 44 q-7 4 -14 0 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/><path d="M2 38 q9 6 18 0 l-2 44 q-7 4 -14 0 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'</g>'; };
 const sword=(cx,cy,s)=>{ s=s||1; return '<g transform="translate('+cx+' '+cy+') scale('+s+')">'
  +'<circle cx="0" cy="0" r="50" fill="#ffe89a" opacity=".25"/>'
  +'<polygon points="0,-70 7,-50 -7,-50" fill="#fffbe6"/>'
  +'<rect x="-7" y="-54" width="14" height="96" rx="3" fill="#fff2b8" stroke="#fff" stroke-width="1"/>'
  +'<line x1="0" y1="-50" x2="0" y2="40" stroke="#fff" stroke-width="1.4" opacity=".8"/>'
  +'<path d="M-24 44 q24 8 48 0 l-4 9 q-20 6 -40 0 Z" fill="#e8c24a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'<rect x="-5" y="50" width="10" height="22" rx="3" fill="#caa23a"/><circle cx="0" cy="78" r="7" fill="#ff8a3d" stroke="#fff6cc" stroke-width="1.2"/>'
  +'</g>'; };
 const dawn=()=>'<rect x="0" y="0" width="300" height="200" fill="#1a1830"/><path d="M0 130 H300 V200 H0 Z" fill="#241f3e"/><circle cx="150" cy="132" r="42" fill="#ffd24a"/><circle cx="150" cy="132" r="58" fill="#ffd24a" opacity=".25"/><path d="M0 132 H300" stroke="#caa23a" stroke-width="1" opacity=".5"/>';
 const halo=(c)=>'<circle cx="150" cy="100" r="92" fill="'+(c||'#caa23a')+'" opacity=".12"/>';

 const P=[];
 P.push({ text:"<b>La Saga des Porteurs de l'Armure</b> — Cette chronique, gravée à l'intérieur du plastron, n'apparaît qu'à celui qui a reconstitué l'Armure et terrassé le Titan. Tu peux enfin la lire.", illus:SV(bg('#13111d')+halo('#caa23a')+armor(150,100,1.0)) });
 P.push({ text:"Avant les royaumes, avant même les noms, il y avait l'Oubli. On l'appela plus tard <b>Léthéas, le Titan de l'Oubli</b>. Là où s'étendait son ombre, les peuples oubliaient leur langue, leurs ancêtres, jusqu'à leur propre visage.", illus:SV(bg('#0f0d1a')+titan(150,182,1.0)) });
 P.push({ text:"Ce que Léthéas dévorait n'était ni l'or ni le sang, mais la <b>mémoire</b>. Et il le savait : un peuple qui oublie son passé est un peuple sans avenir, aussi vide qu'une page effacée.", illus:'' });
 P.push({ text:"Une seule force résistait à l'Oubli : la <b>lumière</b>. Au sommet d'une montagne battue par les vents, un forgeron-sage, <b>Orïas</b>, recueillit un éclat tombé du soleil et le martela sur son enclume, mille jours et mille nuits durant.", illus:SV(bg('#1b1018')+'<g><circle cx="150" cy="120" r="26" fill="#ff8a3d" opacity=".5"/><rect x="96" y="120" width="108" height="30" rx="6" fill="#2a2230"/><rect x="120" y="104" width="60" height="20" rx="4" fill="#3a3040"/><circle cx="150" cy="114" r="9" fill="#ffd24a"/><g stroke="#ffb13d" stroke-width="2" stroke-linecap="round"><line x1="150" y1="100" x2="146" y2="88"/><line x1="158" y1="102" x2="162" y2="90"/><line x1="142" y1="102" x2="136" y2="92"/></g><rect x="184" y="74" width="9" height="34" rx="3" fill="#6a4a2a" transform="rotate(28 188 90)"/><rect x="196" y="70" width="22" height="12" rx="3" fill="#8a8a92" transform="rotate(28 207 76)"/></g>') });
 P.push({ text:"De ce feu naquit l'<b>Armure Solaire</b> : six pièces, six pouvoirs, et un serment gravé contre le cœur — « <i>Tant qu'un seul se souviendra, l'Oubli ne vaincra pas.</i> »", illus:SV(bg('#13111d')+halo()+armor(150,100,1.05)) });
 P.push({ text:"Mais Orïas était trop vieux pour la revêtir. Il comprit alors la vérité qui ferait sa force comme sa fragilité : l'Armure ne serait jamais l'affaire d'un seul. Elle devrait se <b>transmettre</b>, d'épaule en épaule, à travers les âges.", illus:'' });
 P.push({ text:"<b>Première porteuse — l'Antiquité.</b> Ce fut <b>Cassia l'Archiviste</b>, gardienne de la grande bibliothèque de Mémosa. Quand l'ombre du Titan tomba sur la cité, les habitants oublièrent jusqu'au nom de leurs enfants.", illus:SV(bg('#171426')+'<g stroke="#caa23a" stroke-width="3" fill="none">'+[60,110,160,210,250].map(x=>'<line x1="'+x+'" y1="70" x2="'+x+'" y2="150"/>').join('')+'</g><rect x="44" y="60" width="222" height="12" fill="#b89540"/><rect x="44" y="150" width="222" height="10" fill="#9a7a30"/><rect x="120" y="96" width="56" height="40" rx="3" fill="#e8d8a8"/><line x1="148" y1="96" x2="148" y2="136" stroke="#9a7a30"/></g>') });
 P.push({ text:"Revêtant l'Armure, Cassia illumina les rues et, toute la nuit, lut à voix haute chaque nom inscrit dans ses registres. Un à un, les habitants se souvinrent. Au matin, Mémosa avait retrouvé sa mémoire — mais Cassia, épuisée, savait qu'elle ne tiendrait pas un second assaut.", illus:'' });
 P.push({ text:"Elle confia l'Armure à un jeune messager et lui fit prêter le serment. « Ce n'est pas la force qui fait le porteur, lui dit-elle, mais le <b>refus d'oublier</b>. »", illus:'' });
 P.push({ text:"<b>Deuxième porteur — le Moyen Âge.</b> L'Oubli revint sous la forme d'une étrange fièvre : dans tout un royaume, les chroniques s'effaçaient et les gens perdaient le fil de leur histoire. <b>Sire Aldric</b> reçut l'Armure d'un moine mourant.", illus:SV(bg('#141220')+'<path d="M0 150 H300 V200 H0 Z" fill="#241f33"/><rect x="20" y="150" width="100" height="12" fill="#3a3145"/><rect x="180" y="150" width="100" height="12" fill="#3a3145"/><rect x="120" y="150" width="60" height="14" fill="#2a2230"/>'+armor(150,118,0.62)+'<rect x="150" y="80" width="3" height="40" fill="#caa23a"/>') });
 P.push({ text:"Tandis que des moines copiaient en hâte les derniers livres, Aldric tint seul un pont étroit contre les spectres de l'Oubli. Quand les cartes elles-mêmes s'effacèrent dans le brouillard, le <b>casque</b> de l'Armure lui souffla le chemin du retour.", illus:'' });
 P.push({ text:"Grièvement blessé, il remit l'Armure à une jeune paysanne qui, seule au village, savait lire. À ceux qui s'en étonnaient, il répondit : « L'Armure ne se mérite pas par la naissance, mais par ce qu'on accepte de <b>sauvegarder</b>. »", illus:'' });
 P.push({ text:"<b>Troisième porteuse — la Renaissance.</b> En un temps de redécouvertes, <b>Livia</b> servait dans un atelier d'<b>imprimerie</b>. Elle comprit la première qu'une arme nouvelle venait de naître contre le Titan : la <b>copie</b>.", illus:SV(bg('#1a1726')+'<rect x="96" y="60" width="108" height="78" rx="4" fill="#5a4a2e" stroke="#caa23a" stroke-width="2"/><rect x="110" y="74" width="80" height="40" fill="#2a2230"/><rect x="118" y="50" width="64" height="14" fill="#3a3040"/><g fill="#efe6cf">'+[ [40,150],[70,160],[230,150],[260,162],[150,168]].map(p=>'<rect x="'+p[0]+'" y="'+p[1]+'" width="22" height="16" rx="1" transform="rotate('+((p[0]%30)-12)+' '+p[0]+' '+p[1]+')"/>').join('')+'</g>') });
 P.push({ text:"Là où l'Oubli ne pouvait brûler qu'un livre à la fois, Livia en imprima des milliers, qu'elle dispersa aux quatre coins du monde. « Désormais, dit-elle, pour effacer un savoir, il faudrait tous nous effacer. »", illus:'' });
 P.push({ text:"Elle passa l'Armure en murmurant le serment, qui s'allongeait à présent de tous les noms de celles et ceux qui l'avaient porté avant elle.", illus:'' });
 P.push({ text:"<b>Quatrième porteur — le siècle des Lumières.</b> Vint <b>Augustin</b>, l'un de ces savants qui rêvaient de rassembler toutes les connaissances humaines en un seul grand ouvrage, afin que nul ne puisse plus les confisquer.", illus:SV(bg('#17131f')+'<g><path d="M150 60 l18 10 0 60 -18 10 -18 -10 0 -60 Z" fill="#2a2230" stroke="#caa23a" stroke-width="1.6"/><circle cx="150" cy="104" r="14" fill="#ffd24a"/><circle cx="150" cy="104" r="20" fill="#ffd24a" opacity=".25"/><rect x="146" y="118" width="8" height="24" fill="#5a4a2e"/></g><g fill="#e8d8a8">'+[[70,150],[210,150]].map(p=>'<rect x="'+p[0]+'" y="'+p[1]+'" width="26" height="34" rx="2"/>').join('')+'</g>') });
 P.push({ text:"Quand un pouvoir tyrannique voulut effacer l'histoire d'un peuple entier, Augustin, sous l'Armure, mit les archives à l'abri et alluma la « lanterne de mémoire » : la preuve que la lumière d'un seul peut traverser les nuits les plus noires.", illus:'' });
 P.push({ text:"À sa suite, l'Armure traversa les révolutions et les empires, portée par des héros dont l'Histoire, ironie de l'Oubli, n'a pas toujours retenu le nom — mais l'Armure, elle, se souvient de chacun.", illus:'' });
 P.push({ text:"<b>Cinquième porteuse — l'époque des machines.</b> En un siècle de fer, de vitesse et de guerres, des villes entières furent rasées, et avec elles leurs registres. <b>Nora</b> porta l'Armure parmi les décombres.", illus:'' });
 P.push({ text:"Elle ne sauva ni trône ni trésor, mais des <b>témoignages</b> : des lettres, des photographies, des voix. « Tant qu'un seul témoin parle, répétait-elle, l'Oubli recule d'un pas. »", illus:'' });
 P.push({ text:"Puis l'Armure parvint jusqu'à notre temps. Et c'est ici que la chronique cesse de parler du passé… pour parler de <b>toi</b>.", illus:'' });
 P.push({ text:"Car Léthéas, mille fois repoussé, n'était pas mort : l'Oubli ne meurt pas, il <b>attend</b>. À notre époque, il se réveilla plus puissant que jamais.", illus:SV(bg('#0e0c18')+titan(150,188,1.18,'#c46bff')) });
 P.push({ text:"Mais il avait appris à se déguiser. Non plus en ombre terrifiante, mais en <b>distraction</b> : un flot ininterrompu de bruits et d'images, si rapide qu'on oublie aussitôt ce que l'on vient de voir. Le plus dangereux des oublis est celui que l'on ne remarque même pas.", illus:'' });
 P.push({ text:"C'est alors que l'Armure choisit son nouveau porteur : <b>toi</b>, {hero}. Pièce après pièce, île après île, épreuve après épreuve, tu l'as patiemment reconstituée.", illus:SV(bg('#13111d')+halo('#ffd24a')+armor(150,100,1.05)) });
 P.push({ text:"Et lorsque la dernière pièce, le casque, s'ajusta sur ton front, une lumière jaillit dans ta main : la <b>Lame d'Aurore</b>, forgée par Orïas pour le jour — ce jour — où il faudrait affronter le Titan en personne.", illus:SV(bg('#120f1d')+sword(150,100,1.0)) });
 P.push({ text:"Léthéas se dressa, immense, et prononça le plus terrible de ses sortilèges : il te fit oublier ton propre <b>nom</b>. Un instant, tu vacillas, ne sachant plus qui tu étais, ni pourquoi tu te battais.", illus:SV(bg('#0e0c18')+titan(150,190,1.25,'#c46bff')) });
 P.push({ text:"Mais le serment gravé contre ton cœur se mit à briller. Tu te souvins : de la forge d'Orïas, de Cassia, d'Aldric, de Livia, d'Augustin, de Nora — de <b>tous</b> les porteurs. Et en te souvenant d'eux, tu te souvins enfin de <b>toi</b>.", illus:'' });
 P.push({ text:"D'un seul éclat de la Lame d'Aurore, tu déchiras l'ombre. Léthéas ne fut pas anéanti — l'Oubli ne se tue pas — mais <b>repoussé</b>, renvoyé attendre dans les ténèbres, vaincu une fois encore.", illus:SV(bg('#1a1226')+sword(108,100,0.9)+titan(238,196,0.7,'#5a3a7a')+'<path d="M150 40 L150 170" stroke="#ffe89a" stroke-width="3" opacity=".5"/>') });
 P.push({ text:"Tu connais désormais le secret de l'Armure : sa véritable puissance n'est pas dans son or ni dans sa lame, mais dans la <b>chaîne ininterrompue</b> de celles et ceux qui, de siècle en siècle, ont refusé d'oublier.", illus:SV(dawn()+armor(150,118,0.7)) });
 P.push({ text:"Un jour, à ton tour, tu transmettras l'Armure et le serment à qui saura le tenir. Car tant qu'un seul se souviendra… l'Oubli ne vaincra jamais. ✨ <b>FIN</b>", illus:SV(dawn()) });
 return { id:'col_tale_armor', title:"La Saga des Porteurs de l'Armure", accent:'#caa64e', autoSpeak:false, pages:P };
})();

function _openBookTale(){
 try{
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(()=>{ try{
    var tale = (typeof _STORY!=='undefined' && _STORY && _STORY.bookTale) ? _STORY.bookTale
             : (typeof _MAT_STORY_FR!=='undefined' && _MAT_STORY_FR.bookTale ? _MAT_STORY_FR.bookTale : null);
    if(tale && typeof _showStoryModal==='function') _showStoryModal(tale, null);
  }catch(e){} }, 320);
 }catch(e){}
}
function _advBookHtml(){
 const got = _ADV_MAT_ORDER.map(rid => _regionConquered(rid));
 const n = got.filter(Boolean).length;                 // pages retrouvées (0..6)
 const done = got.every(Boolean);
 const seen = (P && P.storySeen) || [];
 const taleSeen = seen.includes('matfr_booktale');
 // Couleur propre à chaque monde (chatoyant) une fois la page acquise.
 const WORLD=[{c:'#2ecc71',r:'#1e8e4e'},{c:'#ff7fb0',r:'#c64d80'},{c:'#f5a623',r:'#b9791a'},{c:'#3aa0e8',r:'#1f6fb0'},{c:'#9b6fdf',r:'#6e47ac'},{c:'#e74c5b',r:'#b02a38'}];
 const memb=(i,x,y,em)=>{
  if(i===0) return `<g fill="${em}"><circle cx="${x}" cy="${y+1}" r="3.8"/><circle cx="${x-3.3}" cy="${y-2.8}" r="1.7"/><circle cx="${x+3.3}" cy="${y-2.8}" r="1.7"/></g>`;
  if(i===1) return `<g fill="${em}"><circle cx="${x}" cy="${y}" r="1.7"/><circle cx="${x}" cy="${y-3.3}" r="1.7"/><circle cx="${x}" cy="${y+3.3}" r="1.7"/><circle cx="${x-3.3}" cy="${y}" r="1.7"/><circle cx="${x+3.3}" cy="${y}" r="1.7"/></g>`;
  if(i===2) return `<g fill="${em}"><ellipse cx="${x-2}" cy="${y+3}" rx="2.3" ry="1.7"/><rect x="${x-0.1}" y="${y-4}" width="1.5" height="7.3"/><path d="M${x+1.4} ${y-4} q3.8 0 3.8 2.8 q-1.9 -1.9 -3.8 -1 Z"/></g>`;
  if(i===3) return `<path d="M${x} ${y-4.4} q3.9 5 0 9 q-3.9 -4 0 -9 Z" fill="${em}"/>`;
  if(i===4) return `<path d="M${x} ${y-4.6} l1.3 3.2 3.5 0 -2.8 2.2 1.1 3.3 -3.1 -2.1 -3.1 2.1 1.1 -3.3 -2.8 -2.2 3.5 0 Z" fill="${em}"/>`;
  return `<text x="${x}" y="${y+4}" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="${em}">A</text>`;
 };
 const coin=(i,x,y,on)=>{
  const w=WORLD[i], fill=on?w.c:'#cdd0c9', rim=on?w.r:'#a6a89e', em=on?'#ffffff':'#eef0ea';
  return `<circle cx="${x}" cy="${y}" r="12.5" fill="${rim}"/><circle cx="${x}" cy="${y}" r="11" fill="${fill}"/>`
   +`<ellipse cx="${x}" cy="${y-4}" rx="7" ry="3.4" fill="#ffffff" opacity="${on?0.28:0.16}"/>`+memb(i,x,y,em);
 };
 let coins=''; const cxs=[32,66,100,134,168,202]; for(let i=0;i<6;i++){ coins+=coin(i,cxs[i],194,i<n); }
 const glow = done ? ' filter="drop-shadow(0 3px 8px rgba(255,210,90,.5))"' : '';
 const msg = (done && taleSeen) ? "Le Livre est complet — touche-le pour réécouter son histoire 📖"
  : done ? "Le Livre est complet ! Touche-le pour écouter son histoire ✨"
  : n>0 ? `${n} page${n>1?'s':''} retrouvée${n>1?'s':''} — continue, page après page !`
  : "Retrouve les mots, monde après monde !";
 const clickable = done ? `onclick="_openBookTale()" role="button" tabindex="0" title="Écouter l'histoire du Livre" style="cursor:pointer"` : '';
 const haloR = done ? `<ellipse cx="120" cy="100" rx="112" ry="92" fill="url(#gbGlo)"/>` : '';
 return `
  <div class="advlog-section-title">📖 Le Grand Livre</div>
  <div class="advcol-box advcol-mat${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 240 212" class="advcol-svg"${glow} aria-label="Le Grand Livre : ${n} pages sur 6">
    <defs>
     <linearGradient id="gbLea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6678ec"/><stop offset=".5" stop-color="#3a44ad"/><stop offset="1" stop-color="#232a86"/></linearGradient>
     <linearGradient id="gbGld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeead"/><stop offset=".5" stop-color="#e6bd58"/><stop offset="1" stop-color="#bd8f2e"/></linearGradient>
     <linearGradient id="gbPag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff9ec"/><stop offset="1" stop-color="#f0e2bf"/></linearGradient>
     <linearGradient id="gbEdg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efe3c4"/><stop offset="1" stop-color="#cdb98c"/></linearGradient>
     <linearGradient id="gbVal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#6b5a2e" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
     <radialGradient id="gbGlo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
     <radialGradient id="gbSky" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#dff0ff"/><stop offset="1" stop-color="#bfe3c8"/></radialGradient>
    </defs>
    ${haloR}
    <ellipse cx="122" cy="174" rx="94" ry="10" fill="#000000" opacity="0.16"/>
    <rect x="26" y="27" width="188" height="138" rx="9" fill="#1a2070"/>
    <rect x="26" y="26" width="188" height="136" rx="9" fill="url(#gbLea)"/>
    <rect x="27" y="27" width="186" height="3" rx="2" fill="#ffffff" opacity="0.16"/>
    <rect x="32" y="32" width="176" height="124" rx="6" fill="none" stroke="url(#gbGld)" stroke-width="2"/>
    <rect x="36" y="36" width="168" height="116" rx="4" fill="none" stroke="url(#gbGld)" stroke-width=".7"/>
    <g fill="url(#gbGld)"><path d="M32 32 h12 v2.4 h-9.6 v9.6 h-2.4 z"/><path d="M208 32 h-12 v2.4 h9.6 v9.6 h2.4 z"/><path d="M32 156 h12 v-2.4 h-9.6 v-9.6 h-2.4 z"/><path d="M208 156 h-12 v-2.4 h9.6 v9.6 h2.4 z"/></g>
    <rect x="33" y="39" width="174" height="117" rx="4" fill="url(#gbEdg)"/>
    <g stroke="#cbb88c" stroke-width="0.6" opacity="0.7"><line x1="36" y1="154" x2="204" y2="154"/><line x1="38" y1="157" x2="202" y2="157"/></g>
    <path d="M40 42 Q37 100 40 156 L118 156 Q121 100 118 42 Z" fill="url(#gbPag)" stroke="#e3d3a8" stroke-width="1"/>
    <path d="M122 42 Q119 100 122 156 L200 156 Q203 100 200 42 Z" fill="url(#gbPag)" stroke="#e3d3a8" stroke-width="1"/>
    <rect x="117" y="42" width="6" height="114" fill="url(#gbVal)"/>
    <g><rect x="50" y="52" width="58" height="34" rx="4" fill="url(#gbSky)" stroke="#cdbf94" stroke-width="1"/><ellipse cx="79" cy="84" rx="30" ry="9" fill="#86c98a"/><rect x="93" y="72" width="3" height="12" fill="#8a5a2a"/><circle cx="94.5" cy="69" r="7" fill="#4aa85f"/><circle cx="70" cy="79" r="6" fill="#8a5a2a"/><circle cx="70" cy="73.5" r="4.6" fill="#a06a34"/><circle cx="67.6" cy="73" r="1" fill="#2a1a0a"/><circle cx="72.4" cy="73" r="1" fill="#2a1a0a"/><circle cx="66.6" cy="69.5" r="1.6" fill="#a06a34"/><circle cx="73.4" cy="69.5" r="1.6" fill="#a06a34"/></g>
    <g stroke="#c79a3a" stroke-width="1" opacity="0.6"><line x1="50" y1="96" x2="108" y2="96"/><line x1="50" y1="101" x2="100" y2="101"/><line x1="50" y1="106" x2="108" y2="106"/></g>
    <g><path d="M134 96 a30 30 0 0 1 60 0" fill="none" stroke="#e74c3c" stroke-width="3.4"/><path d="M138 96 a26 26 0 0 1 52 0" fill="none" stroke="#f1c40f" stroke-width="3.4"/><path d="M142 96 a22 22 0 0 1 44 0" fill="none" stroke="#2ecc71" stroke-width="3.4"/><path d="M146 96 a18 18 0 0 1 36 0" fill="none" stroke="#3498db" stroke-width="3.4"/><ellipse cx="164" cy="96" rx="22" ry="6" fill="#86c98a"/><circle cx="150" cy="66" r="5" fill="#fff6c8"/></g>
    <g stroke="#c79a3a" stroke-width="1" opacity="0.6"><line x1="132" y1="110" x2="196" y2="110"/><line x1="132" y1="115" x2="186" y2="115"/><line x1="132" y1="120" x2="196" y2="120"/></g>
    <path d="M117 26 L123 26 L123 64 L120 59 L117 64 Z" fill="#c0392b"/><path d="M120 26 L123 26 L123 64 L120 59 Z" fill="#9b2620"/>
    <path d="M58 8 L182 8 Q190 16 182 24 L58 24 Q50 16 58 8 Z" fill="url(#gbGld)" stroke="#a9781f" stroke-width="1"/>
    <path d="M58 8 L46 14 L58 20 Z" fill="#a9781f"/><path d="M182 8 L194 14 L182 20 Z" fill="#a9781f"/>
    <text x="120" y="20" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#5a3d12">Le Grand Livre du Conteur</text>
    ${coins}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 6</b></div>
  </div>`;
}
// ── Carnet primaire FR : le Journal intime du héros ─────────────────
// Couverture de journal intime ornée du médaillon des Gardiens (insigne 3),
// avec un petit super-héros au centre (le héros est fan de ses héros !).
// 5 pierres de district se dorent et révèlent leur emblème ; au complet le
// médaillon rayonne. Cliquable une fois Babel vaincu → Histoire B.
function _advBadgeHtml(){
 const order = (typeof _ADV_MAT_ORDER!=='undefined') ? _ADV_MAT_ORDER : ['cp','ce1','ce2','cm1','cm2','final'];
 const got = order.map(rid => _regionConquered(rid));
 const nD = got.slice(0,5).filter(Boolean).length;   // districts libérés (0..5)
 const islandDone = !!got[5];
 const done = got.every(Boolean);
 const n = got.filter(Boolean).length;
 const seen = (P && P.storySeen) || [];
 const taleSeen = seen.includes('primfr_booktale');
 const gold = '#e9c64a';
 // emblème de chaque district : sons, lecture, vocabulaire, temps, phrase
 const glyph = (i,x,y,on)=>{
  const c = on ? '#5a3e0a' : '#9aa0b0';
  if(i===0) return `<g fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"><circle cx="${x-4}" cy="${y}" r="1.3" fill="${c}"/><path d="M${x-1} ${y-3} a4 4 0 0 1 0 6"/><path d="M${x+2} ${y-5} a7 7 0 0 1 0 10"/></g>`;
  if(i===1) return `<g fill="${c}"><path d="M${x-5} ${y-3} q5 -2 5 0 v6 q-5 -2 -5 0 Z"/><path d="M${x+5} ${y-3} q-5 -2 -5 0 v6 q5 -2 5 0 Z"/></g>`;
  if(i===2) return `<g fill="none" stroke="${c}" stroke-width="1.5"><circle cx="${x-2}" cy="${y-2}" r="2.6"/><path d="M${x} ${y} l4 4 M${x+3} ${y+3} l1.6 -1.6"/></g>`;
  if(i===3) return `<path d="M${x-3.5} ${y-4} h7 l-7 8 h7" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`;
  return `<g fill="${c}"><rect x="${x-5}" y="${y-1.6}" width="3" height="3" rx="1"/><rect x="${x-1.5}" y="${y-1.6}" width="3" height="3" rx="1"/><rect x="${x+2}" y="${y-1.6}" width="3" height="3" rx="1"/></g>`;
 };
 const star = (x,y,c,s)=>{ s=s||4; return `<path d="M${x} ${y-s} l${s*0.34} ${s} ${s} ${s*0.34} -${s*0.82} ${s*0.62} ${s*0.3} ${s} -${s*0.82} -${s*0.6} -${s*0.82} ${s*0.6} ${s*0.3} -${s} -${s*0.82} -${s*0.62} ${s} -${s*0.34} Z" fill="${c}"/>`; };
 // super-héros au centre du médaillon (cape, masque, poing levé)
 const hero = (cx,cy)=>`<g>`
  +`<path d="M${cx-9} ${cy-9} q-12 14 -3 30 l7 -7 q-3 -12 3 -19 Z" fill="#8e1a20"/>`
  +`<path d="M${cx+9} ${cy-9} q12 14 3 30 l-7 -7 q3 -12 -3 -19 Z" fill="#b5232b"/>`
  +`<rect x="${cx-4.5}" y="${cy+11}" width="4" height="10" rx="1.5" fill="#16306e"/><rect x="${cx+0.5}" y="${cy+11}" width="4" height="10" rx="1.5" fill="#16306e"/>`
  +`<rect x="${cx-5.5}" y="${cy+19}" width="5.5" height="4" rx="1.5" fill="#b5232b"/><rect x="${cx}" y="${cy+19}" width="5.5" height="4" rx="1.5" fill="#b5232b"/>`
  +`<path d="M${cx-7} ${cy-3} q7 -3 14 0 l-2 16 h-10 Z" fill="#2e57c8"/>`
  +star(cx,cy+4,gold,3.2)
  +`<path d="M${cx-6} ${cy-1} l-7 7" stroke="#2e57c8" stroke-width="3.4" stroke-linecap="round"/><circle cx="${cx-14}" cy="${cy+7}" r="2.4" fill="#f2c79b"/>`
  +`<path d="M${cx+6} ${cy-2} l9 -11" stroke="#2e57c8" stroke-width="3.4" stroke-linecap="round"/><circle cx="${cx+16}" cy="${cy-14}" r="3" fill="#f2c79b"/>`
  +`<circle cx="${cx}" cy="${cy-12}" r="6.2" fill="#f2c79b"/>`
  +`<path d="M${cx-6.4} ${cy-15} q6.4 -6 12.8 0 q-2 -3 -6.4 -3 q-4.4 0 -6.4 3 Z" fill="#16306e"/>`
  +`<rect x="${cx-6.4}" y="${cy-13}" width="12.8" height="3.6" rx="1.8" fill="#16306e"/>`
  +`<circle cx="${cx-2.6}" cy="${cy-11.2}" r="1" fill="#fff"/><circle cx="${cx+2.6}" cy="${cy-11.2}" r="1" fill="#fff"/>`
  +`</g>`;
 const cx=100, cy=132, R=46, ang=[-90,-18,54,126,198];
 let slots=''; for(let i=0;i<5;i++){ const a=ang[i]*Math.PI/180, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a), on=got[i];
  slots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${on?'#f1d979':'#cfd5e6'}" stroke="${on?'#b8902a':'#aab2c8'}" stroke-width="2"/>`+glyph(i,x,y,on); }
 const rays = done ? `<g stroke="${gold}" stroke-width="2.6" stroke-linecap="round" opacity=".75">`+[0,45,90,135,180,225,270,315].map(d=>{ const a=d*Math.PI/180; return `<line x1="${(cx+60*Math.cos(a)).toFixed(1)}" y1="${(cy+60*Math.sin(a)).toFixed(1)}" x2="${(cx+70*Math.cos(a)).toFixed(1)}" y2="${(cy+70*Math.sin(a)).toFixed(1)}"/>`; }).join('')+`</g>` : '';
 const glow = done ? ' filter="drop-shadow(0 4px 12px rgba(233,198,74,.5))"' : '';
 const msg = (done && taleSeen) ? "Journal complet — touche-le pour relire le dossier du Docteur Babel 📖"
  : done ? "Tu es Gardien de l'Alphabet ! Touche le journal pour lire le dossier secret 🦸"
  : nD>0 ? `${nD} district${nD>1?'s':''} libéré${nD>1?'s':''} — le médaillon se forge !`
  : "Libère les districts de Verbopolis, un par un !";
 const clickable = done ? `onclick="_openBookTale()" role="button" tabindex="0" title="Lire le dossier du Docteur Babel" style="cursor:pointer"` : '';
 const _hn = (typeof P!=='undefined' && P && P.name) ? String(P.name) : 'le héros';
 const heroEsc = _hn.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 return `
  <div class="advlog-section-title">📔 Le Journal intime</div>
  <div class="advcol-box advcol-mat${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 200 256" class="advcol-svg"${glow} aria-label="Le Journal intime : ${n} sur 6">
    <defs>
     <linearGradient id="jcLeather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a2a3b"/><stop offset=".5" stop-color="#6e1f2e"/><stop offset="1" stop-color="#46121d"/></linearGradient>
     <linearGradient id="jcSpine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#360c15"/><stop offset="1" stop-color="#5c1824"/></linearGradient>
     <radialGradient id="jcGlow" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#a83249" stop-opacity=".5"/><stop offset="1" stop-color="#6e1f2e" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="98" cy="248" rx="80" ry="9" fill="#000" opacity=".28"/>
    <rect x="168" y="26" width="13" height="206" rx="3" fill="#c9bb95"/>
    <rect x="166" y="23" width="13" height="208" rx="3" fill="#e3d7b3"/>
    <rect x="164" y="20" width="13" height="210" rx="3" fill="#f5ecd2" stroke="#d8c79c" stroke-width=".6"/>
    <g stroke="#d8c79c" stroke-width=".5" opacity=".7"><line x1="166" y1="44" x2="176" y2="44"/><line x1="166" y1="74" x2="176" y2="74"/><line x1="166" y1="120" x2="176" y2="120"/><line x1="166" y1="178" x2="176" y2="178"/><line x1="166" y1="208" x2="176" y2="208"/></g>
    <rect x="18" y="14" width="150" height="226" rx="13" fill="url(#jcLeather)" stroke="#2a0a12" stroke-width="3"/>
    <rect x="18" y="14" width="150" height="226" rx="13" fill="url(#jcGlow)"/>
    <rect x="18" y="14" width="22" height="226" rx="11" fill="url(#jcSpine)"/>
    <line x1="40" y1="18" x2="40" y2="236" stroke="#2a0a12" stroke-width="1.3" opacity=".55"/>
    <rect x="23" y="18" width="140" height="218" rx="10" fill="none" stroke="#cf6f86" stroke-width="1.2" opacity=".35"/>
    <rect x="25" y="20" width="136" height="214" rx="9" fill="none" stroke="#360c15" stroke-width="1.2" opacity=".5"/>
    <rect x="30" y="26" width="126" height="202" rx="8" fill="none" stroke="${gold}" stroke-width="1.3" stroke-dasharray="2 4" opacity=".75"/>
    <text x="100" y="41" text-anchor="middle" font-size="13" font-weight="bold" fill="${gold}" font-family="Georgia,serif">Journal intime</text>
    <text x="100" y="56" text-anchor="middle" font-size="11" fill="#f0d98a" font-family="Georgia,serif">de ${heroEsc}</text>
    <text x="100" y="226" text-anchor="middle" font-size="8.6" fill="#e7b9c4" font-family="Georgia,serif">— Gardiens de l'Alphabet —</text>
    <rect x="158" y="14" width="6" height="226" rx="2" fill="#2a0a12" opacity=".7"/>
    <rect x="158.6" y="14" width="2" height="226" fill="#7a2a3a" opacity=".5"/>
    ${rays}
    <circle cx="${cx}" cy="${cy}" r="55" fill="#000" opacity=".22"/>
    <circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="${gold}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="52" fill="#b5232b" stroke="#7a141a" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="42" fill="#1c3f8f" stroke="${gold}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="34" fill="#24499a"/>
    <ellipse cx="${cx}" cy="${cy-12}" rx="28" ry="14" fill="#3a62c8" opacity=".35"/>
    ${hero(cx,cy)}
    ${slots}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 6</b></div>
  </div>`;
}
// ── Carnet collège : l'Armure Solaire ───────────────────────────────
function _advArmorHtml(){
 const got = {}; _ADV_COL_ORDER.forEach((rid,i)=>{ got[_ADV_COL_PIECES[i].key] = _regionConquered(rid); });
 const count = Object.values(got).filter(Boolean).length;
 const sword = count>=6;
 const v = k => got[k] ? '' : 'style="display:none"';   // pièce
 const l = k => got[k] ? 'style="display:none"' : '';   // verrou
 const powers = _ADV_COL_PIECES.map(p=>`
   <div class="advcol-power ${got[p.key]?'on':''}">
    <span class="advcol-gem" style="background:${p.gem}"></span> ${p.power}
    <span class="advcol-eff">· ${got[p.key]?p.eff:'verrouillé'}</span>
   </div>`).join('');
 const ult = sword
  ? `<div class="advcol-ult on">⚔️ <b>Lame d'Aurore</b> — puissance à son paroxysme. Prêt pour le Titan.</div>`
  : `<div class="advcol-ult">⚔️ <b>Lame d'Aurore</b> — apparaît quand l'armure est complète.</div>`;
 const titanDone = _regionConquered('titan');
 const seenC=(P&&P.storySeen)||[]; const taleSeenC=seenC.includes('col_tale_armor');
 const clickableC = titanDone ? `onclick="_openTaleIllus(_COL_TALE_ARMOR)" role="button" tabindex="0" title="Lire La Saga des Porteurs de l'Armure" style="cursor:pointer"` : '';
 const sagaInvite = titanDone ? `<div class="advcol-caption">${taleSeenC?"Titan vaincu — touche l'Armure pour relire la Saga 📖":"Titan vaincu ! Touche l'Armure pour lire la Saga des Porteurs ⚔️📜"}</div>` : '';
 return `
  <div class="advlog-section-title">🛡️ Armure Solaire <span class="advcol-count">${count} / 6 pièces</span></div>
  <div class="advcol-box advcol-col${titanDone?' advbook-done':''}" ${clickableC}>
   <svg viewBox="0 0 300 340" class="advcol-svg" aria-label="Armure Solaire : ${count} pièces sur 6">
    <defs>
     <radialGradient id="acAura" cx="50%" cy="38%" r="60%"><stop offset="0%" stop-color="#ffe89a" stop-opacity=".62"/><stop offset="45%" stop-color="#d4a017" stop-opacity=".18"/><stop offset="100%" stop-color="#d4a017" stop-opacity="0"/></radialGradient>
     <linearGradient id="acGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="20%" stop-color="#ffe89a"/><stop offset="52%" stop-color="#f0c44a"/><stop offset="80%" stop-color="#a96f0c"/><stop offset="100%" stop-color="#5e3a00"/></linearGradient>
     <radialGradient id="acDome" cx="36%" cy="28%" r="85%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="32%" stop-color="#ffe89a"/><stop offset="68%" stop-color="#e0a82a"/><stop offset="90%" stop-color="#9a6606"/><stop offset="100%" stop-color="#5e3a00"/></radialGradient>
     <linearGradient id="acGoldH" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="50%" stop-color="#f3cf63"/><stop offset="100%" stop-color="#8a5d06"/></linearGradient>
     <radialGradient id="acRuby" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff0f0"/><stop offset="35%" stop-color="#ff5a6e"/><stop offset="100%" stop-color="#7a0016"/></radialGradient>
     <radialGradient id="acSaph" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#eaf6ff"/><stop offset="35%" stop-color="#4da3ff"/><stop offset="100%" stop-color="#0a2f7a"/></radialGradient>
     <radialGradient id="acEmer" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#eafff2"/><stop offset="35%" stop-color="#3ddc84"/><stop offset="100%" stop-color="#0a5a2a"/></radialGradient>
     <radialGradient id="acAmet" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#f6ecff"/><stop offset="35%" stop-color="#b06cff"/><stop offset="100%" stop-color="#3a0a7a"/></radialGradient>
     <radialGradient id="acTopz" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff6d6"/><stop offset="35%" stop-color="#ffb13d"/><stop offset="100%" stop-color="#7a4400"/></radialGradient>
     <radialGradient id="acDiam" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#bfe9ff"/><stop offset="100%" stop-color="#4f86b0"/></radialGradient>
     <linearGradient id="acBlade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#ffe89a"/><stop offset="100%" stop-color="#ff8a3d"/></linearGradient>
     <linearGradient id="acRivet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="100%" stop-color="#8a5e10"/></linearGradient>
    </defs>
    <ellipse cx="150" cy="168" rx="128" ry="160" fill="url(#acAura)" opacity="${(0.15+count*0.14).toFixed(2)}"/>
    <g fill="#2a3450" stroke="#3a4670" stroke-width="1.4">
     <circle cx="150" cy="52" r="25"/>
     <path d="M118 92 Q150 84 182 92 L188 168 Q150 186 112 168 Z"/>
     <rect x="86" y="98" width="20" height="78" rx="10"/><rect x="194" y="98" width="20" height="78" rx="10"/>
     <path d="M122 168 q14 8 28 0 l-2 130 q-13 8 -25 0 Z"/><path d="M150 168 q14 8 28 0 l-2 130 q-13 8 -25 0 Z"/>
    </g>
    <g ${l('legL')}><path d="M122 168 q14 8 28 0 l-2 132 q-13 8 -25 0 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('legR')}><path d="M150 168 q14 8 28 0 l-2 132 q-13 8 -25 0 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('armL')}><path d="M104 90 l-22 6 -2 86 24 2 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('armR')}><path d="M196 90 l22 6 2 86 -24 2 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('torso')}><path d="M114 86 Q150 78 186 86 L192 170 Q150 190 108 170 Z" fill="none" stroke="#caa64e" stroke-width="1.5" stroke-dasharray="5 4"/></g>
    <g ${l('helm')}><path d="M120 56 a30 30 0 0 1 60 0 q0 18 -10 26 l-40 0 q-10 -8 -10 -26 Z" fill="none" stroke="#caa64e" stroke-width="1.6" stroke-dasharray="5 4"/></g>
    <g ${v('legL')} class="advcol-piece">
     <path d="M120 166 q15 9 30 0 l-3 52 q-12 6 -24 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M122 168 q14 7 27 0 l-1 6 q-13 6 -25 0 Z" fill="#fffdf0" opacity=".4"/>
     <path d="M121 212 q14 6 28 0 l-1 6 q-13 6 -26 0 Z" fill="#3a2600" opacity=".3"/>
     <g stroke="#fff6cc" stroke-width="1.4" stroke-linecap="round" opacity=".85"><line x1="135" y1="205" x2="135" y2="210"/><line x1="135" y1="226" x2="135" y2="231"/><line x1="124" y1="218" x2="129" y2="218"/><line x1="141" y1="218" x2="146" y2="218"/></g>
     <circle cx="135" cy="218" r="8.5" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.2"/><circle cx="135" cy="218" r="4" fill="url(#acRuby)" stroke="#5a0010" stroke-width=".7"/><circle cx="133.5" cy="216.5" r="1.2" fill="#fff" opacity=".8"/>
     <path d="M124 230 q11 5 22 0 l-3 66 q-9 5 -16 0 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.2"/>
     <path d="M133 232 l-2 64" stroke="#fffdf0" stroke-width="1.4" opacity=".5"/>
     <g stroke="#5e3a00" stroke-width="1" opacity=".5"><line x1="129" y1="240" x2="128" y2="292"/><line x1="139" y1="240" x2="140" y2="292"/></g>
     <circle cx="135" cy="290" r="1.4" fill="url(#acRivet)"/>
    </g>
    <g ${v('legR')} class="advcol-piece">
     <path d="M150 166 q15 9 30 0 l-3 52 q-12 6 -24 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M152 168 q14 7 27 0 l-1 6 q-13 6 -25 0 Z" fill="#fffdf0" opacity=".4"/>
     <path d="M151 212 q14 6 28 0 l-1 6 q-13 6 -26 0 Z" fill="#3a2600" opacity=".3"/>
     <g stroke="#fff6cc" stroke-width="1.4" stroke-linecap="round" opacity=".85"><line x1="165" y1="205" x2="165" y2="210"/><line x1="165" y1="226" x2="165" y2="231"/><line x1="154" y1="218" x2="159" y2="218"/><line x1="171" y1="218" x2="176" y2="218"/></g>
     <circle cx="165" cy="218" r="8.5" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.2"/><circle cx="165" cy="218" r="4" fill="url(#acSaph)" stroke="#08245e" stroke-width=".7"/><circle cx="163.5" cy="216.5" r="1.2" fill="#fff" opacity=".8"/>
     <path d="M154 230 q11 5 22 0 l-3 66 q-9 5 -16 0 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.2"/>
     <path d="M163 232 l-2 64" stroke="#fffdf0" stroke-width="1.4" opacity=".5"/>
     <g stroke="#5e3a00" stroke-width="1" opacity=".5"><line x1="159" y1="240" x2="158" y2="292"/><line x1="169" y1="240" x2="170" y2="292"/></g>
     <circle cx="165" cy="290" r="1.4" fill="url(#acRivet)"/>
    </g>
    <g ${v('armL')} class="advcol-piece">
     <path d="M114 84 Q88 80 74 94 Q69 103 72 112 Q88 109 110 102 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M114 86 Q92 83 80 93" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M76 90 Q66 94 63 102 L73 105 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="95" cy="94" r="3.4" fill="url(#acDome)" stroke="#7a5200" stroke-width="1"/><circle cx="95" cy="94" r="2" fill="url(#acEmer)"/>
     <path d="M84 118 l22 -4 -3 56 -20 -3 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.1"/>
     <path d="M93 116 l-1 56" stroke="#fffdf0" stroke-width="1.3" opacity=".45"/>
     <g stroke="#5e3a00" stroke-width=".9" opacity=".5"><line x1="89" y1="122" x2="88" y2="166"/><line x1="99" y1="122" x2="99" y2="166"/></g>
     <circle cx="94" cy="164" r="1.3" fill="url(#acRivet)"/>
    </g>
    <g ${v('armR')} class="advcol-piece">
     <path d="M186 84 Q212 80 226 94 Q231 103 228 112 Q212 109 190 102 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M186 86 Q208 83 220 93" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M224 90 Q234 94 237 102 L227 105 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="205" cy="94" r="3.4" fill="url(#acDome)" stroke="#7a5200" stroke-width="1"/><circle cx="205" cy="94" r="2" fill="url(#acAmet)"/>
     <path d="M216 118 l-22 -4 3 56 20 -3 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.1"/>
     <path d="M207 116 l1 56" stroke="#fffdf0" stroke-width="1.3" opacity=".45"/>
     <g stroke="#5e3a00" stroke-width=".9" opacity=".5"><line x1="211" y1="122" x2="212" y2="166"/><line x1="201" y1="122" x2="201" y2="166"/></g>
     <circle cx="206" cy="164" r="1.3" fill="url(#acRivet)"/>
    </g>
    <g ${v('torso')} class="advcol-piece">
     <path d="M132 80 q18 -7 36 0 l-3 12 q-15 -5 -30 0 Z" fill="url(#acGoldH)" stroke="#fff6cc" stroke-width="1.1"/>
     <circle cx="140" cy="84" r="1.3" fill="url(#acRivet)"/><circle cx="160" cy="84" r="1.3" fill="url(#acRivet)"/>
     <path d="M114 90 Q150 80 186 90 L190 150 Q150 166 110 150 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.5"/>
     <path d="M114 90 Q150 80 186 90 L184 96 Q150 87 116 96 Z" fill="#fffdf0" opacity=".45"/>
     <path d="M112 142 Q150 158 188 142 L190 150 Q150 166 110 150 Z" fill="#3a2600" opacity=".32"/>
     <path d="M118 94 Q150 85 182 94 L185 146 Q150 160 115 146 Z" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <g fill="url(#acRivet)"><circle cx="120" cy="98" r="1.4"/><circle cx="180" cy="98" r="1.4"/><circle cx="116" cy="130" r="1.4"/><circle cx="184" cy="130" r="1.4"/></g>
     <path d="M126 96 Q140 91 147 97 Q147 116 138 126 Q128 122 124 108 Z" fill="#fffdf0" opacity=".26"/>
     <path d="M174 96 Q160 91 153 97 Q153 116 162 126 Q172 122 176 108 Z" fill="#3a2600" opacity=".26"/>
     <path d="M122 104 q8 14 4 34" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <path d="M178 104 q-8 14 -4 34" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <g stroke="#fff6cc" stroke-width="2" stroke-linecap="round">
      <line x1="150" y1="100" x2="150" y2="108"/><line x1="150" y1="140" x2="150" y2="148"/><line x1="126" y1="124" x2="134" y2="124"/><line x1="166" y1="124" x2="174" y2="124"/>
      <line x1="134" y1="108" x2="139" y2="113"/><line x1="166" y1="108" x2="161" y2="113"/><line x1="134" y1="140" x2="139" y2="135"/><line x1="166" y1="140" x2="161" y2="135"/>
     </g>
     <circle cx="150" cy="124" r="11" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.4"/>
     <circle cx="150" cy="124" r="5.5" fill="url(#acTopz)" stroke="#5a3a00" stroke-width=".8"/><circle cx="148.5" cy="122.5" r="1.3" fill="#fff" opacity=".8"/>
     <g fill="url(#acGold)" stroke="#fff6cc" stroke-width="1">
      <path d="M120 150 Q150 162 180 150 L178 158 Q150 168 122 158 Z"/>
      <path d="M124 160 Q150 170 176 160 L174 167 Q150 176 126 167 Z" opacity=".96"/>
     </g>
    </g>
    <g ${v('helm')} class="advcol-piece">
     <g fill="url(#acGoldH)" stroke="#fff6cc" stroke-width="1">
      <path d="M122 54 q-9 -2 -17 3 q7 1 10 4 q-6 0 -10 4 q8 0 12 -2 q-2 4 -5 6 q9 -4 13 -9 Z"/>
      <path d="M178 54 q9 -2 17 3 q-7 1 -10 4 q6 0 10 4 q-8 0 -12 -2 q2 4 5 6 q-9 -4 -13 -9 Z"/>
     </g>
     <path d="M122 58 a28 30 0 0 1 56 0 q0 8 -3 14 l-50 0 q-3 -6 -3 -14 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.5"/>
     <path d="M125 56 a25 26 0 0 1 50 0" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M127 70 l46 0 q-3 4 -8 6 l-30 0 q-5 -2 -8 -6 Z" fill="#3a2600" opacity=".25"/>
     <path d="M132 44 q18 -10 36 0" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".55"/>
     <g fill="#8a5e10" opacity=".5"><path d="M134 46 l3 -4 1 4 Z"/><path d="M142 42 l3 -4 1 4 Z"/><path d="M158 42 l-3 -4 -1 4 Z"/><path d="M166 46 l-3 -4 -1 4 Z"/></g>
     <g fill="url(#acRivet)"><circle cx="128" cy="66" r="1.3"/><circle cx="172" cy="66" r="1.3"/></g>
     <path d="M150 14 q6 2 6 11 l-2 24 q-4 4 -8 0 l-2 -24 q0 -9 6 -11 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M150 18 q8 9 6 28 q10 -6 12 -17 q-2 -9 -18 -11 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width=".8" opacity=".9"/>
     <line x1="150" y1="22" x2="150" y2="44" stroke="#fffdf0" stroke-width=".8" opacity=".7"/>
     <path d="M150 55 l7 8 -7 10 -7 -10 Z" fill="url(#acDiam)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M150 57 l3 5 -3 4 -3 -4 Z" fill="#ffffff" opacity=".85"/>
     <path d="M126 72 l8 0 2 26 -8 6 -4 -10 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M174 72 l-8 0 -2 26 8 6 4 -10 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="130" cy="78" r="1.2" fill="url(#acRivet)"/><circle cx="170" cy="78" r="1.2" fill="url(#acRivet)"/>
     <rect x="147" y="74" width="6" height="26" rx="2" fill="url(#acGoldH)" stroke="#fff6cc" stroke-width=".8"/>
     <path d="M134 76 q16 -5 32 0 l-2 12 q-14 -4 -28 0 Z" fill="#0a0e1c" opacity=".85"/>
     <g fill="#bfe9ff"><circle cx="143" cy="84" r="1.6"/><circle cx="157" cy="84" r="1.6"/></g>
    </g>
    <g ${sword?'':'style="display:none"'} class="advcol-piece">
     <g transform="rotate(20 236 220)">
      <polygon points="236,108 241,124 231,124" fill="#fffbe6"/>
      <rect x="231" y="120" width="10" height="124" rx="3" fill="url(#acBlade)" stroke="#fff" stroke-width=".6"/>
      <line x1="236" y1="124" x2="236" y2="242" stroke="#fff" stroke-width="1" opacity=".7"/>
      <path d="M214 244 q22 8 44 0 l-3 8 q-19 6 -38 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1"/>
      <rect x="232" y="250" width="8" height="22" rx="3" fill="url(#acGold)" stroke="#fff6cc" stroke-width=".8"/>
      <circle cx="236" cy="276" r="7" fill="url(#acTopz)" stroke="#fff6cc" stroke-width="1.2"/>
     </g>
    </g>
    <g fill="#fffef2">
     <path class="advcol-glint" d="M150 116 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4 Z"/>
     <path class="advcol-glint" style="animation-delay:1.2s" d="M150 40 l1.2 3.5 3.5 1.2 -3.5 1.2 -1.2 3.5 -1.2 -3.5 -3.5 -1.2 3.5 -1.2 Z"/>
    </g>
   </svg>
   <div class="advcol-powers">${powers}</div>
   ${ult}
   ${sagaInvite}
  </div>`;
}

// ── Carnet primaire : le Talisman de Calcultopia ────────────────────
const _ADV_PRIM_CRYSTALS = [
 { rid:'cp',  name:"Cristal de l'Unité",     color:'rouge',  grad:'tlRed', dot:'radial-gradient(circle at 35% 30%,#ff6b6b,#7a0016)' },
 { rid:'ce1', name:"Cristal de l'Élan",      color:'orange', grad:'tlOra', dot:'radial-gradient(circle at 35% 30%,#ffa94d,#7a3a00)' },
 { rid:'ce2', name:"Cristal du Voyage",      color:'vert',   grad:'tlGrn', dot:'radial-gradient(circle at 35% 30%,#51d88a,#0a5a2a)' },
 { rid:'cm1', name:"Cristal de la Bravoure", color:'bleu',   grad:'tlBlu', dot:'radial-gradient(circle at 35% 30%,#4dabf7,#0a2f7a)' },
 { rid:'cm2', name:"Cristal de l'Infini",    color:'violet', grad:'tlVio', dot:'radial-gradient(circle at 35% 30%,#b06cff,#3a0a7a)' },
];
function _advTalismanHtml(){
 const CX=150, CY=150, R=104;
 const gemAng=[-90,-18,54,126,198], innerAng=[-54,18,90,162,234];
 const pt=(d,r)=>{ const a=d*Math.PI/180; return [CX+r*Math.cos(a), CY+r*Math.sin(a)]; };
 const fx=v=>v.toFixed(1);
 const got = _ADV_PRIM_CRYSTALS.map(c=>_regionConquered(c.rid));
 const count = got.filter(Boolean).length;
 const done = count>=5;
 // monture étoile 3D + rivets
 const sp=[]; for(let i=0;i<5;i++){ sp.push(pt(gemAng[i],100)); sp.push(pt(innerAng[i],46)); }
 const _ptsStr = sp.map(q=>fx(q[0])+','+fx(q[1])).join(' ');
 let rivets=''; for(let i=0;i<5;i++){ const o=pt(gemAng[i],100), ii=pt(innerAng[i],46);
  rivets+=`<circle cx="${fx(o[0])}" cy="${fx(o[1])}" r="2.1" fill="url(#tlRivet)"/><circle cx="${fx(ii[0])}" cy="${fx(ii[1])}" r="1.6" fill="url(#tlRivet)"/>`; }
 const mount = `
  <polygon points="${_ptsStr}" fill="none" stroke="#0a1228" stroke-width="12" stroke-linejoin="round" transform="translate(0 1.5)"/>
  <polygon points="${_ptsStr}" fill="none" stroke="url(#tlMetalV)" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="${_ptsStr}" fill="none" stroke="#eef5ff" stroke-width="3" stroke-linejoin="round" opacity=".45" transform="translate(0 -1.2)"/>
  <polygon points="${_ptsStr}" fill="none" stroke="#1a2748" stroke-width=".8" stroke-linejoin="round"/>${rivets}`;
 // sertissures
 let bez=''; for(let i=0;i<5;i++){ const c=pt(gemAng[i],R);
  bez+=`<circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="15" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1"/><circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="15" fill="none" stroke="#eef5ff" stroke-width="1" opacity=".4"/><circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="11.5" fill="#0c1530"/>`; }
 // cristaux facettés (seulement ceux libérés)
 const poly=p=>p.map(q=>fx(q[0])+','+fx(q[1])).join(' ');
 let gems=''; for(let i=0;i<5;i++){ if(!got[i]) continue;
  const [cx,cy]=pt(gemAng[i],R); const r=12.5, tr=r*0.46; const oct=[],tab=[];
  for(let k=0;k<8;k++){ const a=(k*45-90)*Math.PI/180; oct.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); tab.push([cx+tr*Math.cos(a),cy+tr*Math.sin(a)]); }
  let fac=''; for(let k=0;k<8;k++) fac+=`<line x1="${fx(oct[k][0])}" y1="${fx(oct[k][1])}" x2="${fx(tab[k][0])}" y2="${fx(tab[k][1])}" stroke="#fff" stroke-width=".5" opacity=".4"/>`;
  gems+=`<g class="advtal-slot">`
   +`<polygon points="${poly(oct)}" fill="url(#${_ADV_PRIM_CRYSTALS[i].grad})" stroke="#fff" stroke-width=".7"/>`
   +fac
   +`<polygon points="${poly(tab)}" fill="#fff" opacity=".22"/><polygon points="${poly(tab)}" fill="none" stroke="#fff" stroke-width=".6" opacity=".5"/>`
   +`<polygon points="${poly([oct[5],oct[6],tab[6],tab[5]])}" fill="#fff" opacity=".5"/>`
   +`<path class="advtal-gleam" transform="translate(${fx(cx-4)} ${fx(cy-5)})" d="M4 0 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z" fill="#fff"/>`
   +`</g>`;
 }
 const center = done
  ? `<g class="advtal-burst" stroke="#ffe07a" stroke-width="2.5" stroke-linecap="round">
      <line x1="150" y1="92" x2="150" y2="72"/><line x1="150" y1="208" x2="150" y2="228"/><line x1="92" y1="150" x2="72" y2="150"/><line x1="208" y1="150" x2="228" y2="150"/>
      <line x1="112" y1="112" x2="98" y2="98"/><line x1="188" y1="112" x2="202" y2="98"/><line x1="112" y1="188" x2="98" y2="202"/><line x1="188" y1="188" x2="202" y2="202"/></g>
     <circle cx="150" cy="150" r="24" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1.5"/><circle cx="150" cy="150" r="24" fill="none" stroke="#eef5ff" stroke-width="1.4" opacity=".4"/>
     <circle cx="150" cy="150" r="19" fill="url(#tlCore)" stroke="#fff6d6" stroke-width="1.2"/>
     <path d="M150 134 l4.5 11.5 12.5 0 -10 8 4 12.5 -11 -7 -11 7 4 -12.5 -10 -8 12.5 0 Z" fill="#fffef2"/>
     <g fill="#fff3b0"><circle class="advtal-spark" cx="150" cy="68" r="2.4"/><circle class="advtal-spark" cx="234" cy="150" r="2.4"/><circle class="advtal-spark" cx="150" cy="232" r="2.4"/><circle class="advtal-spark" cx="66" cy="150" r="2.4"/></g>`
  : `<circle cx="150" cy="150" r="24" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1.5"/><circle cx="150" cy="150" r="24" fill="none" stroke="#eef5ff" stroke-width="1.4" opacity=".4"/>
     <circle cx="150" cy="150" r="19" fill="url(#tlCore)" stroke="#fff6d6" stroke-width="1.2" opacity="${(0.3+count*0.1).toFixed(2)}"/>`;
 const legend = _ADV_PRIM_CRYSTALS.map((c,i)=>
  `<div class="advtal-lg ${got[i]?'on':''}"><span class="advtal-dot" style="background:${c.dot}"></span><b>${c.name}</b> <span style="opacity:.85">(${c.color})</span></div>`).join('');
 const seen=(P&&P.storySeen)||[]; const taleSeen=seen.includes('prim_tale_numbers');
 const clickable = done ? `onclick="_openTaleIllus(_PRIM_TALE_NUMBERS)" role="button" tabindex="0" title="Lire La Grande Histoire des Nombres" style="cursor:pointer"` : '';
 const msg = done ? (taleSeen ? "Talisman complet — touche-le pour relire La Grande Histoire des Nombres 📖" : "Talisman complet ! Touche-le pour lire La Grande Histoire des Nombres 📜✨")
  : count>0 ? `${count} Cristal${count>1?'aux':''} libéré${count>1?'s':''} — continue !`
  : 'Libère les Cristaux pour reformer le Talisman !';
 return `
  <div class="advlog-section-title">💎 Talisman de Calcultopia <span class="advcol-count">${count} / 5 cristaux</span></div>
  <div class="advcol-box advtal-box${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 300 300" class="advcol-svg" aria-label="Talisman : ${count} cristaux sur 5">
    <defs>
     <radialGradient id="tlHalo" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#9fd0ff" stop-opacity=".5"/><stop offset="55%" stop-color="#3f6ad0" stop-opacity=".14"/><stop offset="100%" stop-color="#3f6ad0" stop-opacity="0"/></radialGradient>
     <linearGradient id="tlMetalV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6eeff"/><stop offset="42%" stop-color="#8ea4d4"/><stop offset="78%" stop-color="#4a5e92"/><stop offset="100%" stop-color="#26345e"/></linearGradient>
     <radialGradient id="tlBezel" cx="38%" cy="30%" r="80%"><stop offset="0%" stop-color="#f2f7ff"/><stop offset="45%" stop-color="#8ea4d4"/><stop offset="100%" stop-color="#26345e"/></radialGradient>
     <linearGradient id="tlRivet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2f7ff"/><stop offset="100%" stop-color="#26345e"/></linearGradient>
     <radialGradient id="tlCore" cx="42%" cy="34%" r="72%"><stop offset="0%" stop-color="#fffef2"/><stop offset="45%" stop-color="#ffe07a"/><stop offset="100%" stop-color="#b9760f"/></radialGradient>
     <radialGradient id="tlRed" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#fff0f0"/><stop offset="35%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#7a0016"/></radialGradient>
     <radialGradient id="tlOra" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#fff3e0"/><stop offset="35%" stop-color="#ffa94d"/><stop offset="100%" stop-color="#7a3a00"/></radialGradient>
     <radialGradient id="tlGrn" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#eafff2"/><stop offset="35%" stop-color="#51d88a"/><stop offset="100%" stop-color="#0a5a2a"/></radialGradient>
     <radialGradient id="tlBlu" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#eaf6ff"/><stop offset="35%" stop-color="#4dabf7"/><stop offset="100%" stop-color="#0a2f7a"/></radialGradient>
     <radialGradient id="tlVio" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#f6ecff"/><stop offset="35%" stop-color="#b06cff"/><stop offset="100%" stop-color="#3a0a7a"/></radialGradient>
    </defs>
    <circle cx="150" cy="150" r="122" fill="url(#tlHalo)" opacity="${(0.25+count*0.12).toFixed(2)}"/>
    <g class="advtal-rays" opacity=".4" stroke="#3f6ad0" stroke-width="1">
     <line x1="150" y1="150" x2="150" y2="30"/><line x1="150" y1="150" x2="264" y2="113"/><line x1="150" y1="150" x2="220" y2="252"/><line x1="150" y1="150" x2="80" y2="252"/><line x1="150" y1="150" x2="36" y2="113"/>
    </g>
    ${mount}${bez}${gems}${center}
   </svg>
   <div class="advcol-caption">${msg}</div>
   <div class="advtal-legend">${legend}</div>
  </div>`;
}

function openAdventureLog(){
 if(typeof P === 'undefined' || !P) return;
 const beaten = P.mapBossBeaten || [];
 // Couleurs accent par région (réutilise la palette des cinématiques d'îlot)
 const regionAccent = {
  cp:'#a8e6a2', ce1:'#5fb95a', ce2:'#f6cb8b', cm1:'#b6c8d4', cm2:'#cbb1ee', final:'#fff4c0', titan:'#ff9a5a',
 };
 // Progression globale
 const totalZones = MAP_ZONES.length;
 const totalBeaten = MAP_ZONES.filter(z => beaten.includes(z.id)).length;
 const globalPct = totalZones > 0 ? Math.round((totalBeaten / totalZones) * 100) : 0;
 // Progression par région
 const regionRows = _ARCH_REGIONS.map(r => {
  const zonesOfRegion = (typeof _zonesOfRegion==='function') ? _zonesOfRegion(r.id) : MAP_ZONES.filter(z => r.levels.includes(z.level));
  if(zonesOfRegion.length === 0) return '';
  const done = zonesOfRegion.filter(z => beaten.includes(z.id)).length;
  const pct = Math.round((done / zonesOfRegion.length) * 100);
  const accent = regionAccent[r.id] || '#f1c40f';
  const isComplete = done === zonesOfRegion.length && done > 0;
  return `
   <div class="advlog-region-row">
    <div class="advlog-region-head">
     <span class="advlog-region-name">${r.label}${isComplete ? ' <span class="advlog-region-crown">👑</span>' : ''}</span>
     <span class="advlog-region-count">${done}/${zonesOfRegion.length}</span>
    </div>
    <div class="advlog-bar-track">
     <div class="advlog-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,${accent},#fff);"></div>
    </div>
   </div>`;
 }).join('');
 // Galerie des boss vaincus (dans l'ordre des zones)
 const bossMedals = MAP_ZONES.filter(z => beaten.includes(z.id)).map(z => `
  <div class="advlog-medal" onclick="closeAdventureLog();setTimeout(()=>_openBossCard('${z.id}'),300);" role="button" title="${z.bossName || 'Boss'} — ${z.label} (voir la carte)">
   <div class="advlog-medal-boss">${z.boss || '🏆'}</div>
   <div class="advlog-medal-zone">${z.label}</div>
  </div>`).join('');
 const bossGallery = bossMedals
  ? `<div class="advlog-medals">${bossMedals}</div>`
  : `<div class="advlog-empty">Aucun boss vaincu pour l'instant. À l'aventure !</div>`;
 // Stats clés
 const stars = P.stars || 0;
 const figs = (P.ownedFigurines || []).length;
 const xp = P.xp || 0;
 const lvl = Math.floor(xp / 100) + 1;
 // Construction de l'overlay
 const overlay = document.createElement('div');
 overlay.className = 'advlog-overlay';
 overlay.innerHTML = `
  <div class="advlog-modal">
   <button class="advlog-close" onclick="closeAdventureLog()" aria-label="Fermer">✕</button>
   <div class="advlog-header">
    <div class="advlog-avatar">${P.avatar || '🧒'}</div>
    <div class="advlog-header-text">
     <div class="advlog-hero-name">${P.name || 'Héros'}</div>
     <div class="advlog-hero-level">Niveau ${lvl} · Aventurier${heroGender(P.name)==='f'?'ère':''}</div>
    </div>
   </div>
   <div class="advlog-global">
    <div class="advlog-global-label">Progression de l'Odyssée</div>
    <div class="advlog-bar-track advlog-bar-big">
     <div class="advlog-bar-fill" style="width:${globalPct}%;background:linear-gradient(90deg,#f1c40f,#f39c12,#fff5d6);"></div>
     <span class="advlog-global-pct">${totalBeaten}/${totalZones} zones · ${globalPct}%</span>
    </div>
   </div>
   <div class="advlog-stats">
    <div class="advlog-stat"><span class="advlog-stat-ico">⭐</span><span class="advlog-stat-val">${stars}</span><span class="advlog-stat-lbl">étoiles</span></div>
    <div class="advlog-stat"><span class="advlog-stat-ico">🎭</span><span class="advlog-stat-val">${figs}</span><span class="advlog-stat-lbl">figurines</span></div>
    <div class="advlog-stat"><span class="advlog-stat-ico">⚡</span><span class="advlog-stat-val">${xp}</span><span class="advlog-stat-lbl">XP</span></div>
   </div>
   ${(typeof _advCollectionHtml==='function')?_advCollectionHtml():''}
   <div class="advlog-section-title">🗺️ Progression par région</div>
   <div class="advlog-regions">${regionRows}</div>
   <div class="advlog-section-title">🏆 Boss vaincus (${totalBeaten})</div>
   ${bossGallery}
   ${(typeof _questJournalCarnetHtml==='function')?_questJournalCarnetHtml():''}
  </div>
 `;
 document.body.appendChild(overlay);
 // Fermeture au clic sur le fond
 overlay.addEventListener('click', (ev) => {
  if(ev.target === overlay) closeAdventureLog();
 });
 // Animation d'entrée
 requestAnimationFrame(() => overlay.classList.add('advlog-show'));
}
function closeAdventureLog(){
 const overlay = document.querySelector('.advlog-overlay');
 if(!overlay) return;
 overlay.classList.remove('advlog-show');
 setTimeout(() => overlay.remove(), 300);
}

// v8.7.46 (O3-C.4 polish) : Animation de la boussole au clic.
// L'aiguille (l'emoji entier) tourne rapidement dans tous les sens pendant 4s.
let _compassSpinning = false;
function _spinCompass(el){
 if(!el || _compassSpinning) return;
 _compassSpinning = true;
 el.classList.add('compass-spinning');
 // Petit retour sonore/haptique
 if(typeof beep === 'function'){ try{ beep(660,'sine',.12,.06); }catch(e){} }
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){ vibrate(VIBE.good || 30); }
 setTimeout(() => {
  el.classList.remove('compass-spinning');
  _compassSpinning = false;
 }, 4000);
}

// ═══════════════════════════════════════════════════════
// v8.7.50 (O4) : PHASE D'ENRAGE DES BOSS
// Déclenchée quand un boss de zone tombe à la moitié de ses HP. Transition
// épique : screen shake, flash rouge, le monstre devient enragé (rouge + grossit),
// dialogue menaçant, son grave. Effet gameplay : timer réduit (géré dans startTimer).
// ═══════════════════════════════════════════════════════
const _BOSS_ENRAGE_LINES = [
 "Tu m'as assez énervé… Maintenant je ne retiens plus rien !",
 "GRAAH ! Tu vas regretter de m'avoir défié !",
 "Assez joué ! Voici ma vraie puissance !",
 "Tu crois m'avoir ? La vraie bataille commence MAINTENANT !",
 "Impossible… tu es plus fort que prévu. Mais je ne céderai pas !",
 "Ma colère décuple mes forces ! Prépare-toi !",
 "Tu as réveillé ma fureur… tant pis pour toi !",
 "Chaque bonne réponse m'enrage un peu plus !",
 "Tu ne souris plus pour longtemps ! À mon tour de jouer !",
 "Mes attaques vont devenir IMPITOYABLES !",
 "Je gronde, je tremble, je RUGIS de colère !",
 "Tu m'as poussé à bout… voici ma forme déchaînée !",
 "Personne ne m'avait résisté aussi longtemps. ÇA SUFFIT !",
 "Sens ma rage monter : ma fureur va pleuvoir !",
 "Tu as gratté ma fierté… et ça, JAMAIS !",
 "Mes yeux rougeoient ! Plus aucune pitié pour tes neurones !",
];
// Répliques d'enrage adaptées au collège (ton plus mûr, adversaire respecté)
const _BOSS_ENRAGE_LINES_COL = [
 "Tu raisonnes mieux que je ne le pensais. Je cesse de te ménager.",
 "Assez d'échauffement. Montre-moi vraiment de quoi tu es capable.",
 "Chaque réponse juste fissure ma certitude. Soit : passons aux choses sérieuses.",
 "Tu refuses de plier ? Alors je relève la difficulté.",
 "Un esprit qui ne renonce pas… voyons jusqu'où il tient.",
 "Tu as forcé mon respect. Tu auras donc ma pleine puissance.",
];
// Répliques d'enrage maternelle : douces et encourageantes (jamais effrayantes)
const _BOSS_ENRAGE_LINES_MAT = [
 "Oh là là, tu es trop fort ! Bravo !",
 "Waouh ! Tu réponds super bien ! On continue à jouer ?",
 "Tu y arrives très bien ! Encore un petit peu !",
 "Youpi ! Quel champion ! Je suis tout content !",
];
function _triggerBossEnrage(){
 const ma = document.getElementById('monster-area');
 // Effet visuel sur le monstre : classe enragée (rouge + grossissement pulsant)
 if(ma){
  ma.classList.add('monster-enraged');
 }
 // Screen shake + flash rouge sur tout l'écran de jeu
 const gameView = document.getElementById('v-game') || document.body;
 gameView.classList.add('boss-enrage-shake');
 setTimeout(() => gameView.classList.remove('boss-enrage-shake'), 700);
 // Flash rouge overlay
 const flash = document.createElement('div');
 flash.className = 'boss-enrage-flash';
 document.body.appendChild(flash);
 setTimeout(() => flash.remove(), 800);
 // Bannière "ENRAGÉ !"
 const banner = document.createElement('div');
 banner.className = 'boss-enrage-banner';
 banner.textContent = '⚡ ENRAGÉ ! ⚡';
 document.body.appendChild(banner);
 setTimeout(() => banner.classList.add('boss-enrage-banner-out'), 1400);
 setTimeout(() => banner.remove(), 1900);
 // Dialogue menaçant (via le système de voix du monstre si dispo)
 const _mat = (typeof _isMaternelle==='function' && typeof GM!=='undefined' && _isMaternelle(GM.level));
 const _col = (typeof _COL_LEVELS!=='undefined' && typeof GM!=='undefined' && _COL_LEVELS.includes(GM.level));
 const _enPool = _mat ? _BOSS_ENRAGE_LINES_MAT : (_col ? _BOSS_ENRAGE_LINES_COL : _BOSS_ENRAGE_LINES);
 const line = _enPool[Math.floor(Math.random() * _enPool.length)];
 if(typeof monsterSpeak === 'function'){
  try{ monsterSpeak(line, 2600); }catch(e){}
 }
 // v9.2.4 : plus de son d'enrage (trop proche du bip d'erreur). On s'appuie sur la
 // réplique parlée du boss (_BOSS_ENRAGE_LINES) + les effets visuels (shake, flash, bannière).
 // Vibration forte
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate(VIBE.boss || [60, 30, 60, 30, 100]);
 }
}

// ═══════════════════════════════════════════════════════
// v8.7.52 (O4.2a) : ATTAQUES SPÉCIALES DES BOSS ENRAGÉS — effets cosmétiques
// Déclenchées aléatoirement par question pendant la phase enragée.
// (Les attaques touchant la logique de combat sont en O4.2b.)
// ═══════════════════════════════════════════════════════
function _maybeBossAttack(){
 if(!GS.isBoss || !GS.bossEnraged) return;
 // v8.7.56 : en Furie (phase 3), les attaques sont bien plus fréquentes
 const proba = GS.bossFury ? 0.80 : 0.55;
 if(Math.random() > proba) return;
 const attacks = [_atkRoar, _atkLightning, _atkLureRain, _atkWobble, _atkFireflies,
                  _atkFreeze, _atkScramble, _atkWords, _atkShield, _atkRegen,
                  _atkFog, _atkInk, _atkFlip, _atkQuake, _atkEclipse, _atkFrost];
 const atk = attacks[Math.floor(Math.random() * attacks.length)];
 try{ atk(); }catch(e){ console.warn('boss attack failed', e); }
}
// 🐉 Rugissement intimidant : zoom sur le boss + son grave + vibration
function _atkRoar(){
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-roar'); setTimeout(()=>ma.classList.remove('boss-roar'), 750); }
 // v9.2.4 : plus de bip de rugissement (proche du son d'erreur) — on garde le « GROAAAR » parlé + le zoom.
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined') vibrate(VIBE.boss || [50, 30, 50]);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('GROAAAR !', 1400); }catch(e){} }
}
// ⚡ Éclair surprise : flash bleu-blanc plein écran + tonnerre
function _atkLightning(){
 const f = document.createElement('div');
 f.className = 'boss-lightning-flash';
 document.body.appendChild(f);
 setTimeout(()=> f.remove(), 650);
 if(typeof beep === 'function'){
  try{ beep(70, 'sawtooth', .45, .12); setTimeout(()=>beep(55, 'square', .3, .1), 60); }catch(e){}
 }
 if(typeof vibrate === 'function') vibrate(45);
}
// 🌟 Pluie de leurres : symboles mathématiques qui tombent en fond
function _atkLureRain(){
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-lure-layer';
 const syms = ['➕','➖','✖️','➗','🟰','❓','🔢','💢'];
 let html = '';
 for(let i = 0; i < 14; i++){
  const left = Math.random() * 100;
  const delay = Math.random() * 1.2;
  const dur = 2 + Math.random() * 1.6;
  const sz = 0.8 + Math.random() * 0.9;
  html += `<span class="boss-lure" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${sz}em;">${syms[i % syms.length]}</span>`;
 }
 layer.innerHTML = html;
 host.appendChild(layer);
 setTimeout(()=> layer.remove(), 4000);
}
// 🌀 Énoncé qui tangue : la question oscille/pivote doucement
function _atkWobble(){
 const q = document.getElementById('question');
 if(!q) return;
 q.classList.add('boss-wobble');
 setTimeout(()=> q.classList.remove('boss-wobble'), 2600);
}
// ✨ Distraction lucioles : lucioles dorées qui flottent devant l'écran
function _atkFireflies(){
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-firefly-layer';
 let html = '';
 for(let i = 0; i < 12; i++){
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 2;
  const dur = 2.5 + Math.random() * 2;
  html += `<span class="boss-firefly" style="left:${left}%;top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s;">✨</span>`;
 }
 layer.innerHTML = html;
 host.appendChild(layer);
 setTimeout(()=> layer.remove(), 4500);
}

// ═══════════════════════════════════════════════════════
// v8.7.53 (O4.2b) : ATTAQUES BOSS — effets sur saisie & affichage
// Gel temporaire, pavé mélangé, chiffres en lettres.
// ═══════════════════════════════════════════════════════
// Nettoyage des effets d'attaque entre deux questions (appelé en début de renderQ)
// ── v9.4.15 : 6 nouveaux malus de colère. Le timer est mis en pause pendant
//    l'effet (GS.frozen) — donc non punitif ; sans effet en maternelle (pas de chrono).
function _atkFog(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-fog-layer';
 host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Brouillard épais !", 1400); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 3000);
}
function _atkInk(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-ink-layer';
 let html = '';
 for(let i=0;i<6;i++){ const left=8+Math.random()*78, top=12+Math.random()*64, sz=58+Math.random()*70, delay=(Math.random()*0.3).toFixed(2);
  html += `<span class="boss-ink" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;animation-delay:${delay}s;"></span>`; }
 layer.innerHTML = html; host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Tache d'encre !", 1300); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 2600);
}
function _atkFlip(){
 const q = document.getElementById('question');
 GS.frozen = true;
 if(q) q.classList.add('boss-upside');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Sens dessus dessous !", 1500); }catch(e){} }
 setTimeout(()=>{ if(q) q.classList.remove('boss-upside'); GS.frozen = false; }, 2200);
}
function _atkQuake(){
 const gv = document.getElementById('v-game');
 GS.frozen = true;
 if(gv) gv.classList.add('boss-quake');
 if(typeof vibrate === 'function') vibrate([30,40,30,40,30]);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Tremblement de terre !", 1300); }catch(e){} }
 setTimeout(()=>{ if(gv) gv.classList.remove('boss-quake'); GS.frozen = false; }, 1600);
}
function _atkEclipse(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-eclipse-layer';
 host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Éclipse !", 1400); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 2200);
}
function _atkFrost(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-frost-layer';
 host.appendChild(layer);
 if(typeof beep === 'function'){ try{ beep(1200,'sine',.18,.05); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Givre rampant !", 1300); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 3000);
}
function _resetBossAttackEffects(){
 const numpad = document.getElementById('numpad');
 if(numpad){
  numpad.classList.remove('numpad-frozen','numpad-scrambled');
  _restoreNumpadOrder();
 }
 const ai = document.getElementById('answer-input');
 if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false; }
 const qEl = document.getElementById('question');
 if(qEl) qEl.classList.remove('boss-words-q','boss-upside');
 const gv = document.getElementById('v-game');
 if(gv) gv.classList.remove('boss-quake');
 document.querySelectorAll('.boss-fog-layer,.boss-ink-layer,.boss-eclipse-layer,.boss-frost-layer').forEach(el=>el.remove());
 if(typeof GS !== 'undefined') GS.frozen = false;
}
// Restaure l'ordre canonique 1..9 des touches chiffres du pavé
function _restoreNumpadOrder(){
 const numpad = document.getElementById('numpad');
 if(!numpad) return;
 const minusBtn = numpad.querySelector('.np-minus');
 if(!minusBtn) return;
 // Réinsérer les boutons 1..9 dans l'ordre avant le bouton "−"
 for(let d = 1; d <= 9; d++){
  const btn = numpad.querySelector(`.np-btn[data-k="${d}"]`);
  if(btn) numpad.insertBefore(btn, minusBtn);
 }
}
// ❄️ Gel temporaire : pavé givré + timer en pause 2s (non punitif grâce à GS.frozen)
function _atkFreeze(){
 const numpad = document.getElementById('numpad');
 const ai = document.getElementById('answer-input');
 GS.frozen = true; // met le timer en pause (géré dans le tick de startTimer)
 if(numpad) numpad.classList.add('numpad-frozen');
 if(ai){ ai.classList.add('input-frozen'); ai.disabled = true; }
 if(typeof beep === 'function'){ try{ beep(880,'sine',.2,.07); setTimeout(()=>beep(660,'sine',.25,.06),120); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Gèle sur place !', 1600); }catch(e){} }
 setTimeout(() => {
  GS.frozen = false;
  if(numpad) numpad.classList.remove('numpad-frozen');
  if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false;
   // PC/clavier : redonner le focus au champ (sinon il faut recliquer). Pas sur
   // tactile, pour ne pas faire surgir le clavier par-dessus le pavé.
   if(typeof _numpadIsTouch !== 'function' || !_numpadIsTouch()){ try{ ai.focus(); }catch(e){} }
  }
 }, 2000);
}
// 🔀 Pavé mélangé : les touches 1..9 changent de place (la valeur reste correcte)
function _atkScramble(){
 const numpad = document.getElementById('numpad');
 if(!numpad) return;
 const minusBtn = numpad.querySelector('.np-minus');
 if(!minusBtn) return;
 const digits = [];
 for(let d = 1; d <= 9; d++){
  const btn = numpad.querySelector(`.np-btn[data-k="${d}"]`);
  if(btn) digits.push(btn);
 }
 if(digits.length < 9) return;
 // Mélange Fisher-Yates
 for(let i = digits.length - 1; i > 0; i--){
  const j = Math.floor(Math.random() * (i + 1));
  [digits[i], digits[j]] = [digits[j], digits[i]];
 }
 digits.forEach(b => numpad.insertBefore(b, minusBtn));
 numpad.classList.add('numpad-scrambled');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Bonne chance pour trouver les chiffres !', 2000); }catch(e){} }
}
// 🔢 Chiffres en lettres : l'énoncé affiche les nombres en toutes lettres
function _atkWords(){
 const qEl = document.getElementById('question');
 if(!qEl) return;
 const original = qEl.innerText;
 const converted = original.replace(/\d+/g, m => _numberToFrenchWords(parseInt(m, 10)));
 if(converted === original) return; // pas de chiffre converti → effet inutile
 qEl.innerText = converted;
 qEl.classList.add('boss-words-q');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Sais-tu encore lire ?', 1800); }catch(e){} }
}
// Conversion d'un entier (0-9999) en toutes lettres françaises
function _numberToFrenchWords(n){
 if(n === 0) return 'zéro';
 if(n < 0) return 'moins ' + _numberToFrenchWords(-n);
 const units = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix',
  'onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
 const tens = ['','','vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt'];
 function below100(x){
  if(x < 20) return units[x];
  const t = Math.floor(x / 10), u = x % 10;
  if(t === 7 || t === 9){ // soixante-dix / quatre-vingt-dix
   const base = t === 7 ? 'soixante' : 'quatre-vingt';
   const rem = below100(10 + u); // dix..dix-neuf
   return base + '-' + rem;
  }
  if(u === 0) return tens[t] + (t === 8 ? 's' : '');
  if(u === 1 && t !== 8) return tens[t] + '-et-un';
  return tens[t] + '-' + units[u];
 }
 function below1000(x){
  if(x < 100) return below100(x);
  const h = Math.floor(x / 100), rem = x % 100;
  const hPart = (h === 1 ? 'cent' : units[h] + '-cent');
  if(rem === 0) return hPart + (h > 1 ? 's' : '');
  return hPart + ' ' + below100(rem);
 }
 if(n < 1000) return below1000(n);
 const th = Math.floor(n / 1000), rem = n % 1000;
 const thPart = (th === 1 ? 'mille' : below1000(th) + ' mille');
 return rem === 0 ? thPart : thPart + ' ' + below1000(rem);
}

// ═══════════════════════════════════════════════════════
// v8.7.54 (O4.2c) : ATTAQUES BOSS — mécaniques de combat
// ⚔️ Bouclier (2 bonnes réponses pour 1 PV) + 💚 Régénération (le boss récupère 1 PV)
// ═══════════════════════════════════════════════════════
// ⚔️ Bouclier : le boss lève un bouclier qui absorbe le prochain coup
function _atkShield(){
 if(GS.bossShieldActive) return; // déjà levé
 GS.bossShieldActive = true;
 GS.bossShieldHits = 0;
 const ma = document.getElementById('monster-area');
 if(ma) ma.classList.add('boss-shielded');
 if(typeof beep === 'function'){ try{ beep(330,'square',.18,.08); setTimeout(()=>beep(440,'square',.2,.07),110); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Mon bouclier va me protéger !', 2000); }catch(e){} }
 if(typeof vibrate === 'function') vibrate(35);
}
// Bouclier qui absorbe un coup (le 1er) : flash métallique + son
function _bossShieldBlock(){
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-shield-clang'); setTimeout(()=>ma.classList.remove('boss-shield-clang'), 450); }
 if(typeof beep === 'function'){ try{ beep(700,'square',.12,.09); setTimeout(()=>beep(520,'square',.14,.07),70); }catch(e){} }
 if(typeof vibrate === 'function') vibrate(25);
}
// Bouclier brisé (au 2e coup) : éclats + son de bris
function _bossShieldBreak(){
 const ma = document.getElementById('monster-area');
 if(ma){
  ma.classList.remove('boss-shielded');
  ma.classList.add('boss-shield-shatter');
  setTimeout(()=>ma.classList.remove('boss-shield-shatter'), 600);
 }
 if(typeof beep === 'function'){ try{ [600,440,300,200].forEach((f,i)=>setTimeout(()=>beep(f,'triangle',.14,.08), i*55)); }catch(e){} }
 if(typeof vibrate === 'function') vibrate([30,20,40]);
}
// 💚 Régénération : le boss récupère 1 PV (cap au max, 2 fois max par combat)
function _atkRegen(){
 if((GS.bossRegenCount||0) >= 2) return;            // max 2 régénérations par combat
 if(GS.monsterHP >= GS.monsterMaxHP) return;        // déjà au max
 GS.bossRegenCount = (GS.bossRegenCount||0) + 1;
 GS.monsterHP++;
 if(typeof updateMonsterHP === 'function') updateMonsterHP();
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-regen'); setTimeout(()=>ma.classList.remove('boss-regen'), 1200); }
 // particules de soin vertes
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-regen-layer';
 let html='';
 for(let i=0;i<8;i++){
  const left=35+Math.random()*30, delay=Math.random()*.5, dur=1+Math.random()*.8;
  html+=`<span class="boss-regen-plus" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">💚</span>`;
 }
 layer.innerHTML=html;
 host.appendChild(layer);
 setTimeout(()=>layer.remove(), 2000);
 if(typeof beep === 'function'){ try{ [440,550,660].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.2,.07), i*100)); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Je me soigne, hé hé !', 1800); }catch(e){} }
}

// ═══════════════════════════════════════════════════════
// v8.7.56 (O4.4) : 3e PHASE "FURIE" des gros boss (≥6 PV)
// Déclenchée à 25% de vie, après l'enrage. Transition encore plus intense :
// le monstre vire au violet-noir, double secousse, dialogue désespéré, attaques
// plus fréquentes (gérées dans _maybeBossAttack).
// ═══════════════════════════════════════════════════════
const _BOSS_FURY_LINES = [
 "NON ! C'est impossible… Je vais TOUT donner !",
 "Tu ne me vaincras JAMAIS ! JAMAIS !",
 "Ma dernière once de pouvoir… RECEVEZ MA FUREUR !",
 "Si je tombe, je t'emporte avec moi !",
 "AAARGH ! Mes forces ultimes se déchaînent !",
];
// Répliques de furie adaptées au collège
const _BOSS_FURY_LINES_COL = [
 "Impossible… ma logique se brise. Je n'ai plus rien à perdre !",
 "Tu es à un théorème de me vaincre. Je ne te le concéderai pas !",
 "Mes dernières équations, je les lance toutes contre toi !",
 "Si je dois tomber, que ce soit face à un adversaire digne. Prouve-le encore.",
 "Tout mon savoir condensé en un ultime défi. Relève-le, si tu l'oses.",
];
// Répliques de furie maternelle : tout en douceur
const _BOSS_FURY_LINES_MAT = [
 "Tu as presque gagné, c'est génial !",
 "Bravo bravo bravo ! Encore une petite question !",
 "Tu es le plus courageux des petits champions !",
];
function _triggerBossFury(){
 const ma = document.getElementById('monster-area');
 if(ma){
  ma.classList.remove('monster-enraged');
  ma.classList.add('monster-fury');
 }
 // Double secousse plus violente
 const gameView = document.getElementById('v-game') || document.body;
 gameView.classList.add('boss-fury-shake');
 setTimeout(() => gameView.classList.remove('boss-fury-shake'), 900);
 // Flash violet
 const flash = document.createElement('div');
 flash.className = 'boss-fury-flash';
 document.body.appendChild(flash);
 setTimeout(() => flash.remove(), 900);
 // Bannière "FURIE !"
 const banner = document.createElement('div');
 banner.className = 'boss-fury-banner';
 banner.textContent = '🔥 FURIE ! 🔥';
 document.body.appendChild(banner);
 setTimeout(() => banner.classList.add('boss-fury-banner-out'), 1600);
 setTimeout(() => banner.remove(), 2100);
 // Dialogue désespéré
 const _matF = (typeof _isMaternelle==='function' && typeof GM!=='undefined' && _isMaternelle(GM.level));
 const _colF = (typeof _COL_LEVELS!=='undefined' && typeof GM!=='undefined' && _COL_LEVELS.includes(GM.level));
 const _fuPool = _matF ? _BOSS_FURY_LINES_MAT : (_colF ? _BOSS_FURY_LINES_COL : _BOSS_FURY_LINES);
 const line = _fuPool[Math.floor(Math.random() * _fuPool.length)];
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak(line, 2800); }catch(e){} }
 // v9.2.4 : plus de son de furie (trop proche du bip d'erreur). Réplique parlée
 // (_BOSS_FURY_LINES) + effets visuels suffisent à exprimer la rage.
 // Vibration prolongée
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate([80, 40, 80, 40, 80, 40, 140]);
 }
}

// ═══════════════════════════════════════════════════════
// v8.7.64 (esthétique) : DÉCORS THÉMATIQUES PAR ZONE
// Petits éléments décoratifs dispersés autour de chaque nœud de zone pour rendre
// chaque lieu vivant et reconnaissable. Affichés seulement sur les îlots débloqués.
// ═══════════════════════════════════════════════════════
const _ZONE_DECOR = {
 plaine:           ['🌾','🐰','🦋','🌼'],
 village:          ['🏠','🧑‍🌾','🐔','🌳'],
 prairie:          ['🌻','🌷','🐝','🦋'],
 bonbons:          ['🍬','🧁','🍩','🍫'],
 foret:            ['🌲','🦌','🧚','🦉'],
 champignons:      ['🍄','🐌','🌿','🦋'],
 trolls:           ['🌲','⛺','🪵','👺'],
 plage:            ['🌴','🦀','🐚','⛱️'],
 desert:           ['🌵','🦂','🌞','🦎'],
 plaines_venteuses:['🌾','💨','🦬','🍃'],
 temple:           ['🗿','🏺','📜','🕯️'],
 profondeurs:      ['🐠','🐚','🪸','🐙'],
 glace:            ['❄️','⛄','🧊','🐧'],
 marais:           ['🐸','🕷️','🌿','🐍'],
 forteresse:       ['⚔️','🛡️','🚩','🐉'],
 sakura:           ['🌸','🏯','🎏','🐦'],
 nocturne:         ['🌙','⭐','🦇','🦉'],
 volcan:           ['🔥','🪨','💨','🦎'],
 espace:           ['⭐','🪐','🚀','☄️'],
 cimes:            ['🦅','☁️','🪨','🌬️'],
 mecanique:        ['⚙️','🔧','🔩','💡'],
 ile:              ['🌴','🦜','🗺️','💰'],
 sanctuaire:       ['✨','🔮','🏮','⛩️'],
};
function _buildZoneDecorHtml(positions, foggedMap, W){
 let html = '';
 positions.forEach(p => {
  if(foggedMap && foggedMap[p.regionId]) return;          // rien sur les îlots verrouillés
  const decor = _ZONE_DECOR[p.zone.id];
  if(!decor) return;
  decor.forEach((emoji, i) => {
   // Position déterministe autour du nœud (stable entre les rendus, pas de scintillement)
   const angle = (i / decor.length) * Math.PI * 2 + (p.zoneIdx * 0.7) + 0.4;
   const radius = 48 + (i % 2) * 16;
   const dx = Math.cos(angle) * radius;
   const dy = Math.sin(angle) * radius * 0.62 - 8;        // aplati + remonté (évite le label sous le nœud)
   const leftPct = p.xPct + (dx / W) * 100;
   const topPx = p.y + dy;
   const delay = ((p.zoneIdx + i) % 5) * 0.4;
   html += `<div class="archipel-zone-decor" style="left:${leftPct.toFixed(1)}%;top:${topPx.toFixed(0)}px;animation-delay:${delay}s;">${emoji}</div>`;
  });
 });
 return html;
}

// v8.7.66 (esthétique) : SCÈNE PAYSAGE dans la modale de zoom de zone.
// Vraie composition : dégradé ciel→sol par biome, éléments aériens en haut,
// éléments posés sur la ligne d'horizon en bas, tailles proportionnées, et
// placement par rejet pour ne jamais chevaucher les étapes ni les autres décors.
// Tout est confiné à la zone des étapes (sous l'encart "boss vaincu").
const _BIOME_SCENE = {
 CP:  { sky:'#bfe9ff', ground:'#5fa83f' },
 CE1: { sky:'#a7dcc6', ground:'#2f6b4e' },
 CE2: { sky:'#ffe0a6', ground:'#c47e38' },
 CM1: { sky:'#d2e2ee', ground:'#7d8a99' },
 CM2: { sky:'#2a1448', ground:'#532a76' },
};
// Taille relative par emoji (un arbre/maison >> une poule/fleur)
const _DECOR_SIZE = {
 '🌳':1.75,'🌲':1.85,'🌴':1.75,'🏠':1.7,'🏡':1.7,'🏯':1.95,'🏰':2.05,'🏛️':1.9,'🗿':1.6,'🌋':2.0,'⛰️':1.95,'🏔️':1.95,'🪐':1.8,'🏝️':1.7,'⛩️':1.85,'🏮':1.35,
 '🦌':1.3,'🐂':1.35,'🐄':1.35,'🐑':1.2,'🦬':1.4,'🐉':1.55,'🐙':1.35,'⛺':1.45,'🚀':1.55,'🤖':1.35,'⛄':1.25,'⚙️':1.25,'🏺':1.05,'🛡️':1.05,'⚔️':1.1,'🚩':1.15,'🗺️':1.1,
};
const _decorSize = (e)=> _DECOR_SIZE[e] || 0.82;
// Éléments aériens (placés dans le ciel)
const _DECOR_SKY = new Set(['☀️','🌞','🌙','⭐','☁️','🦋','🦅','🦜','🐦','🦇','☄️','🪐','🌌','💨','🌬️','✨','🎏','🧚','🦉']);

function _buildZoomSceneHtml(zoneId, zone, stepPositions, containerW, sceneH){
 const decor = _ZONE_DECOR[zoneId];
 if(!decor || typeof _archHash !== 'function') return '';
 const biome = _BIOME_SCENE[(zone&&zone.level)] || _BIOME_SCENE.CP;
 const horizonPct = 72;                                  // ligne d'horizon (sol en dessous)
 const horizonPx = (horizonPct/100) * sceneH;
 const skyEls = decor.filter(e=>_DECOR_SKY.has(e));
 const groundEls = decor.filter(e=>!_DECOR_SKY.has(e));
 const groundList = groundEls.length ? groundEls : decor;
 const skyList = skyEls.length ? skyEls : ['☁️'];
 const placed = [];
 const STEP_R = 48;                                       // rayon d'exclusion autour des étapes
 function free(xPx, yPx, rPx){
  for(const sp of stepPositions){
   const dx=xPx-sp.x, dy=yPx-sp.y;
   if(Math.sqrt(dx*dx+dy*dy) < STEP_R + rPx) return false;
  }
  for(const p of placed){
   const dx=xPx-p.x, dy=yPx-p.y;
   if(Math.sqrt(dx*dx+dy*dy) < p.r + rPx + 8) return false;
  }
  return true;
 }
 // Dégradé ciel + bande de sol (avec ligne d'horizon)
 let html = `<div class="zoom-scene-sky" style="background:linear-gradient(to bottom, ${biome.sky}, ${biome.sky}00 ${horizonPct}%);"></div>`
          + `<div class="zoom-scene-ground" style="top:${horizonPct}%;background:linear-gradient(to bottom, ${biome.ground}, ${biome.ground}cc);"></div>`;
 // Éléments de sol : posés sur la ligne d'horizon, répartis horizontalement
 const groundCount = Math.min(8, 5 + groundList.length);
 for(let i=0;i<groundCount;i++){
  const e = groundList[i % groundList.length];
  const sz = _decorSize(e);
  const fontPx = 17 * sz;                                 // taille rendue approx (em→px)
  const rPx = fontPx * 0.55;
  let placedOk=false;
  for(let k=0;k<18 && !placedOk;k++){
   const xPct = 7 + _archHash(zoneId, i*37+k*7+1)*86;
   const xPx = xPct/100*containerW;
   // base posée sur la ligne d'horizon (+ légère variation pour profondeur)
   const yPx = horizonPx - rPx*0.2 + _archHash(zoneId,i*11+k+2)*26 - 4;
   if(free(xPx, yPx, rPx)){
    placed.push({x:xPx,y:yPx,r:rPx});
    const op = (0.6 + _archHash(zoneId,i*5+9)*0.25).toFixed(2);
    const delay = ((i)%5)*0.4, dur=(4.5+(i%3)).toFixed(1);
    html += `<div class="archipel-zoom-decor" style="left:${xPct.toFixed(1)}%;top:${yPx.toFixed(0)}px;font-size:${(sz).toFixed(2)}em;opacity:${op};animation-delay:${delay}s;animation-duration:${dur}s;">${e}</div>`;
    placedOk=true;
   }
  }
 }
 // Éléments de ciel : flottant dans la moitié haute
 const skyCount = Math.min(5, 3 + skyList.length);
 for(let i=0;i<skyCount;i++){
  const e = skyList[i % skyList.length];
  const sz = _decorSize(e);
  const fontPx = 17 * sz;
  const rPx = fontPx * 0.5;
  let placedOk=false;
  for(let k=0;k<18 && !placedOk;k++){
   const xPct = 8 + _archHash(zoneId, i*53+k*5+3)*84;
   const xPx = xPct/100*containerW;
   const yPx = 16 + _archHash(zoneId, i*29+k+4)*(horizonPx*0.42);
   if(free(xPx, yPx, rPx)){
    placed.push({x:xPx,y:yPx,r:rPx});
    const op = (0.55 + _archHash(zoneId,i*7+1)*0.25).toFixed(2);
    const delay = ((i)%5)*0.5, dur=(5+(i%3)).toFixed(1);
    html += `<div class="archipel-zoom-decor sky" style="left:${xPct.toFixed(1)}%;top:${yPx.toFixed(0)}px;font-size:${(sz).toFixed(2)}em;opacity:${op};animation-delay:${delay}s;animation-duration:${dur}s;">${e}</div>`;
    placedOk=true;
   }
  }
 }
 return html;
}

// ═══════════════════════════════════════════════════════
// v8.7.67 (O5) : FIL NARRATIF — « Les Cristaux de Calcultopia »
// Système data-driven et EXTENSIBLE : pour ajouter un îlot (et donc un Cristal),
// il suffit d'ajouter une région à _ARCH_REGIONS et un chapitre à _STORY.chapters.
// Le nombre de Cristaux et les déclencheurs s'adaptent automatiquement.
// ═══════════════════════════════════════════════════════
