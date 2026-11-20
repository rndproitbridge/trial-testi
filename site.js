const filterButtons = [...document.querySelectorAll('[data-filter]')];
const stories = [...document.querySelectorAll('[data-categories]')];
const count = document.getElementById('story-count');

function showStories(category) {
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  stories.forEach((story) => {
    story.hidden = category !== 'all' && !story.dataset.categories.split(' ').includes(category);
  });
  const visibleCount = stories.filter((story) => !story.hidden).length;
  count.textContent = visibleCount === 1 ? '1 story shown' : visibleCount + ' stories shown';
}

function revealLinkedStory() {
  const story = stories.find((item) => '#' + item.id === location.hash);
  if (story) {
    showStories('all');
    const details = story.querySelector('details');
    if (!details.hidden) details.open = true;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    stories.forEach((story) => story.classList.remove('motion-in'));
    showStories(button.dataset.filter);
    requestAnimationFrame(() => {
      stories.filter((story) => !story.hidden).forEach((story, index) => {
        story.style.setProperty('--story-delay', index * 45 + 'ms');
        story.classList.add('motion-in');
      });
    });
  });
});

const storyDialog = document.getElementById('story-dialog');
const storyDialogMedia = storyDialog.querySelector('.story-dialog-media');
const storyDialogBody = storyDialog.querySelector('.story-dialog-body');
const storyDialogTitle = storyDialog.querySelector('h2');
let storyTrigger;

function openStoryDialog(story, trigger) {
  const details = story.querySelector('details');
  const portrait = story.querySelector('.story-top img');
  const photo = details.querySelector('[data-story-image]') || portrait;
  const video = details.querySelector('[data-video]');
  const summary = details.querySelector('p');
  const learnerName = story.querySelector('h3').textContent;
  const outcome = story.querySelector('dl > div:last-child dd');

  storyDialogTitle.textContent = learnerName;
  storyDialog.querySelector('.story-dialog-role').textContent = outcome.textContent;
  storyDialogMedia.replaceChildren();
  storyDialogBody.replaceChildren();
  if (summary) storyDialogBody.append(summary.cloneNode(true));

  const source = details.querySelector('a:not([data-video])');
  if (source) storyDialogBody.append(source.cloneNode(true));

  if (photo?.getAttribute('src')) {
    const image = document.createElement('img');
    image.src = photo.getAttribute('src');
    image.alt = photo === portrait ? learnerName : photo.alt;
    image.className = photo === portrait ? 'story-media-portrait' : 'story-media-photo';
    image.addEventListener('error', () => image.remove(), { once: true });
    storyDialogMedia.append(image);
  }

  if (video) {
    const watch = document.createElement('button');
    watch.type = 'button';
    watch.className = 'button story-play';
    watch.textContent = video.textContent;
    storyDialogMedia.append(watch);
    const directLink = video.cloneNode(true);
    directLink.removeAttribute('data-video');
    directLink.textContent = 'Open video directly';
    storyDialogBody.append(directLink);
    watch.addEventListener('click', () => {
      const youtubeId = video.dataset.video;
      let player;
      if (/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
        player = document.createElement('iframe');
        player.src = 'https://www.youtube-nocookie.com/embed/' + youtubeId + '?rel=0&autoplay=1';
        player.title = 'Learner interview with ' + learnerName;
        player.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        player.allowFullscreen = true;
      } else {
        player = document.createElement('video');
        player.src = video.href;
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
        player.setAttribute('aria-label', 'Learner video with ' + learnerName);
      }
      player.tabIndex = 0;
      storyDialogMedia.replaceChildren(player);
      player.focus();
    });
  }

  if (!storyDialog.open) {
    storyTrigger = trigger;
    storyDialog.showModal();
  }
  storyDialog.scrollTop = 0;
}

if (typeof storyDialog.showModal === 'function') {
  stories.forEach((story) => {
    const details = story.querySelector('details');
    const read = document.createElement('button');
    read.type = 'button';
    read.className = 'story-read';
    read.textContent = details.querySelector('summary').textContent;
    read.setAttribute('aria-haspopup', 'dialog');
    read.setAttribute('aria-controls', storyDialog.id);
    details.before(read);
    details.hidden = true;
    read.addEventListener('click', () => openStoryDialog(story, read));
  });

  document.querySelectorAll('[data-story]').forEach((link) => {
    const story = document.getElementById(link.dataset.story);
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (!story) return;
      event.preventDefault();
      openStoryDialog(story, link);
    });
  });

  storyDialog.addEventListener('close', () => {
    if (storyDialog.open) return;
    storyDialogMedia.replaceChildren();
    if (storyTrigger?.isConnected) storyTrigger.focus({ preventScroll: true });
  });
}

window.addEventListener('hashchange', revealLinkedStory);
revealLinkedStory();

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

