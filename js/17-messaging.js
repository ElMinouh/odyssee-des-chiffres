// 17-messaging.js — L'Odyssée des Chiffres
// Messagerie fermée (contacts validés des deux côtés), branchée sur le Worker odyssee-chat.
// IMPORTANT : l'identité + l'état d'activation sont stockés dans une zone SÉPARÉE
// (localStorage 'chatProfiles'), indépendante du profil de jeu — donc insensible à la
// synchronisation cloud (qui réécrit user_<nom>).
'use strict';

const CHAT_API = 'https://odyssee-chat.air7841.workers.dev';

// ═══════════════════════════════════════════════════════
// STOCKAGE SÉPARÉ (identité, activation, non-lus) par nom de profil
// ═══════════════════════════════════════════════════════
function _chatStore(){ try{ return JSON.parse(localStorage.getItem('chatProfiles') || '{}'); }catch(e){ return {}; } }
function _chatSaveStore(s){ try{ localStorage.setItem('chatProfiles', JSON.stringify(s)); }catch(e){} }
function _chatLoad(name){
 const s = _chatStore(); const e = s[name] || {};
 return { name, chatId:e.id||null, chatSecret:e.secret||null, chatEnabled:!!e.enabled, chatRegistered:!!e.registered, chatSeen:e.seen||{}, ts:e.ts||0 };
}
function _chatPersist(prof){
 if(!prof || !prof.name) return;
 const s = _chatStore();
 s[prof.name] = { id:prof.chatId||null, secret:prof.chatSecret||null, enabled:!!prof.chatEnabled, registered:!!prof.chatRegistered, seen:prof.chatSeen||{}, ts:prof.ts||0 };
 _chatSaveStore(s);
}

