// 06-time-block.js — L'Odyssée des Chiffres
'use strict';

// Blocage horaire (contrôle parental) et filtres d'opérations.

// ═══════════════════════════════════════════════════════
// BLOCAGE HORAIRE
// ═══════════════════════════════════════════════════════
function isTimeBlocked(){
 const cfg=getBlockCfg(P.name);if(!cfg||!cfg.enabled)return false;
 const now=new Date(),h=now.getHours(),m=now.getMinutes();
 const cur=h*60+m;
 const [sh,sm]=cfg.start.split(':').map(Number);const [eh,em]=cfg.end.split(':').map(Number);
 const s=sh*60+sm,e=eh*60+em;
 return!(cur>=s&&cur<=e);
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
function closeBlockScreen(){$('time-block-screen').classList.add('hidden');clearInterval(blockClockInterval);}
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
   <label for="opf-${op.key}">${op.label}<br><span style="font-size:.7em;color:#bdc3c7;">${op.affects.join(', ')}</span></label>
   <label class="toggle-sw"><input type="checkbox" id="opf-${op.key}" ${f[op.key]!==false?'checked':''}><span class="toggle-slider"></span></label>
  </div>`).join('');
}
function saveFilterSettings(){
 const name=$('filter-player').value;
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+name)||'{}');}catch(e){d={};}
 d.opFilters={};OP_FILTERS.forEach(op=>{d.opFilters[op.key]=$('opf-'+op.key)?.checked!==false;});
 localStorage.setItem('user_'+name,JSON.stringify(d));
 $('filter-status').innerText=`✅ Filtres mis à jour pour ${name}`;
 if(P.name===name)P.opFilters=d.opFilters;
 beep(600,'sine',.3);
}