const menus = [...document.querySelectorAll('.nav-group')];
menus.forEach((menu) => {
  menu.addEventListener('toggle', () => {
    if (menu.open) menus.filter((other) => other !== menu).forEach((other) => { other.open = false; });
  });
});
document.addEventListener('click', (event) => {
  menus.filter((menu) => !menu.contains(event.target)).forEach((menu) => { menu.open = false; });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  menus.filter((menu) => menu.open).forEach((menu) => {
    menu.open = false;
    menu.querySelector('summary').focus();
  });
});

const enquiry = document.getElementById('enquiry');
document.querySelectorAll('[data-enquire]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (typeof enquiry.showModal !== 'function') return;
    event.preventDefault();
    enquiry.showModal();
  });
});

const logoStrip = document.getElementById('logo-strip');
const logoTrack = logoStrip.querySelector('.logo-track');
const logoCopy = logoTrack.firstElementChild.cloneNode(true);
logoCopy.removeAttribute('aria-label');
logoCopy.setAttribute('aria-hidden', 'true');
logoTrack.append(logoCopy);

logoStrip.classList.add('is-moving');

function updateLogoControl() {
  if (motion.matches) {
    logoStrip.removeAttribute('tabindex');
    logoStrip.removeAttribute('aria-description');
  } else {
    logoStrip.tabIndex = 0;
    logoStrip.setAttribute('aria-description', 'Focus to pause. Press Space to keep motion paused.');
  }
}
function toggleLogoMotion() {
  const paused = logoStrip.classList.toggle('is-paused');
  logoStrip.setAttribute('aria-description', paused ? 'Motion paused. Press Space to resume.' : 'Press Space to keep motion paused.');
}
logoStrip.setAttribute('role', 'region');
logoStrip.setAttribute('aria-label', 'Employer logos');
logoStrip.addEventListener('click', () => { if (!motion.matches) toggleLogoMotion(); });
logoStrip.addEventListener('keydown', (event) => {
  if (event.key !== ' ' || motion.matches) return;
  event.preventDefault();
  toggleLogoMotion();
});
updateLogoControl();

motion.addEventListener('change', updateLogoControl);

const concernItems = [...document.querySelectorAll('.concern-item')];

function openConcern(item) {
  concernItems.forEach((other) => { other.open = other === item; });
}

concernItems.forEach((item) => {
  const summary = item.querySelector('summary');
  summary.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') openConcern(item);
  });
  summary.addEventListener('focus', () => {
    if (summary.matches(':focus-visible')) openConcern(item);
  });
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    openConcern(item);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  if (!concernItems.some((item) => item.open && item.contains(document.activeElement))) return;
  const [firstConcern] = concernItems;
  openConcern(firstConcern);
  firstConcern.querySelector('summary').focus();
});

const hero = document.querySelector('.hero');
const readingProgress = document.querySelector('.reading-progress');
const readingBar = readingProgress.querySelector('span');
const scroller = document.scrollingElement || document.documentElement;
let scrollFrame = null;

function updateScrollState() {
  scrollFrame = null;

  const scrollTop = Math.max(0, scroller.scrollTop);
  const viewportHeight = scroller.clientHeight || window.innerHeight;
  const scrollDistance = scroller.scrollHeight - viewportHeight;
  const progress = scrollDistance > 0 ? Math.min(1, scrollTop / scrollDistance) : 0;
  readingBar.style.transform = 'scaleX(' + progress + ')';
}

function requestScrollUpdate() {
  if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScrollState);
}

readingProgress.hidden = false;
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
window.addEventListener('pageshow', requestScrollUpdate);
if ('ResizeObserver' in window) {
  const scrollLayout = new ResizeObserver(requestScrollUpdate);
  scrollLayout.observe(document.body);
}
requestScrollUpdate();

const reviewReel = document.querySelector('.reviews-reel');
const reviewDialog = document.getElementById('google-review-dialog');
const canOpenReview = typeof reviewDialog.showModal === 'function';

for (const set of reviewReel.querySelectorAll('.review-set')) {
  if (canOpenReview) set.querySelectorAll('.review-read').forEach((button) => { button.hidden = false; });
  const copy = set.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('button').forEach((button) => { button.tabIndex = -1; });
  set.after(copy);
}

function updateReviewMotion() {
  reviewReel.classList.toggle('is-running', !motion.matches);
}

motion.addEventListener('change', updateReviewMotion);
updateReviewMotion();

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    reviewReel.classList.toggle('is-visible', entry.isIntersecting);
  }).observe(reviewReel);
} else {
  reviewReel.classList.add('is-visible');
}

