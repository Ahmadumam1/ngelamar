/* ===================================================================
   NGELAMAR - Interactive Website Script
   Handles Themes, GitHub API, Interactive Simulator, FAQ, & Modal
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. THEME TOGGLE (Dark / Light)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('ngelamar-theme') || 'dark';

  const sunIconSvg = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
  const moonIconSvg = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'light' ? moonIconSvg : sunIconSvg;
    }
    localStorage.setItem('ngelamar-theme', theme);
  }

  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // 2. MOBILE NAVIGATION MENU TOGGLE
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    function toggleMenu(isOpen) {
      const willOpen = typeof isOpen === 'boolean' ? isOpen : !navMenu.classList.contains('active');
      navMenu.classList.toggle('active', willOpen);
      mobileToggle.classList.toggle('active', willOpen);
      mobileToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking nav links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu(false);
      }
    });
  }

  // 3. DYNAMIC GITHUB RELEASE FETCHER
  const releaseBadges = document.querySelectorAll('.release-tag-text');
  const downloadLinks = document.querySelectorAll('.dynamic-apk-download');
  const releaseDateSpan = document.getElementById('release-date-text');
  const fileSizeSpan = document.getElementById('release-filesize-text');

  const GITHUB_REPO = 'Ahmadumam1/ngelamar';
  const FALLBACK_VERSION = 'v1.0.2';
  const FALLBACK_APK_URL = 'https://github.com/Ahmadumam1/ngelamar/releases/latest';

  async function fetchLatestRelease() {
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      const tagName = data.tag_name || FALLBACK_VERSION;
      let apkUrl = data.html_url || FALLBACK_APK_URL;
      let apkSize = '~60 MB';

      if (data.assets && data.assets.length > 0) {
        const apkAsset = data.assets.find(a => a.name.toLowerCase().endsWith('.apk'));
        if (apkAsset) {
          apkUrl = apkAsset.browser_download_url;
          if (apkAsset.size) {
            apkSize = `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB`;
          }
        }
      }

      // Update UI elements
      releaseBadges.forEach(badge => {
        badge.textContent = tagName;
      });

      downloadLinks.forEach(link => {
        link.setAttribute('href', apkUrl);
      });

      if (fileSizeSpan) {
        fileSizeSpan.textContent = apkSize;
      }

      if (releaseDateSpan && data.published_at) {
        const date = new Date(data.published_at);
        releaseDateSpan.textContent = date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (err) {
      console.warn('Using default release info:', err);
      releaseBadges.forEach(badge => badge.textContent = FALLBACK_VERSION);
      downloadLinks.forEach(link => link.setAttribute('href', FALLBACK_APK_URL));
      if (fileSizeSpan) fileSizeSpan.textContent = '60.6 MB';
      if (releaseDateSpan) releaseDateSpan.textContent = 'Terbaru (2026)';
    }
  }

  fetchLatestRelease();

  // 4. VIDEO PLAYER INTERACTION
  const videoPlayer = document.getElementById('guide-video-player');
  const videoOverlay = document.getElementById('video-overlay-preview');
  const videoPlayBtn = document.getElementById('video-play-btn');

  if (videoOverlay && videoPlayer) {
    function startVideo() {
      videoOverlay.classList.add('hidden');
      videoPlayer.play().catch(err => {
        console.log('Video play interrupted or file not yet loaded:', err);
      });
    }

    videoOverlay.addEventListener('click', startVideo);
    if (videoPlayBtn) {
      videoPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startVideo();
      });
    }

    videoPlayer.addEventListener('pause', () => {
      if (videoPlayer.currentTime === 0 || videoPlayer.ended) {
        videoOverlay.classList.remove('hidden');
      }
    });

    videoPlayer.addEventListener('ended', () => {
      videoOverlay.classList.remove('hidden');
    });
  }



  // 5. FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item, .faq-row');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question, .faq-trigger');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active') || item.classList.contains('open');
        // Close others
        faqItems.forEach(i => {
          i.classList.remove('open');
          i.classList.remove('active');
        });
        if (!isOpen) {
          item.classList.add('open');
          item.classList.add('active');
        }
      });
    }
  });

  // 6. DOWNLOAD MODAL
  const modalOverlay = document.getElementById('download-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const openModalBtns = document.querySelectorAll('.open-download-modal-btn');

  function openModal() {
    if (modalOverlay) modalOverlay.classList.add('active');
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If clicking with intention of guide or download confirmation
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
