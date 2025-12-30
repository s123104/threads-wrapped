/**
 * Page04MostActiveDay.js - 最活躍日頁
 * "這天你特別有話說"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page04MostActiveDay extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-active-day');
    el.innerHTML = `
      <p class="label">這天你特別有話說</p>
      <div class="explosion-container">
        <div class="date-display">${this.stats.mostActiveDay}</div>
        <div class="count-badge">
          <span class="count">${this.stats.mostActiveDayCount}</span> 篇
        </div>
        <div class="particles"></div>
      </div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    // 標籤淡入
    const label = el.querySelector('.label');
    label.classList.add('visible');

    await this.delay(300);

    // 爆炸效果
    const dateDisplay = el.querySelector('.date-display');
    dateDisplay.classList.add('explode');

    // 粒子散射
    const particles = el.querySelector('.particles');
    this.createParticles(particles, 20);

    await this.delay(400);

    // 數字徽章顯示
    const countBadge = el.querySelector('.count-badge');
    countBadge.classList.add('visible');
  }
}
