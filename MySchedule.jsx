import { useEffect, useMemo, useState } from "react";
import { db, collection, onSnapshot } from "../services/firebase.js";
import { getSessionPhone } from "../utils/member.js";

const pad = n => String(n).padStart(2, "0");
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayString = () => fmtDate(new Date());
const isPastDate = date => !!date && date < todayString();

export default function MySchedule({ approved, member, requireApproved }) {
  const [meetups, setMeetups] = useState([]);
  const [view, setView] = useState("upcoming");

  useEffect(() => {
    return onSnapshot(collection(db, "meetups"), snap => {
      setMeetups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  if (!approved) {
    return (
      <main className="page narrow">
        <section className="card center statusCard">
          <p className="eyebrow">MY SCHEDULE</p>
          <h1>내 일정은 승인 후 볼 수 있어요</h1>
          <p className="lead dark">파도 가입 승인이 완료되면 내가 신청한 밋업을 한곳에서 확인할 수 있어요.</p>
          <div className="actions centerActions">
            <button className="btn primary" onClick={() => requireApproved("my-schedule", "내 일정은 승인 완료 후 이용할 수 있어요.")}>승인 상태 확인하기</button>
          </div>
        </section>
      </main>
    );
  }

  const phone = getSessionPhone();

  const mine = useMemo(() => meetups
    .filter(m => (m.participants || []).some(p => p.phone === phone))
    .filter(m => ["approved", "lightning", "closed"].includes(m.status))
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || "")), [meetups, phone]);

  const upcoming = mine.filter(m => !isPastDate(m.date));
  const past = mine.filter(m => isPastDate(m.date)).reverse();
  const currentList = view === "past" ? past : upcoming;

  const nextMeetup = upcoming[0];

  return (
    <main className="page">
      <div className="sectionTitle">
        <div>
          <p className="eyebrow">MY SCHEDULE</p>
          <h1>내 일정</h1>
          <p className="muted">{member?.name}님이 신청한 밋업만 모아봤어요.</p>
        </div>
      </div>

      <section className="grid two myScheduleHero">
        <article className="card statBig">
          <span className="pill approved">다가오는 일정</span>
          <b>{upcoming.length}</b>
          <p className="muted">앞으로 참여할 파도 밋업</p>
        </article>
        <article className="card">
          <span className="pill">다음 일정</span>
          {nextMeetup ? (
            <>
              <h3>{nextMeetup.title}</h3>
              <p className="meta">{nextMeetup.date} {nextMeetup.time || ""}<br />📍 {nextMeetup.location}</p>
            </>
          ) : (
            <p className="muted">아직 다가오는 일정이 없어요. 마음 가는 밋업에 신청해봐요 🌊</p>
          )}
        </article>
      </section>

      <div className="tabs scheduleTabs">
        <button className={view === "upcoming" ? "active" : ""} onClick={() => setView("upcoming")}>다가오는 일정</button>
        <button className={view === "past" ? "active" : ""} onClick={() => setView("past")}>지난 일정</button>
      </div>

      <section className="list">
        {currentList.length ? currentList.map(m => <ScheduleCard key={m.id} m={m} />) : (
          <article className="item center">
            <h3>{view === "past" ? "지난 일정이 아직 없어요" : "신청한 밋업이 아직 없어요"}</h3>
            <p className="muted">밋업에서 참가 신청을 누르면 이곳에 자동으로 쌓여요.</p>
            <button className="btn primary" onClick={() => location.hash = "meetups"}>밋업 보러가기</button>
          </article>
        )}
      </section>
    </main>
  );
}

function ScheduleCard({ m }) {
  const count = (m.participants || []).length;
  const isLightning = m.status === "lightning";
  const past = isPastDate(m.date);
  return (
    <article className={`item scheduleCard ${past ? "pastSchedule" : ""}`}>
      <div className="scheduleDateBox">
        <strong>{m.date?.slice(5).replace("-", ".")}</strong>
        <span>{m.time || "시간 미정"}</span>
      </div>
      <div className="scheduleBody">
        <span className={`pill ${isLightning ? "orange" : past ? "pending" : "approved"}`}>{isLightning ? "오늘의 번개" : past ? "지난 일정" : "참가 예정"}</span>
        <h3>{m.title}</h3>
        <p className="meta">📍 {m.location}<br />밋업장: {m.host} · 신청 {count}{m.max ? ` / ${m.max}` : ""}명</p>
        {m.desc && <p>{m.desc}</p>}
        <div className="actions">
          {m.kakao && !past && <button className="btn primary" onClick={() => window.open(m.kakao, "_blank")}>오픈채팅 이동</button>}
          <button className="btn" onClick={() => location.hash = "meetups"}>전체 밋업 보기</button>
        </div>
      </div>
    </article>
  );
}
