// 06-time-block.js — L'Odyssée des Chiffres
'use strict';

// Blocage horaire (contrôle parental) et filtres d'opérations.

// ═══════════════════════════════════════════════════════
// BLOCAGE HORAIRE
// ═══════════════════════════════════════════════════════
// v11.7.3 (audit n°12) : format HH:MM strict — une config corrompue ou mal
// formée ne doit jamais verrouiller l'enfant en permanence (fail-open, pas
// fail-closed : c'est un confort parental, pas un dispositif de sécurité).
function _isValidTimeStr(s){ return typeof s==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s); }
// AUD-02-033 (audit fonctionnel 2026-09-21) : aucun moyen, depuis l'écran de
// blocage, de débloquer temporairement l'accès sans que le parent aille
// modifier manuellement les horaires (avec le risque réel d'oublier de les
// remettre ensuite). Dérogation ponctuelle, via re-saisie du code parent —
// reste un « confort parental, pas un dispositif de sécurité » (cf. commentaire
// ci-dessus sur le fail-open), même esprit que le reste de ce module.
const TIME_BLOCK_OVERRIDE_MS = 60*60*1000; // 1h : assez pour une session, pas un contournement permanent
function _blockOverrideKey(name){ return 'blockOverrideUntil_'+name; }
function _blockOverrideActive(name){
 try{
  const until=parseInt(localStorage.getItem(_blockOverrideKey(name))||'0',10)||0;
  return until>Date.now();
 }catch(e){ return false; }
}
function isTimeBlocked(){
 const cfg=getBlockCfg(P.name);if(!cfg||!cfg.enabled)return false;
 if(_blockOverrideActive(P.name)) return false; // dérogation ponctuelle en cours
 if(!_isValidTimeStr(cfg.start)||!_isValidTimeStr(cfg.end)) return false;
 const now=new Date(),h=now.getHours(),m=now.getMinutes();
 const cur=h*60+m;
 const [sh,sm]=cfg.start.split(':').map(Number);const [eh,em]=cfg.end.split(':').map(Number);
 const s=sh*60+sm,e=eh*60+em;
 // v2 (audit AUD-01-011) : plage traversant minuit (ex. 20:00-07:00, jeu
 // autorisé en soirée jusqu'au matin). Avant ce correctif, start>end rendait
 // la condition toujours fausse : jeu bloqué en PERMANENCE, alors que la
 // config est parfaitement valide (contrairement au constat n°12, qui
 // portait sur des données corrompues, pas sur ce cas arithmétique).
 if(s<=e) return!(cur>=s&&cur<=e);
 return!(cur>=s||cur<=e);
}
function getBlockCfg(name){try{return JSON.parse(localStorage.getItem('block_'+name)||'null');}catch(e){return null;}}
function showBlockScreen(){
 const cfg=getBlockCfg(P.name)||{start:'17:00',end:'18:00'};
 $('block-msg').innerText=`Jeu autorisé entre ${cfg.start} et ${cfg.end}`;
 $('time-block-screen').classList.remove('hidden');
 clearInterval(blockClockInterval);
 blockClockInterval=setInterval(()=>{
  const n=new Date();
  $('block-clock').innerText=n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0')+':'+n.getSeconds().toString().padStart(2,'0');
 },1000);
}
// AUD-02-033 : déclenchée par le bouton « Dérogation ponctuelle » de l'écran
// de blocage — réutilise showPrompt() (01-core.js, Lot 3.1) et checkStoredPin()
// (déjà utilisée pour d'autres re-saisies de code parent hors Vue Parent,
// ex. chatSendCurrent() en 17-messaging.js).
function requestTemporaryUnblock(){
 if(typeof showPrompt!=='function' || typeof checkStoredPin!=='function') return;
 showPrompt('Code parent pour débloquer l’accès pendant 1 heure :', async (pin)=>{
  if(await checkStoredPin(String(pin||'').trim())){
   try{ localStorage.setItem(_blockOverrideKey(P.name), String(Date.now()+TIME_BLOCK_OVERRIDE_MS)); }catch(e){}
   clearInterval(blockClockInterval);
   $('time-block-screen').classList.add('hidden');
   if(typeof toast==='function') toast('🔓 Débloqué pour 1 heure !', 2500);
  } else {
   if(typeof toast==='function') toast('❌ Code parent incorrect.', 2200);
  }
 }, {title:'Dérogation ponctuelle', inputType:'password', placeholder:'Code parent', confirmLabel:'Débloquer'});
}
// Contrôles parent : blocage horaire
function loadBlockSettings(){
 const name=$('block-player').value;const cfg=getBlockCfg(name)||{enabled:false,start:'17:00',end:'18:00'};
 $('block-start').value=cfg.start;$('block-end').value=cfg.end;$('block-enabled').checked=cfg.enabled;
}
function saveBlockSettings(){
 const name=$('block-player').value;
 const cfg={enabled:$('block-enabled').checked,start:$('block-start').value,end:$('block-end').value};
 localStorage.setItem('block_'+name,JSON.stringify(cfg));
 $('block-status').innerText=`✅ Horaire enregistré pour ${name} : ${cfg.start}–${cfg.end}${cfg.enabled?' (actif)':' (inactif)'}`;
 beep(600,'sine',.3);
}

