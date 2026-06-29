export const normalizePhone=v=>String(v||"").replace(/[^0-9]/g,"");
export const getSessionPhone=()=>localStorage.getItem("pado_member_phone")||"";
export const setSessionPhone=p=>localStorage.setItem("pado_member_phone",normalizePhone(p));
export const clearSessionPhone=()=>localStorage.removeItem("pado_member_phone");
export const isCrew=()=>localStorage.getItem("pado_crew")==="yes";
export const setCrew=v=>v?localStorage.setItem("pado_crew","yes"):localStorage.removeItem("pado_crew");
export const currentGeneration=()=>Number(localStorage.getItem("pado_generation")||"1");
export const setCurrentGeneration=n=>localStorage.setItem("pado_generation",String(n||1));

export function scoreFromStats(s={}){
  return (s.joined||0)*20+(s.created||0)*30+(s.confirmed||0)*20+(s.reviews||0)*10+(s.photos||0)*5+(s.club||0)*15+(s.invited||0)*50+(s.bonus||0);
}
export function levelFromScore(score=0){
  if(score>=3000)return{level:6,icon:"🌊",name:"파도",next:null};
  if(score>=1500)return{level:5,icon:"🌊💦",name:"물보라",next:3000};
  if(score>=700)return{level:4,icon:"🌊",name:"너울",next:1500};
  if(score>=300)return{level:3,icon:"🌊",name:"물결",next:700};
  if(score>=100)return{level:2,icon:"✨",name:"윤슬",next:300};
  return{level:1,icon:"💧",name:"물방울",next:100};
}
export function levelFromStats(s={}){const score=scoreFromStats(s);return{...levelFromScore(score),score};}
export function badgesFromStats(s={},extra=[]){
  const b=new Set(extra||[]);
  if((s.joined||0)>=1)b.add("👋 첫 만남");
  if((s.joined||0)>=5)b.add("🥉 5회 참여");
  if((s.joined||0)>=10)b.add("🥈 10회 참여");
  if((s.joined||0)>=20)b.add("🥇 20회 참여");
  if((s.joined||0)>=50)b.add("💎 50회 참여");
  if((s.created||0)>=1)b.add("🎤 첫 밋업 개설");
  if((s.created||0)>=5)b.add("🚩 밋업장 5회");
  if((s.created||0)>=10)b.add("⭐ 밋업장 10회");
  if((s.lightning||0)>=1)b.add("⚡ 번개 참여");
  if((s.lightning||0)>=5)b.add("🍻 번개왕");
  if((s.reviews||0)>=1)b.add("📝 첫 후기");
  if((s.reviews||0)>=10)b.add("📸 후기왕");
  if((s.invited||0)>=1)b.add("🤝 친구 초대");
  if((s.invited||0)>=5)b.add("🌊 물결 만들기");
  return Array.from(b);
}
