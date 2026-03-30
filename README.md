# Skill Vetter

> **让每一次 Skill 安装都有据可依**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI Skill 生态正在爆发，但质量参差不齐。下载量可以被操纵，营销软文铺天盖地，安全风险难以识别。

**Skill Vetter** 是一个独立的第三方评估工具，帮助你在安装前做出明智选择。

## 为什么需要这个工具？

```
❌ 不要只看下载量 —— 可以被刷
❌ 不要只看评分 —— 可能有水军
❌ 不要盲目信任 —— 可能有安全风险

✅ 看来源可信度 —— 谁开发的？
✅ 看透明度 —— 敢不敢公开信息？
✅ 看可持续性 —— 会不会突然跑路？
✅ 看技术价值 —— 是真技术还是套壳？
✅ 看安全审计 —— 有没有漏洞？
```

## 快速开始

```bash
# 安装
npm install -g skill-vetter

# 评估一个 Skill
skill-vetter check inference-sh/skills@ai-video-generation

# 对比多个 Skill
skill-vetter compare skill-a skill-b skill-c

# 查看已评估列表
skill-vetter list --top
```

## 评估维度

| 维度 | 权重 | 说明 |
|------|------|------|
| **来源可信度** | 20% | 开发者/团队背景 |
| **透明度** | 20% | 信息公开程度 |
| **可持续性** | 15% | 项目活跃度、商业模式 |
| **技术价值** | 15% | 是否简单套壳 |
| **安全审计** | 15% | 漏洞、权限风险 |
| **社区反馈** | 10% | 真实用户评价 |
| **使用指标** | 5% | 下载量（仅参考）|

## 示例输出

```bash
$ skill-vetter check inference-sh/skills@ai-video-generation

📊 Skill 评估报告: inference-sh/skills@ai-video-generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

综合评分: 72/100
风险等级: MEDIUM ⚠️
建议: 谨慎使用，建议先阅读风险说明

维度评分:
  ✅ 来源可信度: 60/100
  ⚠️  透明度: 40/100
  ✅ 可持续性: 70/100
  ✅ 技术价值: 85/100
  ✅ 社区反馈: 65/100
  ✅ 安全审计: 80/100
  ✅ 使用指标: 90/100

红旗信号:
  ⚠️  官网无团队信息
  ⚠️  无融资披露

替代方案:
  - 字节 Seedance 官方 API
  - Google Veo 官方 API
  - 本地部署 Wan 2.5
```

## 核心原则

1. **独立第三方** —— 不与任何 Skill 平台有利益关系
2. **完全开源** —— 评估逻辑公开透明，接受社区监督
3. **数据驱动** —— 基于可验证的数据，而非主观判断
4. **持续迭代** —— 根据反馈不断改进评估标准

## 贡献

欢迎贡献！无论是代码、数据、还是建议。

```bash
# 克隆仓库
git clone https://github.com/yourusername/skill-vetter.git
cd skill-vetter

# 安装依赖
npm install

# 运行测试
npm test

# 提交 PR
```

## 路线图

- [x] 基础评估框架
- [ ] 支持更多数据源
- [ ] Web 界面
- [ ] 企业白名单功能
- [ ] 评估标准委员会

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**免责声明**: 本工具提供的评估仅供参考，不构成任何推荐或保证。请结合自身判断做出决策。
