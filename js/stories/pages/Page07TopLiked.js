/**
 * Page07TopLiked.js - 互動王頁
 * "你最常幫他按讚"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page07TopLiked extends StoryPage {
  render() {
    const el = super.render();
    const topUsers = this.stats.topInteractions.slice(0, 3);
    el.classList.add('page-top-liked');

    const rankingItems = topUsers.map((user, index) => `
      <div class="ranking-item rank-${index + 1}">
        <span class="ranking-name">${user.username}</span>
      </div>
    `).join('');

    el.innerHTML = `
      <p class="label">你最常幫他們按讚</p>
      <div class="ranking-list">
        ${rankingItems}
      </div>
      <div class="hearts-container"></div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    // 標籤淡入
    const label = el.querySelector('.label');
    label.classList.add('visible');

    await this.delay(300);

    // 排名依序滑入
    const items = el.querySelectorAll('.ranking-item');
    for (const item of items) {
      item.classList.add('visible');
      await this.delay(250);
    }

    await this.delay(200);

    // 愛心飄落
    const hearts = el.querySelector('.hearts-container');
    this.createFallingItems(hearts, 15, '❤️', 'heart');
  }
}
