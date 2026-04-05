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
 * 评估未知 Skill - 从 GitHub 获取真实数据
 */
async function assessUnknownSkill(skillId) {
  console.log(`\n${skillId} 尚未在数据库中，尝试从 GitHub 获取数据...`);

  try {
    // 解析 skillId: owner/repo 或 owner/repo@skill-name
    let owner, repo;
    const atMatch = skillId.match(/^([^/]+)\/([^@]+)@(.+)$/);
    const simpleMatch = skillId.match(/^([^/]+)\/([^/]+)$/);
    
    if (atMatch) {
      owner = atMatch[1];
      repo = atMatch[2];
    } else if (simpleMatch) {
      owner = simpleMatch[1];
      repo = simpleMatch[2];
    } else {
      throw new Error('Invalid skill ID format');
    }

    // 从 GitHub API 获取仓库数据
    const repoData = await fetchGitHubRepo(owner, repo);

    if (!repoData) {
      throw new Error('无法获取 GitHub 数据');
    }

    // 计算各维度得分
    const dimensions = calculateDimensionsFromGitHub(repoData);

    // 计算总分
    let overallScore = 0;
    for (const [key, dim] of Object.entries(dimensions)) {
      overallScore += dim.score * WEIGHTS[key];
    }

    // 确定风险等级
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
      red_flags: [],
      alternatives: [],
      github_data: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        updated_at: repoData.updated_at,
        url: repoData.html_url
      }
    };
  } catch (error) {
    console.log(`GitHub 数据获取失败: ${error.message}，使用默认评估`);

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
}

/**
 * 从 GitHub 获取仓库数据
 */
async function fetchGitHubRepo(owner, repo) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'skill-vetter'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`仓库 ${owner}/${repo} 不存在`);
    } else if (error.response?.status === 403) {
      console.log('GitHub API 限流，请稍后重试');
    }
    return null;
  }
}

/**
 * 根据 GitHub 数据计算各维度得分
 */
function calculateDimensionsFromGitHub(data) {
  // 来源可信度
  let sourceCredibility = 50;
  if (data.owner?.type === 'Organization') sourceCredibility += 20;
  if (data.owner?.login?.match(/^(google|microsoft|aws|facebook|meta|openai|anthropic|github|vercel|prisma)$/i)) sourceCredibility += 25;
  if (data.stargazers_count > 10000) sourceCredibility += 10;

  // 透明度
  let transparency = 50;
  if (data.description) transparency += 15;
  if (data.license) transparency += 15;
  if (data.readme) transparency += 10;

  // 可持续性
  let sustainability = 40;
  const daysSinceUpdate = (Date.now() - new Date(data.updated_at)) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) sustainability += 25;
  else if (daysSinceUpdate < 90) sustainability += 15;
  if (data.stargazers_count > 1000) sustainability += 10;
  if (data.forks_count > 100) sustainability += 10;

  // 技术价值
  let technicalValue = 50;
  if (data.language) technicalValue += 10;
  if (data.topics?.length > 0) technicalValue += 10;
  if (data.stargazers_count > 5000) technicalValue += 15;

  // 社区反馈
  let communityFeedback = 40;
  if (data.stargazers_count > 1000) communityFeedback += 20;
  if (data.forks_count > 100) communityFeedback += 15;
  if (data.open_issues_count < 50) communityFeedback += 10;

  // 安全审计
  let securityAudit = 60;
  if (data.license) securityAudit += 10;
  if (data.stargazers_count > 5000) securityAudit += 15;

  // 使用指标
  let usageMetrics = 40;
  if (data.stargazers_count > 1000) usageMetrics += 30;
  else if (data.stargazers_count > 100) usageMetrics += 20;
  else if (data.stargazers_count > 10) usageMetrics += 10;

  return {
    source_credibility: { score: Math.min(100, sourceCredibility), name: '来源可信度' },
    transparency: { score: Math.min(100, transparency), name: '透明度' },
    sustainability: { score: Math.min(100, sustainability), name: '可持续性' },
    technical_value: { score: Math.min(100, technicalValue), name: '技术价值' },
    community_feedback: { score: Math.min(100, communityFeedback), name: '社区反馈' },
    security_audit: { score: Math.min(100, securityAudit), name: '安全审计' },
    usage_metrics: { score: Math.min(100, usageMetrics), name: '使用指标' }
  };
}

module.exports = { assessSkill };
