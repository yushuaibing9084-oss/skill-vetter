# Skill Vetter

> **让每一次 Skill 安装都有据可依**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI Skill 生态正在爆发，但质量参差不齐。下载量可以被操纵，营销软文铺天盖地，安全风险难以识别。

**更关键的是**：每个用户的需求、技术背景、使用场景都不同。一个适合专家的 Skill，对新手可能是灾难。

**Skill Vetter** 是一个独立的第三方评估工具，帮助你在安装前做出**真正适合自己的**明智选择。

## 核心洞察

用户反馈揭示了 Skill 选择的本质问题：

```
❌ 不要只看客观评分 —— 适合别人的不一定适合你
❌ 不要只看功能列表 —— 实际使用可能完全不同
❌ 不要被营销话术误导 —— 预期管理至关重要

✅ 要看与你需求的匹配度 —— 你的场景是什么？
✅ 要看与你能力的匹配度 —— 你能驾驭吗？
✅ 要看真实的能力边界 —— 它能做什么、不能做什么？
✅ 要看隐藏成本 —— 时间、金钱、学习曲线
```

## 🚀 立即体验

### 方式一：本地运行（推荐）

```bash
# 克隆仓库
git clone https://github.com/yushuaibing9084-oss/skill-vetter.git
cd skill-vetter
npm install

# 评估任意 Skill
node src/cli-interactive.js check inference-sh/skills@ai-video-generation

# 或带需求评估
node src/cli-interactive.js check inference-sh/skills@ai-video-generation \
  --intent "我想生成产品宣传视频，要求高清质量"

# 或启动交互式推荐
node src/cli-interactive.js recommend
```

### 方式二：npx 运行（推荐）

```bash
# 基础评估（客观维度）
npx skill-vetter check inference-sh/skills@ai-video-generation

# ⭐ 推荐：带需求评估（客观+主观维度，个性化匹配分析）
npx skill-vetter check inference-sh/skills@ai-video-generation \
  --intent "我想生成产品宣传视频"

# 交互式推荐
npx skill-vetter recommend
```

> 💡 **强烈建议**: 使用 `--intent "你的需求"` 获取个性化匹配分析，避免"功能符合但场景不匹配"的坑！

### 方式三：全局安装

```bash
npm install -g skill-vetter
skill-vetter check <skill-id>
```

---

## 📊 真实评估案例

我们用 Skill Vetter 评估了 7 个真实的 Skill，覆盖大厂官方、知名开源、个人开发者和匿名项目：

| Skill | 来源类型 | 综合评分 | 建议 |
|-------|---------|---------|------|
| Anthropic Webapp Testing | AI大厂官方 | 93/100 | ✅ 放心使用 |
| kepano Obsidian Skills | 开源/官方成员 | 92/100 | ✅ 放心使用 |
| GitHub Git Commit | 平台官方 | 90/100 | ✅ 放心使用 |
| Vercel React Best Practices | 大厂官方 | 90/100 | ✅ 放心使用 |
| Lark/Feishu CLI | 大厂官方 | 85/100 | ✅ 放心使用 |
| Prisma Database Setup | 知名开源 | 87/100 | ✅ 放心使用 |
| inference-sh AI Video | 初创/不明 | 46/100 | ⚠️ 谨慎使用 |
| developer-xyz Image Resizer | 个人开发者 | 37/100 | ❌ 不建议 |
| unknown-dev Data Scraper | 匿名开发者 | 0/100 | 🚫 强烈不建议 |

### 快速体验

```bash
# 评估大厂官方 Skill（高分案例）
npx skill-vetter check vercel-labs/agent-skills@vercel-react-best-practices

# 评估高风险 Skill（红旗案例）
npx skill-vetter check unknown-dev/skills@data-scraper
```

📄 [查看完整评估报告（7个案例）](./examples/REAL_EVALUATIONS.md)  
📄 [了解评估方法论](./docs/METHODOLOGY.md)

---

## 三种使用模式

## 三种使用模式

### 模式一：快速评估 (check)

适合：你已经知道要安装什么，想快速了解风险

```bash
$ skill-vetter check inference-sh/skills@ai-video-generation

📊 Skill 评估报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skill: inference-sh/skills@ai-video-generation
综合评分: 72/100
风险等级: ⚠️ MEDIUM
建议: 谨慎使用，建议先阅读风险说明

维度评分:
  ████████░░ 85/100 技术价值
  ██████░░░░ 60/100 来源可信度
  ████░░░░░░ 40/100 透明度
  ...

⚠️ 红旗信号:
  • 官网无团队信息
  • 无融资披露
```

### 模式二：需求匹配评估 (check --intent)

适合：你有明确需求，想验证某个 Skill 是否满足

