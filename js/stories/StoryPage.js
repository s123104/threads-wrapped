/**
 * StoryPage.js - 單頁基礎類別
 * 提供通用的動畫方法和工具函數
 */

export class StoryPage {
  constructor(stats) {
    this.stats = stats;
  }

  /**
   * 渲染 DOM（子類別需覆寫）
   */
  render() {
    const el = document.createElement('div');
    el.className = 'story-page';
    return el;
  }

  /**
   * 入場動畫（可覆寫）
   */
  async animateIn(el) {
    el.classList.add('active');
    return this.delay(600);
  }

  /**
   * 離場動畫（可覆寫）
   */
  async animateOut(el) {
    el.classList.remove('active');
    el.classList.add('exit');
    return this.delay(400);
  }

  /**
   * 數字動畫
   */
  animateNumber(element, target, duration = 1500) {
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutCubic(progress);
      const current = Math.round(target * eased);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  /**
   * 緩動函數 - Ease Out Cubic
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * 緩動函數 - Ease Out Back
   */
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * 延遲函數
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 依序添加動畫類別
   */
  async animateSequence(elements, className, interval = 100) {
    for (const el of elements) {
      el.classList.add(className);
      await this.delay(interval);
    }
  }

  /**
   * 創建粒子元素
   */
  createParticles(container, count, className = 'particle') {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = className;
      p.style.setProperty('--angle', `${Math.random() * 360}deg`);
      p.style.setProperty('--distance', `${50 + Math.random() * 100}px`);
      p.style.setProperty('--delay', `${Math.random() * 0.5}s`);
      container.appendChild(p);
    }
  }

  /**
   * 創建飄落元素
   */
  createFallingItems(container, count, content, className = 'falling-item') {
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.className = className;
      item.textContent = content;
      item.style.left = `${Math.random() * 100}%`;
      item.style.animationDelay = `${Math.random() * 2}s`;
      item.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(item);
    }
  }

  /**
   * 創建星星元素
   */
  createStars(container, count) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 60}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(star);
    }
  }
}
