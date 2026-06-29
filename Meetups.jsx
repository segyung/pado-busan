import { useEffect, useMemo, useState } from "react";
import { db, collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, arrayUnion } from "../services/firebase.js";
import { getSessionPhone } from "../utils/member.js";

const initial = {
  title: "",
  date: "",
  time: "",
  location: "",
  host: "",
  min: 3,
  max: "",
  cost: "",
  desc: "",
  kakao: "",
  isLightning: false
};

const pad = n => String(n).padStart(2, "0");
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayString = () => fmtDate(new Date());
const isPastDate = date => !!date && date < todayString();

function normalizeForm(form) {
  const isLightning = !!form.isLightning;
  return {
    ...form,
    min: Number(form.min || 3),
    max: form.max ? Number(form.max) : null,
    date: isLightning && !form.date ? todayString() : form.date,
    status: isLightning ? "lightning" : "pending"
  };
}

export default function Meetups({ approved, member, requireApproved, crew }) {
  const [meetups, setMeetups] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => onSnapshot(collection(db, "meetups"), snap =>
    setMeetups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  ), []);

  const visible = meetups
    .filter(m => ["approved", "lightning", "closed"].includes(m.status))
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""));

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openCreate(date = "") {
    if (isPastDate(date)) {
      alert("지난 날짜에는 밋업을 만들 수 없습니다.");
      return;
    }
    const base = date === todayString() ? { ...initial, date, isLightning: true, title: "오늘의 번개" } : { ...initial, date };
    setForm(base);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(m) {
    setForm({
      title: m.title || "",
      date: m.date || "",
      time: m.time || "",
      location: m.location || "",
      host: m.host || "",
      min: m.min || 3,
      max: m.max || "",
      cost: m.cost || "",
      desc: m.desc || "",
      kakao: m.kakao || "",
      isLightning: m.status === "lightning" || !!m.isLightning
    });
    setEditingId(m.id);
    setOpen(true);
  }

  async function saveMeetup() {
    if (!approved && !crew) {
      alert("승인된 파도 멤버만 밋업을 만들 수 있어요.");
      return;
    }
    if (!form.title || !form.date || !form.location || !form.host) {
      alert("밋업명, 날짜, 장소, 밋업장을 입력해 주세요.");
      return;
    }
    if (isPastDate(form.date)) {
      alert("지난 날짜에는 밋업을 만들 수 없습니다.");
      return;
    }

    const data = normalizeForm(form);

    if (editingId) {
      const current = meetups.find(m => m.id === editingId);
      const participantCount = current?.participants?.length || 0;
      const nextStatus = data.isLightning
        ? "lightning"
        : current?.status === "approved" || crew ? "approved" : "pending";

      await updateDoc(doc(db, "meetups", editingId), {
        ...data,
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      alert("🌊 밋업이 수정됐어요.");
    } else {
      await addDoc(collection(db, "meetups"), {
        ...data,
        hostPhone: getSessionPhone(),
        participants: [],
        createdAt: serverTimestamp()
      });
      alert(data.isLightning
        ? "⚡ 오늘의 번개가 등록됐어요."
        : "🌊 밋업이 승인 대기로 등록됐어요."
      );
    }

    setForm(initial);
    setEditingId(null);
    setOpen(false);
  }

  async function joinMeetup(m) {
    if (!approved) {
      requireApproved("meetups", "참가 신청은 승인 완료 후 이용할 수 있어요.");
      return;
    }
    if (m.status === "closed") {
      alert("모집이 마감된 밋업이에요.");
      return;
    }
    const phone = getSessionPhone();
    if ((m.participants || []).some(p => p.phone === phone)) {
      alert("이미 신청했어요.");
      return;
    }

    await updateDoc(doc(db, "meetups", m.id), {
      participants: arrayUnion({ phone, name: member?.name || "", checkedIn: false, joinedAt: Date.now() })
    });

    alert("🌊 이번 항해에 함께합니다.");
    if (m.kakao && confirm("오픈채팅방으로 이동할까요?")) window.open(m.kakao, "_blank");
  }

  const days = useMemo(() => {
    const y = month.getFullYear(), m = month.getMonth(), first = new Date(y, m, 1);
    const startDay = first.getDay(), total = new Date(y, m + 1, 0).getDate(), arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(new Date(y, m, d));
    return arr;
  }, [month]);
  const today = todayString();
  const hasLightning = date => visible.some(m => m.date === date && m.status === "lightning");
  const hasMeetup = date => visible.some(m => m.date === date && m.status !== "lightning");

  return (
    <main className="page">
      <div className="sectionTitle">
        <div>
          <p className="eyebrow">MEETUP</p>
          <h1>다가오는 밋업</h1>
          <p className="muted">오늘의 번개는 운영진이 수동으로 등록해요.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => crew ? openCreate(today) : alert("오늘의 번개는 운영진만 등록할 수 있어요.")}>⚡ 오늘의 번개</button>
          <button className="btn primary" onClick={() => approved ? openCreate() : requireApproved("meetups", "밋업 만들기는 승인 완료 후 이용할 수 있어요.")}>📅 밋업 만들기</button>
        </div>
      </div>

      <div className="tabs">
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>목록 보기</button>
        <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>캘린더 보기</button>
      </div>

      {view === "list" ? (
        <section className="list">
          {visible.length ? visible.map(m => <MeetupCard key={m.id} m={m} joinMeetup={joinMeetup} crew={crew} openEdit={openEdit} />) : <article className="item">아직 공개된 밋업이 없어요.</article>}
        </section>
      ) : (
        <section>
          <div className="calendarHead">
            <button className="btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
            <h2>{month.getFullYear()}년 {month.getMonth() + 1}월</h2>
            <div><button className="btn" onClick={() => setMonth(new Date())}>오늘</button> <button className="btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div>
          </div>
          <div className="calendarGrid">
            {["일", "월", "화", "수", "목", "금", "토"].map(w => <div className="weekday" key={w}>{w}</div>)}
            {days.map((d, i) => {
              const date = d ? fmtDate(d) : "";
              const past = isPastDate(date);
              const events = visible.filter(m => m.date === date);
              const cellClass = [
                "dayCell",
                date === today ? "today" : "",
                past ? "pastDay" : "",
                hasLightning(date) ? "hasLightning" : "",
                hasMeetup(date) ? "hasMeetup" : ""
              ].filter(Boolean).join(" ");
              return (
                <div key={i} className={cellClass} title={past ? "지난 날짜에는 밋업을 만들 수 없습니다." : ""}>
                  {d && <>
                    <div className="dayNumber">{d.getDate()}</div>
                    {events.map(e => <button className="eventChip" key={e.id} onClick={() => setSelectedDate(date)}>{e.status === "lightning" ? "⚡ " : "🌊 "}{e.title}</button>)}
                    {!events.length && (
                      <button
                        className="emptyCreate"
                        disabled={past}
                        onClick={() => openCreate(date)}
                      >
                        {past ? "지난 날짜" : date === today ? "+ 오늘의 번개 만들기" : "+ 이 날 밋업 만들기"}
                      </button>
                    )}
                  </>}
                </div>
              );
            })}
          </div>
          {selectedDate && <section className="card" style={{ marginTop: 16 }}><h3>{selectedDate} 밋업</h3>{visible.filter(m => m.date === selectedDate).map(m => <MeetupCard key={m.id} m={m} joinMeetup={joinMeetup} crew={crew} openEdit={openEdit} />)}{!visible.some(m => m.date === selectedDate) && <p className="muted">이 날은 아직 밋업이 없어요.</p>}</section>}
        </section>
      )}

      <div className={`modal ${open ? "open" : ""}`}>
        <div className="sheet">
          <h2>{editingId ? "밋업 수정하기" : "새 밋업 만들기"}</h2>
          <p className="muted">오늘의 번개는 운영진이 수동으로 등록해요. 지난 날짜에는 새 밋업을 만들 수 없어요.</p>
          <label>밋업명</label>
          <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="예) 퇴근 후 저녁 먹으실 분?" />
          <div className="row"><div><label>날짜</label><input type="date" min={today} value={form.date} onChange={e => update("date", e.target.value)} /></div><div><label>시간</label><input type="time" value={form.time} onChange={e => update("time", e.target.value)} /></div></div>
          <label>장소</label><input value={form.location} onChange={e => update("location", e.target.value)} placeholder="예) 서면 · 전포 일대" />
          <label>밋업장</label><input value={form.host} onChange={e => update("host", e.target.value)} placeholder="예) 김세경" />
          <div className="row"><div><label>최소 인원</label><input type="number" min="1" value={form.min} onChange={e => update("min", e.target.value)} /></div><div><label>최대 인원</label><input type="number" value={form.max || ""} onChange={e => update("max", e.target.value)} placeholder="비워두면 제한 없음" /></div></div>
          <label>예상 비용</label><input value={form.cost} onChange={e => update("cost", e.target.value)} placeholder="예) 무료 · 각자 계산 · 1/N" />
          <label className="checkLine"><input type="checkbox" checked={form.isLightning} onChange={e => update("isLightning", e.target.checked)} />오늘의 번개로 표시하기</label>
          <label>밋업 소개</label><textarea value={form.desc} onChange={e => update("desc", e.target.value)} placeholder="오늘은 어떤 시간을 함께 보내고 싶나요?" />
          <label>오픈채팅 링크</label><input value={form.kakao} onChange={e => update("kakao", e.target.value)} placeholder="참가 신청 후 이동할 오픈채팅 링크" />
          <div className="actions right"><button className="btn" onClick={() => setOpen(false)}>취소</button><button className="btn primary" onClick={saveMeetup}>{editingId ? "수정 완료" : "등록하기"}</button></div>
        </div>
      </div>
    </main>
  );
}

function MeetupCard({ m, joinMeetup, crew, openEdit }) {
  const count = (m.participants || []).length;
  const min = Number(m.min || 3);
  const isLightning = m.status === "lightning" || !!m.isLightning;
  const label = isLightning ? `오늘의 번개 · ${count}명 참여` : m.status === "closed" ? "모집 마감" : "공개 밋업";
  return (
    <article className={`item ${isLightning ? "lightningItem" : ""}`}>
      <span className={`pill ${isLightning ? "orange" : m.status === "closed" ? "pending" : "approved"}`}>{label}</span>
      <h3>{m.title}</h3>
      <p className="meta">{m.date} {m.time}<br /><a href={`https://map.naver.com/p/search/${encodeURIComponent(m.location || "")}`} target="_blank">📍 {m.location}</a><br />밋업장: {m.host} · 신청 {count}{m.max ? ` / ${m.max}` : ""}명</p>
      {m.desc && <p>{m.desc}</p>}
      <div className="actions">
        <button className="btn primary" onClick={() => joinMeetup(m)} disabled={m.status === "closed"}>{m.status === "closed" ? "모집 마감" : "참가 신청"}</button>
        {crew && <button className="btn" onClick={() => openEdit(m)}>크루 수정</button>}
      </div>
    </article>
  );
}