// ═══════════════════════════════════════════════════════
// IDENTITÉ (code ami public + secret privé)
// ═══════════════════════════════════════════════════════
const _CHAT_IDCHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O/I/1
function _chatRand(n, chars){
 chars = chars || _CHAT_IDCHARS;
 if(typeof crypto !== 'undefined' && crypto.getRandomValues){
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  let s=''; for(const b of a) s += chars[b % chars.length]; return s;
 }
 let s=''; for(let i=0;i<n;i++) s += chars[Math.floor(Math.random()*chars.length)]; return s;
}
function _chatGenId(){ return _chatRand(4) + '-' + _chatRand(4); }            // ex: 7K2P-9QXM
function _chatGenSecret(){ return _chatRand(28, 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'); }
function ensureChatIdentity(prof){
 if(!prof) return prof;
 let changed=false;
 if(!prof.chatId){ prof.chatId = _chatGenId(); changed=true; }
 if(!prof.chatSecret){ prof.chatSecret = _chatGenSecret(); changed=true; }
 if(!prof.chatSeen){ prof.chatSeen = {}; }
 if(changed) _chatPersist(prof);
 return prof;
}

// ═══════════════════════════════════════════════════════
// CLIENT API (Worker)
// ═══════════════════════════════════════════════════════
async function _chatApi(path, body){
 try{
  const r = await fetch(CHAT_API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  return await r.json();
 }catch(e){ return { error:'network' }; }
}
function _chatAuth(prof){ return { id: prof.chatId, secret: prof.chatSecret }; }
function _chatProfileAvatar(name){ try{ const gp=(typeof P!=='undefined' && P && P.name===name) ? P : (typeof _readProfile==='function' ? _readProfile(name) : null); return (gp && gp.avatar) || '\uD83E\uDDD9'; }catch(e){ return '\uD83E\uDDD9'; } }
async function chatRegister(prof){ ensureChatIdentity(prof); return _chatApi('/register', { id:prof.chatId, secret:prof.chatSecret, name:prof.name, avatar:_chatProfileAvatar(prof.name) }); }
async function chatFriendRequest(prof, code){ return _chatApi('/friend/request', Object.assign(_chatAuth(prof), { code })); }
async function chatFriendList(prof){ return _chatApi('/friend/list', _chatAuth(prof)); }
async function chatFriendAccept(prof, from){ return _chatApi('/friend/accept', Object.assign(_chatAuth(prof), { from })); }
async function chatFriendDecline(prof, from){ return _chatApi('/friend/decline', Object.assign(_chatAuth(prof), { from })); }
async function chatFriendRemove(prof, other){ return _chatApi('/friend/remove', Object.assign(_chatAuth(prof), { other })); }
async function chatFriendBlock(prof, other){ return _chatApi('/friend/block', Object.assign(_chatAuth(prof), { other })); }
async function chatFriendUnblock(prof, other){ return _chatApi('/friend/unblock', Object.assign(_chatAuth(prof), { other })); }
async function chatMsgSend(prof, to, txt){ return _chatApi('/msg/send', Object.assign(_chatAuth(prof), { to, body:txt })); }
async function chatMsgFetch(prof, withId, since){ return _chatApi('/msg/fetch', Object.assign(_chatAuth(prof), { with:withId, since:since||0 })); }
async function chatMsgLatest(prof){ return _chatApi('/msg/latest', _chatAuth(prof)); }

// ═══════════════════════════════════════════════════════
// ACTIVATION (parental) — désactivée par défaut
// ═══════════════════════════════════════════════════════
function chatIsEnabled(prof){ return !!(prof && prof.chatEnabled); }
function chatIsEnabledByName(name){ return name ? _chatLoad(name).chatEnabled : false; }

async function chatEnableForProfile(name){
 if(!name) return { error:'no_profile' };
 const prof = _chatLoad(name);
 ensureChatIdentity(prof);
 prof.chatEnabled = true; prof.ts = Date.now(); _chatPersist(prof);     // état LOCAL d'abord (jamais annulé sur échec réseau)
 let res = await chatRegister(prof);
 if(res && res.error === 'taken'){ prof.chatId = _chatGenId(); _chatPersist(prof); res = await chatRegister(prof); }
 if(res && res.ok){ prof.chatRegistered = true; _chatPersist(prof); }
 if(typeof scheduleCloudSync==='function'){ try{ scheduleCloudSync(); }catch(e){} } // fait voyager l'identité via le cloud
 return res || { error:'network' };
}
function chatDisableForProfile(name){
 if(!name) return;
 const prof = _chatLoad(name); prof.chatEnabled = false; prof.ts = Date.now(); _chatPersist(prof);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ═══════════════════════════════════════════════════════
// NON LUS
// ═══════════════════════════════════════════════════════
function _chatSeen(prof){ return prof.chatSeen || (prof.chatSeen = {}); }
function _chatMarkSeen(prof, contactId, msgId){ if(!prof||!contactId) return; const s=_chatSeen(prof); if((msgId||0) > (s[contactId]||0)){ s[contactId]=msgId; _chatPersist(prof); } }
function chatUnreadCount(prof, latestMap){
 if(!prof || !latestMap) return 0;
 const seen = _chatSeen(prof); let n=0;
 for(const cid in latestMap){ if((latestMap[cid]||0) > (seen[cid]||0)) n++; }
 return n;
}

// ═══════════════════════════════════════════════════════
// ÉTAT UI + OUVERTURE
// ═══════════════════════════════════════════════════════
var _msgProf = null;       // objet messagerie (identité + état) du profil consulté
var _msgReadOnly = false;  // mode lecture seule (visualisation parentale)
var _msgConv = null;       // {id, name, lastId}
var _msgConvTimer = null;
var _msgBadgePoll = null;

function _e(s){ return (typeof esc==='function') ? esc(s) : String(s==null?'':s); }
// _jsAttr est désormais mutualisée dans 01-core.js (v11.1.10) — plus de définition locale ici.
function _msgEl(){ return document.getElementById('msg-overlay'); }
function _curName(){ return (typeof P!=='undefined' && P) ? P.name : null; }

async function openMessaging(readOnlyName){
 const name = readOnlyName || _curName();
 const ro = !!readOnlyName;
 if(!name){ if(typeof toast==='function') toast('Aucun profil.',2000); return; }
 if(!ro){ try{ await chatSyncIdentityFromCloud(name); }catch(e){} } // adopte l'identité du cloud si elle existe
 const prof = _chatLoad(name);
 if(!prof.chatEnabled && !ro){ if(typeof toast==='function') toast('La messagerie est désactivée. Un parent peut l\u2019activer dans Vue Parent → Options.',3200); return; }
 ensureChatIdentity(prof);
 _msgProf = prof; _msgReadOnly = ro; _msgConv = null;
 const ov = _msgEl(); if(ov) ov.classList.remove('hidden');
 if(typeof _msgFabUpdate==='function') _msgFabUpdate();
 if(!ro){
  if(!prof.chatRegistered){ const r = await chatRegister(prof); if(r && r.ok){ prof.chatRegistered = true; _chatPersist(prof); } }
  else { try{ chatRegister(prof).catch(function(){}); }catch(e){} } // rafraîchit prénom+avatar en arrière-plan
 }
 renderContactsScreen();
}
function closeMessaging(){
 _stopConvPoll(); _msgConv = null;
 const ov = _msgEl(); if(ov) ov.classList.add('hidden');
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ═══════════════════════════════════════════════════════
// ÉCRAN CONTACTS
// ═══════════════════════════════════════════════════════
async function renderContactsScreen(){
 _stopConvPoll();
 const body = document.getElementById('msg-body'); if(!body) return;
 const prof = _msgProf;
 const myCode = prof.chatId || '(—)';
 body.innerHTML = '<p style="text-align:center;color:#bdc3c7;font-size:.85em;margin:20px;">Chargement\u2026</p>';
 const data = await chatFriendList(prof);
 if(!data || data.error){
  body.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:.85em;margin:20px;">Connexion impossible. Vérifie la connexion internet.</p>'
   + '<div style="text-align:center;"><button onclick="renderContactsScreen()" style="font-size:.85em;">Réessayer</button></div>';
  return;
 }
 try{ (data.contacts||[]).forEach(c=>{ _chatContactCache[c.id]={name:c.name,avatar:c.avatar}; }); }catch(e){}
 let html = '';
 html += '<div style="background:rgba(52,152,219,.1);border:1px solid rgba(52,152,219,.35);border-radius:10px;padding:10px 12px;margin-bottom:12px;">'
  + '<p style="margin:0 0 2px;font-size:.74em;color:#bdc3c7;">Ton code ami (à donner pour être ajouté) :</p>'
  + '<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:1.1em;font-weight:700;letter-spacing:1px;color:#5dade2;">'+_e(myCode)+'</span>'
  + '<button onclick="chatCopyCode()" style="font-size:.72em;padding:4px 8px;">📋 Copier</button></div></div>';

 const inc = data.incoming || [];
 if(inc.length && !_msgReadOnly){
  html += '<p style="font-size:.78em;font-weight:700;color:#f1c40f;margin:6px 0;">📨 Demandes reçues</p>';
  inc.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id), av=_e(c.avatar||'\uD83E\uDDD9');
   html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;margin:4px 0;">'
    + '<span style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.9em;">'+cn+'</span>'
    + '<button onclick="chatAcceptContact(\''+cid+'\')" style="background:#27ae60;font-size:.76em;padding:5px 10px;">✅ Accepter</button>'
    + '<button onclick="chatDeclineContact(\''+cid+'\')" style="background:#7f8c8d;font-size:.76em;padding:5px 10px;">✕</button></div>';
  });
 }

 let latest = {};
 try{ const l = await chatMsgLatest(prof); if(l && l.latest) latest = l.latest; }catch(e){}
 const seen = _chatSeen(prof);

 const contacts = data.contacts || [];
 html += '<p style="font-size:.78em;font-weight:700;color:#bdc3c7;margin:12px 0 6px;">👥 Mes amis</p>';
 if(!contacts.length){
  html += '<div style="text-align:center;border:2px dashed rgba(255,255,255,.18);border-radius:14px;padding:16px;margin:6px 0;">'
   + '<div style="font-size:30px;">🤝</div>'
   + '<p style="font-size:.82em;color:#9aa6b2;margin:6px 0 0;">Pas encore d\u2019amis ?<br>Partage ton code ami pour vous ajouter !</p></div>';
 } else {
  contacts.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id), av=_e(c.avatar||'\uD83E\uDDD9');
   const nameArg=_jsAttr(c.name||c.id), avArg=_jsAttr(c.avatar||'');
   const unread = (latest[c.id]||0) > (seen[c.id]||0);
   html += '<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;margin:5px 0;cursor:pointer;" onclick="chatOpenConv(\''+cid+'\',\''+nameArg+'\',\''+avArg+'\')">'
    + '<span style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.95em;font-weight:600;">'+cn+'</span>'
    + (unread ? '<span style="background:#e74c3c;border-radius:50%;width:11px;height:11px;display:inline-block;"></span>' : '')
    + '<button onclick="event.stopPropagation();chatRemoveContact(\''+cid+'\',\''+nameArg+'\')" style="background:transparent;border:none;color:#7f8c8d;font-size:1em;cursor:pointer;" title="Retirer">\u2715</button>'
    + '<span style="color:#7f8c8d;">\u203A</span></div>';
  });
 }

 if(!_msgReadOnly){
  html += '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px;">'
   + '<p style="font-size:.78em;font-weight:700;color:#2ecc71;margin:0 0 6px;">➕ Ajouter un ami</p>'
   + '<input type="text" id="msg-addcode" placeholder="Code ami (ex: 7K2P-9QXM)" style="width:70%;text-transform:uppercase;font-family:monospace;letter-spacing:1px;">'
   + '<button onclick="chatAddFriend()" style="background:#27ae60;font-size:.82em;margin-left:4px;">Envoyer</button>'
   + '<p id="msg-add-msg" style="font-size:.76em;margin-top:6px;"></p></div>';
 } else {
  html += '<p style="font-size:.74em;color:#7f8c8d;text-align:center;margin-top:14px;">👁 Visualisation parentale (lecture seule)</p>';
 }
 body.innerHTML = html;
}