// ═══════════════════════════════════════════════════════
// FILTRES OPÉRATIONS (parent)
// ═══════════════════════════════════════════════════════
function loadFilterSettings(){
 const name=$('filter-player').value;
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+name)||'null');}catch(e){}
 const f=(d&&d.opFilters)||{add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true};
 $('op-filters').innerHTML=OP_FILTERS.map(op=>`
  <div class="op-toggle">
   <label for="opf-${op.key}">${op.label}<br><span style="font-size:.72em;color:#bdc3c7;">${op.affects.join(', ')}</span></label>
   <label class="toggle-sw"><input type="checkbox" id="opf-${op.key}" ${f[op.key]!==false?'checked':''}><span class="toggle-slider"></span></label>
  </div>`).join('');
 // v11.5.2 — bloc dédié aux catégories histoire (miroir de op-filters).
 const hf=(d&&d.histCatFilters)||{frise:true,personnages:true,evenements:true,civilisation:true,temps:true,repere:true};
 $('hist-filters').innerHTML=(typeof HIST_CAT_FILTERS!=='undefined'?HIST_CAT_FILTERS:[]).map(op=>`
  <div class="op-toggle">
   <label for="histf-${op.key}">${op.label}<br><span style="font-size:.72em;color:#bdc3c7;">${op.affects.join(', ')}</span></label>
   <label class="toggle-sw"><input type="checkbox" id="histf-${op.key}" ${hf[op.key]!==false?'checked':''}><span class="toggle-slider"></span></label>
  </div>`).join('');
 // v11.5.3 — bloc dédié aux catégories français (même principe).
 const ff=(d&&d.frCatFilters)||{conj:true,orth:true,gram:true,vocab:true};
 $('fr-filters').innerHTML=(typeof FR_CAT_FILTERS!=='undefined'?FR_CAT_FILTERS:[]).map(op=>`
  <div class="op-toggle">
   <label for="frf-${op.key}">${op.label}<br><span style="font-size:.72em;color:#bdc3c7;">${op.affects.join(', ')}</span></label>
   <label class="toggle-sw"><input type="checkbox" id="frf-${op.key}" ${ff[op.key]!==false?'checked':''}><span class="toggle-slider"></span></label>
  </div>`).join('');
 if(typeof onFilterSubjectChange==='function') onFilterSubjectChange();
}
function saveFilterSettings(){
 const name=$('filter-player').value;
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+name)||'{}');}catch(e){d={};}
 d.opFilters={};OP_FILTERS.forEach(op=>{d.opFilters[op.key]=$('opf-'+op.key)?.checked!==false;});
 // v11.5.2/3 — sauvegarde systématique des 3 blocs (même ceux actuellement
 // masqués) : les cases à cocher existent toujours dans le DOM, seule leur
 // visibilité change avec onFilterSubjectChange().
 d.histCatFilters={};(typeof HIST_CAT_FILTERS!=='undefined'?HIST_CAT_FILTERS:[]).forEach(op=>{d.histCatFilters[op.key]=$('histf-'+op.key)?.checked!==false;});
 d.frCatFilters={};(typeof FR_CAT_FILTERS!=='undefined'?FR_CAT_FILTERS:[]).forEach(op=>{d.frCatFilters[op.key]=$('frf-'+op.key)?.checked!==false;});
 localStorage.setItem('user_'+name,JSON.stringify(d));
 $('filter-status').innerText=`✅ Filtres mis à jour pour ${name}`;
 if(P.name===name){P.opFilters=d.opFilters;P.histCatFilters=d.histCatFilters;P.frCatFilters=d.frCatFilters;}
 beep(600,'sine',.3);
}
