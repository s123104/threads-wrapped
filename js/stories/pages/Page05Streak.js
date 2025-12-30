/**
 * Page05Streak.js - 連續發文頁
 * "你堅持了..."
 */

import { StoryPage } from '../StoryPage.js';

export default class Page05Streak extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-streak');
    el.innerHTML = `
      <p class="label">你堅持了...</p>
      <div class="streak-display">
        <span class="streak-number">${this.stats.longestStreak}</span>
        <span class="streak-unit">天連續發文</span>
      </div>
      <div class="flame-container">
        <div class="flame"></div>
        <div class="flame-glow"></div>
      </div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    // 標籤淡入
    const label = el.querySelector('.label');
    label.classList.add('visible');

    await this.delay(200);

    // 火焰燃燒動畫
    const flame = el.querySelector('.flame');
    flame.classList.add('burning');

    await this.delay(400);

    // 數字從底部升起
    const streakDisplay = el.querySelector('.streak-display');
    streakDisplay.classList.add('visible');
  }
}
