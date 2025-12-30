/**
 * Page09Followers.js - 社群成長頁
 * "你的圈子變大了"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page09Followers extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-followers');
    el.innerHTML = `
      <p class="label">你的圈子變大了</p>
      <div class="growth-display">
        <span class="plus">+</span>
        <span class="followers-number" data-target="${this.stats.followersCount}">0</span>
        <span class="unit">追蹤者</span>
      </div>
      <div class="crowd-animation">
        <div class="person-row"></div>
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

    // 人群聚集動畫
    const row = el.querySelector('.person-row');
    const personCount = Math.min(Math.ceil(this.stats.followersCount / 150), 12);
    for (let i = 0; i < personCount; i++) {
      const person = document.createElement('div');
      person.className = 'person-icon';
      person.style.animationDelay = `${i * 0.1}s`;
      row.appendChild(person);
    }

    await this.delay(500);

    // 數字區塊顯示
    const growthDisplay = el.querySelector('.growth-display');
    growthDisplay.classList.add('visible');

    const numEl = el.querySelector('.followers-number');
    this.animateNumber(numEl, this.stats.followersCount, 1500);
  }
}
