import { useEffect, useMemo, useState } from "react";
import { db, collection, onSnapshot } from "../services/firebase.js";

export default function Home({ go, approved, requireApproved, pending, rejected }) {
  const [meetups, setMeetups] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "meetups"), s => setMeetups(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, "reviews"), s => setReviews(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, "members"), s => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const publicMeetups = meetups.filter(m => ["approved", "lightning"].includes(m.status));
  const lightning = publicMeetups.find(m => m.isLightning || m.status === "lightning");
  const thisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return publicMeetups.filter(m => {
      const d = new Date((m.date || "") + "T00:00:00");
      return d >= start && d <= end;
    }).slice(0, 6);
  }, [meetups]);

  return (
    <main className="hero">
      <section className="heroCard">
        <p className="eyebrow">People Arrive, Discover, and Open up.</p>
        <h1>오늘의 만남이,<br />언젠가 오래 기억될<br />추억이 되도록.</h1>
        <p className="lead">파도는 사람을 연결하고, 함께한 순간을 기록하는 부산 2030 커뮤니티 플랫폼입니다.</p>
        <div className="actions">
          {approved
            ? <button className="btn primary" onClick={() => requireApproved("meetups")}>📅 밋업 만들기</button>
            : pending
              ? <button className="btn primary" onClick={() => go("pending")}>승인 상태 확인</button>
              : rejected
                ? <button className="btn primary" onClick={() => go("rejected")}>승인 결과 확인</button>
                : <button className="btn primary" onClick={() => go("signup")}>파도 가입하기</button>}
          <button className="btn" onClick={() => go("meetups")}>밋업 보기</button>
          <button className="btn" onClick={() => go("notices")}>공지사항</button>
        </div>
      </section>

      {lightning && (
        <section className="lightning">
          <p className="eyebrow">오늘의 번개</p>
          <h2>⚡ {lightning.title}</h2>
          <p className="meta">📍 {lightning.location} · 🕢 {lightning.time || "시간 미정"}<br />👥 현재 {(lightning.participants || []).length}명 참여</p>
          <button className="btn primary" onClick={() => go("meetups")}>참여하기</button>
        </section>
      )}

      <section className="grid">
        <article className="card statBig"><span>👥 멤버</span><b>{members.filter(m => m.status === "approved").length || 0}명</b></article>
        <article className="card statBig"><span>📅 이번 주 밋업</span><b>{thisWeek.length}개</b></article>
        <article className="card statBig"><span>📸 후기</span><b>{reviews.length}개</b></article>
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="sectionTitle"><h2>📅 이번 주 밋업</h2><button className="btn" onClick={() => go("meetups")}>전체보기</button></div>
        <div className="grid">
          {thisWeek.length ? thisWeek.map(m => <article className="card" key={m.id}><h3>{m.title}</h3><p className="meta">{m.date} {m.time}<br />📍 {m.location}</p></article>) : <article className="card">이번 주 공개된 밋업이 아직 없어요.</article>}
        </div>
      </section>
    </main>
  );
}