function chatCopyCode(){
 const code = _msgProf && _msgProf.chatId; if(!code) return;
 try{ navigator.clipboard.writeText(code); if(typeof toast==='function') toast('📋 Code copié !',1800); }
 catch(e){ if(typeof toast==='function') toast(code,3000); }
}
async function chatAddFriend(){
 const inp = document.getElementById('msg-addcode'); const msg = document.getElementById('msg-add-msg');
 if(!inp) return; const code = inp.value.trim().toUpperCase();
 if(!code){ if(msg){msg.innerText='Entre un code ami.';msg.style.color='#e74c3c';} return; }
 if(msg){ msg.innerText='Envoi\u2026'; msg.style.color='#bdc3c7'; }
 const res = await chatFriendRequest(_msgProf, code);
 if(res && res.ok){
  if(res.status==='accepted'){ if(msg){msg.innerText='✅ Vous êtes déjà amis !';msg.style.color='#2ecc71';} }
  else { if(msg){msg.innerText='✅ Demande envoyée ! Ton ami devra l\u2019accepter de son côté.';msg.style.color='#2ecc71';} }
  inp.value=''; setTimeout(renderContactsScreen, 1200);
 } else {
  const m = (res && res.error==='no_such_code') ? 'Ce code ami n\u2019existe pas.'
          : (res && res.error==='invalid') ? 'Code invalide.'
          : 'Échec. Vérifie la connexion.';
  if(msg){ msg.innerText='❌ '+m; msg.style.color='#e74c3c'; }
 }
}
async function chatAcceptContact(from){
 if(!_chatParentGate()) return;
 const res = await chatFriendAccept(_msgProf, from);
 if(res && res.ok){ if(typeof toast==='function') toast('✅ Ami ajouté !',2000); renderContactsScreen(); }
 else if(typeof toast==='function') toast('Échec de l\u2019ajout.',2000);
}
async function chatDeclineContact(from){
 const res = await chatFriendDecline(_msgProf, from);
 if(res && res.ok) renderContactsScreen();
}
async function chatRemoveContact(other, name){
 if(!confirm('Retirer '+name+' de tes amis ? Vous ne pourrez plus vous écrire.')) return;
 const res = await chatFriendRemove(_msgProf, other);
 if(res && res.ok){ if(typeof toast==='function') toast('Contact retiré.',1800); renderContactsScreen(); }
}
function _chatParentGate(){
 if(_msgReadOnly) return true;
 const pin = prompt('Validation parentale\n\nEntre le code parent pour accepter ce contact :');
 if(pin===null) return false;
 if(typeof checkStoredPin==='function' && checkStoredPin(String(pin).trim())) return true;
 if(typeof toast==='function') toast('❌ Code parent incorrect.',2000);
 return false;
}

