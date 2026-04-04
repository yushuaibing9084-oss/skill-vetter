/**
 * Skill Assessor - MVP 版本
 * 简化实现，先让工具能跑起来
 */

const axios = require('axios');

// 模拟评估数据（MVP 阶段用硬编码数据验证流程）
const MOCK_DATABASE = {
  'inference-sh/skills@ai-video-generation': {
    source_credibility: { score: 60, name: '来源可信度' },
    transparency: { score: 40, name: '透明度' },
    sustainability: { score: 70, name: '可持续性' },
    technical_value: { score: 85, name: '技术价值' },
    community_feedback: { score: 65, name: '社区反馈' },
    security_audit: { score: 80, name: '安全审计' },
    usage_metrics: { score: 90, name: '使用指标' }
  },
  'inference-sh/skills@p-video': {
    source_credibility: { score: 60, name: '来源可信度' },
    transparency: { score: 40, name: '透明度' },
    sustainability: { score: 70, name: '可持续性' },
    technical_value: { score: 75, name: '技术价值' },
    community_feedback: { score: 60, name: '社区反馈' },
    security_audit: { score: 80, name: '安全审计' },
    usage_metrics: { score: 85, name: '使用指标' }
  },
  'vercel-labs/agent-skills@vercel-react-best-practices': {
    source_credibility: { score: 95, name: '来源可信度' },
    transparency: { score: 90, name: '透明度' },
    sustainability: { score: 95, name: '可持续性' },
    technical_value: { score: 85, name: '技术价值' },
    community_feedback: { score: 80, name: '社区反馈' },
    security_audit: { score: 90, name: '安全审计' },
    usage_metrics: { score: 85, name: '使用指标' }
  },
  // 新增案例 1: Anthropic 官方 Skill (大厂官方)
  'anthropic/skills@webapp-testing': {
    source_credibility: { score: 98, name: '来源可信度' },
    transparency: { score: 95, name: '透明度' },
    sustainability: { score: 95, name: '可持续性' },
    technical_value: { score: 90, name: '技术价值' },
    community_feedback: { score: 85, name: '社区反馈' },
    security_audit: { score: 92, name: '安全审计' },
    usage_metrics: { score: 88, name: '使用指标' }
  },
  // 新增案例 2: GitHub 官方 Skill (大厂官方)
  'github/skills@git-commit': {
    source_credibility: { score: 95, name: '来源可信度' },
    transparency: { score: 90, name: '透明度' },
    sustainability: { score: 95, name: '可持续性' },
    technical_value: { score: 80, name: '技术价值' },
    community_feedback: { score: 85, name: '社区反馈' },
    security_audit: { score: 90, name: '安全审计' },
    usage_metrics: { score: 92, name: '使用指标' }
  },
  // 新增案例 3: Prisma 官方 Skill (知名开源)
  'prisma/skills@database-setup': {
    source_credibility: { score: 90, name: '来源可信度' },
    transparency: { score: 85, name: '透明度' },
    sustainability: { score: 88, name: '可持续性' },
    technical_value: { score: 88, name: '技术价值' },
    community_feedback: { score: 82, name: '社区反馈' },
    security_audit: { score: 85, name: '安全审计' },
    usage_metrics: { score: 87, name: '使用指标' }
  },
  // 新增案例 4: 个人开发者 Skill (中等风险)
  'developer-xyz/skills@image-resizer': {
    source_credibility: { score: 55, name: '来源可信度' },
    transparency: { score: 45, name: '透明度' },
    sustainability: { score: 50, name: '可持续性' },
    technical_value: { score: 70, name: '技术价值' },
    community_feedback: { score: 60, name: '社区反馈' },
    security_audit: { score: 65, name: '安全审计' },
    usage_metrics: { score: 55, name: '使用指标' }
  },
  // 新增案例 5: 匿名/高风险 Skill (高风险)
  'unknown-dev/skills@data-scraper': {
    source_credibility: { score: 20, name: '来源可信度' },
    transparency: { score: 15, name: '透明度' },
    sustainability: { score: 30, name: '可持续性' },
    technical_value: { score: 60, name: '技术价值' },
    community_feedback: { score: 35, name: '社区反馈' },
    security_audit: { score: 40, name: '安全审计' },
    usage_metrics: { score: 45, name: '使用指标' }
  }
};

