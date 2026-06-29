export default function Rejected({ logout }) {
  return (
    <main className="page narrow">
      <section className="card center statusCard">
        <div className="avatar">🌙</div>
        <p className="eyebrow">APPLICATION RESULT</p>
        <h1>가입 승인이 어렵습니다</h1>
        <p className="lead dark">
          파도 가입 신청을 검토했지만 현재는 승인이 어려워요.<br />
          문의가 필요하시면 운영진에게 연락해 주세요.
        </p>
        <div className="actions centerActions">
          <button className="btn danger" onClick={logout}>로그아웃</button>
        </div>
      </section>
    </main>
  );
}
