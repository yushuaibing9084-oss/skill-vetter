/**
 * User Profile Manager
 * 管理用户画像，实现个性化 Skill 推荐
 */

class UserProfileManager {
  constructor() {
    this.profile = this.loadProfile();
  }

  /**
   * 加载用户画像（从本地配置文件）
   */
  loadProfile() {
    // MVP: 返回默认画像
    // TODO: 从 ~/.skill-vetter/profile.json 加载
    return {
      technical_level: null,      // 'beginner' | 'intermediate' | 'advanced'
      use_case: null,             // 'personal' | 'team' | 'enterprise'
      privacy_concern: null,      // 'low' | 'medium' | 'high'
      time_budget: null,          // 'quick_try' | 'deep_integration'
      preferred_languages: [],    // ['zh', 'en', ...]
      budget_constraint: null,    // 'free_only' | 'affordable' | 'no_limit'
      history: []                 // 已评估/使用的 skill 历史
    };
  }

  /**
   * 交互式收集用户画像
   */
  async collectProfile() {
    const questions = [
      {
        id: 'technical_level',
        question: '你的技术背景是？',
        options: [
          { value: 'beginner', label: '非技术用户，希望开箱即用', emoji: '🔰' },
          { value: 'intermediate', label: '懂一些代码，能做简单配置', emoji: '💻' },
          { value: 'advanced', label: '开发者，可以二次开发', emoji: '⚡' }
        ]
      },
      {
        id: 'use_case',
        question: '你的使用场景是？',
        options: [
          { value: 'personal', label: '个人使用', emoji: '👤' },
          { value: 'team', label: '小团队协作', emoji: '👥' },
          { value: 'enterprise', label: '企业级应用', emoji: '🏢' }
        ]
      },
      {
        id: 'privacy_concern',
        question: '你对隐私的要求是？',
        options: [
          { value: 'low', label: '无所谓，方便就行', emoji: '☁️' },
          { value: 'medium', label: '希望数据留在本地', emoji: '🏠' },
          { value: 'high', label: '必须有端到端加密', emoji: '🔒' }
        ]
      },
      {
        id: 'time_budget',
        question: '你愿意投入多少时间来配置？',
        options: [
          { value: 'quick_try', label: '5分钟以内，越快越好', emoji: '⚡' },
          { value: 'moderate', label: '30分钟左右，可以接受配置', emoji: '⏱️' },
          { value: 'deep_integration', label: '几小时，追求最佳效果', emoji: '🔧' }
        ]
      },
      {
        id: 'budget_constraint',
        question: '你的预算限制是？',
        options: [
          { value: 'free_only', label: '只用免费方案', emoji: '🆓' },
          { value: 'affordable', label: '可以接受合理付费', emoji: '💰' },
          { value: 'no_limit', label: '预算充足，效果优先', emoji: '💎' }
        ]
      }
    ];

    return questions;
  }

  /**
   * 根据用户画像计算 Skill 的个性化匹配度
   */
  calculateFitScore(skillAssessment, userProfile) {
    const fitScores = {
      technical_fit: this.calculateTechnicalFit(skillAssessment, userProfile),
      privacy_fit: this.calculatePrivacyFit(skillAssessment, userProfile),
      time_fit: this.calculateTimeFit(skillAssessment, userProfile),
      cost_fit: this.calculateCostFit(skillAssessment, userProfile)
    };

    // 加权计算总体匹配度
    const weights = {
      technical_fit: 0.30,
      privacy_fit: 0.25,
      time_fit: 0.25,
      cost_fit: 0.20
    };

    let overallFit = 0;
    for (const [key, score] of Object.entries(fitScores)) {
      overallFit += score * weights[key];
    }

    return {
      overall_fit: Math.round(overallFit),
      dimensions: fitScores,
      reasoning: this.generateFitReasoning(fitScores, skillAssessment)
    };
  }

  /**
   * 技术匹配度计算
   */
  calculateTechnicalFit(skill, userProfile) {
    const levelMap = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };

    const userLevel = levelMap[userProfile.technical_level] || 2;
    
