/**
 * Page08Keywords.js - 年度關鍵字頁
 * "這些詞佔據你的腦海"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page08Keywords extends StoryPage {
  render() {
    const el = super.render();
    const keywords = this.stats.topKeywords.length > 0
      ? this.stats.topKeywords
      : ['Threads', '2025', '精彩'];
    el.classList.add('page-keywords');
    el.innerHTML = `
      <p class="label">這些詞佔據你的腦海</p>
      <div class="word-cloud">
        ${keywords.map((word, i) => `
          <span class="cloud-word size-${i}" style="--delay: ${i * 0.2}s">${word}</span>
        `).join('')}
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

    // 文字雲動畫
    const words = el.querySelectorAll('.cloud-word');
    for (const word of words) {
      await this.delay(300);
      word.classList.add('pop-in');
    }
  }
}
