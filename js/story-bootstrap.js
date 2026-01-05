/**
 * 故事流啟動器
 * 從 localStorage 讀取統計資料並初始化故事引擎
 */

import { StoryEngine } from './stories/StoryEngine.js';
import { modal } from './modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('story-container');

  // 從 localStorage 讀取 stats
  const statsJson = localStorage.getItem('threadsStats');
  if (!statsJson) {
    modal.showNoData();
    return;
  }

  const stats = JSON.parse(statsJson);
  console.log('Stats loaded:', stats);

  try {
    // 初始化故事引擎
    const storyEngine = new StoryEngine(container, stats);
    await storyEngine.init();
    console.log('Story engine initialized');

    // 監聽故事結束事件
    storyEngine.onComplete = () => {
      window.location.href = 'result.html';
    };

    // 監聽 showSummary 事件（從 Page13 觸發）
    window.addEventListener('showSummary', () => {
      window.location.href = 'result.html';
    });

  } catch (error) {
    console.error('Story flow error:', error);
    container.innerHTML = `
      <div style="color: red; padding: 40px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <h2>載入故事流時發生錯誤</h2>
        <p>${error.message}</p>
        <button onclick="location.href='index.html'" style="margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #fff; color: #000; border: none; border-radius: 8px;">
          返回首頁
        </button>
      </div>
    `;
  }
});
