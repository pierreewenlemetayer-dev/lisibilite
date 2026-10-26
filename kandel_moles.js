/* Adaptation de ReadSightPy (MIT, Yevhen Leonidov, 2026) et hyph-fr (MIT).
   L'indice utilise les coefficients français de Flesch (Kandel-Moles).
   Attention : les points de césure typographique sont utilisés ici comme proxy des syllabes,
   conformément à ReadSightPy ; ce n'est pas un comptage phonétique. */
(function(root){
'use strict';
function analyser(texte,donnees){
 const patterns=donnees.patterns,maxLen=donnees.maxLength;
 const mots=texte.trim().split(/[^\p{L}'’-]+/u).filter(Boolean);
 if(!mots.length) return null;
 const phrases=(texte.match(/[.!?]+/g)||[]).length||1;
 function syllabes(mot){
  const n=Array.from(mot).length;
  if(n<5)return 1; // hyphenMins: left=2, right=3
  const s='.'+mot.toLowerCase()+'.';const chars=Array.from(s),scores=new Uint8Array(chars.length);
  const end=chars.length-3;
  for(let start=0;start<end;start++){
   for(let len=1;len<=Math.min(maxLen,chars.length-start);len++){
    const weights=patterns[chars.slice(start,start+len).join('')];
    if(!weights)continue;
    for(let k=0;k<weights.length&&start+k<chars.length;k++){
     const v=weights.charCodeAt(k)-48;
     if(v>scores[start+k])scores[start+k]=v;
    }
   }
  }
  let total=1;
  for(let i=3;i<chars.length-3;i++)if(scores[i]&1)total++;
  return total;
 }
 const totalSyllabes=mots.reduce((n,w)=>n+syllabes(w),0);
 const moyenneMots=mots.length/phrases,moyenneSyllabes=totalSyllabes/mots.length;
 const brut=207-1.015*moyenneMots-73.6*moyenneSyllabes;
 // Python round(x,1) : demi-au-pair, utile surtout aux cas limites.
 const scaled=brut*10, low=Math.floor(scaled), frac=scaled-low;
 const score=(frac===0.5?(low%2===0?low:low+1):Math.round(scaled))/10;
 return {score,scoreBrut:brut,mots:mots.length,phrases,syllabes:totalSyllabes,motsParPhrase:moyenneMots,syllabesParMot:moyenneSyllabes};
}
root.KandelMoles={analyser};
if(typeof module!=='undefined'&&module.exports)module.exports=root.KandelMoles;
})(typeof window!=='undefined'?window:globalThis);