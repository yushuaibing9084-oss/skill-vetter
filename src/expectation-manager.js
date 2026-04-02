/**
 * Expectation Manager
 * 管理用户对 Skill 的预期，避免"踩坑"
 */

class ExpectationManager {
  constructor() {
    this.expectationDatabase = this.loadExpectations();
  }

  /**
   * 加载预期数据库
   */
  loadExpectations() {
    // MVP: 硬编码一些常见 skill 的预期信息
    // TODO: 后续从社区众包数据加载
    return {
      'inference-sh/skills@ai-video-generation': {
        works_well_for: [
          '✅ 生成 5-10 秒的短视频片段',
          '✅ 概念验证和创意原型',
          '✅ 社交媒体内容创作',
          '✅ 已有明确提示词（prompt）的场景'
        ],
        limitations: [
          '⚠️ 长视频（>30秒）生成质量不稳定',
          '⚠️ 人物一致性难以保证',
          '⚠️ 复杂动作场景容易出错',
          '⚠️ 生成速度较慢（1分钟视频约需 5-10 分钟）'
        ],
        hidden_costs: [
          '💰 首次使用需要充值最低 $10',
          '💰 高质量视频消耗更多 credits',
          '⏱️ 需要学习提示词工程（prompt engineering）',
          '⏱️ 生成失败也会扣除 credits'
        ],
        learning_curve: 'medium',
        setup_complexity: 'low',
        ongoing_maintenance: 'low'
      },
      'inference-sh/skills@p-video': {
        works_well_for: [
          '✅ 图片转视频动画',
          '✅ 简单的镜头运动效果',
          '✅ 产品展示视频'
        ],
        limitations: [
          '⚠️ 仅支持图片输入，不支持文本直接生成',
          '⚠️ 动画效果相对简单',
          '⚠️ 对输入图片质量要求较高'
        ],
        hidden_costs: [
          '💰 按帧计费，长视频成本较高',
          '⏱️ 需要准备高质量的输入图片'
        ],
        learning_curve: 'low',
        setup_complexity: 'low',
        ongoing_maintenance: 'low'
      },
      'vercel-labs/agent-skills@vercel-react-best-practices': {
        works_well_for: [
          '✅ React 项目代码审查',
          '✅ 学习 React 最佳实践',
          '✅ 团队代码规范统一'
        ],
        limitations: [
          '⚠️ 主要针对 Next.js/Vercel 生态',
          '⚠️ 对非标准 React 项目建议可能不适用',
          '⚠️ 不能替代人工 code review'
        ],
        hidden_costs: [
          '⏱️ 需要理解建议背后的原理，不能盲目应用'
        ],
        learning_curve: 'medium',
        setup_complexity: 'low',
        ongoing_maintenance: 'low'
      }
    };
  }

  /**
   * 获取 Skill 的预期管理信息
   */
  getExpectations(skillId) {
    return this.expectationDatabase[skillId] || this.generateDefaultExpectations();
  }

  /**
   * 生成默认预期（未知 skill）
   */
  generateDefaultExpectations() {
    return {
      works_well_for: [
        '🤷 暂无具体数据，建议查看官方文档'
      ],
      limitations: [
        '⚠️ 未知 skill，建议先在小范围测试',
        '⚠️ 查看 GitHub Issues 了解已知问题'
      ],
      hidden_costs: [
        '⏱️ 可能需要额外的学习时间',
        '⏱️ 建议预留调试时间'
      ],
      learning_curve: 'unknown',
      setup_complexity: 'unknown',
      ongoing_maintenance: 'unknown'
    };
  }

  /**
   * 生成预期匹配报告
   * 对比用户预期 vs 实际能力
   */
  generateExpectationReport(skillId, userIntent) {
    const expectations = this.getExpectations(skillId);
    
    // 解析用户意图
    const parsedIntent = this.parseUserIntent(userIntent);
    
    // 匹配分析
    const matchAnalysis = this.analyzeIntentMatch(parsedIntent, expectations);
    
    return {
      skill_id: skillId,
      user_intent: parsedIntent,
      expectations,
      match_analysis: matchAnalysis,
      recommendations: this.generateRecommendations(matchAnalysis, expectations)
    };
  }

