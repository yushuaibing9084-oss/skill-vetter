# NPM 发布指南

## 发布前检查清单

- [ ] 已登录 npm 账号
- [ ] 版本号已更新（如有需要）
- [ ] 所有测试通过
- [ ] README 已更新

## 发布步骤

### 1. 登录 npm

```bash
cd /Users/bigfish9084/.openclaw/workspace/projects/skill-vetter
npm login
```

按提示输入：
- Username: yushuaibing9084
- Password: [你的npm密码]
- Email: [你的邮箱]

### 2. 测试发布（可选）

```bash
npm publish --dry-run
```

检查输出是否有警告或错误。

### 3. 正式发布

```bash
npm publish
```

### 4. 验证发布

```bash
# 等待几分钟，然后检查
npm view skill-vetter

# 测试安装
npm install -g skill-vetter
skill-vetter check inference-sh/skills@ai-video-generation
```

## 版本更新流程

如需发布新版本：

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 提交更改
git push origin main

# 3. 发布
npm publish
```

## 常见问题

**Q: 包名已被占用？**
A: 需要更换包名，修改 package.json 中的 name 字段。

**Q: 发布失败，提示需要 2FA？**
A: 在 npm 网站设置中，为 CLI 操作配置 2FA。

**Q: 如何撤销发布？**
A: 24 小时内可以撤销：
```bash
npm unpublish skill-vetter@0.2.0
```

## 发布后的更新

发布后需要更新 README：

```markdown
## 🚀 立即体验

### 方式一：npx 运行（推荐）

```bash
npx skill-vetter check inference-sh/skills@ai-video-generation
```

### 方式二：全局安装

```bash
npm install -g skill-vetter
skill-vetter check <skill-id>
```

### 方式三：本地运行

```bash
git clone https://github.com/yushuaibing9084-oss/skill-vetter.git
cd skill-vetter
npm install
node src/cli-interactive.js check <skill-id>
```
```
