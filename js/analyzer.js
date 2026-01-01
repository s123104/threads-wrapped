/**
 * analyzer.js - 統計分析邏輯
 * 從解析後的資料計算各種統計數據
 */

export class Analyzer {
  constructor(data) {
    this.posts = data.posts || [];
    this.likes = data.likes || [];
    this.followers = data.followers || [];
    this.following = data.following || [];
    this.username = data.username || '';
  }

  /**
   * 執行所有分析並返回結果
   */
  analyze() {
    const peakData = this.getPeakFollowerMonth();

    return {
      username: this.username,
      totalPosts: this.posts.length,
      totalWords: this.calculateTotalWords(),
      totalLikes: this.likes.length,
      followersCount: this.followers.length,
      followingCount: this.following.length,
      mostActiveDay: this.findMostActiveDay(),
      mostActiveDayCount: this.getMostActiveDayCount(),
      longestStreak: this.calculateLongestStreak(),
      dailyActivity: this.getDailyActivity(),
      weeklyDistribution: this.getWeeklyDistribution(),
      topInteractions: this.getTopInteractions(),
      topKeywords: this.getTopKeywords(),
      topAITools: this.getTopAITools(),
      favoriteEmoji: this.getFavoriteEmoji(),
      personality: this.determinePersonality(),
      hourlyDistribution: this.getHourlyDistribution(),
      firstPostDate: this.getFirstPostDate(),
      ...peakData
    };
  }

  /**
   * 取得第一篇發文日期
   */
  getFirstPostDate() {
    if (this.posts.length === 0) return '-';

    const sorted = [...this.posts].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0];
    const date = new Date(first.timestamp * 1000);

    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  /**
   * 取得最活躍日的發文數
   */
  getMostActiveDayCount() {
    const dateCounts = {};
    for (const post of this.posts) {
      dateCounts[post.date] = (dateCounts[post.date] || 0) + 1;
    }
    return Math.max(...Object.values(dateCounts), 0);
  }

  /**
   * 取得漲粉高峰月份
   */
  getPeakFollowerMonth() {
    const monthCounts = {};

    for (const follower of this.followers) {
      if (!follower.timestamp) continue;
      const date = new Date(follower.timestamp * 1000);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    }

    let peakMonth = '-';
    let peakGain = 0;

    for (const [month, count] of Object.entries(monthCounts)) {
      if (count > peakGain) {
        peakGain = count;
        peakMonth = month;
      }
    }

    if (peakMonth !== '-') {
      const [year, month] = peakMonth.split('-');
      peakMonth = `${month} 月`;
    }

    return { peakFollowerMonth: peakMonth, peakFollowerGain: peakGain };
  }

  /**
   * 計算總字數
   */
  calculateTotalWords() {
    let total = 0;
    for (const post of this.posts) {
      if (post.text) {
        // 計算中文字符和英文單詞
        const chinese = (post.text.match(/[\u4e00-\u9fff]/g) || []).length;
        const english = (post.text.match(/[a-zA-Z]+/g) || []).length;
        total += chinese + english;
      }
    }
    return total;
  }

  /**
   * 找出最活躍的一天
   */
  findMostActiveDay() {
    const dateCounts = {};
    for (const post of this.posts) {
      dateCounts[post.date] = (dateCounts[post.date] || 0) + 1;
    }

    let maxDate = null;
    let maxCount = 0;
    for (const [date, count] of Object.entries(dateCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDate = date;
      }
    }

    if (maxDate) {
      const [year, month, day] = maxDate.split('-');
      return `${parseInt(month)} 月 ${parseInt(day)} 日`;
    }
    return '-';
  }