const WEIGHTS = {
  source_credibility: 0.20,
  transparency: 0.20,
  sustainability: 0.15,
  technical_value: 0.15,
  security_audit: 0.15,
  community_feedback: 0.10,
  usage_metrics: 0.05
};

const RED_FLAGS = {
  'inference-sh/skills@ai-video-generation': [
    '官网无团队信息',
    '无融资披露'
  ],
  'inference-sh/skills@p-video': [
    '官网无团队信息',
    '无融资披露'
  ],
  'vercel-labs/agent-skills@vercel-react-best-practices': [],
  'anthropic/skills@webapp-testing': [],
  'github/skills@git-commit': [],
  'prisma/skills@database-setup': [],
  'developer-xyz/skills@image-resizer': [
    '开发者信息不完整',
    '项目更新频率低'
  ],
  'unknown-dev/skills@data-scraper': [
    '开发者身份不明',
    '官网不存在或无法访问',
    '代码未开源',
    '要求过度权限（访问所有网站数据）'
  ]
};

const ALTERNATIVES = {
  'inference-sh/skills@ai-video-generation': [
    '字节 Seedance 官方 API',
    'Google Veo 官方 API',
    '本地部署 Wan 2.5'
  ],
  'inference-sh/skills@p-video': [
    'Pruna 官方 API',
    '本地部署 Wan 2.5'
  ],
  'vercel-labs/agent-skills@vercel-react-best-practices': [],
  'anthropic/skills@webapp-testing': [],
  'github/skills@git-commit': [],
  'prisma/skills@database-setup': [
    'Drizzle ORM',
    'TypeORM'
  ],
  'developer-xyz/skills@image-resizer': [
    'Sharp 官方库',
    'ImageMagick'
  ],
  'unknown-dev/skills@data-scraper': [
    'Puppeteer 官方',
    'Playwright 官方',
    'Scrapy'
  ]
};

/**
 * 评估 Skill
 */
async function assessSkill(skillId) {
  // MVP: 使用模拟数据
  // TODO: 后续接入真实数据源
  
  const dimensions = MOCK_DATABASE[skillId];
  
  if (!dimensions) {
    // 未知 Skill，返回默认评估
    return assessUnknownSkill(skillId);
  }
  
  // 计算总分
  let overallScore = 0;
  for (const [key, dim] of Object.entries(dimensions)) {
    overallScore += dim.score * WEIGHTS[key];
  }
  
  // 红旗扣减
  const redFlags = RED_FLAGS[skillId] || [];
  overallScore = Math.max(0, overallScore - redFlags.length * 10);
  
  // 确定风险等级和建议
  let riskLevel, recommendation;
  if (overallScore >= 80) {
    riskLevel = 'LOW';
    recommendation = '评估通过，可以放心使用';
  } else if (overallScore >= 60) {
    riskLevel = 'MEDIUM';
    recommendation = '谨慎使用，建议先阅读风险说明';
  } else if (overallScore >= 40) {
    riskLevel = 'HIGH';
    recommendation = '风险较高，建议寻找替代方案';
  } else {
    riskLevel = 'CRITICAL';
    recommendation = '不建议安装，存在严重风险';
  }
  
  return {
    skill_id: skillId,
    overall_score: Math.round(overallScore),
    risk_level: riskLevel,
    recommendation,
    dimensions,
    red_flags: redFlags,
    alternatives: ALTERNATIVES[skillId] || []
  };
}

/**
 * 评估未知 Skill
 */
function assessUnknownSkill(skillId) {
  console.log(`\n${skillId} 尚未在数据库中，使用默认评估...`);
  
  const dimensions = {
    source_credibility: { score: 50, name: '来源可信度' },
    transparency: { score: 50, name: '透明度' },
    sustainability: { score: 50, name: '可持续性' },
    technical_value: { score: 50, name: '技术价值' },
    community_feedback: { score: 50, name: '社区反馈' },
    security_audit: { score: 50, name: '安全审计' },
    usage_metrics: { score: 50, name: '使用指标' }
  };
  
  return {
    skill_id: skillId,
    overall_score: 50,
    risk_level: 'UNKNOWN',
    recommendation: '暂无评估数据，建议谨慎使用',
    dimensions,
    red_flags: ['暂无详细评估数据'],
    alternatives: []
  };
}

module.exports = { assessSkill };
