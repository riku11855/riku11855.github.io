// 작업마다 펼침 패널은 하나만 열립니다.
document.querySelectorAll('[data-work]').forEach((work) => {
  const buttons = [...work.querySelectorAll('.step-btn')];
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
    // 좌우 화살표로 버튼 사이를 이동합니다.
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    });
  });
});

// 스크롤하면 섹션이 차례로 나타납니다.
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
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
  if (!id) {
    btn.disabled = true;
    btn.textContent = '영상 준비 중';
    return;
  }
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
  if (a.dataset.href) {
    a.href = a.dataset.href;
  } else {
    a.classList.add('is-pending');
    a.setAttribute('aria-disabled', 'true');
    a.textContent = '빌드 준비 중';
  }
});

// ===== 스크롤 효과 =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. 지금 보는 섹션을 메뉴에서 강조합니다.
const navLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
const navTargets = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function markCurrentNav() {
  const line = window.innerHeight * 0.35;
  let current = null;
  navTargets.forEach((sec) => { if (sec.getBoundingClientRect().top <= line) current = sec; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = navTargets[navTargets.length - 1];
  navLinks.forEach((a) => a.classList.toggle('is-current', !!current && a.getAttribute('href') === '#' + current.id));
}

// 2. 표지 이미지는 글보다 느리게 움직이고, 내려갈수록 어두워집니다.
const hero = document.querySelector('.hero');
const heroImg = hero?.querySelector('.hero-slot img');
function moveHero() {
  if (!hero || !heroImg || reduceMotion) return;
  const h = hero.offsetHeight || 1;
  const y = Math.min(Math.max(window.scrollY, 0), h);
  heroImg.style.transform = `translateY(${y * 0.3}px) scale(1.06)`;
  hero.style.setProperty('--hero-dim', (y / h * 0.6).toFixed(3));
}

// 4. 이력 선이 스크롤을 따라 채워지고, 지나간 항목이 켜집니다.
const timeline = document.querySelector('.timeline');
const timelineItems = timeline ? [...timeline.querySelectorAll('li')] : [];
function fillTimeline() {
  if (!timeline) return;
  const r = timeline.getBoundingClientRect();
  const line = window.innerHeight * 0.7;
  const p = Math.min(Math.max((line - r.top) / (r.height || 1), 0), 1);
  timeline.style.setProperty('--fill', p.toFixed(3));
  timelineItems.forEach((li) => li.classList.toggle('on', li.getBoundingClientRect().top + 12 <= line));
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { markCurrentNav(); moveHero(); fillTimeline(); ticking = false; });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
