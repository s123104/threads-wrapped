/**
 * Page12Emoji.js - 最愛表情頁
 * "這個 emoji 出現最多"
 */

import { StoryPage } from '../StoryPage.js';

export default class Page12Emoji extends StoryPage {
  render() {
    const el = super.render();
    el.classList.add('page-emoji');
    el.innerHTML = `
      <p class="label">這個 emoji 出現最多</p>
      <div class="emoji-display">
        <span class="big-emoji">${this.stats.favoriteEmoji}</span>
        <div class="emoji-particles"></div>
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

    // Emoji 放大跳動
    const emoji = el.querySelector('.big-emoji');
    emoji.classList.add('visible');

    await this.delay(200);

    // 小 emoji 散射
    const particles = el.querySelector('.emoji-particles');
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.textContent = this.stats.favoriteEmoji;
      p.className = 'emoji-particle';
      p.style.setProperty('--angle', `${i * 45}deg`);
      particles.appendChild(p);
    }
  }
}
