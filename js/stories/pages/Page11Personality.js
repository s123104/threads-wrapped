/**
 * Page11Personality.js - 人格類型頁
 * "你是..."
 */

import { StoryPage } from '../StoryPage.js';

export default class Page11Personality extends StoryPage {
  render() {
    const el = super.render();
    // 從人格類型中提取 emoji
    const personality = this.stats.personality || '創作者 ⭐';
    const emoji = personality.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u)?.[0] || '⭐';
    const title = personality.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

    el.classList.add('page-personality');
    el.innerHTML = `
      <div class="moon-animation">
        <div class="moon"></div>
        <div class="stars"></div>
      </div>
      <p class="label">你是...</p>
      <div class="personality-content">
        <div class="personality-icon">${emoji}</div>
        <h2 class="personality-title">${title}</h2>
      </div>
    `;
    return el;
  }

  async animateIn(el) {
    el.classList.add('active');

    // 標籤淡入
    const label = el.querySelector('.label');
    label.classList.add('visible');

    // 月亮升起
    const moon = el.querySelector('.moon');
    moon.classList.add('rise');

    await this.delay(300);

    // 星星閃爍
    const stars = el.querySelector('.stars');
    this.createStars(stars, 20);

    await this.delay(400);

    // 人格圖示顯示
    const icon = el.querySelector('.personality-icon');
    icon.classList.add('visible');

    await this.delay(300);

    // 人格標題滑入
    const title = el.querySelector('.personality-title');
    title.classList.add('visible');
  }
}
