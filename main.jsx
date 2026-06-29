import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/pado.css";

import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Meetups from "./pages/Meetups.jsx";
import MySchedule from "./pages/MySchedule.jsx";
import Reviews from "./pages/Reviews.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import HallOfFame from "./pages/HallOfFame.jsx";
import Pending from "./pages/Pending.jsx";
import Notices from "./pages/Notices.jsx";
import Rejected from "./pages/Rejected.jsx";
import { db, doc, getDoc } from "./services/firebase.js";
import { getSessionPhone, clearSessionPhone, isCrew, setCrew } from "./utils/member.js";

function App() {
  const [route, setRoute] = useState(location.hash.replace("#", "") || "home");
  const [member, setMember] = useState(null);
  const [crew, setCrewState] = useState(isCrew());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(location.hash.replace("#", "") || "home");
      setMenuOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  async function reloadMember() {
    const phone = getSessionPhone();
    if (!phone) {
      setMember(null);
      return;
    }
    const snap = await getDoc(doc(db, "members", phone));
    setMember(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }

  useEffect(() => {
    reloadMember();
  }, [route]);

  const approved = member?.status === "approved";
  const rejected = member?.status === "rejected";
  const pending = member?.status === "pending";

  function go(name) {
    location.hash = name;
    setMenuOpen(false);
  }

  function requireApproved(target, message = "승인 완료 후 이용할 수 있어요.") {
    if (!member) {
      localStorage.setItem("pado_auth_mode", "login");
      alert("로그인이 필요해요.");
      go("signup");
      return;
    }
    if (member.status === "pending") {
      alert(message);
      go("pending");
      return;
    }
    if (member.status === "rejected") {
      go("rejected");
      return;
    }
    go(target);
  }

  function goAuth(mode) {
    localStorage.setItem("pado_auth_mode", mode);
    go("signup");
  }

  function crewLogin() {
    if (crew) {
      if (confirm("크루 모드를 종료할까요?")) {
        setCrew(false);
        setCrewState(false);
      }
      return;
    }
    const pw = prompt("크루 비밀번호를 입력해 주세요.");
    if (pw === "pado2026") {
      setCrew(true);
      setCrewState(true);
      alert("크루 모드 ON");
      go("admin");
    } else if (pw !== null) {
      alert("비밀번호가 달라요.");
    }
  }

  function logout() {
    clearSessionPhone();
    setMember(null);
    setMenuOpen(false);
    alert("로그아웃 완료");
    go("home");
  }

  const ctx = useMemo(() => ({
    go,
    member,
    approved,
    pending,
    rejected,
    crew,
    requireApproved,
    reloadMember,
    logout
  }), [member, approved, crew]);

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => go("home")}>🌊 <b>파도</b></button>
        <nav>
          <button onClick={() => go("meetups")}>밋업</button>
          {member && <button onClick={() => requireApproved("my-schedule", "내 일정은 승인 완료 후 이용할 수 있어요.")}>내 일정</button>}
          <button onClick={() => go("reviews")}>후기</button>
          <button onClick={() => go("notices")}>공지</button>
          <button onClick={() => go("hall")}>명예의 전당</button>

          {!member && (
            <>
              <button onClick={() => goAuth("login")}>로그인</button>
              <button className="joinBtn" onClick={() => goAuth("signup")}>회원가입</button>
            </>
          )}

          {member && (
            <div className="userMenu">
              <button className="userButton" onClick={() => setMenuOpen(v => !v)}>
                👤 {member.name}님 ▾
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <button onClick={() => requireApproved("profile", "마이페이지는 승인 완료 후 이용할 수 있어요.")}>👤 마이페이지</button>
                  <button onClick={() => requireApproved("my-schedule", "내 일정은 승인 완료 후 이용할 수 있어요.")}>📅 내 일정</button>
                  <button onClick={() => go("reviews")}>✍️ 내 후기 보기</button>
                  {crew && <button onClick={() => go("admin")}>🌊 크루 대시보드</button>}
                  <button className="logoutBtn" onClick={logout}>🚪 로그아웃</button>
                </div>
              )}
            </div>
          )}

          <button className="crewBtn" onClick={crewLogin}>크루</button>
        </nav>
      </header>

      {route === "home" && <Home {...ctx} />}
      {route === "signup" && <Signup {...ctx} />}
      {route === "meetups" && <Meetups {...ctx} />}
      {route === "my-schedule" && <MySchedule {...ctx} />}
      {route === "reviews" && <Reviews {...ctx} />}
      {route === "notices" && <Notices {...ctx} />}
      {route === "profile" && (approved || crew ? <Profile {...ctx} /> : pending ? <Pending {...ctx} /> : rejected ? <Rejected {...ctx} /> : <Profile {...ctx} />)}
      {route === "pending" && <Pending {...ctx} />}
      {route === "rejected" && <Rejected {...ctx} />}
      {route === "admin" && <Admin {...ctx} />}
      {route === "hall" && <HallOfFame {...ctx} />}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