    // 根据 skill 特征判断难度
    const skillDifficulty = this.assessSkillDifficulty(skill);
    
    // 理想情况：skill 难度 <= 用户水平 + 1（稍微挑战但可接受）
    if (skillDifficulty <= userLevel + 1) {
      return 80 + (userLevel - skillDifficulty + 1) * 10;
    } else {
      return Math.max(20, 80 - (skillDifficulty - userLevel - 1) * 30);
    }
  }

  /**
   * 隐私匹配度计算
   */
  calculatePrivacyFit(skill, userProfile) {
    const privacyLevel = skill.dimensions.privacy_score || 50;
    
    switch (userProfile.privacy_concern) {
      case 'high':
        return privacyLevel >= 80 ? 100 : privacyLevel >= 60 ? 60 : 20;
      case 'medium':
        return privacyLevel >= 60 ? 100 : privacyLevel >= 40 ? 70 : 40;
      case 'low':
        return 80; // 不太在意隐私，大部分都可以接受
      default:
        return 50;
    }
  }

  /**
   * 时间投入匹配度计算
   */
  calculateTimeFit(skill, userProfile) {
    const setupTime = skill.metadata?.setup_time || 'medium';
    
    const timeMap = {
      'quick_try': { max: 5, ideal: 2 },
      'moderate': { max: 30, ideal: 15 },
      'deep_integration': { max: 300, ideal: 60 }
    };

    const userTime = timeMap[userProfile.time_budget] || timeMap.moderate;
    const skillMinutes = this.parseSetupTime(setupTime);

    if (skillMinutes <= userTime.ideal) {
      return 100;
    } else if (skillMinutes <= userTime.max) {
      return 80 - (skillMinutes - userTime.ideal) * 2;
    } else {
      return Math.max(20, 50 - (skillMinutes - userTime.max) * 0.5);
    }
  }

  /**
   * 成本匹配度计算
   */
  calculateCostFit(skill, userProfile) {
    const cost = skill.metadata?.cost || 'free';
    
    switch (userProfile.budget_constraint) {
      case 'free_only':
        return cost === 'free' ? 100 : 20;
      case 'affordable':
        return cost === 'free' ? 100 : cost === 'affordable' ? 90 : 50;
      case 'no_limit':
        return 90; // 预算充足，主要考虑价值
      default:
        return 70;
    }
  }

  /**
   * 评估 Skill 技术难度
   */
  assessSkillDifficulty(skill) {
    let difficulty = 2; // 默认中等
    
    // 根据特征判断
    if (skill.metadata?.requires_coding) difficulty += 1;
    if (skill.metadata?.requires_config) difficulty += 0.5;
    if (skill.metadata?.has_gui) difficulty -= 0.5;
    if (skill.metadata?.one_click_setup) difficulty -= 1;
    
    return Math.max(1, Math.min(3, difficulty));
  }

  /**
   * 解析设置时间
   */
  parseSetupTime(time) {
    if (typeof time === 'number') return time;
    
    const timeMap = {
      'instant': 1,
      'quick': 5,
      'medium': 15,
      'long': 60,
      'complex': 120
    };
    
    return timeMap[time] || 15;
  }

  /**
   * 生成匹配度解释
   */
  generateFitReasoning(fitScores, skill) {
    const reasons = [];
    
    if (fitScores.technical_fit >= 80) {
      reasons.push('技术难度与你的水平匹配');
    } else if (fitScores.technical_fit < 50) {
      reasons.push('技术门槛可能较高，需要更多学习时间');
    }

    if (fitScores.privacy_fit >= 80) {
      reasons.push('符合你的隐私要求');
    } else if (fitScores.privacy_fit < 50) {
      reasons.push('隐私保护程度可能不符合你的要求');
    }

    if (fitScores.time_fit >= 80) {
      reasons.push('配置时间在你的接受范围内');
    } else if (fitScores.time_fit < 50) {
      reasons.push('配置耗时较长，需要预留足够时间');
    }

    return reasons;
  }

  /**
   * 保存用户画像
   */
  saveProfile() {
    // TODO: 保存到 ~/.skill-vetter/profile.json
  }
}

module.exports = { UserProfileManager };
