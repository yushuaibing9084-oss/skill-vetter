#!/usr/bin/env node
/**
 * Skill Vetter CLI - 零依赖 MVP 版本
 * 先用纯 Node.js 实现，验证核心价值
 */

// 模拟评估数据
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
  'vercel-labs/agent-skills@vercel-react-best-practices': []
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
  'vercel-labs/agent-skills@vercel-react-best-practices': []
};

// 颜色代码
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function color(text, colorName) {
  return COLORS[colorName] + text + COLORS.reset;
}

function bold(text) {
  return COLORS.bold + text + COLORS.reset;
}

/**
 * 评估 Skill
 */
function assessSkill(skillId) {
  const dimensions = MOCK_DATABASE[skillId];
  
  if (!dimensions) {
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
  console.log(`\n${skillId} 尚未在数据库中，使用默认评估...\n`);
  
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

/**
 * 生成进度条
 */
function progressBar(score) {
  const filled = Math.floor(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${bold('Skill Vetter')} - AI Skill 评估工具

用法:
  node cli-simple.js check <skill-id>    评估指定 Skill
  node cli-simple.js --help              显示帮助

示例:
  node cli-simple.js check inference-sh/skills@ai-video-generation
  node cli-simple.js check vercel-labs/agent-skills@vercel-react-best-practices

已支持的 Skill:
  - inference-sh/skills@ai-video-generation
  - inference-sh/skills@p-video
  - vercel-labs/agent-skills@vercel-react-best-practices
`);
    return;
  }
  
  if (args[0] !== 'check' || !args[1]) {
    console.log('错误: 请使用 "check <skill-id>" 格式');
    process.exit(1);
  }
  
  const skillId = args[1];
  
  console.log(`正在评估 ${skillId}...`);
  
  const result = assessSkill(skillId);
  
  // 输出报告
  console.log('\n' + bold('📊 Skill 评估报告'));
  console.log(color('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray'));
  console.log(`\n${bold('Skill:')} ${result.skill_id}`);
  
  // 评分
  const scoreColor = result.overall_score >= 80 ? 'green' : 
                    result.overall_score >= 60 ? 'yellow' : 'red';
  console.log(`${bold('综合评分:')} ${color(result.overall_score + '/100', scoreColor)}`);
  
  // 风险等级
  const riskEmoji = result.risk_level === 'LOW' ? '✅' :
                   result.risk_level === 'MEDIUM' ? '⚠️' :
                   result.risk_level === 'HIGH' ? '❌' : '❓';
  console.log(`${bold('风险等级:')} ${riskEmoji} ${result.risk_level}`);
  
  // 建议
  console.log(`${bold('建议:')} ${result.recommendation}`);
  
  // 维度评分
  console.log('\n' + bold('维度评分:'));
  for (const [key, dim] of Object.entries(result.dimensions)) {
    const dimColor = dim.score >= 80 ? 'green' : dim.score >= 60 ? 'yellow' : 'red';
    const bar = progressBar(dim.score);
    console.log(`  ${color(bar, dimColor)} ${dim.score}/100 ${dim.name}`);
  }
  
  // 红旗信号
  if (result.red_flags.length > 0) {
    console.log('\n' + bold('⚠️  红旗信号:'));
    result.red_flags.forEach(flag => {
      console.log(`  • ${flag}`);
    });
  }
  
  // 替代方案
  if (result.alternatives.length > 0) {
    console.log('\n' + bold('💡 替代方案:'));
    result.alternatives.forEach(alt => {
      console.log(`  • ${alt}`);
    });
  }
  
  console.log('\n' + color('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray'));
  
  // 退出码
  if (result.overall_score < 50) {
    process.exit(1);
  }
}

main();
