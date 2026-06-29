import { useEffect, useMemo, useState } from "react";
import { db, collection, doc, updateDoc, onSnapshot } from "../services/firebase.js";

const roleLabel = {
  owner: "크루장",
  leader: "크루리더",
  crew: "크루",
  member: "멤버"
};

export default function Admin({ crew }) {
  const [members, setMembers] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState("members");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!crew) return;
    const u1 = onSnapshot(collection(db, "members"), s =>
      setMembers(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(collection(db, "meetups"), s =>
      setMeetups(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u3 = onSnapshot(collection(db, "reviews"), s =>
      setReviews(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); u3(); };
  }, [crew]);

  if (!crew) {
    return (
      <main className="page narrow">
        <section className="card center">
          <h1>크루 전용</h1>
          <p className="muted">상단의 크루 버튼으로 로그인해 주세요.</p>
          <p className="muted">크루 비밀번호는 운영진만 공유해 주세요.</p>
        </section>
      </main>
    );
  }

  const pendingMembers = members.filter(m => m.status === "pending");
  const approvedMembers = members.filter(m => m.status === "approved");
  const suspendedMembers = members.filter(m => m.status === "suspended");
  const pendingMeetups = meetups.filter(m => m.status === "pending");

  const filteredMembers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m =>
      [m.name, m.phone, m.homeArea, m.workArea, m.instagram, m.role, m.status]
        .some(v => String(v || "").toLowerCase().includes(q))
    );
  }, [members, keyword]);

  const approveMember = id => updateDoc(doc(db, "members", id), { status: "approved" });
  const rejectMember = id => updateDoc(doc(db, "members", id), { status: "rejected" });
  const suspendMember = id => updateDoc(doc(db, "members", id), { status: "suspended" });
  const restoreMember = id => updateDoc(doc(db, "members", id), { status: "approved" });
  const setRole = (id, role) => updateDoc(doc(db, "members", id), { role });

  const approveMeetup = id => updateDoc(doc(db, "meetups", id), { status: "approved" });
  const rejectMeetup = id => updateDoc(doc(db, "meetups", id), { status: "rejected" });
  const closeMeetup = id => updateDoc(doc(db, "meetups", id), { status: "closed" });
  const reopenMeetup = id => updateDoc(doc(db, "meetups", id), { status: "approved" });

  const hideReview = id => updateDoc(doc(db, "reviews", id), { status: "hidden" });
  const showReview = id => updateDoc(doc(db, "reviews", id), { status: "approved" });
  const recommendReview = id => updateDoc(doc(db, "reviews", id), { recommended: true });
  const unrecommendReview = id => updateDoc(doc(db, "reviews", id), { recommended: false });

  const crewMembers = members.filter(m => ["owner", "leader", "crew"].includes(m.role));

  const csv = () => {
    const rows = [
      ["이름", "성별", "생년월일", "사는 곳", "직장 위치", "연락처", "상태", "권한", "인스타그램"],
      ...members.map(m => [
        m.name, m.gender, m.birthdate, m.homeArea, m.workArea, m.phone, m.status, roleLabel[m.role] || "멤버", m.instagram
      ])
    ];
    const text = "\ufeff" + rows.map(r => r.map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = "pado_members.csv";
    a.click();
  };

  return (
    <main className="page">
      <div className="sectionTitle">
        <div>
          <p className="eyebrow">CREW DASHBOARD</p>
          <h1>크루 대시보드</h1>
          <p className="muted">회원 승인, 운영진 권한, 밋업, 후기까지 한 곳에서 관리해요.</p>
        </div>
        <button className="btn" onClick={csv}>CSV 다운로드</button>
      </div>

      <section className="dash">
        <article><span>회원 승인 대기</span><b>{pendingMembers.length}</b></article>
        <article><span>밋업 승인 대기</span><b>{pendingMeetups.length}</b></article>
        <article><span>승인 회원</span><b>{approvedMembers.length}</b></article>
        <article><span>활동정지</span><b>{suspendedMembers.length}</b></article>
      </section>

      <div className="tabs">
        <button className={tab === "members" ? "active" : ""} onClick={() => setTab("members")}>회원 승인</button>
        <button className={tab === "crew" ? "active" : ""} onClick={() => setTab("crew")}>운영진 관리</button>
        <button className={tab === "meetups" ? "active" : ""} onClick={() => setTab("meetups")}>밋업 관리</button>
        <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>후기 관리</button>
        <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>운영 통계</button>
      </div>

      {tab === "members" && (
        <section className="card">
          <div className="sectionTitle">
            <h2>가입 신청 / 회원 관리</h2>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="이름, 연락처, 지역 검색" style={{ maxWidth: 360 }} />
          </div>
          <div className="list">
            {filteredMembers.length ? filteredMembers.map(m => (
              <article className="item" key={m.id}>
                <span className={`pill ${m.status === "pending" ? "pending" : m.status === "approved" ? "approved" : ""}`}>
                  {m.status === "pending" ? "승인 대기" : m.status === "approved" ? "승인 완료" : m.status === "suspended" ? "활동정지" : "반려"}
                </span>
                <h3>{m.name}</h3>
                <p className="meta">
                  {m.gender} · {m.birthdate}<br />
                  🏠 {m.homeArea}<br />
                  💼 {m.workArea || "직장 위치 미입력"}<br />
                  ☎️ {m.phone}<br />
                  📷 {m.instagram || "인스타그램 미입력"}<br />
                  권한: {roleLabel[m.role] || "멤버"}
                </p>
                {m.note && <p>{m.note}</p>}
                <div className="actions">
                  {m.status === "pending" && <button className="btn success" onClick={() => approveMember(m.id)}>승인</button>}
                  {m.status === "pending" && <button className="btn danger" onClick={() => rejectMember(m.id)}>거절</button>}
                  {m.status !== "suspended" && <button className="btn danger" onClick={() => suspendMember(m.id)}>활동정지</button>}
                  {m.status === "suspended" && <button className="btn success" onClick={() => restoreMember(m.id)}>정지해제</button>}
                  <select value={m.role || "member"} onChange={e => setRole(m.id, e.target.value)} style={{ maxWidth: 170 }}>
                    <option value="member">멤버</option>
                    <option value="crew">크루</option>
                    <option value="leader">크루리더</option>
                    <option value="owner">크루장</option>
                  </select>
                </div>
              </article>
            )) : <p className="muted">검색 결과가 없어요.</p>}
          </div>
        </section>
      )}

      {tab === "crew" && (
        <section className="card">
          <h2>운영진 관리</h2>
          <p className="muted">
            권한 기준: 크루장은 전체 관리, 크루리더는 회원/밋업 관리, 크루는 밋업/후기 중심으로 운영하는 구조를 추천해요.
          </p>
          <div className="list">
            {crewMembers.length ? crewMembers.map(m => (
              <article className="item" key={m.id}>
                <h3>{m.name}</h3>
                <p className="meta">{roleLabel[m.role]} · {m.phone}<br />🏠 {m.homeArea}</p>
                <div className="actions">
                  <select value={m.role || "member"} onChange={e => setRole(m.id, e.target.value)} style={{ maxWidth: 170 }}>
                    <option value="crew">크루</option>
                    <option value="leader">크루리더</option>
                    <option value="owner">크루장</option>
                    <option value="member">운영진 해제</option>
                  </select>
                </div>
              </article>
            )) : <p className="muted">아직 지정된 운영진이 없어요. 회원 관리 탭에서 권한을 지정해 주세요.</p>}
          </div>
        </section>
      )}

      {tab === "meetups" && (
        <section className="card">
          <h2>밋업 관리</h2>
          <div className="list">
            {meetups.length ? meetups.map(m => (
              <article className="item" key={m.id}>
                <span className={`pill ${m.status === "pending" ? "pending" : m.status === "approved" ? "approved" : ""}`}>
                  {m.status || "대기"}
                </span>
                <h3>{m.title}</h3>
                <p className="meta">
                  {m.date} {m.time}<br />
                  📍 {m.location}<br />
                  밋업장: {m.host}<br />
                  신청 {(m.participants || []).length}{m.max ? ` / ${m.max}` : ""}명
                </p>
                {m.desc && <p>{m.desc}</p>}
                <div className="actions">
                  {m.status === "pending" && <button className="btn success" onClick={() => approveMeetup(m.id)}>공개 승인</button>}
                  {m.status === "pending" && <button className="btn danger" onClick={() => rejectMeetup(m.id)}>반려</button>}
                  {m.status === "approved" && <button className="btn danger" onClick={() => closeMeetup(m.id)}>모집 마감</button>}
                  {m.status === "closed" && <button className="btn success" onClick={() => reopenMeetup(m.id)}>다시 공개</button>}
                </div>
              </article>
            )) : <p className="muted">등록된 밋업이 없어요.</p>}
          </div>
        </section>
      )}

      {tab === "reviews" && (
        <section className="card">
          <h2>후기 관리</h2>
          <div className="list">
            {reviews.length ? reviews.map(r => (
              <article className="item" key={r.id}>
                <span className={`pill ${r.status === "hidden" ? "pending" : "approved"}`}>
                  {r.status === "hidden" ? "숨김" : "공개"}
                </span>
                {r.recommended && <span className="pill orange" style={{ marginLeft: 6 }}>추천 후기</span>}
                <h3>{r.meetupTitle || "파도 후기"}</h3>
                <p>{r.text}</p>
                <p className="meta">by {r.memberName || "익명"}</p>
                {!!r.photoUrls?.length && (
                  <div className="photoGrid">
                    {r.photoUrls.map((url, i) => <a key={i} href={url} target="_blank"><img src={url} /></a>)}
                  </div>
                )}
                <div className="actions">
                  {r.status === "hidden"
                    ? <button className="btn success" onClick={() => showReview(r.id)}>다시 공개</button>
                    : <button className="btn danger" onClick={() => hideReview(r.id)}>숨김</button>}
                  {r.recommended
                    ? <button className="btn" onClick={() => unrecommendReview(r.id)}>추천 해제</button>
                    : <button className="btn primary" onClick={() => recommendReview(r.id)}>추천 후기</button>}
                </div>
              </article>
            )) : <p className="muted">아직 후기가 없어요.</p>}
          </div>
        </section>
      )}

      {tab === "stats" && (
        <section className="grid two">
          <article className="card">
            <h2>운영 요약</h2>
            <p className="meta">
              전체 회원: {members.length}명<br />
              승인 회원: {approvedMembers.length}명<br />
              승인 대기: {pendingMembers.length}명<br />
              활동정지: {suspendedMembers.length}명<br />
              운영진: {crewMembers.length}명
            </p>
          </article>
          <article className="card">
            <h2>활동 요약</h2>
            <p className="meta">
              전체 밋업: {meetups.length}개<br />
              공개 밋업: {meetups.filter(m => m.status === "approved").length}개<br />
              승인 대기 밋업: {pendingMeetups.length}개<br />
              전체 후기: {reviews.length}개<br />
              추천 후기: {reviews.filter(r => r.recommended).length}개
            </p>
          </article>
        </section>
      )}
    </main>
  );
}
