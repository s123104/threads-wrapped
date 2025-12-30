/**
 * Page02FirstPost.js - 起點頁
 * "一切從這天開始..."
 */

import { StoryPage } from '../StoryPage.js';

export default class Page02FirstPost extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-first-post');
    el.innerHTML = `
      <div class="diary-book">
        <div class="diary-cover">
          <div class="diary-spine"></div>
        </div>
        <div class="diary-page">
          <p class="label">一切從這天開始...</p>
          <h2 class="date">${this.stats.firstPostDate}</h2>
          <div class="decorative-line"></div>
        </div>
      </div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    await this.delay(300);

    // 日記本封面翻開
    const cover = el.querySelector('.diary-cover');
    cover.classList.add('flip-open');

    await this.delay(800);

    // 內頁內容淡入
    const page = el.querySelector('.diary-page');
    page.classList.add('reveal');

    // 標籤淡入
    const label = page.querySelector('.label');
    label.classList.add('visible');
  }
}
