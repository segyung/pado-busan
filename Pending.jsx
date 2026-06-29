export default function Pending({ logout, go }) {
  return (
    <main className="page narrow">
      <section className="card center statusCard">
        <div className="avatar">🌊</div>
        <p className="eyebrow">APPROVAL PENDING</p>
        <h1>승인 대기중입니다</h1>
        <p className="lead dark">
          파도 가입 신청이 완료되었어요.<br />
          운영진 확인 후 승인되면 밋업 참여와 개설이 가능해요.
        </p>
        <div className="noticeBox">
          <b>현재 이용 가능한 기능</b>
          <p>공지 보기 · 밋업 둘러보기 · 후기 보기 · 명예의 전당 보기</p>
          <b>승인 후 이용 가능한 기능</b>
          <p>밋업 만들기 · 참가 신청 · 후기 작성 · 마이페이지</p>
        </div>
        <div className="actions centerActions">
          <button className="btn" onClick={() => go("meetups")}>밋업 둘러보기</button>
          <button className="btn danger" onClick={logout}>로그아웃</button>
        </div>
      </section>
    </main>
  );
}