if (canOpenReview) {
  reviewReel.addEventListener('click', (event) => {
    const button = event.target.closest('.review-read');
    if (!button) return;

    const card = button.closest('.review-card');
    reviewDialog.querySelector('h2').textContent = card.querySelector('h3').textContent;
    reviewDialog.querySelector('.review-dialog-rating').textContent = card.querySelector('.review-rating .sr-only').textContent;
    reviewDialog.querySelector('.review-dialog-text').textContent = card.querySelector('.review-quote').textContent;
    reviewReel.classList.add('is-reading');
    reviewDialog.showModal();
  });
  reviewDialog.addEventListener('close', () => reviewReel.classList.remove('is-reading'));
}

function revealOpeningBrand(onComplete) {
  if (motion.matches || location.hash || window.scrollY > 0) {
    onComplete();
    return;
  }

  const overlay = document.querySelector('.brand-intro');
  const mark = overlay.querySelector('.brand-intro-logo');
  const brand = document.querySelector('.header .brand');
  const target = brand.getBoundingClientRect();

  if (typeof mark.animate !== 'function' || !target.width || !target.height) {
    hero.classList.add('hero-enter');
    onComplete();
    return;
  }

  Object.assign(mark.style, {
    left: target.left + 'px',
    top: target.top + 'px',
    width: target.width + 'px',
    height: target.height + 'px'
  });

  const x = (window.innerWidth - target.width) / 2 - target.left;
  const y = (window.innerHeight - target.height) / 2 - target.top;
  const scale = Math.min(2.45, (window.innerWidth - 48) / target.width);
  const centered = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';

  document.documentElement.classList.add('brand-revealing');
  overlay.hidden = false;
  const flight = mark.animate([
    { opacity: 0, transform: centered + ' scale(.9)', offset: 0 },
    { opacity: 1, transform: centered, offset: 0.25 },
    { opacity: 1, transform: centered, offset: 0.42 },
    { opacity: 1, transform: 'translate(0, 0) scale(1)', offset: 1 }
  ], { duration: 1120, easing: 'cubic-bezier(.24,.74,.24,1)', fill: 'both' });

  function finishReveal() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('brand-revealing');
    window.removeEventListener('resize', finishReveal);
    window.removeEventListener('keydown', finishReveal);
    hero.classList.add('hero-enter');
    flight.cancel();
    onComplete();
  }

  flight.finished.then(finishReveal, finishReveal);
  window.addEventListener('resize', finishReveal, { once: true });
  window.addEventListener('keydown', finishReveal, { once: true });
}

function animateImpactNumbers(impact) {
  const formatter = new Intl.NumberFormat('en-US');
  const counters = [];

  for (const link of impact.querySelectorAll('.stat-source')) {
    const finalText = link.textContent.trim();
    const match = finalText.match(/^([\d,]+)(\+?)$/);
    if (!match) continue;

    const [, digits, suffix] = match;
    const value = document.createElement('span');
    value.setAttribute('aria-hidden', 'true');
    value.textContent = '1' + suffix;
    link.setAttribute('aria-label', finalText);
    link.replaceChildren(value);
    counters.push({ value, target: Number(digits.replaceAll(',', '')), suffix, finalText });
  }

  let startedAt;
  function countFrame(now) {
    startedAt ??= now;
    const progress = motion.matches ? 1 : Math.min(1, (now - startedAt) / 1050);
    const eased = 1 - (1 - progress) ** 3;
    for (const { value, target, suffix, finalText } of counters) {
      const count = 1 + Math.round((target - 1) * eased);
      value.textContent = progress === 1 ? finalText : formatter.format(count) + suffix;
    }
    if (progress < 1) requestAnimationFrame(countFrame);
  }
  if (counters.length) requestAnimationFrame(countFrame);
}

function observePageEntrances() {
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!target.classList.replace('reveal-pending', 'scroll-revealed')) continue;
      if (!motion.matches && target.matches('.impact-grid')) animateImpactNumbers(target);
    }
  });

  document.querySelectorAll('[data-scroll-reveal]').forEach((target) => {
    if (target.contains(document.activeElement)) return;
    target.classList.add('reveal-pending');
    target.addEventListener('focusin', () => {
      target.classList.remove('reveal-pending', 'scroll-revealed');
      observer.unobserve(target);
    }, { once: true });
    observer.observe(target);
  });
}

revealOpeningBrand(observePageEntrances);

const heroVideo = document.getElementById('hero-video');
let heroVideoInView = !('IntersectionObserver' in window);

function updateHeroVideo() {
  if (motion.matches || document.hidden || !heroVideoInView) {
    if (!heroVideo.paused) heroVideo.pause();
    return;
  }

  if (!heroVideo.hasAttribute('src')) heroVideo.src = heroVideo.dataset.src;
  heroVideo.muted = true;
  if (heroVideo.paused) heroVideo.play()?.catch(() => {});
}

motion.addEventListener('change', updateHeroVideo);
document.addEventListener('visibilitychange', updateHeroVideo);

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    heroVideoInView = entry.isIntersecting;
    updateHeroVideo();
  }, { threshold: 0.15 }).observe(heroVideo.closest('.hero'));
}
updateHeroVideo();
