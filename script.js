// 움직임 줄이기 설정 여부 (켜져 있으면 패럴랙스를 끔)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   효과 1: 스크롤하면 제목, 문장, 이미지가 아래에서 위로 페이드인
   - IntersectionObserver로 요소가 화면에 들어오는 순간을 감지
   - 같은 묶음 안에서는 순서대로 조금씩 늦게 나타나도록 지연 적용
   ========================================================= */
const fadeItems = document.querySelectorAll(".fade-up");

// 히어로 안에서 제목 → 문장 → 버튼 순으로 0.15초씩 지연
document.querySelectorAll(".hero-inner").forEach((group) => {
  group.querySelectorAll(".fade-up").forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.15}s`;
  });
});

const fadeObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible"); // 페이드인 시작
        observer.unobserve(entry.target);         // 한 번 나타나면 더 이상 감시하지 않음
      }
    });
  },
  {
    threshold: 0.15,                 // 요소의 15%가 보이면 실행
    rootMargin: "0px 0px -10% 0px",  // 화면 아래쪽 10%는 제외해서 조금 더 올라왔을 때 실행
  }
);

fadeItems.forEach((item) => fadeObserver.observe(item));

/* =========================================================
   효과 2: 히어로 배경 패럴랙스
   효과 3: 상단 스크롤 진행률 프로그래스 바
   - 두 효과 모두 스크롤 위치를 사용하므로 하나의 함수에서 처리
   ========================================================= */
const heroBg = document.getElementById("heroBg");
const progressBar = document.getElementById("progressBar");
const progress = document.getElementById("progress");
const topAppBar = document.getElementById("topAppBar");
const fab = document.getElementById("fab");

// FAB: 맨 위로 이동
fab.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

function updateOnScroll() {
  const scrollY = window.scrollY;

  // 효과 2: 배경을 스크롤 양의 30%만큼만 내려서 콘텐츠보다 느리게 움직이게 함
  if (!reduceMotion && scrollY <= window.innerHeight) {
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  }

  // 효과 3: 전체 스크롤 가능한 길이 대비 현재 위치를 0 ~ 1 비율로 계산
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${ratio})`;
  progress.setAttribute("aria-valuenow", Math.round(ratio * 100));

  // Top app bar: 스크롤하면 surface 색으로 전환 / FAB: 히어로를 지나면 표시
  topAppBar.classList.toggle("is-scrolled", scrollY > 8);
  fab.classList.toggle("is-visible", scrollY > window.innerHeight * 0.6);
}

// requestAnimationFrame으로 한 프레임에 한 번만 계산해서 스크롤을 부드럽게 유지
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);

window.addEventListener("resize", updateOnScroll);
updateOnScroll(); // 첫 로드 시 한 번 실행
