/* ===================================================================
   NGELAMAR - Interactive Website Script
   Handles Themes, GitHub API, Interactive Simulator, FAQ, & Modal
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. THEME TOGGLE (Dark / Light)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('ngelamar-theme') || 'dark';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
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
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close when clicking nav links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
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

  // 4. INTERACTIVE WORKFLOW SIMULATOR
  const stepTabs = document.querySelectorAll('.step-tab');
  const previewContents = document.querySelectorAll('.preview-content');

  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetStep = tab.getAttribute('data-step');

      stepTabs.forEach(t => t.classList.remove('active'));
      previewContents.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPreview = document.getElementById(`sim-preview-${targetStep}`);
      if (targetPreview) {
        targetPreview.classList.add('active');
      }
    });
  });

  // Interactive Status Pills in Simulator
  const statusBtns = document.querySelectorAll('.status-choice-btn');
  const liveStatusBadge = document.getElementById('live-sim-status-badge');
  const liveStatusDesc = document.getElementById('live-sim-status-desc');

  const statusConfigs = {
    'wishlist': { text: 'Disimpan (Wishlist)', color: '#64748B', desc: 'Lowongan baru disimpan untuk diteliti lebih lanjut.' },
    'applied': { text: 'Dilamar (Terkirim)', color: '#3B82F6', desc: 'Berkas CV & Portofolio sudah dikirim ke HRD.' },
    'interview': { text: 'Wawancara (Interview)', color: '#F59E0B', desc: 'Jadwal interview telah disiapkan! Persiapkan diri sebaik mungkin.' },
    'offering': { text: 'Offering Letter', color: '#10B981', desc: 'Penawaran kerja diterima! Waktunya negosiasi & evaluasi kontrak.' },
    'accepted': { text: 'Diterima 🎉', color: '#059669', desc: 'Selamat! Kamu resmi bergabung dan menaklukkan proses seleksi!' }
  };

  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const statusKey = btn.getAttribute('data-status');
      const cfg = statusConfigs[statusKey];
      if (cfg && liveStatusBadge && liveStatusDesc) {
        liveStatusBadge.textContent = cfg.text;
        liveStatusBadge.style.backgroundColor = `${cfg.color}22`;
        liveStatusBadge.style.color = cfg.color;
        liveStatusBadge.style.border = `1px solid ${cfg.color}55`;
        liveStatusDesc.textContent = cfg.desc;
      }
    });
  });

  // 5. FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
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