// ═══════════════════════════════════════════════════════
// ÉCRAN CONVERSATION
// ═══════════════════════════════════════════════════════
async function chatOpenConv(id, name, avatar){
 const cached = _chatContactCache[id];
 _msgConv = { id, name, avatar: avatar || (cached && cached.avatar) || null, lastId:0 };
 renderConvShell(name);
 await _convFetch(true);
 if(!_msgReadOnly) _startConvPoll();
}
function renderConvShell(name){
 const body = document.getElementById('msg-body'); if(!body) return;
 const av = (_msgConv && _msgConv.avatar) || '\uD83E\uDDD9';
 body.innerHTML =
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
  + '<button onclick="renderContactsScreen()" style="background:#444;font-size:.82em;padding:5px 10px;">\u2039 Retour</button>'
  + '<span style="width:30px;height:30px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:16px;">'+_e(av)+'</span>'
  + '<span style="font-weight:700;font-size:1em;">'+_e(name)+'</span></div>'
  + '<div style="position:relative;">'
  + '<div id="msg-thread" onscroll="_msgThreadScroll()" style="height:46vh;overflow-y:auto;background:rgba(0,0,0,.2);border-radius:10px;padding:10px;"></div>'
  + '<button id="msg-jump" class="hidden" onclick="_msgJumpToBottom()">\u2193 nouveau message</button>'
  + '</div>'
  + (_msgReadOnly
     ? '<p style="font-size:.74em;color:#7f8c8d;text-align:center;margin-top:8px;">\uD83D\uDC41 Lecture seule (espace parent)</p>'
     : ('<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">'
        + CHAT_PHRASES.map(s=>'<button onclick="chatQuickSend(\''+_jsAttr(s)+'\')" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:6px 11px;font-size:.82em;">'+_e(s)+'</button>').join('')
        + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">'
        + CHAT_STICKERS.map(s=>'<button onclick="chatQuickSend(\''+s+'\')" style="background:rgba(255,255,255,.08);border-radius:50%;width:38px;height:38px;font-size:19px;padding:0;line-height:1;">'+s+'</button>').join('')
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:8px;">'
        + '<input type="text" id="msg-input" maxlength="1000" placeholder="Ton message\u2026" style="flex:1;" onkeydown="if(event.key===\'Enter\')chatSendCurrent()">'
        + '<button onclick="chatSendCurrent()" style="background:#27ae60;">Envoyer</button></div>'));
}
function _fmtTime(ts){ if(!ts) return ''; try{ const d=new Date(ts); const h=d.getHours(), m=d.getMinutes(); return h+':'+(m<10?'0':'')+m; }catch(e){ return ''; } }
function _msgSpeakIdx(i){ const m=_convCache[i]; if(m && typeof speak==='function'){ try{ speak(m.body); }catch(e){} } }
function _msgShowJump(){ const b=document.getElementById('msg-jump'); if(b) b.classList.remove('hidden'); }
function _msgHideJump(){ const b=document.getElementById('msg-jump'); if(b) b.classList.add('hidden'); }
function _msgJumpToBottom(){ const th=document.getElementById('msg-thread'); if(th) th.scrollTop = th.scrollHeight; _msgHideJump(); }
function _msgThreadScroll(){ const th=document.getElementById('msg-thread'); if(th && (th.scrollHeight - th.scrollTop - th.clientHeight) < 40) _msgHideJump(); }
function _renderBubbles(messages){
 const thread = document.getElementById('msg-thread'); if(!thread) return;
 const mine = _msgProf.chatId;
 const av = (_msgConv && _msgConv.avatar) || '\uD83E\uDDD9';
 const pend = _chatPendingFor(_msgConv && _msgConv.id).map(q=>({ sender:mine, body:q.body, ts:q.ts, pending:true }));
 messages = (messages||[]).concat(pend);
 const atBottom = !thread.innerHTML || (thread.scrollHeight - thread.scrollTop - thread.clientHeight) < 40;
 const prevTop = thread.scrollTop;
 const lastIdx = messages.length - 1;
 thread.innerHTML = messages.map((m, i) => {
  const isMine = (m.sender === mine);
  const t = _fmtTime(m.ts);
  if(isMine){
   const pop = (_msgJustSent && i===lastIdx) ? ' msg-pop' : '';
   return '<div class="msg-row msg-out"><div class="msg-bub msg-bub-out'+pop+'">'
    + '<div>'+_e(m.body)+'</div>'
    + '<div class="msg-meta msg-meta-out"><span>'+t+'</span><span class="msg-ck">'+(m.pending?'\u23F3':'\u2713')+'</span></div></div></div>';
  }
  return '<div class="msg-row msg-in"><div class="msg-av">'+_e(av)+'</div>'
   + '<div class="msg-bub msg-bub-in"><div>'+_e(m.body)+'</div>'
   + '<div class="msg-meta"><span>'+t+'</span><span class="msg-spk" onclick="_msgSpeakIdx('+i+')">\uD83D\uDD0A</span></div></div></div>';
 }).join('');
 _msgJustSent = false;
 if(atBottom){ thread.scrollTop = thread.scrollHeight; _msgHideJump(); }
 else { thread.scrollTop = prevTop; _msgShowJump(); }
}
// ── Phrases toutes prêtes + autocollants (non-lecteurs) + file d'attente hors-ligne ──
var CHAT_PHRASES = ['Coucou !','Bravo !','Tu joues ?','Merci !','À bientôt !'];
var CHAT_STICKERS = ['\uD83D\uDC4D','\u2B50','\uD83C\uDF89','\u2764\uFE0F','\uD83D\uDE00','\uD83D\uDC36','\uD83E\uDD84'];
function _chatQueueLoad(){ try{ return JSON.parse(localStorage.getItem('chatQueue')||'[]'); }catch(e){ return []; } }
function _chatQueueSave(q){ try{ localStorage.setItem('chatQueue', JSON.stringify(q)); }catch(e){} }
function _chatEnqueue(prof,to,body){ const q=_chatQueueLoad(); const it={ sender:prof.chatId, to:to, body:body, ts:Date.now(), tmpId:'q'+Math.random().toString(36).slice(2,9) }; q.push(it); _chatQueueSave(q); return it; }
function _chatQueueRemove(tmpId){ _chatQueueSave(_chatQueueLoad().filter(x=>x.tmpId!==tmpId)); }
function _chatPendingFor(to){ if(!to||!_msgProf||!_msgProf.chatId) return []; return _chatQueueLoad().filter(x=>x.sender===_msgProf.chatId && x.to===to); }
var _chatFlushing=false;
async function _chatFlushQueue(prof){
 if(_chatFlushing || !prof || !prof.chatId) return 0;
 const mine=_chatQueueLoad().filter(x=>x.sender===prof.chatId);
 if(!mine.length) return 0;
 _chatFlushing=true; let sent=0;
 try{
  for(const it of mine){
   try{
    const r=await chatMsgSend(prof, it.to, it.body);
    if(r && r.ok){ _chatQueueRemove(it.tmpId); sent++; }
    else if(r && (r.error==='not_contact'||r.error==='blocked'||r.error==='empty')){ _chatQueueRemove(it.tmpId); } // jamais envoyable → on retire
    else { break; } // réseau/serveur KO → on garde et on réessaiera
   }catch(e){ break; }
  }
 } finally { _chatFlushing=false; }
 return sent;
}
async function _chatSend(body){
 if(!_msgConv) return;
 body=String(body==null?'':body).trim(); if(!body) return;
 const res = await chatMsgSend(_msgProf, _msgConv.id, body);
 if(res && res.ok){
  _convCache.push({ id:res.id, sender:_msgProf.chatId, body:body, ts:res.ts });
  _msgConv.lastId = res.id || _msgConv.lastId;
  _msgJustSent = true;
  _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
  _renderBubbles(_convCache);
 } else if(res && (res.error==='not_contact'||res.error==='blocked'||res.error==='empty')){
  const m = res.error==='not_contact' ? 'Vous n\u2019êtes plus amis.' : (res.error==='blocked' ? 'Ce contact est bloqué.' : 'Message vide.');
  if(typeof toast==='function') toast('\u274C '+m, 2500);
 } else {
  _chatEnqueue(_msgProf, _msgConv.id, body); // hors-ligne → file d'attente
  _msgJustSent = true;
  _renderBubbles(_convCache);
  if(typeof toast==='function') toast('Hors-ligne : message en attente d\u2019envoi.', 2400);
 }
}
function chatQuickSend(text){ _chatSend(text); }

var _convCache = [];
var _msgJustSent = false;
async function _convFetch(reset){
 if(!reset && !_msgReadOnly){ try{ await _chatFlushQueue(_msgProf); }catch(e){} }
 if(!_msgConv) return;
 if(reset) _convCache = [];
 const since = reset ? 0 : _msgConv.lastId;
 const res = await chatMsgFetch(_msgProf, _msgConv.id, since);
 if(res && res.ok && res.messages){
  if(res.messages.length){
   _convCache = _convCache.concat(res.messages);
   _msgConv.lastId = _convCache[_convCache.length-1].id;
   _renderBubbles(_convCache);
   _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
  } else if(reset){ _renderBubbles([]); }
 } else if(reset){
  const thread = document.getElementById('msg-thread');
  if(thread) thread.innerHTML = '<p style="color:#e74c3c;font-size:.82em;text-align:center;">Connexion impossible.</p>';
 }
}
function chatInsertEmoji(em){ const i=document.getElementById('msg-input'); if(i){ i.value += em; i.focus(); } }
async function chatSendCurrent(){
 const inp = document.getElementById('msg-input'); if(!inp) return;
 const txt = inp.value.trim(); if(!txt) return;
 inp.value=''; inp.disabled=true;
 await _chatSend(txt);
 inp.disabled=false; inp.focus();
}
function _startConvPoll(){ _stopConvPoll(); _msgConvTimer = setInterval(()=>{ _convFetch(false); }, 4000); }
function _stopConvPoll(){ if(_msgConvTimer){ clearInterval(_msgConvTimer); _msgConvTimer=null; } }

