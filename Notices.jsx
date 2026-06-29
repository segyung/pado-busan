import { useEffect, useState } from "react";
import { db, collection, onSnapshot } from "../services/firebase.js";

const defaultNotices = [
  {
    id: "score",
    title: "활동 점수와 레벨 안내",
    category: "활동 점수",
    body: "밋업 참여, 밋업 개설, 후기 작성 등 파도 안에서의 활동을 기준으로 점수와 배지가 쌓입니다. 자세한 기준은 운영진이 확정 후 순차적으로 공지합니다."
  },
  {
    id: "meetup",
    title: "밋업 개설 안내",
    category: "밋업",
    body: "승인된 멤버는 밋업을 직접 만들 수 있습니다. 밋업명, 장소, 일시, 모집 인원, 예상 비용, 오픈채팅 링크를 입력해 주세요. 운영진 확인 후 공개됩니다."
  },
  {
    id: "rules",
    title: "파도 운영 수칙 안내",
    category: "운영 수칙",
    body: "서로를 존중하는 대화를 기본으로 합니다. 노쇼, 무단 취소, 영업·투자·다단계·종교·정치 권유, 불편한 접근은 운영진 판단에 따라 제재될 수 있습니다."
  },
  {
    id: "season1",
    title: "파도 1기 운영 안내",
    category: "기수제",
    body: "현재 파도는 1기 기준으로 운영됩니다. 다른 기수 멤버는 밋업을 볼 수 있지만, 신청 권한은 해당 기수 운영 기준에 따라 제한될 수 있습니다."
  }
];

export default function Notices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notices"), snap => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotices(rows.filter(n => n.status !== "hidden"));
    }, () => setNotices([]));
    return unsub;
  }, []);

  const list = notices.length ? notices : defaultNotices;

  return (
    <main className="page">
      <div className="sectionTitle">
        <div>
          <p className="eyebrow">NOTICE</p>
          <h1>공지사항</h1>
          <p className="muted">파도 운영 안내, 활동 점수, 레벨, 배지, 모집 안내를 확인할 수 있어요.</p>
        </div>
      </div>
      <section className="list">
        {list.map(n => (
          <article className="item" key={n.id}>
            <span className="pill approved">{n.category || "공지"}</span>
            <h3>{n.title}</h3>
            <p>{n.body || n.content}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
