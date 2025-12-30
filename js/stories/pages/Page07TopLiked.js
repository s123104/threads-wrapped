/**
 * Page07TopLiked.js - 互動王頁
 * "你最常幫他按讚"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page07TopLiked extends StoryPage {
  render() {
    const el = super.render();
    const topUser = this.stats.topInteractions[0] || { username: '-', count: 0 };
    el.classList.add('page-top-liked');
    el.innerHTML = `
      <p class="label">你最常幫他按讚</p>
      <div class="liked-user">
        <div class="user-avatar"></div>
        <div class="user-name">${topUser.username}</div>
        <div class="like-count">${topUser.count} 次</div>
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

    // 使用者卡片滑入
    const user = el.querySelector('.liked-user');
    user.classList.add('visible');

    await this.delay(400);

    // 愛心飄落
    const hearts = el.querySelector('.hearts-container');
    this.createFallingItems(hearts, 15, '❤️', 'heart');
  }
}