// ═══════════════════════════════════════════════════════
// ENVELOPPE FLOTTANTE UNIQUE (partout) + PASTILLE + BANDEAU
// Une seule enveloppe en coin, présente sur tous les écrans,
// masquée pendant une question (vue v-game) et quand la
// messagerie est ouverte. Remplace l'ancien bouton menu + HUD.
// ═══════════════════════════════════════════════════════
function _msgEnsureFab(){
 if(!document.getElementById('msg-fab-style')){
  const st=document.createElement('style'); st.id='msg-fab-style';
  st.textContent=''
   +'#msg-fab{position:fixed;right:14px;bottom:16px;height:44px;padding:0 15px 0 11px;border-radius:22px;background:#fff;border:1px solid #e7ddcd;box-shadow:0 3px 10px rgba(0,0,0,.18);display:inline-flex;align-items:center;gap:7px;font-size:21px;cursor:pointer;z-index:9000;transition:transform .15s;}'+'.msg-fab-lbl{font-size:.72rem;font-weight:700;color:#2c2c2a;letter-spacing:.2px;}'
   +'#msg-fab:active{transform:scale(.92);}#msg-fab.hidden{display:none;}'
   +'#msg-fab-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;line-height:20px;background:#e74c3c;color:#fff;font-size:.7rem;font-weight:700;border-radius:10px;text-align:center;padding:0 5px;box-shadow:0 1px 3px rgba(0,0,0,.3);}'
   +'#msg-fab-badge.hidden{display:none;}#msg-fab.msg-fab-pop{animation:msgFabPop .55s;}'
   +'@keyframes msgFabPop{0%{transform:scale(1);}25%{transform:scale(1.18) rotate(-9deg);}55%{transform:scale(.95) rotate(7deg);}100%{transform:scale(1) rotate(0);}}'
   +'#msg-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%) translateY(-140%);max-width:340px;width:calc(100% - 28px);background:#fff;border:1px solid #e7ddcd;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.22);padding:10px 14px;display:flex;align-items:center;gap:10px;z-index:9500;cursor:pointer;transition:transform .38s cubic-bezier(.2,.8,.2,1.15);}'
   +'#msg-toast.msg-toast-show{transform:translateX(-50%) translateY(0);}#msg-toast.hidden{display:none;}'
   +'.msg-row{display:flex;align-items:flex-end;gap:6px;margin-bottom:8px;}.msg-row.msg-out{justify-content:flex-end;}'
   +'.msg-av{width:26px;height:26px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}'
   +'.msg-bub{max-width:76%;padding:7px 11px;border-radius:14px;font-size:.92em;word-break:break-word;}'
   +'.msg-bub-in{background:#fff;color:#2c2c2a;border:1px solid #eee;border-bottom-left-radius:4px;}'
   +'.msg-bub-out{background:#cdeafc;color:#0c447c;border-bottom-right-radius:4px;}'
   +'.msg-meta{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:.62rem;color:#9aa6b2;}.msg-meta-out{justify-content:flex-end;color:#5a86a8;}'
   +'.msg-spk{cursor:pointer;font-size:.85rem;}.msg-ck{font-weight:700;}'
   +'.msg-pop{animation:msgBubPop .28s ease-out;}@keyframes msgBubPop{0%{transform:scale(.6) translateY(6px);opacity:0;}100%{transform:scale(1) translateY(0);opacity:1;}}'
   +'#msg-jump{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;background:#1d9e75;color:#fff;border:none;border-radius:14px;padding:6px 14px;font-size:.78rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);z-index:20;}#msg-jump.hidden{display:none;}';
  document.head.appendChild(st);
 }
 if(!document.getElementById('msg-fab')){
  const fab=document.createElement('div');
  fab.id='msg-fab'; fab.className='hidden'; fab.setAttribute('role','button'); fab.setAttribute('aria-label','Messagerie');
  fab.onclick=function(){ try{ openMessaging(); }catch(e){} };
  fab.innerHTML='\u2709\uFE0F<span class="msg-fab-lbl">Messagerie</span><span id="msg-fab-badge" class="hidden"></span>';
  document.body.appendChild(fab);
 }
 if(!document.getElementById('msg-toast')){
  const t=document.createElement('div'); t.id='msg-toast'; t.className='hidden';
  document.body.appendChild(t);
 }
}
function _msgGameViewActive(){ const g=document.getElementById('v-game'); return !!(g && !g.classList.contains('hidden')); }
function _msgOverlayOpen(){ const ov=document.getElementById('msg-overlay'); return !!(ov && !ov.classList.contains('hidden')); }
function _msgFabUpdate(){
 _msgEnsureFab();
 const fab=document.getElementById('msg-fab'); if(!fab) return;
 const name=_curName(); const prof=name?_chatLoad(name):null;
 const show = !!(prof && prof.chatEnabled && prof.chatId) && !_msgGameViewActive() && !_msgOverlayOpen();
 fab.classList.toggle('hidden', !show);
}
function _msgWrapShowView(){
 if(typeof showView!=='function' || showView._msgWrapped) return;
 const orig=showView;
 showView=function(){ orig.apply(this, arguments); try{ _msgFabUpdate(); }catch(e){} };
 showView._msgWrapped=true;
}

