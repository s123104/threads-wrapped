/**
 * Page03TotalPosts.js - 總發文數頁
 * "今年你發了..."
 */

import { StoryPage } from '../StoryPage.js';

export default class Page03TotalPosts extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-total-posts');
    el.innerHTML = `
      <p class="label">今年你發了...</p>
      <div class="number-display">
        <span class="big-number" data-target="${this.stats.totalPosts}">0</span>
        <span class="unit">篇</span>
      </div>
      <div class="post-icons"></div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    // 標籤淡入
    const label = el.querySelector('.label');
    label.classList.add('visible');

    await this.delay(300);

    // 數字區塊顯示
    const numberDisplay = el.querySelector('.number-display');
    numberDisplay.classList.add('visible');

    // 數字跳動計數
    const numEl = el.querySelector('.big-number');
    this.animateNumber(numEl, this.stats.totalPosts, 2000);

    // 貼文圖示飛入
    await this.delay(500);
    const icons = el.querySelector('.post-icons');
    const iconCount = Math.min(Math.ceil(this.stats.totalPosts / 300), 15);
    for (let i = 0; i < iconCount; i++) {
      const icon = document.createElement('div');
      icon.className = 'post-icon';
      icon.style.animationDelay = `${i * 100}ms`;
      icons.appendChild(icon);
    }
  }
}
