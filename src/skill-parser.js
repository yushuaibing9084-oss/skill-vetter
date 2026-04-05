/**
 * Skill Parser
 * 从 SKILL.md 自动提取预期信息，实现主观维度的泛化评估
 */

const axios = require('axios');

class SkillParser {
  constructor() {
    // 提取规则：从 SKILL.md 内容中提取关键信息
    this.extractionRules = {
      // 能做什么
      works_well_for: [
        { pattern: /use when[:\s]+(.+?)(?=\n\n|\n#|$)/is, type: 'single' },
        { pattern: /capabilities?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /examples?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /✅\s*(.+)/g, type: 'global' },
        { pattern: /when to use[:\s]+(.+?)(?=\n\n|\n#|$)/is, type: 'single' },
        { pattern: /suitable for[:\s]+(.+?)(?=\n\n|\n#|$)/is, type: 'single' }
      ],

      // 不能做什么 / 限制
      limitations: [
        { pattern: /limitations?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /known issues?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /constraints?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /⚠️|❌|🚫\s*(.+)/g, type: 'global' },
        { pattern: /do not[:\s]+(.+?)(?=\n\n|\n#|$)/is, type: 'single' },
        { pattern: /not supported[:\s]+(.+?)(?=\n\n|\n#|$)/is, type: 'single' },
        { pattern: /caution[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /important[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' }
      ],

      // 隐藏成本
      hidden_costs: [
        { pattern: /requirements?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /prerequisites?[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /setup[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /installation[:\s]*\n([\s\S]+?)(?=\n#|$)/i, type: 'list' },
        { pattern: /💰|⏱️|⚡\s*(.+)/g, type: 'global' },
        { pattern: /api key|token|credential|auth/i, type: 'keyword', label: '需要 API Key 或认证' },
        { pattern: /pricing|cost|付费|价格|billing/i, type: 'keyword', label: '可能涉及费用' }
      ]
    };
  }

  /**
   * 从 GitHub 解析 SKILL.md
   */
  async parseFromGitHub(owner, repo, skillName) {
    try {
      // 尝试多个可能的路径
      const possiblePaths = [
        `skills/${skillName}/SKILL.md`,
        `${skillName}/SKILL.md`,
        `SKILL.md`
      ];

      let content = null;
      let usedPath = null;

      for (const path of possiblePaths) {
        try {
          const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
          const response = await axios.get(url, { timeout: 10000 });
          content = response.data;
          usedPath = path;
          break;
        } catch (e) {
          continue;
        }
      }

      // 尝试 master 分支
      if (!content) {
        for (const path of possiblePaths) {
          try {
            const url = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`;
            const response = await axios.get(url, { timeout: 10000 });
            content = response.data;
            usedPath = path;
            break;
          } catch (e) {
            continue;
          }
        }
      }

      if (!content) {
        return this.getGenericExpectations();
      }

      // 预处理：移除代码块，避免提取到代码
      const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '\n');

      return {
        works_well_for: this.extract(contentWithoutCode, 'works_well_for'),
        limitations: this.extract(contentWithoutCode, 'limitations'),
        hidden_costs: this.extract(contentWithoutCode, 'hidden_costs'),
        learning_curve: this.inferLearningCurve(content),
        setup_complexity: this.inferSetupComplexity(content),
        source: `https://github.com/${owner}/${repo}/blob/main/${usedPath || 'SKILL.md'}`
      };
    } catch (error) {
      console.error(`解析 SKILL.md 失败: ${error.message}`);
      return this.getGenericExpectations();
    }
  }

  /**
   * 从内容中提取信息
   */
  extract(content, type) {
    const rules = this.extractionRules[type];
    const results = [];

    for (const rule of rules) {
      try {
        if (rule.type === 'global') {
          const matches = [...content.matchAll(rule.pattern)];
          for (const match of matches) {
            const text = match[1] || match[0];
            const cleaned = this.cleanText(text);
            if (cleaned && cleaned.length > 5) {
              results.push(cleaned);
            }
          }
        } else if (rule.type === 'single') {
          const match = content.match(rule.pattern);
          if (match && match[1]) {
            const items = match[1].split(/[,;，；]|\n/).map(s => s.trim()).filter(s => s.length > 5);
            results.push(...items);
          }
        } else if (rule.type === 'list') {
          const match = content.match(rule.pattern);
          if (match && match[1]) {
            const items = match[1].split(/\n[-*•]\s+/).map(s => s.trim()).filter(s => s.length > 5);
            results.push(...items);
          }
        } else if (rule.type === 'keyword') {
          if (rule.pattern.test(content)) {
            results.push(rule.label);
          }
        }
      } catch (e) {
        continue;
      }
    }

    // 去重并限制数量
    const unique = [...new Set(results)];
    return unique.slice(0, 8).map(item => {
      // 添加前缀
      if (type === 'works_well_for' && !item.match(/^[✅🟢✓]/)) {
        return `✅ ${item}`;
      }
      if (type === 'limitations' && !item.match(/^[⚠️❌🚫]/)) {
        return `⚠️ ${item}`;
      }
      if (type === 'hidden_costs' && !item.match(/^[💰⏱️⚡]/)) {
        if (item.includes('API') || item.includes('token') || item.includes('付费') || item.includes('价格')) {
          return `💰 ${item}`;
        }
        return `⏱️ ${item}`;
      }
      return item;
    });
  }

  /**
   * 清理文本
   */
  cleanText(text) {
    // 移除代码块
    text = text.replace(/```[\s\S]*?```/g, '');
    // 移除行内代码
    text = text.replace(/`[^`]+`/g, '');
    // 移除 markdown 链接，保留文本
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // 移除 HTML 标签
    text = text.replace(/<[^>]+>/g, '');
    // 移除前缀符号
    text = text.replace(/^[-*•✅⚠️❌🚫💰⏱️⚡]\s*/, '');
    // 移除多余空白
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * 推断学习曲线
   */
  inferLearningCurve(content) {
    const lower = content.toLowerCase();
    if (lower.includes('simple') || lower.includes('easy') || lower.includes('beginner')) return 'low';
    if (lower.includes('advanced') || lower.includes('complex') || lower.includes('expert')) return 'high';
    
    // 根据内容长度和复杂度推断
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    if (codeBlocks > 10) return 'high';
    if (codeBlocks < 3) return 'low';
    return 'medium';
  }

  /**
   * 推断设置复杂度
   */
  inferSetupComplexity(content) {
    const lower = content.toLowerCase();
    const setupKeywords = [
      'install', 'setup', 'configure', 'config', 'environment',
      'dependency', 'npm install', 'pip install', 'brew install',
      'api key', 'token', 'credential', 'auth', '登录', '授权'
    ];
    
    let count = 0;
    for (const keyword of setupKeywords) {
      const matches = lower.match(new RegExp(keyword, 'g'));
      if (matches) count += matches.length;
    }

    if (count < 3) return 'low';
    if (count > 8) return 'high';
    return 'medium';
  }

  /**
   * 通用预期（解析失败时使用）
   */
  getGenericExpectations() {
    return {
      works_well_for: ['✅ 请参考官方文档了解具体功能'],
      limitations: ['⚠️ 未找到详细限制说明，建议仔细阅读文档'],
      hidden_costs: ['⏱️ 建议先了解 setup 和配置要求'],
      learning_curve: 'medium',
      setup_complexity: 'medium',
      source: null
    };
  }
}

module.exports = SkillParser;