// Détection d'un nouveau message entrant → enveloppe qui tressaute + son + bandeau.
var _chatLastLatest = {};
var _chatLatestInit = false;
var _chatContactCache = {}; // id -> {name, avatar}
var _msgToastTimer = null;
async function _chatMaybeNotify(prof, latest){
 const seen = _chatSeen(prof);
 if(!_chatLatestInit){ _chatLatestInit = true; _chatLastLatest = Object.assign({}, latest); return; } // 1re passe : pas de notif
 const newcomers=[];
 for(const cid in latest){
  const cur=latest[cid]||0, prev=_chatLastLatest[cid]||0;
  const isOpen=_msgOverlayOpen() && _msgConv && _msgConv.id===cid;
  if(cur>prev && cur>(seen[cid]||0) && !isOpen) newcomers.push(cid);
 }
 _chatLastLatest = Object.assign({}, latest);
 if(!newcomers.length) return;
 const fab=document.getElementById('msg-fab');
 if(fab && !fab.classList.contains('hidden')){ fab.classList.remove('msg-fab-pop'); void fab.offsetWidth; fab.classList.add('msg-fab-pop'); }
 try{ beep(660,'sine',.12,.07); setTimeout(()=>{ try{ beep(880,'sine',.12,.07); }catch(e){} },130); }catch(e){}
 const cid=newcomers[newcomers.length-1];
 let info=_chatContactCache[cid];
 if(!info){
  try{ const fl=await chatFriendList(prof); if(fl&&fl.ok&&Array.isArray(fl.contacts)){ fl.contacts.forEach(c=>{ _chatContactCache[c.id]={name:c.name,avatar:c.avatar}; }); info=_chatContactCache[cid]; } }catch(e){}
 }
 _msgShowToast(cid, info);
}
function _msgShowToast(cid, info){
 _msgEnsureFab();
 const t=document.getElementById('msg-toast'); if(!t) return;
 const name=(info&&info.name)||'un ami';
 const av=(info&&info.avatar)||'\uD83D\uDC64';
 t.innerHTML='<div style="width:34px;height:34px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">'+_e(av)+'</div>'
  +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#2c2c2a;">\uD83D\uDCE9 Nouveau message</div>'
  +'<div style="font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">de '+_e(name)+'</div></div>';
 t.onclick=function(){ _msgHideToast(); _msgOpenConvFromNotif(cid, name); };
 t.classList.remove('hidden'); void t.offsetWidth; t.classList.add('msg-toast-show');
 if(_msgToastTimer) clearTimeout(_msgToastTimer);
 _msgToastTimer=setTimeout(_msgHideToast, 4500);
}
function _msgHideToast(){
 const t=document.getElementById('msg-toast'); if(!t) return;
 t.classList.remove('msg-toast-show');
 if(_msgToastTimer) clearTimeout(_msgToastTimer);
 _msgToastTimer=setTimeout(()=>{ if(t) t.classList.add('hidden'); }, 400);
}
async function _msgOpenConvFromNotif(cid, name){
 try{ await openMessaging(); }catch(e){}
 setTimeout(()=>{ try{ chatOpenConv(cid, name); }catch(e){} }, 280);
}

async function chatRefreshBadges(){
 _msgEnsureFab();
 const name = _curName();
 const prof = name ? _chatLoad(name) : null;
 const enabled = !!(prof && prof.chatEnabled);
 // anciennes entrées remplacées par l'enveloppe flottante unique
 const menuBtn = document.getElementById('menu-msg-btn'); if(menuBtn) menuBtn.classList.add('hidden');
 const hud = document.getElementById('hud-msg'); if(hud) hud.classList.add('hidden');
 _msgFabUpdate();
 if(!enabled || !prof || !prof.chatId){ _setBadge('msg-fab-badge',0); _setBadge('menu-msg-badge',0); _setBadge('hud-msg-badge',0); _chatLastLatest={}; _chatLatestInit=false; return; }
 const l = await chatMsgLatest(prof);
 const latest = (l && l.latest) ? l.latest : {};
 const n = chatUnreadCount(prof, latest);
 _setBadge('msg-fab-badge', n); _setBadge('menu-msg-badge', n); _setBadge('hud-msg-badge', n);
 try{ await _chatMaybeNotify(prof, latest); }catch(e){}
}
function _setBadge(id, n){
 const el = document.getElementById(id); if(!el) return;
 if(n>0){ el.textContent = n>9?'9+':String(n); el.classList.remove('hidden'); }
 else { el.classList.add('hidden'); }
}
// Tire l'identité de messagerie depuis le cloud (lecture seule du profil cloud, sans toucher au profil de jeu).
async function chatSyncIdentityFromCloud(name){
 name = name || _curName(); if(!name) return;
 let prof = null;
 try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : (typeof _readProfile==='function' ? _readProfile(name) : null); }catch(e){}
 const code = prof && prof.cloudCode;
 if(!code || typeof pullProfileFromCloud!=='function') return;
 try{
  const res = await pullProfileFromCloud(code);
  if(res && res.ok && res.profile && res.profile._chat){ chatMergeFromCloud(name, res.profile._chat); }
 }catch(e){}
}
var _chatPushedOnce = false;
async function chatSyncTick(){
 const name = _curName();
 if(name){
  await chatSyncIdentityFromCloud(name);              // adopte l'identité du cloud si dispo (tablette/téléphone)
  const prof = _chatLoad(name);
  if(prof.chatEnabled && prof.chatId){ try{ await _chatFlushQueue(prof); }catch(e){} } // ré-essaie les messages hors-ligne
  if(prof.chatEnabled && prof.chatId && !_chatPushedOnce){ // s'assure que l'appareil déjà activé pousse son identité
   _chatPushedOnce = true;
   try{ if(typeof scheduleCloudSync==='function') scheduleCloudSync(); }catch(e){}
  }
 }
 if(!_chatAllPulled){ _chatAllPulled = true; try{ await chatPullAllIdentities(); }catch(e){} } // adopte TOUS les profils synchronisés
 chatRefreshBadges();
}
function chatStartBadgePoll(){
 _msgEnsureFab(); _msgWrapShowView();
 if(_msgBadgePoll) clearInterval(_msgBadgePoll);
 chatSyncTick();
 _msgBadgePoll = setInterval(chatSyncTick, 25000);
}

// ═══════════════════════════════════════════════════════
// SECTION « MESSAGERIE » DANS LE PANNEAU PROFIL (espace parent)
// ═══════════════════════════════════════════════════════
// Actions parent : bloquer/débloquer un contact, accepter/refuser une demande (déjà dans l'espace parent).
async function chatBlockContact(name, otherId, otherName){
 if(!confirm('Bloquer '+(otherName||otherId)+' ?\n\nCe contact ne pourra plus échanger avec '+name+' et ses messages seront ignorés. Tu pourras le débloquer plus tard.')) return;
 const prof=_chatLoad(name); if(!prof.chatId) return;
 const r=await chatFriendBlock(prof, otherId);
 if(typeof toast==='function') toast((r&&r.ok)?'\uD83D\uDEAB Contact bloqué.':'Échec du blocage.',2000);
 _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}
async function chatUnblockContact(name, otherId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 const r=await chatFriendUnblock(prof, otherId);
 if(r&&r.ok && typeof toast==='function') toast('Contact débloqué.',1600);
 _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}
async function optAcceptPending(name, fromId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 const r=await chatFriendAccept(prof, fromId);
 if(r&&r.ok && typeof toast==='function') toast('\u2705 Contact accepté.',1600);
 _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}
