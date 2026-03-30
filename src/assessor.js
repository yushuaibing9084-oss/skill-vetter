/**
 * Skill Assessor
 * 核心评估引擎
 */

const axios = require('axios');
const cheerio = require('cheerio');

class SkillAssessor {
  constructor(options = {}) {
    this.depth = options.depth || 'standard'; // basic | standard | deep
    this.weights = this.getWeights();
  }

  /**
   * 评估单个 Skill
   */
  async assess(skillId) {
    const [owner, repo, skillName] = this.parseSkillId(skillId);
    
    // 并行采集数据
    const [
      metadata,
      githubData,
      websiteData,
      communityData,
      securityData
    ] = await Promise.all([
      this.fetchMetadata(owner, repo, skillName),
      this.analyzeGithub(owner, repo),
      this.analyzeWebsite(owner, repo),
      this.searchCommunity(skillId),
      this.runSecurityScan(owner, repo)
    ]);

    // 计算各维度得分
    const dimensions = {
      source_credibility: this.assessSourceCredibility(metadata, githubData),
      transparency: this.assessTransparency(websiteData, githubData),
      sustainability: this.assessSustainability(metadata, githubData),
      technical_value: this.assessTechnicalValue(metadata, githubData),
      community_feedback: this.assessCommunityFeedback(communityData, githubData),
      security_audit: this.assessSecurity(securityData),
      usage_metrics: this.assessUsageMetrics(metadata, githubData)
    };

    // 计算总分
    const { overallScore, riskLevel, verdict } = this.calculateOverallScore(dimensions);

    // 识别红旗
    const redFlags = this.identifyRedFlags(dimensions, metadata);

    // 推荐替代方案
    const alternatives = await this.suggestAlternatives(skillId, dimensions);

    return {
      skill_id: skillId,
      assessed_at: new Date().toISOString(),
      assessor_version: '1.0.0',
      overall_score: overallScore,
      risk_level: riskLevel,
      verdict: verdict,
      dimensions,
      red_flags: redFlags,
      alternatives,
      metadata: {
        owner,
        repo,
        skill_name: skillName,
        ...metadata
      },
      raw_data: this.depth === 'deep' ? {
        github: githubData,
        website: websiteData,
        community: communityData,
        security: securityData
      } : undefined
    };
  }

  /**
   * 解析 Skill ID
   * format: owner/repo@skill-name
   */
  parseSkillId(skillId) {
    const match = skillId.match(/^([^/]+)\/([^@]+)@(.+)$/);
    if (!match) {
      throw new Error(`Invalid skill ID format: ${skillId}. Expected: owner/repo@skill-name`);
    }
    return [match[1], match[2], match[3]];
  }

  /**
   * 获取权重配置
   */
  getWeights() {
    return {
      source_credibility: 0.20,
      transparency: 0.20,
      sustainability: 0.15,
      technical_value: 0.15,
      community_feedback: 0.10,
      security_audit: 0.15,
      usage_metrics: 0.05
    };
  }

  /**
   * 1. 来源可信度评估
   */
  assessSourceCredibility(metadata, githubData) {
    let score = 50; // 基础分
    const evidence = [];

    // 知名组织加分
    const trustedOrgs = [
      'vercel-labs', 'google', 'microsoft', 'aws', 'facebook',
      'openai', 'anthropic', 'github'
    ];
    if (trustedOrgs.includes(metadata.owner?.toLowerCase())) {
      score += 30;
      evidence.push({ type: 'trusted_org', value: metadata.owner, weight: 30 });
    }

    // GitHub 组织信息完整度
    if (githubData.org?.description) {
      score += 10;
      evidence.push({ type: 'org_description', value: true, weight: 10 });
    }

    // 团队成员可见
    if (githubData.org?.public_members_count > 0) {
      score += 10;
      evidence.push({ type: 'public_members', value: githubData.org.public_members_count, weight: 10 });
    }

    return {
      score: Math.min(100, score),
      max_score: 100,
      evidence,
      details: {
        owner: metadata.owner,
        org_verified: trustedOrgs.includes(metadata.owner?.toLowerCase()),
        public_members: githubData.org?.public_members_count || 0
      }
    };
  }

  /**
   * 2. 透明度评估
   */
  assessTransparency(websiteData, githubData) {
    let score = 0;
    const evidence = [];

    // 官网 About 页面
    if (websiteData.hasAboutPage) {
      score += 25;
      evidence.push({ type: 'about_page', value: true, weight: 25 });
    }

    // 联系信息
    if (websiteData.hasContact) {
      score += 20;
      evidence.push({ type: 'contact_info', value: true, weight: 20 });
    }

    // 团队信息
    if (websiteData.hasTeamInfo) {
      score += 25;
      evidence.push({ type: 'team_info', value: true, weight: 25 });
    }

    // GitHub README 完整度
    if (githubData.readme?.length > 500) {
      score += 15;
      evidence.push({ type: 'readme_quality', value: githubData.readme.length, weight: 15 });
    }

    // License 声明
    if (githubData.license) {
      score += 15;
      evidence.push({ type: 'license', value: githubData.license, weight: 15 });
    }

    return {
      score,
      max_score: 100,
      evidence,
      details: {
        has_about_page: websiteData.hasAboutPage,
        has_contact: websiteData.hasContact,
        has_team_info: websiteData.hasTeamInfo,
        readme_length: githubData.readme?.length || 0,
        license: githubData.license
      }
    };
  }

