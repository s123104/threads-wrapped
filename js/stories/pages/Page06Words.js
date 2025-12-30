/**
 * Page06Words.js - 創作量頁
 * "你寫下了..."
 */

import { StoryPage } from '../StoryPage.js';

export default class Page06Words extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-words');
    el.innerHTML = `
      <p class="label">你寫下了...</p>
      <div class="words-display">
        <span class="words-number" data-target="${this.stats.totalWords}">0</span>
        <span class="words-unit">字</span>
      </div>
      <div class="book-stack">
        ${Array(5).fill('<div class="book"></div>').join('')}
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

    // 書本堆疊動畫
    const books = el.querySelectorAll('.book');
    for (let i = 0; i < books.length; i++) {
      await this.delay(150);
      books[i].classList.add('stack-in');
    }

    await this.delay(200);

    // 數字區塊顯示
    const wordsDisplay = el.querySelector('.words-display');
    wordsDisplay.classList.add('visible');

    // 數字計數
    const numEl = el.querySelector('.words-number');
    this.animateNumber(numEl, this.stats.totalWords, 2000);
  }
}
