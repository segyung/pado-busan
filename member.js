export const normalizePhone = v => String(v || "").replace(/[^0-9]/g, "");
export const getSessionPhone = () => localStorage.getItem("pado_member_phone") || "";
export const setSessionPhone = p => localStorage.setItem("pado_member_phone", normalizePhone(p));
export const clearSessionPhone = () => localStorage.removeItem("pado_member_phone");
export const isCrew = () => localStorage.getItem("pado_crew") === "yes";
export const setCrew = v => v ? localStorage.setItem("pado_crew", "yes") : localStorage.removeItem("pado_crew");

export function levelFromStats(s = {}) {
  const score = (s.joined || 0) * 2 + (s.created || 0) * 4 + (s.reviews || 0) * 3;
  if (score >= 80) return { icon: "👑", name: "레전드", score };
  if (score >= 50) return { icon: "🌊", name: "파도 메이커", score };
  if (score >= 30) return { icon: "⛵", name: "항해사", score };
  if (score >= 15) return { icon: "🏄", name: "서퍼", score };
  if (score >= 5) return { icon: "🌊", name: "물결", score };
  return { icon: "🌱", name: "새싹", score };
}

export function badgesFromStats(s = {}) {
  const b = [];
  if ((s.joined || 0) >= 1) b.push("🎉 첫 밋업");
  if ((s.reviews || 0) >= 1) b.push("📸 첫 후기");
  if ((s.created || 0) >= 1) b.push("📅 첫 밋업 개설");
  if ((s.joined || 0) >= 10) b.push("🔥 한 달 10회 참여");
  if ((s.lightning || 0) >= 1) b.push("🌙 번개 밋업 참여");
  if ((s.reviews || 0) >= 5) b.push("💙 기록가");
  return b;
}
