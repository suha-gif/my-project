📍 저장 위치

GitHub에 저장 (seongsu-food-app.jsx)
배포 없이 로컬에서 JSX 파일로 실행

📄 데이터

맛집 정보는 seongsu-food-app.jsx 내 INITIAL_RESTAURANTS 배열에 저장
총 15개 기본 맛집 데이터 포함 (식당 8, 카페 4, 술집 3)
직원이 앱에서 직접 추가한 데이터는 세션 내 메모리에 저장 (새로고침 시 초기화)

👤 사용자

Enuma 직원 전용 (비밀번호 인증)
직원 이름 + 공용 비밀번호로 로그인
각 직원이 맛집 추가 및 본인이 추가한 항목 삭제 가능

🌐 사용 방법

GitHub에서 seongsu-food-app.jsx 파일 다운로드
React 환경 또는 Claude Cowork에서 실행
로그인 후 바로 사용 가능

🗂️ 데이터 구조
{
  id, name, type (식당|카페|술집), cuisine (한식|중식|양식|일식|null),
  area (성수|뚝섬), address, description, tags[],
  lat, lng,        // 거리 계산용 (기본 데이터만)
  mapUrl,          // 직원이 직접 추가한 지도 링크
  reactions: { good, wait, bad },
  addedBy
}
💡 나중에 확장

데이터 영속성 추가 (DB 또는 GitHub Issues 활용)
위치 기반 실시간 거리 계산
카카오/네이버 지도 API 연동으로 자동 좌표 입력