```bash
$ skill-vetter check inference-sh/skills@ai-video-generation \
  --intent "想把会议录音转成文字，要求本地处理保护隐私"

📊 Skill 评估报告
...

🎯 预期匹配分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 不符合预期:
  • 你希望数据留在本地，但该 skill 需要上传数据到云端
  ⚠️ 这是一个严重的不匹配，建议重新考虑

💡 建议:
  ⚠️ 该 skill 可能不符合你的隐私要求，建议寻找替代方案
  💡 考虑使用 whisper-local 或本地部署方案
```

### 模式三：智能推荐 (recommend) ⭐ 推荐

适合：你不确定哪个 Skill 适合你，需要个性化推荐

```bash
$ skill-vetter recommend

🤖 Skill Vetter - 智能推荐

我会问你几个问题，帮你找到最适合的 Skill。

你想解决什么问题？ 我想把会议录音转成文字

你的技术背景是？
  > 🔰 非技术用户，希望开箱即用
    💻 懂一些代码，能做简单配置
    ⚡ 开发者，可以二次开发

你对隐私的要求是？
    ☁️ 无所谓，方便就行
  > 🏠 希望数据留在本地
    🔒 必须有端到端加密

...

📊 推荐结果

🥇 whisper-local
   匹配度: 95/100 | 综合评分: 78/100
   本地运行，隐私安全，一键安装

   匹配分析:
     ✅ 符合你的隐私要求
     ✅ 配置时间在你的接受范围内
     ℹ️ 首次运行需要下载 1.5GB 模型

🥈 otter-ai
   匹配度: 65/100 | 综合评分: 82/100
   云端处理，速度快，功能丰富

   匹配分析:
     ⚠️ 数据上传至云端，不符合你的隐私要求
     ✅ 功能强大，识别准确率高
```

## 评估维度

### 客观维度（通用评估）

| 维度 | 权重 | 说明 |
|------|------|------|
| **来源可信度** | 20% | 开发者/团队背景 |
| **透明度** | 20% | 信息公开程度 |
| **可持续性** | 15% | 项目活跃度、商业模式 |
| **技术价值** | 15% | 是否简单套壳 |
| **安全审计** | 15% | 漏洞、权限风险 |
| **社区反馈** | 10% | 真实用户评价 |
| **使用指标** | 5% | 下载量（仅参考）|

### 主观维度（个性化匹配）

| 维度 | 说明 |
|------|------|
| **技术匹配度** | Skill 难度 vs 你的技术水平 |
| **隐私匹配度** | 数据处理方式 vs 你的隐私要求 |
| **时间匹配度** | 配置耗时 vs 你的时间预算 |
| **成本匹配度** | 定价模式 vs 你的预算限制 |

## 预期管理：使用前必知

每个 Skill 评估报告都包含「使用前必知」清单：

```
📋 使用前必知
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

它能做什么:
  ✅ 生成 5-10 秒的短视频片段
  ✅ 概念验证和创意原型
  ✅ 社交媒体内容创作

它不能做什么:
  ⚠️ 长视频（>30秒）生成质量不稳定
  ⚠️ 人物一致性难以保证
  ⚠️ 复杂动作场景容易出错

隐藏成本:
  💰 首次使用需要充值最低 $10
  💰 生成失败也会扣除 credits
  ⏱️ 需要学习提示词工程

安装前检查清单:
  □ 我已经阅读了官方文档
  □ 我了解该 skill 的能力边界
  □ 我预留了学习/调试时间
  □ 我了解定价和费用结构
```

## 核心原则

1. **个性化优先** —— 没有最好的 Skill，只有最适合你的 Skill
2. **预期管理** —— 明确告知能做什么、不能做什么
3. **透明可信** —— 评估逻辑完全开源，接受社区监督
4. **持续学习** —— 根据用户反馈不断优化推荐算法

## 贡献

欢迎贡献！无论是代码、数据、还是使用反馈。

```bash
# 克隆仓库
git clone https://github.com/yushuaibing9084-oss/skill-vetter.git
cd skill-vetter

# 安装依赖
npm install

# 本地运行
node src/cli-interactive.js check inference-sh/skills@ai-video-generation

# 提交 PR
```

### 特别需要的贡献

- **使用反馈**：安装 Skill 后，实际体验与预期是否有差距？
- **预期数据**：补充 Skill 的「能做什么/不能做什么」信息
- **推荐算法**：改进个性化匹配算法
- **文档翻译**：让更多语言的用户受益

## 路线图

- [x] 基础评估框架
- [x] 交互式推荐（个性化匹配）
- [x] 预期管理功能
- [ ] 支持更多数据源
- [ ] Web 界面
- [ ] 社区众包预期数据库
- [ ] 使用后反馈闭环
- [ ] 企业白名单功能

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**免责声明**: 本工具提供的评估仅供参考，不构成任何推荐或保证。请结合自身判断做出决策。

**反馈欢迎**: 如果你有使用反馈或功能建议，欢迎提交 Issue 或 PR！
