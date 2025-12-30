/**
 * StoryEngine.js - 故事流引擎核心
 * 處理進度條、點擊事件、頁面切換
 */

// 靜態 import 所有頁面（避免動態 import 在 file:// 協議下失敗）
import Page01Opening from './pages/Page01Opening.js';
import Page02FirstPost from './pages/Page02FirstPost.js';
import Page03TotalPosts from './pages/Page03TotalPosts.js';
import Page04MostActiveDay from './pages/Page04MostActiveDay.js';
import Page05Streak from './pages/Page05Streak.js';
import Page06Words from './pages/Page06Words.js';
import Page07TopLiked from './pages/Page07TopLiked.js';
import Page08Keywords from './pages/Page08Keywords.js';
import Page09Followers from './pages/Page09Followers.js';
import Page10PeakMonth from './pages/Page10PeakMonth.js';
import Page11Personality from './pages/Page11Personality.js';
import Page12Emoji from './pages/Page12Emoji.js';
import Page13Ending from './pages/Page13Ending.js';

export class StoryEngine {
  constructor(container, stats) {
    this.container = container;
    this.stats = stats;
    this.currentPage = 0;
    this.totalPages = 13;
    this.pages = [];
    this.isAnimating = false;
    this.progressBar = null;
    this.pagesWrapper = null;
    this.onComplete = null;

    // 頁面類別陣列
    this.pageClasses = [
      Page01Opening,
      Page02FirstPost,
      Page03TotalPosts,
      Page04MostActiveDay,
      Page05Streak,
      Page06Words,
      Page07TopLiked,
      Page08Keywords,
      Page09Followers,
      Page10PeakMonth,
      Page11Personality,
      Page12Emoji,
      Page13Ending
    ];
  }

  /**
   * 初始化引擎
   */
  async init() {
    try {
      this.container.innerHTML = '';

      this.createProgressBar();
      this.createPagesContainer();
      this.loadPages();
      this.bindEvents();
      await this.showPage(0);
    } catch (error) {
      console.error('StoryEngine init error:', error);
      this.container.innerHTML = `<div style="color: red; padding: 20px;">載入故事流時發生錯誤：${error.message}</div>`;
    }
  }

  /**
   * 建立頂部進度條
   */
  createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'story-progress-bar';
    bar.innerHTML = Array(this.totalPages)
      .fill(0)
      .map((_, i) => `<div class="progress-segment" data-index="${i}"></div>`)
      .join('');
    this.container.appendChild(bar);
    this.progressBar = bar;
  }

  /**
   * 建立頁面容器
   */
  createPagesContainer() {
    const pagesWrapper = document.createElement('div');
    pagesWrapper.className = 'story-pages-wrapper';
    this.container.appendChild(pagesWrapper);
    this.pagesWrapper = pagesWrapper;
  }

  /**
   * 載入所有頁面
   */
  loadPages() {
    for (const PageClass of this.pageClasses) {
      const page = new PageClass(this.stats);
      this.pages.push(page);
    }
  }

  /**
   * 綁定點擊事件
   */
  bindEvents() {
    // 點擊畫面切換頁面
    this.container.addEventListener('click', (e) => {
      if (this.isAnimating) return;

      // 點擊左半邊返回上一頁，右半邊下一頁
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeftHalf = x < rect.width * 0.3;

      if (isLeftHalf && this.currentPage > 0) {
        this.prevPage();
      } else {
        this.nextPage();
      }
    });

    // 鍵盤支援
    document.addEventListener('keydown', (e) => {
      if (this.isAnimating) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.nextPage();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevPage();
      }
    });

    // 觸控滑動支援
    let touchStartX = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextPage();
        } else {
          this.prevPage();
        }
      }
    }, { passive: true });
  }

  /**
   * 切換到下一頁
   */
  async nextPage() {
    if (this.currentPage >= this.totalPages - 1) {
      // 已經在最後一頁，觸發完成回調
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }
    await this.showPage(this.currentPage + 1);
  }

  /**
   * 切換到上一頁
   */
  async prevPage() {
    if (this.currentPage <= 0) return;
    await this.showPage(this.currentPage - 1);
  }

  /**
   * 顯示指定頁面
   */
  async showPage(index) {
    if (index < 0 || index >= this.totalPages) return;

    this.isAnimating = true;

    // 更新進度條
    this.updateProgress(index);

    // 執行離場動畫
    const currentPageEl = this.pagesWrapper.querySelector('.story-page.active');
    if (currentPageEl) {
      await this.pages[this.currentPage].animateOut(currentPageEl);
      currentPageEl.remove();
    }

    // 更新當前頁面索引
    this.currentPage = index;

    // 建立並顯示新頁面
    const page = this.pages[index];
    const pageEl = page.render();
    this.pagesWrapper.appendChild(pageEl);

    // 執行入場動畫
    await page.animateIn(pageEl);

    this.isAnimating = false;
  }

  /**
   * 更新進度條
   */
  updateProgress(index) {
    const segments = this.progressBar.querySelectorAll('.progress-segment');
    segments.forEach((seg, i) => {
      seg.classList.remove('active', 'completed');
      if (i < index) {
        seg.classList.add('completed');
      }
      if (i === index) {
        seg.classList.add('active');
      }
    });
  }
}
