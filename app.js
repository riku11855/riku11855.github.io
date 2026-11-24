// 장식용 요소(마우스 빛, 스크롤 막대)를 붙입니다.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bar = document.createElement('div');
bar.className = 'progress';
document.body.prepend(bar);
const topBar = document.querySelector('.top');
const heroImg = document.querySelector('.hero-bg img');

// 1. 지금 보는 섹션을 메뉴에서 강조하고, 진행 막대를 채웁니다.
const navLinks = [...document.querySelectorAll('.menu a')];
const targets = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function onScroll() {
  const line = window.innerHeight * 0.4;
  let current = null;
  targets.forEach((sec) => { if (sec.getBoundingClientRect().top <= line) current = sec; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = targets[targets.length - 1];
  navLinks.forEach((a) => a.classList.toggle('on', !!current && a.getAttribute('href') === '#' + current.id));
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  topBar.classList.toggle('solid', window.scrollY > 40);
  // 첫 화면 배경은 글보다 느리게 움직입니다.
  if (heroImg && !reduceMotion && window.scrollY < window.innerHeight) heroImg.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.06)`;
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
onScroll();

// 2. 항목이 화면에 들어오면 아래에서 떠오릅니다.
const rises = document.querySelectorAll('.rise');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  rises.forEach((el) => io.observe(el));
} else {
  rises.forEach((el) => el.classList.add('in'));
}

// 이메일 주소 복사
const copyBtn = document.getElementById('copy-mail');
const copyState = document.querySelector('.copy-state');
copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('riku11855@gmail.com');
    copyState.textContent = '복사했습니다.';
  } catch {
    copyState.textContent = '주소를 직접 선택해 주세요.';
  }
  setTimeout(() => { copyState.textContent = ''; }, 2400);
});

// 유튜브 영상은 사이트 안의 창에서 재생합니다.
const modal = document.querySelector('.video-modal');
const frame = modal?.querySelector('.video-frame');
document.querySelectorAll('.video-btn').forEach((btn) => {
  const id = btn.dataset.youtube;
  if (!id) { btn.disabled = true; btn.textContent = '영상 준비 중'; return; }
  btn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
    iframe.title = btn.dataset.title || '플레이 영상';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
    modal.showModal();
  });
});
modal?.querySelector('.video-close').addEventListener('click', () => modal.close());
modal?.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
modal?.addEventListener('close', () => frame.replaceChildren());

// 빌드 다운로드 주소가 없으면 준비 중으로 표시합니다.
document.querySelectorAll('.build-btn').forEach((a) => {
  if (a.dataset.href) { a.href = a.dataset.href; } else {
    a.classList.add('is-pending');
    a.setAttribute('aria-disabled', 'true');
    a.textContent = '빌드 준비 중';
  }
});