async function optDeclinePending(name, fromId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 await chatFriendDecline(prof, fromId);
 if(typeof toast==='function') toast('Demande refusée.',1500);
 _renderOptMsgManage(name);
}
// Sous-panneau parent : demandes en attente + contacts (bloquer) + bloqués (débloquer).
async function _renderOptMsgManage(name){
 const box=document.getElementById('opt-msg-manage'); if(!box) return;
 const prof=_chatLoad(name);
 if(!prof.chatEnabled || !prof.chatId){ box.innerHTML=''; return; }
 box.innerHTML='<p style="font-size:.72em;color:#7f8c8d;margin:8px 0 4px;">Chargement\u2026</p>';
 let fl=null; try{ fl=await chatFriendList(prof); }catch(e){}
 if(!fl || !fl.ok){ box.innerHTML='<p style="font-size:.72em;color:#7f8c8d;margin:8px 0;">Contacts indisponibles (hors-ligne ?).</p>'; return; }
 const nEsc=_jsAttr(name);
 const av=c=>_e(c.avatar||'\uD83E\uDDD9'), nm=c=>_e(c.name||c.id), idOf=c=>_e(c.id);
 const avat=v=>'<span style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">'+v+'</span>';
 let h='';
 const inc=fl.incoming||[];
 if(inc.length){
  h+='<div style="margin-top:10px;font-size:.74em;font-weight:700;color:#f39c12;">\uD83D\uDCE5 Demandes en attente ('+inc.length+')</div>';
  inc.forEach(c=>{ h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;">'+avat(av(c))
    +'<span style="flex:1;font-size:.82em;">'+nm(c)+'</span>'
    +'<button onclick="optAcceptPending(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#27ae60;font-size:.72em;padding:4px 9px;">Accepter</button>'
    +'<button onclick="optDeclinePending(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#7f8c8d;font-size:.72em;padding:4px 9px;">Refuser</button></div>'; });
 }
 const contacts=fl.contacts||[];
 h+='<div style="margin-top:10px;font-size:.74em;font-weight:700;color:#bdc3c7;">\uD83D\uDC65 Contacts ('+contacts.length+')</div>';
 if(!contacts.length) h+='<p style="font-size:.72em;color:#7f8c8d;margin:4px 0;">Aucun contact.</p>';
 contacts.forEach(c=>{ const cnArg=_jsAttr(c.name||c.id);
  h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;">'+avat(av(c))
   +'<span style="flex:1;font-size:.82em;">'+nm(c)+'</span>'
   +'<button onclick="chatBlockContact(\''+nEsc+'\',\''+idOf(c)+'\',\''+cnArg+'\')" style="background:#c0392b;font-size:.72em;padding:4px 9px;">\uD83D\uDEAB Bloquer</button></div>'; });
 const blocked=fl.blocked||[];
 if(blocked.length){
  h+='<div style="margin-top:10px;font-size:.74em;font-weight:700;color:#e74c3c;">\uD83D\uDEAB Bloqués ('+blocked.length+')</div>';
  blocked.forEach(c=>{ h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;opacity:.7;">'+avat(av(c))
    +'<span style="flex:1;font-size:.82em;">'+nm(c)+'</span>'
    +'<button onclick="chatUnblockContact(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#7f8c8d;font-size:.72em;padding:4px 9px;">Débloquer</button></div>'; });
 }
 box.innerHTML=h;
}

