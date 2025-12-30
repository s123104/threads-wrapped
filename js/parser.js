/**
 * parser.js - JSON 資料解析器
 * 處理 Instagram 匯出的 Threads 資料
 */

// 修復 Instagram JSON 的編碼問題（Latin1 編碼的 UTF-8）
function fixEncoding(str) {
  if (!str) return '';
  try {
    // Instagram 將 UTF-8 以 Latin1 編碼存儲
    const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return str;
  }
}

// 將 Unix timestamp 轉換為日期字串
function timestampToDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 取得 timestamp 的小時
function timestampToHour(timestamp) {
  return new Date(timestamp * 1000).getHours();
}

// 取得 timestamp 的星期幾 (0=週日, 1=週一, ..., 6=週六)
function timestampToWeekday(timestamp) {
  return new Date(timestamp * 1000).getDay();
}

export class Parser {
  constructor() {
    this.files = new Map();
    this.threadsPath = null;
  }

  /**
   * 從檔案列表中找到 threads 資料夾路徑
   */
  findThreadsPath(files) {
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;

      // 檢查是否為 threads 子資料夾中的檔案
      if (path.includes('your_instagram_activity/threads/')) {
        const idx = path.indexOf('your_instagram_activity/threads/');
        this.threadsPath = path.substring(0, idx + 'your_instagram_activity/threads/'.length);
        return true;
      }

      // 檢查是否直接上傳 threads 資料夾
      if (path.includes('threads/') && path.includes('threads_and_replies.json')) {
        const idx = path.indexOf('threads/');
        this.threadsPath = path.substring(0, idx + 'threads/'.length);
        return true;
      }
    }
    return false;
  }

  /**
   * 讀取並解析所有需要的 JSON 檔案
   */
  async parseFiles(files) {
    // 先找到 threads 路徑
    if (!this.findThreadsPath(files)) {
      throw new Error('找不到 Threads 資料。請確認上傳的是 Instagram 匯出資料夾。');
    }

    // 建立檔案名稱到 File 物件的映射
    const fileMap = new Map();
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;
      fileMap.set(path, file);
    }

    // 需要讀取的檔案
    const requiredFiles = [
      'threads_and_replies.json',
      'liked_threads.json',
      'followers.json',
      'following.json'
    ];

    const optionalFiles = [
      'archived_threads.json'
    ];

    // 讀取所有檔案
    const data = {};

    for (const filename of requiredFiles) {
      const fullPath = this.findFile(fileMap, filename);
      if (!fullPath) {
        throw new Error(`找不到 ${filename}。請確認資料完整。`);
      }
      const file = fileMap.get(fullPath);
      data[filename] = await this.readJsonFile(file);
    }

    for (const filename of optionalFiles) {
      const fullPath = this.findFile(fileMap, filename);
      if (fullPath) {
        const file = fileMap.get(fullPath);
        try {
          data[filename] = await this.readJsonFile(file);
        } catch (e) {
          console.warn(`無法讀取 ${filename}:`, e);
        }
      }
    }

    return this.extractData(data);
  }

  /**
   * 在 fileMap 中尋找檔案
   */
  findFile(fileMap, filename) {
    for (const [path] of fileMap) {
      if (path.endsWith(filename) && path.includes('threads')) {
        return path;
      }
    }
    return null;
  }

  /**
   * 讀取 JSON 檔案
   */
  async readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve(json);
        } catch (err) {
          reject(new Error(`無法解析 ${file.name}: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error(`無法讀取 ${file.name}`));
      reader.readAsText(file);
    });
  }

  /**
   * 從原始 JSON 資料提取需要的資訊
   */
  extractData(rawData) {
    const result = {
      posts: [],
      likes: [],
      followers: [],
      following: [],
      username: ''
    };

    // 解析貼文
    const postsData = rawData['threads_and_replies.json'];
    if (postsData?.text_post_app_text_posts) {
      for (const post of postsData.text_post_app_text_posts) {
        if (post.media && post.media.length > 0) {
          const media = post.media[0];
          result.posts.push({
            timestamp: media.creation_timestamp,
            date: timestampToDate(media.creation_timestamp),
            hour: timestampToHour(media.creation_timestamp),
            weekday: timestampToWeekday(media.creation_timestamp),
            text: fixEncoding(media.title || ''),
            source: media.cross_post_source?.source_app || 'Threads'
          });
        }
      }
    }

    // 解析按讚
    const likesData = rawData['liked_threads.json'];
    if (likesData?.text_post_app_media_likes) {
      for (const like of likesData.text_post_app_media_likes) {
        const username = like.title;
        if (like.string_list_data) {
          for (const item of like.string_list_data) {
            result.likes.push({
              username: username,
              timestamp: item.timestamp
            });
          }
        }
      }
    }

    // 解析追蹤者
    const followersData = rawData['followers.json'];
    if (followersData?.text_post_app_text_post_app_followers) {
      result.followers = followersData.text_post_app_text_post_app_followers.map(f => ({
        name: fixEncoding(f.title),
        username: f.string_list_data?.[0]?.value || '',
        timestamp: f.string_list_data?.[0]?.timestamp || 0
      }));
    }

    // 解析追蹤中
    const followingData = rawData['following.json'];
    if (followingData?.text_post_app_text_post_app_following) {
      result.following = followingData.text_post_app_text_post_app_following.map(f => ({
        name: fixEncoding(f.title),
        username: f.string_list_data?.[0]?.value || '',
        timestamp: f.string_list_data?.[0]?.timestamp || 0
      }));
    }

    // 解析用戶名稱
    // 嘗試方法 1: 從 archived_threads.json 的「作者」欄位提取
    const archivedData = rawData['archived_threads.json'];
    if (archivedData?.text_post_app_text_app_archived_posts?.length > 0) {
      const firstPost = archivedData.text_post_app_text_app_archived_posts[0];
      if (firstPost.string_map_data) {
        for (const [key, data] of Object.entries(firstPost.string_map_data)) {
          const decodedKey = fixEncoding(key);
          if (decodedKey === '作者' && data?.value) {
            result.username = data.value;
            break;
          }
        }
      }
    }

    // 嘗試方法 2: 從資料夾名稱提取
    if (!result.username && this.threadsPath) {
      const match = this.threadsPath.match(/instagram-(.+?)-\d{4}-\d{2}-\d{2}/);
      if (match) {
        result.username = match[1];
      }
    }


    return result;
  }
}
