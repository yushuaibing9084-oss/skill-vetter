# Skill Vetter 严谨评估流程 v2.0

**目标**: 解决 Round 1 中发现的"草率"问题  
**核心改进**: 标准化、可复现、证据链完整

---

## Round 1 问题复盘

| 问题 | 影响 | 改进措施 |
|------|------|----------|
| 样本量小 (10个) | 统计意义不足 | 扩充到 30-50 个 |
| 数据来源单一 | 可能有偏差 | 多源交叉验证 |
| 主观判断多 | 可复现性差 | 标准化检查清单 |
| 证据记录不全 | 难以复核 | 强制证据归档 |
| 权重未验证 | 可能不合理 | 敏感性分析 |

---

## 评估流程 SOP

### Phase 1: 数据采集（标准化）

每个 Skill 必须采集以下数据：

#### 1.1 元数据（自动/半自动）
```yaml
skill_id: owner/repo@name
collection_date: YYYY-MM-DD
data_sources:
  - skills.sh API
  - GitHub API
  - Website crawl
  - Community search
```

#### 1.2 检查清单（人工+自动）

**来源可信度检查**:
- [ ] GitHub 组织/个人资料截图
- [ ] 官网域名注册信息 (whois)
- [ ] 团队成员 LinkedIn/Twitter
- [ ] 历史项目列表

**透明度检查**:
- [ ] About 页面截图（404也要记录）
- [ ] Team 页面截图
- [ ] Contact 信息记录
- [ ] README 完整度评分
- [ ] License 类型记录

**可持续性检查**:
- [ ] 最近提交日期
- [ ] 提交频率（过去6个月）
- [ ] Issue 数量和响应时间
- [ ] Release 频率

**技术价值检查**:
- [ ] 代码行数统计
- [ ] 依赖数量
- [ ] 测试文件存在性
- [ ] 文档完整性

**安全审计检查**:
- [ ] npm audit 结果
- [ ] 依赖漏洞扫描
- [ ] 权限要求审查

**社区反馈检查**:
- [ ] Reddit 讨论搜索
- [ ] Hacker News 搜索
- [ ] 技术博客提及
- [ ] GitHub Issues 情感分析

**使用指标检查**:
- [ ] 下载量截图
- [ ] Stars 数量
- [ ] Forks 数量

---

### Phase 2: 评分（标准化）

每个维度使用**评分表**，减少主观性：

#### 2.1 来源可信度评分表

| 等级 | 标准 | 得分 | 示例 |
|------|------|------|------|
| A+ | 知名上市公司 | 95-100 | Google, Microsoft |
| A | 知名独角兽/大厂 | 85-94 | Vercel, Anthropic |
| B+ | 有融资的初创 | 75-84 | 有 Crunchbase 记录 |
| B | 实名团队 | 65-74 | 有完整团队信息 |
| C | 个人开发者 | 50-64 | 有实名 GitHub |
| D | 匿名/信息缺失 | 0-49 | 无法确认身份 |

#### 2.2 透明度评分表

| 检查项 | 存在 | 得分 | 证据 |
|--------|------|------|------|
| About 页面 | 是/否 | 0/25 | 截图 |
| Team 信息 | 是/否 | 0/25 | 截图 |
| Contact | 是/否 | 0/20 | 截图 |
| README > 500字 | 是/否 | 0/15 | 字数统计 |
| License | 是/否 | 0/15 | 类型记录 |

#### 2.3 可持续性评分表

| 指标 | 标准 | 得分 |
|------|------|------|
| 最近更新 | <30天: 40分, <90天: 20分, >180天: 0分 | 0-40 |
| 提交频率 | >10次/月: 30分, >5次/月: 15分 | 0-30 |
| Issue 响应 | <7天: 20分, <30天: 10分 | 0-20 |
| Stars | >1000: 10分, >100: 5分 | 0-10 |

---

### Phase 3: 复核（防错机制）

#### 3.1 自检清单
- [ ] 所有检查项都有证据
- [ ] 评分与证据一致
- [ ] 计算无误（总分 = Σ(维度×权重) - 红旗扣分）