  /**
   * 3. 可持续性评估
   */
  assessSustainability(metadata, githubData) {
    let score = 40; // 基础分
    const evidence = [];

    // 最近更新时间
    const lastUpdate = new Date(githubData.lastCommit || 0);
    const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 30) {
      score += 20;
      evidence.push({ type: 'recent_update', value: daysSinceUpdate, weight: 20 });
    } else if (daysSinceUpdate < 90) {
      score += 10;
      evidence.push({ type: 'recent_update', value: daysSinceUpdate, weight: 10 });
    }

    // 提交频率
    if (githubData.commitFrequency > 10) {
      score += 15;
      evidence.push({ type: 'commit_frequency', value: githubData.commitFrequency, weight: 15 });
    }

    // Issue 响应
    if (githubData.issueResponseTime < 7) {
      score += 15;
      evidence.push({ type: 'issue_response', value: githubData.issueResponseTime, weight: 15 });
    }

    // Stars 数量（社区支持度）
    if (githubData.stars > 1000) {
      score += 10;
      evidence.push({ type: 'stars', value: githubData.stars, weight: 10 });
    }

    return {
      score: Math.min(100, score),
      max_score: 100,
      evidence,
      details: {
        days_since_update: Math.floor(daysSinceUpdate),
        commit_frequency: githubData.commitFrequency,
        issue_response_days: githubData.issueResponseTime,
        stars: githubData.stars
      }
    };
  }

  /**
   * 4. 技术价值评估
   */
  assessTechnicalValue(metadata, githubData) {
    let score = 50;
    const evidence = [];

    // 代码复杂度（非简单套壳）
    if (githubData.codeComplexity > 50) {
      score += 20;
      evidence.push({ type: 'code_complexity', value: githubData.codeComplexity, weight: 20 });
    }

    // 测试覆盖率
    if (githubData.testCoverage > 50) {
      score += 15;
      evidence.push({ type: 'test_coverage', value: githubData.testCoverage, weight: 15 });
    }

    // 文档完整性
    if (githubData.hasDocumentation) {
      score += 15;
      evidence.push({ type: 'documentation', value: true, weight: 15 });
    }

    // 独特功能（非纯转发）
    if (metadata.hasUniqueFeatures) {
      score += 20;
      evidence.push({ type: 'unique_features', value: true, weight: 20 });
    }

    return {
      score: Math.min(100, score),
      max_score: 100,
      evidence,
      details: {
        code_complexity: githubData.codeComplexity,
        test_coverage: githubData.testCoverage,
        has_documentation: githubData.hasDocumentation,
        unique_features: metadata.hasUniqueFeatures
      }
    };
  }

  /**
   * 5. 社区反馈评估
   */
  assessCommunityFeedback(communityData, githubData) {
    let score = 50;
    const evidence = [];

    // GitHub Issues 解决率
    if (githubData.issueResolutionRate > 0.8) {
      score += 20;
      evidence.push({ type: 'issue_resolution', value: githubData.issueResolutionRate, weight: 20 });
    }

    // 社区讨论正面度
    if (communityData.sentiment > 0.6) {
      score += 20;
      evidence.push({ type: 'sentiment', value: communityData.sentiment, weight: 20 });
    }

    // 技术博客提及
    if (communityData.blogMentions > 5) {
      score += 10;
      evidence.push({ type: 'blog_mentions', value: communityData.blogMentions, weight: 10 });
    }

    return {
      score: Math.min(100, score),
      max_score: 100,
      evidence,
      details: {
        issue_resolution_rate: githubData.issueResolutionRate,
        sentiment: communityData.sentiment,
        blog_mentions: communityData.blogMentions
      }
    };
  }

  /**
   * 6. 安全审计评估
   */
  assessSecurity(securityData) {
    let score = 100;
    const evidence = [];
    const vulnerabilities = [];

    // 依赖漏洞
    if (securityData.vulnerabilities?.length > 0) {
      const penalty = securityData.vulnerabilities.length * 15;
      score -= penalty;
      vulnerabilities.push(...securityData.vulnerabilities);
      evidence.push({ type: 'vulnerabilities', value: securityData.vulnerabilities.length, weight: -penalty });
    }

    // 权限要求
    if (securityData.excessivePermissions) {
      score -= 20;
      evidence.push({ type: 'excessive_permissions', value: true, weight: -20 });
    }

    // 代码审查
    if (securityData.codeReviewScore) {
      score += (securityData.codeReviewScore - 50) * 0.3;
      evidence.push({ type: 'code_review', value: securityData.codeReviewScore, weight: 15 });
    }

    return {
      score: Math.max(0, score),
      max_score: 100,
      evidence,
      details: {
        vulnerabilities: vulnerabilities.length,
        excessive_permissions: securityData.excessivePermissions,
        code_review_score: securityData.codeReviewScore
      }
    };
  }

  /**
   * 7. 使用指标评估
   */
  assessUsageMetrics(metadata, githubData) {
    let score = 50;
    const evidence = [];

    // 下载/安装量
    if (metadata.downloads > 100000) {
      score += 30;
      evidence.push({ type: 'downloads', value: metadata.downloads, weight: 30 });
    } else if (metadata.downloads > 10000) {
      score += 20;
      evidence.push({ type: 'downloads', value: metadata.downloads, weight: 20 });
    } else if (metadata.downloads > 1000) {
      score += 10;
      evidence.push({ type: 'downloads', value: metadata.downloads, weight: 10 });
    }

    // Fork 数量
    if (githubData.forks > 100) {
      score += 10;
      evidence.push({ type: 'forks', value: githubData.forks, weight: 10 });
    }

    // 依赖数量（被其他项目使用）
    if (githubData.dependents > 50) {
      score += 10;
      evidence.push({ type: 'dependents', value: githubData.dependents, weight: 10 });
    }

    return {
      score: Math.min(100, score),
      max_score: 100,
      evidence,
      details: {
        downloads: metadata.downloads,
        forks: githubData.forks,
        dependents: githubData.dependents
      }
    };
  }

  /**
   * 计算总分
   */
  calculateOverallScore(dimensions) {
    let weightedScore = 0;
    
    for (const [key, dimension] of Object.entries(dimensions)) {
      const weight = this.weights[key];
      weightedScore += dimension.score * weight;
    }

    // 红旗扣减
    const redFlagPenalty = this.identifyRedFlags(dimensions, {}).length * 10;
    weightedScore = Math.max(0, weightedScore - redFlagPenalty);

    // 安全一票否决
    if (dimensions.security_audit.score < 30) {
      return {
        overallScore: 0,
        riskLevel: 'CRITICAL',
        verdict: 'REJECT'
      };
    }

    // 确定风险等级
    let riskLevel, verdict;
    if (weightedScore >= 80) {
      riskLevel = 'LOW';
      verdict = 'APPROVE';
    } else if (weightedScore >= 60) {
      riskLevel = 'MEDIUM';
      verdict = 'CAUTION';
    } else if (weightedScore >= 40) {
      riskLevel = 'HIGH';
      verdict = 'WARNING';
    } else {
      riskLevel = 'CRITICAL';
      verdict = 'REJECT';
    }

    return {
      overallScore: Math.round(weightedScore),
      riskLevel,
      verdict
    };
  }

  /**
   * 识别红旗信号
   */
  identifyRedFlags(dimensions, metadata) {
    const redFlags = [];

    if (dimensions.transparency.score < 30) {
      redFlags.push('官网无团队/公司信息');
    }

    if (dimensions.source_credibility.score < 40) {
      redFlags.push('开发者身份不明');
    }

    if (dimensions.sustainability.score < 30) {
      redFlags.push('项目长期未更新');
    }

    if (dimensions.security_audit.details?.vulnerabilities > 0) {
      redFlags.push('存在安全漏洞');
    }

    if (dimensions.security_audit.details?.excessive_permissions) {
      redFlags.push('要求过度权限');
    }

    if (metadata.isFork && !metadata.hasSignificantChanges) {
      redFlags.push('简单 fork，无实质改进');
    }

    return redFlags;
  }

  /**
   * 推荐替代方案
   */
  async suggestAlternatives(skillId, dimensions) {
    // TODO: 实现替代方案推荐逻辑
    return [];
  }

  // ============ 数据采集方法 ============

  async fetchMetadata(owner, repo, skillName) {
    // TODO: 从 skills.sh API 获取
    return { downloads: 0 };
  }

  async analyzeGithub(owner, repo) {
    // TODO: 调用 GitHub API
    return {};
  }

  async analyzeWebsite(owner, repo) {
    // TODO: 爬取官网
    return {
      hasAboutPage: false,
      hasContact: false,
      hasTeamInfo: false
    };
  }

  async searchCommunity(skillId) {
    // TODO: 搜索 Reddit/HN/博客
    return {
      sentiment: 0.5,
      blogMentions: 0
    };
  }

  async runSecurityScan(owner, repo) {
    // TODO: 调用 Snyk 等安全扫描
    return {
      vulnerabilities: [],
      excessivePermissions: false
    };
  }
}

module.exports = { SkillAssessor };
