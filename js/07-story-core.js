// ═══════════════════════════════════════════════════════
// 07-story-core.js — Helpers structurels zone ↔ région
// ═══════════════════════════════════════════════════════
// Extrait de 07-story.js (ADR-54, "petit lot low-risk" — scission de
// 07-story.js). Ces fonctions sont utilisées par 07-map.js, 07-game.js et
// 07-boss.js, en plus de 07-story.js lui-même : elles vivaient jusqu'ici au
// milieu de 3700+ lignes de textes narratifs, sans lien logique avec eux.
// Isolées ici, elles clarifient la frontière entre "moteur de zones/régions"
// (toujours nécessaire dès l'accueil) et "contenu narratif" (utile seulement
// une fois en Odyssée) — première étape vers un futur chargement différé de
// 07-story.js, sans le tenter ici (voir ADR-54 pour le plan complet).
//
// Ne dépendent que des globals _ARCH_REGIONS / MAP_ZONES / P, résolus au
// moment de l'appel (pas au chargement) — aucune contrainte d'ordre de
// chargement avec 07-story.js ou 07-map.js.

// Une région est « conquise » quand toutes ses zones sont battues (cohérent avec
// la détection de conquête d'îlot du moteur). Extensible via _ARCH_REGIONS/MAP_ZONES.
// v10.2.0 — Helpers génériques zone↔région (compatibles 3 aventures).
// Les zones des nouvelles aventures portent z.region ; le primaire se résout
// par niveau (+ cas sanctuaire). Toute logique de région DOIT passer par ici.
function _regionOfZone(zone){
 if(!zone) return null;
 if(zone.region) return _ARCH_REGIONS.find(r => r.id === zone.region) || null;
 if(zone.id === 'sanctuaire') return _ARCH_REGIONS.find(r => r.id === 'final') || null;
 return _ARCH_REGIONS.find(r => r.levels.includes(zone.level) && r.id !== 'final') || null;
}
function _zonesOfRegion(regionId){
 const reg = _ARCH_REGIONS.find(r => r.id === regionId);
 if(!reg) return [];
 return MAP_ZONES.filter(z => {
  if(z.region) return z.region === reg.id;
  if(reg.id === 'final') return z.id === 'sanctuaire';
  return reg.levels.includes(z.level) && z.id !== 'sanctuaire';
 });
}
// Dernière région de l'aventure active (porte l'épilogue)
function _lastRegionId(){
 try{ return _ARCH_REGIONS[_ARCH_REGIONS.length-1].id; }catch(e){ return 'final'; }
}

function _regionConquered(regionId){
 try{
  const zones = _zonesOfRegion(regionId);
  if(!zones.length) return false;
  const beaten = (typeof P!=='undefined' && P && P.mapBossBeaten) ? P.mapBossBeaten : [];
  return zones.every(z => beaten.includes(z.id));
 }catch(e){ return false; }
}
// v10.13.6 — Accessibilité d'une zone, avec garde anti-soft-lock : si la zone
// précédente est battue ET qu'on franchit une frontière de région entièrement
// conquise, la 1re zone de la région suivante est TOUJOURS jouable, sans exiger
// le palier d'étoiles (sinon un joueur peu scoreur reste bloqué entre deux îles).
function _zoneReachable(p, beaten, starsTotal){
 // Progression LINÉAIRE : plus de verrou par étoiles. Un lieu est accessible dès que
 // le lieu précédent est réussi ; le 1er lieu d'un nouvel îlot dès que l'îlot précédent
 // est entièrement conquis. Les étoiles ne servent plus qu'à la collection / la boutique.
 try{
  const idx = p.zoneIdx;
  if(idx === 0) return true;
  const prevZone = MAP_ZONES[idx-1];
  if(!prevZone || !beaten.includes(prevZone.id)) return false;
  if(prevZone.region && p.zone.region && prevZone.region !== p.zone.region){
   return _regionConquered(prevZone.region);
  }
  return true;
 }catch(e){ return false; }
}