#### 3.2 交叉验证
- [ ] 两个独立评估者分别评分
- [ ] 差异 > 20分需讨论
- [ ] 记录分歧原因

#### 3.3 异常标记
- [ ] 任何维度得分 < 30 需特别说明
- [ ] 总分与直觉不符需复核

---

### Phase 4: 报告（标准化格式）

```yaml
skill_id: owner/repo@name
assessment_date: YYYY-MM-DD
assessor: name
version: 2.0

overall:
  score: 0-100
  risk_level: LOW/MEDIUM/HIGH/CRITICAL
  verdict: APPROVE/CAUTION/WARNING/REJECT

dimensions:
  source_credibility:
    score: 0-100
    evidence:
      - type: github_org
        value: ...
        source: https://github.com/...
        screenshot: path/to/screenshot.png
      - type: whois
        value: ...
        source: whois domain.com
    reasoning: 为什么给这个分

  transparency:
    score: 0-100
    evidence: [...]
    reasoning: ...

  # ... 其他维度

red_flags:
  - flag: 具体问题
    severity: high/medium/low
    evidence: ...

alternatives:
  - skill_id: alternative/skill@name
    reason: 为什么推荐

data_quality:
  completeness: 0-100  # 数据完整度
  confidence: high/medium/low  # 评估置信度
  limitations: 已知局限

audit_trail:
  - date: YYYY-MM-DD
    action: initial_assessment
    by: assessor_name
  - date: YYYY-MM-DD
    action: review
    by: reviewer_name
```

---

## 样本扩充计划

### 目标
- **总样本**: 50 个 Skill
- **分类覆盖**: 至少 10 个类别
- **来源分布**: 大厂、初创、个人、匿名

### 分类清单

| 类别 | 目标数量 | 已评估 |
|------|----------|--------|
| 视频生成 | 5 | 3 |
| React/前端 | 5 | 2 |
| 测试 | 5 | 1 |
| Git/版本控制 | 3 | 1 |
| 数据库 | 5 | 2 |
| DevOps/部署 | 5 | 0 |
| AI/ML | 5 | 0 |
| 安全 | 3 | 0 |
| 文档 | 3 | 0 |
| 其他 | 11 | 0 |

### 选择标准

每个类别选择 Skill 时，覆盖：
- 高下载量 (>100K)
- 中下载量 (10K-100K)
- 低下载量 (<10K)
- 大厂官方
- 初创公司
- 个人开发者

---

## 质量保障

### 评估者培训
- 阅读评估标准文档
- 完成 3 个示例评估
- 与标准答案对比，差异 < 10%

### 定期校准
- 每月回顾 5% 的已评估 Skill
- 检查评分一致性
- 调整标准（如有必要）

### 社区审核
- 公开评估数据
- 接受社区反馈
- 建立申诉机制

---

## 工具支持

### 数据采集工具
```bash
# 自动化采集
skill-vetter collect <skill-id>

# 输出: data/raw/<skill-id>.yaml
```

### 评分辅助工具
```bash
# 交互式评分
skill-vetter score data/raw/<skill-id>.yaml

# 输出: data/assessed/<skill-id>.yaml
```

### 报告生成工具
```bash
# 生成评估报告
skill-vetter report data/assessed/<skill-id>.yaml

# 输出: reports/<skill-id>.md
```

---

## 时间估算

| 阶段 | 每个 Skill 耗时 | 50个总耗时 |
|------|----------------|-----------|
| 数据采集 | 15-30 分钟 | 12-25 小时 |
| 评分 | 10-15 分钟 | 8-12 小时 |
| 复核 | 5-10 分钟 | 4-8 小时 |
| 报告 | 5 分钟 | 4 小时 |
| **总计** | **35-60 分钟** | **28-49 小时** |

建议：分批次进行，每周评估 10 个，5 周完成。

---

## 成功标准

Round 2 成功标准：
- [ ] 完成 50 个 Skill 评估
- [ ] 覆盖 10+ 类别
- [ ] 所有评估都有完整证据链
- [ ] 交叉验证一致性 > 90%
- [ ] 发现至少 3 个高风险 Skill
- [ ] 验证权重合理性

---

**核心原则**: 宁可慢，不可糙。质量是口碑的基础。
