# 贡献指南

感谢你对 Skill Vetter 的兴趣！以下是参与贡献的方式。

## 如何贡献

### 报告问题

如果你发现了 bug 或有改进建议：

1. 先搜索现有 Issue，避免重复
2. 创建新 Issue，描述清楚：
   - 问题现象
   - 复现步骤
   - 期望行为
   - 实际行为

### 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin feature/my-feature`
5. 创建 Pull Request

### 评估数据贡献

帮助我们完善 Skill 数据库：

- 提交你评估过的 Skill 报告
- 修正错误的评估数据
- 提供新的评估维度建议

## 开发环境

```bash
# 克隆仓库
git clone https://github.com/yourusername/skill-vetter.git
cd skill-vetter

# 安装依赖
npm install

# 运行测试
npm test

# 本地运行
node src/cli.js check <skill-id>
```

## 代码规范

- 使用 ESLint 检查代码风格
- 提交前运行测试
- 保持代码简洁清晰
- 添加必要的注释

## 行为准则

- 尊重他人
- 接受建设性批评
- 关注社区利益
- 展现同理心

## 问题？

如有疑问，欢迎开 Issue 讨论！