  /**
   * 計算最長連續發文天數
   */
  calculateLongestStreak() {
    const dates = new Set(this.posts.map(p => p.date));
    const sortedDates = [...dates].sort();

    if (sortedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  /**
   * 取得每日活動統計（熱力圖用）
   */
  getDailyActivity() {
    const activity = {};
    for (const post of this.posts) {
      activity[post.date] = (activity[post.date] || 0) + 1;
    }
    return activity;
  }

  /**
   * 取得每週分布
   */
  getWeeklyDistribution() {
    // 0=週日, 1=週一, ..., 6=週六
    const distribution = [0, 0, 0, 0, 0, 0, 0];

    for (const post of this.posts) {
      distribution[post.weekday]++;
    }

    // 重新排列為週一開始
    const reordered = [
      distribution[1], // Mon
      distribution[2], // Tue
      distribution[3], // Wed
      distribution[4], // Thu
      distribution[5], // Fri
      distribution[6], // Sat
      distribution[0]  // Sun
    ];

    const max = Math.max(...reordered);
    return reordered.map(count => ({
      count,
      percentage: max > 0 ? (count / max) * 100 : 0
    }));
  }

  /**
   * 取得按讚最多的用戶（Top 互動對象）
   */
  getTopInteractions() {
    const counts = {};
    for (const like of this.likes) {
      counts[like.username] = (counts[like.username] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([username, count]) => ({
      username: `@${username}`,
      count
    }));
  }

  /**
   * 提取年度關鍵字
   */
  getTopKeywords() {
    const stopWords = new Set([
      '的', '是', '在', '了', '和', '有', '我', '你', '他', '她', '它',
      '這', '那', '就', '也', '都', '不', '很', '會', '要', '但', '個',
      '到', '說', '為', '上', '下', '來', '去', '能', '把', '讓', '被',
      '與', '以', '及', '等', '著', '過', '給', '從', '而', '可', '如',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'to', 'of', 'and', 'in', 'that', 'have', 'has', 'had', 'for',
      'on', 'with', 'as', 'at', 'by', 'this', 'it', 'from', 'or'
    ]);

    const wordCounts = {};

    for (const post of this.posts) {
      if (!post.text) continue;

      // 清理文字：移除 URL、@用戶名、#hashtag
      let cleanText = post.text.replace(/https?:\/\/[^\s]+/g, '');
      cleanText = cleanText.replace(/@[\w.]+/g, '');
      cleanText = cleanText.replace(/#[\w\u4e00-\u9fff]+/g, '');

      // 提取中文詞彙（2-4字）
      const chineseWords = cleanText.match(/[\u4e00-\u9fff]{2,4}/g) || [];
      for (const word of chineseWords) {
        if (!stopWords.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      }

      // 提取英文單詞
      const englishWords = cleanText.match(/[a-zA-Z]{2,}/g) || [];
      for (const word of englishWords) {
        const lower = word.toLowerCase();
        if (!stopWords.has(lower) && word.length > 1) {
          wordCounts[word.toUpperCase()] = (wordCounts[word.toUpperCase()] || 0) + 1;
        }
      }
    }

    const sorted = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([word]) => word);
  }

  /**
   * 找出最常用的 Emoji
   */
  getFavoriteEmoji() {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu;
    const emojiCounts = {};

    for (const post of this.posts) {
      if (!post.text) continue;
      const emojis = post.text.match(emojiRegex) || [];
      for (const emoji of emojis) {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      }
    }

    const sorted = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '😊';
  }

  /**
   * 根據發文時間判斷人格類型
   */
  determinePersonality() {
    const hourCounts = this.getHourlyDistribution();

    // 計算不同時段的發文量
    const morning = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);   // 6-11
    const afternoon = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0); // 12-17
    const evening = hourCounts.slice(18, 22).reduce((a, b) => a + b, 0);   // 18-21
    const night = hourCounts.slice(22, 24).reduce((a, b) => a + b, 0) +
                  hourCounts.slice(0, 6).reduce((a, b) => a + b, 0);       // 22-5

    const max = Math.max(morning, afternoon, evening, night);

    if (max === morning) return '早起鳥 🌅';
    if (max === afternoon) return '午後行動派 ☀️';
    if (max === evening) return '黃昏漫步者 🌆';
    if (max === night) return '夜間思考者 🌙';

    return '全時段創作者 ⭐';
  }

  /**
   * 取得每小時分布
   */
  getHourlyDistribution() {
    const distribution = new Array(24).fill(0);
    for (const post of this.posts) {
      distribution[post.hour]++;
    }
    return distribution;
  }

  /**
   * 統計 AI 工具提及次數
   */
  getTopAITools() {
    // AI 工具關鍵字映射表（小寫 -> 顯示名稱）
    const aiToolPatterns = [
      { display: 'Gemini', patterns: ['gemini'] },
      { display: 'Claude', patterns: ['claude'] },
      { display: 'ChatGPT', patterns: ['chatgpt', 'gpt'] },
      { display: 'Grok', patterns: ['grok'] },
      { display: 'Perplexity', patterns: ['perplexity'] },
      { display: 'Copilot', patterns: ['copilot'] },
      { display: 'DeepSeek', patterns: ['deepseek'] },
      { display: 'Codex', patterns: ['codex'] },
      { display: 'Cursor', patterns: ['cursor'] },
      { display: 'Qwen', patterns: ['qwen'] },
      { display: 'Antigravity', patterns: ['antigravity', '反重力'] }
    ];

    const toolCounts = {};

    for (const post of this.posts) {
      if (!post.text) continue;

      const textLower = post.text.toLowerCase();

      for (const tool of aiToolPatterns) {
        for (const pattern of tool.patterns) {
          // 使用正則匹配完整單詞（英文）或直接包含（中文）
          const regex = /[\u4e00-\u9fff]/.test(pattern)
            ? new RegExp(pattern, 'gi')
            : new RegExp(`\\b${pattern}\\b`, 'gi');

          const matches = post.text.match(regex);
          if (matches) {
            toolCounts[tool.display] = (toolCounts[tool.display] || 0) + matches.length;
          }
        }
      }
    }

    // 排序並取前三名
    const sorted = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([name, count]) => ({ name, count }));
  }
}
