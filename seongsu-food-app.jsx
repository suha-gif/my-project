import { useState, useMemo } from "react";

const COMPANY_LAT = 37.5474;
const COMPANY_LNG = 127.0545;

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function distLabel(km) { return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`; }
function walkTime(km) { const m = Math.round((km / 4.5) * 60); return m < 1 ? "1분 이내" : `도보 ${m}분`; }

// reactions: { good: 꼭가세요, wait: 웨이팅많다면, bad: 아쉬워요 }
const REACTIONS = [
  { key: "good", label: "꼭 가세요!", emoji: "🔥", bg: "#fff7ed", activeBg: "#f97316", color: "#c2410c", activeColor: "white", border: "#fed7aa", activeBorder: "#f97316" },
  { key: "wait", label: "웨이팅 많다면..", emoji: "⏳", bg: "#fefce8", activeBg: "#eab308", color: "#a16207", activeColor: "white", border: "#fde68a", activeBorder: "#eab308" },
  { key: "bad",  label: "아쉬워요",       emoji: "😕", bg: "#f8fafc", activeBg: "#94a3b8", color: "#475569", activeColor: "white", border: "#e2e8f0", activeBorder: "#94a3b8" },
];

const INITIAL_RESTAURANTS = [
  {
    id: 1, name: "뚝섬 국수나무", type: "식당", cuisine: "한식", area: "뚝섬",
    address: "서울 성동구 뚝섬로1나길 15",
    description: "회사 바로 근처! 칼국수와 비빔국수가 맛있고 가성비도 좋아요.",
    lat: 37.5476, lng: 127.0548, mapUrl: null,
    reactions: { good: 5, wait: 1, bad: 0 }, addedBy: "관리자",
    tags: ["국수", "칼국수", "가성비", "혼밥OK"],
  },
  {
    id: 2, name: "할머니 순대국", type: "식당", cuisine: "한식", area: "뚝섬",
    address: "서울 성동구 뚝섬로 265",
    description: "오래된 단골 순대국집. 깔끔하고 진한 국물이 일품입니다.",
    lat: 37.5483, lng: 127.0537, mapUrl: null,
    reactions: { good: 4, wait: 0, bad: 0 }, addedBy: "김직원",
    tags: ["순대국", "국밥", "혼밥OK"],
  },
  {
    id: 3, name: "뚝섬 한우명가", type: "식당", cuisine: "한식", area: "뚝섬",
    address: "서울 성동구 뚝섬로 293",
    description: "회식 단골 한우집. 점심 육회비빔밥도 훌륭합니다.",
    lat: 37.5490, lng: 127.0530, mapUrl: null,
    reactions: { good: 4, wait: 2, bad: 0 }, addedBy: "최직원",
    tags: ["한우", "고기", "회식"],
  },
  {
    id: 4, name: "성수 짬뽕 지존", type: "식당", cuisine: "중식", area: "성수",
    address: "서울 성동구 연무장길 37",
    description: "얼큰한 짬뽕과 탕수육이 맛있는 중식당. 배달도 빠름!",
    lat: 37.5448, lng: 127.0570, mapUrl: null,
    reactions: { good: 4, wait: 0, bad: 1 }, addedBy: "정직원",
    tags: ["짬뽕", "탕수육", "혼밥OK"],
  },
  {
    id: 5, name: "성수 마라탕 가", type: "식당", cuisine: "중식", area: "성수",
    address: "서울 성동구 아차산로 112",
    description: "마라탕과 마라샹궈 맛집. 매운 걸 좋아한다면 강추!",
    lat: 37.5443, lng: 127.0568, mapUrl: null,
    reactions: { good: 3, wait: 1, bad: 1 }, addedBy: "윤직원",
    tags: ["마라탕", "마라샹궈", "매운맛"],
  },
  {
    id: 6, name: "이태리움 성수", type: "식당", cuisine: "양식", area: "성수",
    address: "서울 성동구 성수이로 113",
    description: "파스타와 피자가 정통 이탈리안 스타일. 데이트나 특별 점심에.",
    lat: 37.5453, lng: 127.0582, mapUrl: null,
    reactions: { good: 3, wait: 0, bad: 0 }, addedBy: "강직원",
    tags: ["이탈리안", "파스타", "피자"],
  },
  {
    id: 7, name: "스시하루", type: "식당", cuisine: "일식", area: "성수",
    address: "서울 성동구 성수이로 78",
    description: "점심 특선 런치 세트가 가성비 최고. 신선한 초밥.",
    lat: 37.5451, lng: 127.0579, mapUrl: null,
    reactions: { good: 4, wait: 1, bad: 0 }, addedBy: "박직원",
    tags: ["초밥", "런치세트", "일식"],
  },
  {
    id: 8, name: "라멘 성수점", type: "식당", cuisine: "일식", area: "성수",
    address: "서울 성동구 연무장7길 22",
    description: "진하고 깊은 돈코츠 라멘. 추운 날 생각나는 맛.",
    lat: 37.5444, lng: 127.0563, mapUrl: null,
    reactions: { good: 5, wait: 2, bad: 0 }, addedBy: "한직원",
    tags: ["라멘", "돈코츠", "혼밥OK"],
  },
  {
    id: 9, name: "어니언 성수", type: "카페", cuisine: null, area: "성수",
    address: "서울 성동구 아차산로9길 8",
    description: "폐공장을 개조한 감성 베이커리 카페. 소금빵이 최고예요!",
    lat: 37.5441, lng: 127.0555, mapUrl: null,
    reactions: { good: 6, wait: 3, bad: 0 }, addedBy: "이직원",
    tags: ["베이커리", "소금빵", "인스타감성"],
  },
  {
    id: 10, name: "대림창고 갤러리 카페", type: "카페", cuisine: null, area: "성수",
    address: "서울 성동구 성수이로14길 14-2",
    description: "창고 개조 카페. 넓고 여유로운 공간. 팀 미팅에도 딱.",
    lat: 37.5437, lng: 127.0560, mapUrl: null,
    reactions: { good: 3, wait: 0, bad: 1 }, addedBy: "관리자",
    tags: ["넓은공간", "팀모임", "감성카페"],
  },
  {
    id: 11, name: "성수연방 카페", type: "카페", cuisine: null, area: "성수",
    address: "서울 성동구 연무장7길 11",
    description: "성수동 대표 복합문화공간 내 카페. 브런치와 커피가 맛있어요.",
    lat: 37.5447, lng: 127.0561, mapUrl: null,
    reactions: { good: 4, wait: 1, bad: 0 }, addedBy: "관리자",
    tags: ["브런치", "복합문화공간", "감성"],
  },
  {
    id: 12, name: "블루보틀 성수", type: "카페", cuisine: null, area: "성수",
    address: "서울 성동구 왕십리로2길 21",
    description: "블루보틀 성수점. 스페셜티 커피와 조용한 분위기.",
    lat: 37.5455, lng: 127.0575, mapUrl: null,
    reactions: { good: 4, wait: 0, bad: 0 }, addedBy: "서직원",
    tags: ["스페셜티커피", "집중하기좋음"],
  },
  {
    id: 13, name: "성수 포차 골목", type: "술집", cuisine: null, area: "성수",
    address: "서울 성동구 연무장길 포차골목",
    description: "퇴근 후 회식 1번지! 다양한 포차들이 즐비해 있어요.",
    lat: 37.5446, lng: 127.0565, mapUrl: null,
    reactions: { good: 5, wait: 2, bad: 0 }, addedBy: "조직원",
    tags: ["포차", "회식", "단체"],
  },
  {
    id: 14, name: "뚝섬 맥주집 홉스", type: "술집", cuisine: null, area: "뚝섬",
    address: "서울 성동구 뚝섬로 281",
    description: "크래프트 맥주 전문점. 다양한 수제맥주와 안주.",
    lat: 37.5487, lng: 127.0534, mapUrl: null,
    reactions: { good: 4, wait: 1, bad: 0 }, addedBy: "민직원",
    tags: ["맥주", "크래프트", "회식"],
  },
  {
    id: 15, name: "성수 와인바 온도", type: "술집", cuisine: null, area: "성수",
    address: "서울 성동구 성수이로 96",
    description: "합리적인 가격의 와인과 치즈 플래터. 소규모 팀 모임에 딱.",
    lat: 37.5449, lng: 127.0577, mapUrl: null,
    reactions: { good: 3, wait: 0, bad: 0 }, addedBy: "류직원",
    tags: ["와인", "치즈", "소모임"],
  },
];

const TYPE_TABS = ["전체", "식당", "카페", "술집"];
const CUISINE_TABS = ["전체", "한식", "중식", "양식", "일식"];
const TYPE_EMOJI = { 식당: "🍽️", 카페: "☕", 술집: "🍺" };
const TYPE_COLORS = {
  식당: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  카페: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  술집: { bg: "#fce7f3", text: "#831843", dot: "#ec4899" },
};
const CUISINE_COLORS = {
  한식: { bg: "#fef2f2", text: "#991b1b" },
  중식: { bg: "#fff7ed", text: "#9a3412" },
  양식: { bg: "#f0fdf4", text: "#166534" },
  일식: { bg: "#eff6ff", text: "#1e40af" },
};

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function ReactionBar({ reactions }) {
  const total = (reactions.good || 0) + (reactions.wait || 0) + (reactions.bad || 0);
  if (total === 0) return <span style={{ fontSize: 12, color: "#9ca3af" }}>아직 반응 없음</span>;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {REACTIONS.map(r => {
        const count = reactions[r.key] || 0;
        if (count === 0) return null;
        return (
          <span key={r.key} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: r.bg, color: r.color,
            border: `1px solid ${r.border}`,
            fontSize: 12, fontWeight: 700,
            padding: "3px 10px", borderRadius: 20,
          }}>
            {r.emoji} {r.label} <span style={{ fontWeight: 800 }}>{count}</span>
          </span>
        );
      })}
    </div>
  );
}

function RestaurantCard({ r, onReact, onDelete, currentUser }) {
  const [showReactBox, setShowReactBox] = useState(false);

  const hasDist = r.lat && r.lng;
  const dist = hasDist ? calcDistance(COMPANY_LAT, COMPANY_LNG, r.lat, r.lng) : null;

  const tc = TYPE_COLORS[r.type] || { bg: "#f3f4f6", text: "#374151", dot: "#6b7280" };
  const distColor = !dist ? "#9ca3af" : dist < 0.5 ? "#10b981" : dist < 1 ? "#f59e0b" : "#8b5cf6";

  const mapLink = r.mapUrl || (r.lat && r.lng
    ? `https://map.naver.com/v5/search/${encodeURIComponent(r.name)}`
    : null);

  return (
    <div style={{
      background: "white", borderRadius: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "transform 0.18s, box-shadow 0.18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
    >
      <div style={{ height: 5, background: tc.dot }} />

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 배지 */}
        <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ background: tc.bg, color: tc.text, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
            {TYPE_EMOJI[r.type]} {r.type}
          </span>
          {r.cuisine && (
            <span style={{ background: CUISINE_COLORS[r.cuisine]?.bg || "#f3f4f6", color: CUISINE_COLORS[r.cuisine]?.text || "#374151", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>
              {r.cuisine}
            </span>
          )}
          <span style={{ background: r.area === "뚝섬" ? "#dbeafe" : "#f3e8ff", color: r.area === "뚝섬" ? "#1d4ed8" : "#6d28d9", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>
            {r.area}
          </span>
        </div>

        {/* 이름 + 거리 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{r.name}</h3>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: distColor }}>
              {dist !== null ? distLabel(dist) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              {dist !== null ? walkTime(dist) : "링크로 확인"}
            </div>
          </div>
        </div>

        {/* 주소 */}
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>📌 {r.address}</p>

        {/* 설명 */}
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#4b5563", lineHeight: 1.55, flex: 1 }}>{r.description}</p>

        {/* 태그 */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {r.tags.map(t => (
            <span key={t} style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 11, padding: "2px 7px", borderRadius: 10 }}>#{t}</span>
          ))}
        </div>

        {/* 반응 현황 */}
        <div style={{ marginBottom: 10 }}>
          <ReactionBar reactions={r.reactions} />
        </div>

        <div style={{ marginLeft: "auto", fontSize: 11, color: "#d1d5db", marginBottom: 10, textAlign: "right" }}>
          추천: {r.addedBy}
        </div>

        {/* 버튼 행 */}
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => setShowReactBox(!showReactBox)} style={{
            flex: 1, padding: "8px 0",
            background: showReactBox ? "#6366f1" : "#f3f4f6",
            color: showReactBox ? "white" : "#374151",
            border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            {showReactBox ? "닫기" : "💬 반응 남기기"}
          </button>

          {mapLink ? (
            <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 13px", background: "#e8f5e4", color: "#16a34a",
              borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              <MapIcon /> 지도 보기
            </a>
          ) : (
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 13px", background: "#f3f4f6", color: "#9ca3af",
              borderRadius: 9, fontSize: 12, fontWeight: 700,
            }}>
              <MapIcon /> 링크 없음
            </span>
          )}

          {r.addedBy === currentUser && (
            <button onClick={() => onDelete(r.id)} style={{
              padding: "8px 10px", background: "#fee2e2", color: "#dc2626",
              border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>삭제</button>
          )}
        </div>

        {/* 반응 선택 박스 */}
        {showReactBox && (
          <div style={{ marginTop: 10, padding: 14, background: "#f9fafb", borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#374151" }}>어떠셨나요?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {REACTIONS.map(rx => (
                <button key={rx.key}
                  onClick={() => { onReact(r.id, rx.key); setShowReactBox(false); }}
                  style={{
                    padding: "10px 14px", textAlign: "left",
                    background: rx.bg, color: rx.color,
                    border: `1.5px solid ${rx.border}`,
                    borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = rx.activeBg; e.currentTarget.style.color = rx.activeColor; e.currentTarget.style.borderColor = rx.activeBorder; }}
                  onMouseLeave={e => { e.currentTarget.style.background = rx.bg; e.currentTarget.style.color = rx.color; e.currentTarget.style.borderColor = rx.border; }}
                >
                  <span style={{ fontSize: 18 }}>{rx.emoji}</span>
                  {rx.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddModal({ onAdd, currentUser, onClose }) {
  const [form, setForm] = useState({
    name: "", type: "식당", cuisine: "한식", area: "성수",
    address: "", description: "", tags: "", mapUrl: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.address || !form.description) {
      alert("이름, 주소, 소개는 필수 항목이에요."); return;
    }
    onAdd({
      id: Date.now(),
      name: form.name,
      type: form.type,
      cuisine: form.type === "식당" ? form.cuisine : null,
      area: form.area,
      address: form.address,
      description: form.description,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      mapUrl: form.mapUrl.trim() || null,
      lat: null, lng: null,
      reactions: { good: 0, wait: 0, bad: 0 },
      addedBy: currentUser,
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: 28,
        width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>🍽️ 맛집 추가</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>

        {/* 종류 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>종류 *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["식당", "카페", "술집"].map(t => (
              <button key={t} onClick={() => set("type", t)} style={{
                flex: 1, padding: "9px 0",
                background: form.type === t ? "#6366f1" : "#f3f4f6",
                color: form.type === t ? "white" : "#374151",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                {TYPE_EMOJI[t]} {t}
              </button>
            ))}
          </div>
        </div>

        {/* 음식 종류 (식당만) */}
        {form.type === "식당" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>음식 종류 *</label>
            <div style={{ display: "flex", gap: 7 }}>
              {["한식", "중식", "양식", "일식"].map(c => (
                <button key={c} onClick={() => set("cuisine", c)} style={{
                  flex: 1, padding: "8px 0",
                  background: form.cuisine === c ? (CUISINE_COLORS[c]?.text || "#374151") : "#f3f4f6",
                  color: form.cuisine === c ? "white" : "#374151",
                  border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* 지역 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>지역 *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["성수", "뚝섬"].map(a => (
              <button key={a} onClick={() => set("area", a)} style={{
                flex: 1, padding: "9px 0",
                background: form.area === a ? "#374151" : "#f3f4f6",
                color: form.area === a ? "white" : "#374151",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>{a}</button>
            ))}
          </div>
        </div>

        {/* 텍스트 필드들 */}
        {[
          { label: "가게 이름 *", key: "name", placeholder: "예: 성수 짬뽕 지존" },
          { label: "주소 *", key: "address", placeholder: "예: 서울 성동구 연무장길 37" },
          { label: "한 줄 소개 *", key: "description", placeholder: "예: 얼큰한 짬뽕이 일품!" },
          { label: "태그 (쉼표로 구분)", key: "tags", placeholder: "예: 짬뽕, 혼밥OK, 가성비" },
        ].map(({ label, key, placeholder }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
            <input
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}

        {/* 지도 링크 */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>
            지도 링크 <span style={{ fontWeight: 400, color: "#9ca3af" }}>(카카오맵 / 네이버지도)</span>
          </label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
              <LinkIcon />
            </div>
            <input
              value={form.mapUrl}
              onChange={e => set("mapUrl", e.target.value)}
              placeholder="https://kko.to/... 또는 https://naver.me/..."
              style={{ width: "100%", padding: "10px 12px 10px 30px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: "#9ca3af" }}>
            💡 카카오맵: 장소 → 공유 → 링크 복사 &nbsp;|&nbsp; 네이버지도: 장소 → 공유하기
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 12, background: "#f3f4f6", color: "#374151",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>취소</button>
          <button onClick={handleSubmit} style={{
            flex: 2, padding: 12, background: "#6366f1", color: "white",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>추가하기 🎉</button>
        </div>
      </div>
    </div>
  );
}

const EMPLOYEE_PASSWORD = "enuma0309";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [userName, setUserName] = useState("");
  const [pwError, setPwError] = useState(false);
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);

  const [filterType, setFilterType] = useState("전체");
  const [filterCuisine, setFilterCuisine] = useState("전체");
  const [filterArea, setFilterArea] = useState("전체");
  const [sortBy, setSortBy] = useState("distance");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleLogin = () => {
    if (!userName.trim()) { setPwError(true); return; }
    if (pwInput === EMPLOYEE_PASSWORD) { setLoggedIn(true); setPwError(false); }
    else setPwError(true);
  };

  const filtered = useMemo(() => {
    let list = restaurants;
    if (filterType !== "전체") list = list.filter(r => r.type === filterType);
    if (filterCuisine !== "전체") list = list.filter(r => r.cuisine === filterCuisine);
    if (filterArea !== "전체") list = list.filter(r => r.area === filterArea);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "distance") {
        const da = a.lat && a.lng ? calcDistance(COMPANY_LAT, COMPANY_LNG, a.lat, a.lng) : 999;
        const db = b.lat && b.lng ? calcDistance(COMPANY_LAT, COMPANY_LNG, b.lat, b.lng) : 999;
        return da - db;
      }
      if (sortBy === "rating") {
        return (b.reactions.good || 0) - (a.reactions.good || 0);
      }
      const ta = (a.reactions.good || 0) + (a.reactions.wait || 0) + (a.reactions.bad || 0);
      const tb = (b.reactions.good || 0) + (b.reactions.wait || 0) + (b.reactions.bad || 0);
      return tb - ta;
    });
  }, [restaurants, filterType, filterCuisine, filterArea, search, sortBy]);

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "white", borderRadius: 24, padding: 40, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🍜</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#111827" }}>뚝섬 & 성수 맛집 MAP</h1>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: "#9ca3af" }}>직원 전용 서비스입니다</p>

          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 4 }}>이름</label>
            <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="홍길동"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `2px solid ${pwError && !userName.trim() ? "#ef4444" : "#e5e7eb"}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 22, textAlign: "left" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 4 }}>비밀번호</label>
            <input type="password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              placeholder="직원 전용 비밀번호" onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `2px solid ${pwError ? "#ef4444" : "#e5e7eb"}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
            {pwError && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{!userName.trim() ? "이름을 입력해주세요." : "비밀번호가 올바르지 않습니다."}</p>}
          </div>
          <button onClick={handleLogin} style={{ width: "100%", padding: "13px 0", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            입장하기 →
          </button>
          <p style={{ margin: "16px 0 0", fontSize: 11, color: "#d1d5db" }}>Enuma 직원 전용</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      {/* 헤더 */}
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "18px 24px 0", color: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>🍜 뚝섬 & 성수 맛집 MAP</h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>📍 성동구 뚝섬로1나길 5 기준 &nbsp;·&nbsp; {userName}님 반가워요 👋</p>
            </div>
            <button onClick={() => setShowAddModal(true)} style={{
              padding: "9px 16px", background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)",
              color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>+ 맛집 추가</button>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, opacity: 0.8, marginBottom: 14 }}>
            <span>🟢 500m 이내</span><span>🟡 500m~1km</span><span>🟣 1km 이상</span>
          </div>
          {/* 종류 탭 */}
          <div style={{ display: "flex" }}>
            {TYPE_TABS.map(t => (
              <button key={t} onClick={() => { setFilterType(t); if (t !== "식당") setFilterCuisine("전체"); }}
                style={{
                  padding: "10px 20px", background: "none", border: "none",
                  color: filterType === t ? "white" : "rgba(255,255,255,0.6)",
                  fontSize: 14, fontWeight: filterType === t ? 800 : 500,
                  cursor: "pointer",
                  borderBottom: filterType === t ? "3px solid white" : "3px solid transparent",
                }}>
                {t !== "전체" ? `${TYPE_EMOJI[t]} ` : ""}{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div style={{ background: "white", padding: "11px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 이름, 태그로 검색..."
            style={{ padding: "8px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", minWidth: 150, flex: 1 }}
          />
          {filterType === "식당" && CUISINE_TABS.map(c => (
            <button key={c} onClick={() => setFilterCuisine(c)} style={{
              padding: "6px 12px", borderRadius: 20,
              background: filterCuisine === c ? "#6366f1" : "#f3f4f6",
              color: filterCuisine === c ? "white" : "#374151",
              border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>{c}</button>
          ))}
          {["전체", "성수", "뚝섬"].map(a => (
            <button key={a} onClick={() => setFilterArea(a)} style={{
              padding: "6px 12px", borderRadius: 20,
              background: filterArea === a ? "#374151" : "#f3f4f6",
              color: filterArea === a ? "white" : "#374151",
              border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>{a}</button>
          ))}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 12, color: "#374151" }}>
            <option value="distance">거리순</option>
            <option value="rating">🔥 꼭 가세요 많은순</option>
            <option value="reviews">반응 많은순</option>
          </select>
          <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{filtered.length}곳</span>
        </div>
      </div>

      {/* 카드 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🍽️</div>
            <p style={{ fontSize: 15 }}>검색 결과가 없어요.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
            {filtered.map(r => (
              <RestaurantCard key={r.id} r={r} currentUser={userName}
                onReact={(id, key) => {
                  setRestaurants(rs => rs.map(x => x.id === id
                    ? { ...x, reactions: { ...x.reactions, [key]: (x.reactions[key] || 0) + 1 } }
                    : x
                  ));
                  const rx = REACTIONS.find(r => r.key === key);
                  showToast(`${rx.emoji} 반응이 등록됐어요!`);
                }}
                onDelete={(id) => {
                  if (confirm("정말 삭제하시겠어요?")) {
                    setRestaurants(rs => rs.filter(x => x.id !== id));
                    showToast("🗑️ 삭제됐어요.");
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal currentUser={userName}
          onAdd={(r) => { setRestaurants(rs => [...rs, r]); showToast("🎉 맛집이 추가됐어요!"); }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1f2937", color: "white", padding: "11px 22px",
          borderRadius: 50, fontSize: 14, fontWeight: 700,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 2000,
        }}>{toast}</div>
      )}
    </div>
  );
}