function renderOptMessaging(name){
 const box = document.getElementById('opt-messaging'); if(!box) return;
 if(!name){ box.innerHTML=''; return; }
 const prof = _chatLoad(name);
 const on = !!prof.chatEnabled;
 const code = prof.chatId || '(généré à l\u2019activation)';
 const nEsc = _jsAttr(name);
 box.innerHTML =
  '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
  + '<span style="font-size:.85em;">Messagerie : <b style="color:'+(on?'#2ecc71':'#e67e22')+';">'+(on?'active':'suspendue')+'</b></span>'
  + '<button onclick="optToggleMessaging(\''+nEsc+'\')" style="background:'+(on?'#e67e22':'#27ae60')+';font-size:.78em;padding:5px 12px;">'+(on?'\u23F8 Suspendre':'\u25B6 Réactiver')+'</button>'
  + '</div>'
  + (on
     ? ('<p style="font-size:.72em;color:#bdc3c7;margin:0 0 6px;">Code ami : <span style="font-family:monospace;color:#5dade2;">'+_e(code)+'</span></p>'
        + '<button onclick="openMessaging(\''+nEsc+'\')" style="background:#2980b9;font-size:.8em;">\uD83D\uDC41 Voir les conversations</button>'
        + '<button onclick="chatAdoptCloudIdentity(\''+nEsc+'\')" style="background:#16a085;font-size:.78em;margin-left:4px;">\uD83D\uDD01 Aligner le code ami sur les autres appareils</button>'
        + '<div style="margin-top:8px;font-size:.7em;color:#9aa6b2;">Forcer le même code ami (transfert manuel d\u2019un appareil à l\u2019autre) :</div>'
        + '<button onclick="chatExportIdentityCode(\''+nEsc+'\')" style="background:#7f8c8d;font-size:.76em;">\uD83D\uDCE4 Exporter le code</button>'
        + '<button onclick="chatImportIdentityCode(\''+nEsc+'\')" style="background:#7f8c8d;font-size:.76em;margin-left:4px;">\uD83D\uDCE5 Importer un code</button>'
        + '<div id="opt-msg-manage"></div>')
     : '<p style="font-size:.72em;color:#7f8c8d;margin:0;">Suspendue : le code ami, les amis et l\u2019historique sont <b>conservés</b>. Réactive quand tu veux pour reprendre avec le même code.</p>');
 if(on){ try{ _renderOptMsgManage(name); }catch(e){} }
}
async function optToggleMessaging(name){
 const prof = _chatLoad(name);
 if(prof.chatEnabled){
  if(!confirm('Suspendre la messagerie pour '+name+' ?\n\nLe code ami, les amis et l\u2019historique sont conservés. Tu pourras réactiver à tout moment avec le même code.')) return;
  chatDisableForProfile(name);
  if(typeof toast==='function') toast('\u23F8 Messagerie suspendue (identité conservée).',2200);
 } else {
  if(typeof toast==='function') toast('Réactivation\u2026',1500);
  const res = await chatEnableForProfile(name);
  if(res && res.ok){ if(typeof toast==='function') toast('\u25B6 Messagerie réactivée !',2000); }
  else { if(typeof toast==='function') toast('\u25B6 Réactivée. Le code se synchronisera à la prochaine ouverture.',3200); }
 }
 renderOptMessaging(name);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ── Synchronisation de l'identité via le cloud (fusion NON destructive) ──
function chatExportFor(name){ if(!name) return null; return _chatStore()[name] || null; }
function _chatMergeSeen(a,b){ const o=Object.assign({}, a||{}); const bb=b||{}; for(const k in bb){ if((bb[k]||0)>(o[k]||0)) o[k]=bb[k]; } return o; }
function chatMergeFromCloud(name, cloudChat){
 if(!name || !cloudChat || typeof cloudChat!=='object') return;
 const s=_chatStore(); const local=s[name]||{};
 const adoptId = (!local.id && !!cloudChat.id);
 const lt = local.ts||0, ct = cloudChat.ts||0;
 let enabled;
 if(lt===0 && ct===0) enabled = !!(local.enabled || cloudChat.enabled); // compat : aucun horodatage → OU
 else enabled = (ct > lt) ? !!cloudChat.enabled : !!local.enabled;       // le réglage le plus récent gagne (désactivation ne rebondit plus)
 s[name]={
  id: local.id || cloudChat.id || null,
  secret: local.secret || cloudChat.secret || null,
  enabled: enabled,
  registered: adoptId ? false : !!(local.registered || cloudChat.registered),
  seen: _chatMergeSeen(local.seen, cloudChat.seen),
  ts: Math.max(lt, ct)
 };
 _chatSaveStore(s);
 if(typeof chatRefreshBadges==='function'){ try{ chatRefreshBadges(); }catch(e){} }
}

// Force l'envoi de l'identité de messagerie de TOUS les profils activés vers le cloud
// (réutilise la version cloud la plus à jour pour ne pas régresser le profil de jeu).
async function chatForceSyncMessaging(){
 if(typeof getRoster!=='function' || typeof CLOUD_API==='undefined'){ if(typeof toast==='function') toast('Synchro cloud indisponible.',2500); return; }
 const roster = getRoster(); let okN=0, skip=0, fail=0;
 for(const name of roster){
  const local = _chatLoad(name);
  if(!local.chatEnabled || !local.chatId){ skip++; continue; }
  let prof=null; try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : _readProfile(name); }catch(e){}
  const cc = prof && prof.cloudCode;
  if(!cc){ fail++; continue; }
  let base = prof;
  try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile) base = r.profile; }catch(e){}
  const payload = Object.assign({}, base);
  delete payload._syncedAt;
  payload._chat = { id:local.chatId, secret:local.chatSecret, enabled:true, registered:!!local.chatRegistered, seen:local.chatSeen||{}, ts:local.ts||Date.now() };
  try{
   const r = await fetch(`${CLOUD_API}/profile/${encodeURIComponent(cc)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
   if(r.ok){ okN++; } else { fail++; }
  }catch(e){ fail++; }
 }
 if(typeof toast==='function') toast('🔄 Messagerie envoyée pour '+okN+' profil(s). Recharge maintenant les autres appareils.', 4500);
 return { ok:okN, skip, fail };
}
// Côté récepteur : tire l'identité de TOUS les profils synchronisés (une fois par session).
var _chatAllPulled = false;
async function chatPullAllIdentities(){
 if(typeof getRoster!=='function') return;
 for(const n of getRoster()){
  const local = _chatLoad(n);
  if(local.chatId) continue; // déjà une identité locale
  let prof=null; try{ prof = _readProfile(n); }catch(e){}
  const cc = prof && prof.cloudCode; if(!cc) continue;
  try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile && r.profile._chat){ chatMergeFromCloud(n, r.profile._chat); } }catch(e){}
 }
}

// Aligne volontairement l'identité de CE profil sur celle, commune, du cloud (remplace l'identité locale).
async function chatAdoptCloudIdentity(name){
 let prof=null; try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : _readProfile(name); }catch(e){}
 const cc = prof && prof.cloudCode;
 if(!cc){ if(typeof toast==='function') toast('Ce profil n\u2019est pas en sauvegarde cloud.',3000); return; }
 if(!confirm('Aligner le code ami de '+name+' sur celui des autres appareils ?\n\nLe code ami actuel de CET appareil sera remplacé par le code commun (cloud). Tu retrouveras alors les amis et l\u2019historique communs.')) return;
 if(typeof toast==='function') toast('Récupération\u2026',1500);
 let cloudChat=null;
 try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile && r.profile._chat) cloudChat = r.profile._chat; }catch(e){}
 if(!cloudChat || !cloudChat.id){ if(typeof toast==='function') toast('Aucune identité commune trouvée sur le cloud. Lance d\u2019abord « Forcer la synchro » depuis l\u2019appareil de référence.',5000); return; }
 const s=_chatStore();
 s[name]={ id:cloudChat.id, secret:cloudChat.secret, enabled:true, registered:false, seen:cloudChat.seen||{}, ts:cloudChat.ts||Date.now() };
 _chatSaveStore(s);
 try{ const p=_chatLoad(name); const rr=await chatRegister(p); if(rr&&rr.ok){ p.chatRegistered=true; _chatPersist(p); } }catch(e){}
 if(typeof toast==='function') toast('✅ Code ami aligné ('+cloudChat.id+'). Amis et historique communs récupérés.',5000);
 if(typeof renderOptMessaging==='function') renderOptMessaging(name);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ── Transfert MANUEL du code de messagerie (force le même code ami entre appareils) ──
function chatExportIdentityCode(name){
 const p = _chatLoad(name);
 if(!p.chatId || !p.chatSecret){ if(typeof toast==='function') toast('Active d\u2019abord la messagerie pour ce profil.',3000); return; }
 let code=''; try{ code = btoa(JSON.stringify({ v:1, id:p.chatId, secret:p.chatSecret })); }catch(e){ code=''; }
 if(!code){ if(typeof toast==='function') toast('Erreur d\u2019export.',2500); return; }
 try{ if(navigator && navigator.clipboard) navigator.clipboard.writeText(code); }catch(e){}
 if(typeof prompt==='function') prompt('Code de messagerie de '+name+' (déjà copié).\nColle-le sur l\u2019autre appareil via « Importer un code » :', code);
 return code;
}
async function chatImportIdentityCode(name){
 const code = (typeof prompt==='function') ? prompt('Colle le code de messagerie de '+name+' (exporté depuis l\u2019appareil de référence) :') : null;
 if(!code) return;
 let data=null; try{ data = JSON.parse(atob(String(code).trim())); }catch(e){}
 if(!data || !data.id || !data.secret){ if(typeof toast==='function') toast('Code invalide.',3000); return; }
 const s=_chatStore();
 s[name] = { id:data.id, secret:data.secret, enabled:true, registered:false, seen:(s[name]&&s[name].seen)||{}, ts:Date.now() };
 _chatSaveStore(s);
 try{ const p=_chatLoad(name); const rr=await chatRegister(p); if(rr&&rr.ok){ p.chatRegistered=true; _chatPersist(p); } }catch(e){}
 if(typeof toast==='function') toast('✅ Code ami importé ('+data.id+'). Amis et historique récupérés.',5000);
 if(typeof renderOptMessaging==='function') renderOptMessaging(name);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// Démarrage : suivi des pastilles + affichage du bouton menu (fixe)
try{ if(typeof window!=='undefined'){ setTimeout(()=>{ if(typeof chatStartBadgePoll==='function') chatStartBadgePoll(); }, 1500); } }catch(e){}