  /**
   * 解析用户意图
   */
  parseUserIntent(intent) {
    // 简单的关键词匹配
    // TODO: 后续可以用 NLP 模型做更精准的意图识别
    const keywords = {
      use_case: [],
      constraints: [],
      expectations: []
    };

    const useCasePatterns = {
      'video_generation': ['视频', 'video', '生成视频', '短视频'],
      'audio_processing': ['音频', 'audio', '录音', '转录'],
      'code_assistance': ['代码', 'code', '编程', 'programming'],
      'data_analysis': ['数据', 'data', '分析', '报表'],
      'content_creation': ['内容', 'content', '创作', '写作']
    };

    const constraintPatterns = {
      'privacy': ['隐私', 'privacy', '本地', 'local', '离线', 'offline'],
      'speed': ['快', 'fast', '速度', 'speed', '实时', 'realtime'],
      'cost': ['免费', 'free', '便宜', 'cheap', '成本', 'cost'],
      'quality': ['质量', 'quality', '高精度', 'high quality']
    };

    // 匹配使用场景
    for (const [category, patterns] of Object.entries(useCasePatterns)) {
      if (patterns.some(p => intent.toLowerCase().includes(p.toLowerCase()))) {
        keywords.use_case.push(category);
      }
    }

    // 匹配约束条件
    for (const [category, patterns] of Object.entries(constraintPatterns)) {
      if (patterns.some(p => intent.toLowerCase().includes(p.toLowerCase()))) {
        keywords.constraints.push(category);
      }
    }

    return keywords;
  }

  /**
   * 分析意图匹配度
   */
  analyzeIntentMatch(intent, expectations) {
    const analysis = {
      matches: [],
      mismatches: [],
      warnings: []
    };

    // 检查隐私需求
    if (intent.constraints.includes('privacy')) {
      if (expectations.limitations.some(l => l.includes('云端') || l.includes('上传'))) {
        analysis.mismatches.push({
          aspect: '隐私',
          issue: '你希望数据留在本地，但该 skill 可能需要上传数据到云端',
          severity: 'high'
        });
      } else {
        analysis.matches.push({
          aspect: '隐私',
          note: '该 skill 符合你的隐私要求'
        });
      }
    }

    // 检查速度需求
    if (intent.constraints.includes('speed')) {
      if (expectations.limitations.some(l => l.includes('慢') || l.includes('时间'))) {
        analysis.warnings.push({
          aspect: '速度',
          issue: '你要求快速处理，但该 skill 生成速度可能较慢',
          suggestion: '考虑使用更低质量设置或寻找替代方案'
        });
      }
    }

    // 检查成本需求
    if (intent.constraints.includes('cost')) {
      if (expectations.hidden_costs.some(c => c.includes('💰'))) {
        analysis.warnings.push({
          aspect: '成本',
          issue: '该 skill 可能有隐藏费用',
          suggestion: '仔细阅读定价说明，预留预算'
        });
      }
    }

    return analysis;
  }

  /**
   * 生成建议
   */
  generateRecommendations(analysis, expectations) {
    const recommendations = [];

    // 根据匹配分析生成建议
    if (analysis.mismatches.length > 0) {
      recommendations.push({
        type: 'warning',
        message: '你的需求与该 skill 的能力存在不匹配，建议重新考虑'
      });
    }

    if (expectations.learning_curve === 'high') {
      recommendations.push({
        type: 'tip',
        message: '学习曲线较陡，建议预留充足的学习时间，或寻找更简单的替代方案'
      });
    }

    if (expectations.hidden_costs.length > 0) {
      recommendations.push({
        type: 'info',
        message: '注意隐藏成本，建议先小额试用验证效果'
      });
    }

    // 总是给出通用建议
    recommendations.push({
      type: 'best_practice',
      message: '建议先在非关键场景测试，验证符合预期后再大规模使用'
    });

    return recommendations;
  }

  /**
   * 生成"使用前必知"清单
   */
  generatePreFlightChecklist(skillId) {
    const expectations = this.getExpectations(skillId);
    
    return {
      title: '📋 使用前必知',
      items: [
        {
          category: '它能做什么',
          items: expectations.works_well_for
        },
        {
          category: '它不能做什么',
          items: expectations.limitations
        },
        {
          category: '隐藏成本',
          items: expectations.hidden_costs
        }
      ],
      checklist: [
        '□ 我已经阅读了官方文档',
        '□ 我了解该 skill 的能力边界',
        '□ 我预留了学习/调试时间',
        '□ 我已经准备好测试数据',
        '□ 我了解定价和费用结构'
      ]
    };
  }

  /**
   * 提交用户反馈（用于改进预期数据库）
   */
  submitFeedback(skillId, feedback) {
    // TODO: 将反馈提交到社区数据库
    // 包括：实际使用体验、遇到的问题、与预期的差异
    console.log(`反馈已记录：${skillId}`);
    console.log('感谢你的反馈，这将帮助其他用户做出更好的选择');
  }
}

module.exports = { ExpectationManager };
