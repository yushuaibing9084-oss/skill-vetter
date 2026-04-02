#!/usr/bin/env node
/**
 * Skill Vetter CLI - 交互式版本
 * 支持对话式需求挖掘和个性化推荐
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { assessSkill } = require('./assessor-mvp');
const { UserProfileManager } = require('./user-profile');
const { ExpectationManager } = require('./expectation-manager');

const userProfile = new UserProfileManager();
const expectationManager = new ExpectationManager();

program
  .name('skill-vetter')
  .description('AI Skill 评估工具 - 让每一次安装都有据可依')
  .version('0.2.0');

// 原有的 check 命令
program
  .command('check <skill-id>')
  .description('评估指定 Skill')
  .option('-i, --intent <intent>', '你的使用意图，例如："想把会议录音转成文字"')
  .action(async (skillId, options) => {
    const spinner = ora(`正在评估 ${skillId}...`).start();
    
    try {
      const result = await assessSkill(skillId);
      spinner.stop();
      
      // 输出基础报告
      printBasicReport(result);
      
      // 如果有意图，输出预期匹配分析
      if (options.intent) {
        console.log('\n' + chalk.bold('🎯 预期匹配分析'));
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        
        const expectationReport = expectationManager.generateExpectationReport(skillId, options.intent);
        printExpectationReport(expectationReport);
      }
      
      // 输出使用前必知
      console.log('\n' + chalk.bold('📋 使用前必知'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      
      const checklist = expectationManager.generatePreFlightChecklist(skillId);
      printChecklist(checklist);
      
      console.log('\n' + chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      
      // 退出码
      if (result.overall_score < 50) {
        process.exit(1);
      }
      
    } catch (error) {
      spinner.stop();
      console.error(chalk.red(`\n✗ 评估失败: ${error.message}`));
      process.exit(1);
    }
  });

// 新增：交互式推荐命令
program
  .command('recommend')
  .alias('rec')
  .description('根据你的需求推荐合适的 Skill')
  .action(async () => {
    console.log(chalk.bold('\n🤖 Skill Vetter - 智能推荐\n'));
    console.log('我会问你几个问题，帮你找到最适合的 Skill。\n');
    
    // 第一步：了解用户需求
    const { userNeed } = await inquirer.prompt([{
      type: 'input',
      name: 'userNeed',
      message: '你想解决什么问题？（用自然语言描述）',
      validate: (input) => input.length > 0 || '请描述你的需求'
    }]);
    
    // 第二步：收集用户画像
    const questions = userProfile.collectProfile();
    const answers = {};
    
    for (const q of questions) {
      const { answer } = await inquirer.prompt([{
        type: 'list',
        name: 'answer',
        message: q.question,
        choices: q.options.map(opt => ({
          name: `${opt.emoji} ${opt.label}`,
          value: opt.value
        }))
      }]);
      answers[q.id] = answer;
    }
    
    // 更新用户画像
    Object.assign(userProfile.profile, answers);
    
    console.log('\n' + chalk.blue('🔍 正在分析你的需求并匹配最佳 Skill...\n'));
    
    // 模拟推荐结果（MVP）
    // TODO: 后续接入真实的 skill 数据库和匹配算法
    const recommendations = generateRecommendations(userNeed, answers);
    
    // 输出推荐结果
    console.log(chalk.bold('📊 推荐结果\n'));
    
    recommendations.forEach((rec, index) => {
      const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
      const scoreColor = rec.match_score >= 80 ? 'green' : rec.match_score >= 60 ? 'yellow' : 'red';
      
      console.log(`${rankEmoji} ${chalk.bold(rec.skill_id)}`);
      console.log(`   匹配度: ${chalk[scoreColor](rec.match_score + '/100')} | 综合评分: ${rec.overall_score}/100`);
      console.log(`   ${chalk.gray(rec.why)}\n`);
      
      // 显示匹配维度
      if (rec.fit_analysis) {
        console.log(chalk.gray('   匹配分析:'));
        rec.fit_analysis.forEach(analysis => {
          const icon = analysis.type === 'match' ? '✅' : analysis.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(chalk.gray(`     ${icon} ${analysis.message}`));
        });
        console.log('');
      }
    });
    
    // 询问用户是否要查看详细评估
    const { viewDetail } = await inquirer.prompt([{
      type: 'confirm',
      name: 'viewDetail',
      message: '是否要查看某个 Skill 的详细评估报告？',
      default: false
    }]);
    
    if (viewDetail) {
      const { selectedSkill } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedSkill',
        message: '选择要查看的 Skill：',
        choices: recommendations.map(r => ({
          name: `${r.skill_id} (匹配度: ${r.match_score})`,
          value: r.skill_id
        }))
      }]);
      
      // 调用 check 命令显示详细报告
      const result = await assessSkill(selectedSkill);
      printBasicReport(result);
      
      const expectationReport = expectationManager.generateExpectationReport(selectedSkill, userNeed);
      printExpectationReport(expectationReport);
      
      const checklist = expectationManager.generatePreFlightChecklist(selectedSkill);
      printChecklist(checklist);
    }
    
    console.log(chalk.green('\n✨ 希望这些建议对你有帮助！'));
    console.log(chalk.gray('如有问题，欢迎提交反馈帮助改进推荐算法。\n'));
  });

// 新增：设置用户画像
program
  .command('profile')
  .description('设置你的用户画像（用于个性化推荐）')
  .action(async () => {
    console.log(chalk.bold('\n👤 设置用户画像\n'));
    console.log('这些信息将帮助我们为你提供更精准的 Skill 推荐。\n');
    
    const questions = userProfile.collectProfile();
    const answers = {};
    
    for (const q of questions) {
      const { answer } = await inquirer.prompt([{
        type: 'list',
        name: 'answer',
        message: q.question,
        choices: q.options.map(opt => ({
          name: `${opt.emoji} ${opt.label}`,
          value: opt.value
        }))
      }]);
      answers[q.id] = answer;
    }
    
    // 保存画像
    Object.assign(userProfile.profile, answers);
    userProfile.saveProfile();
    
    console.log(chalk.green('\n✅ 用户画像已保存！'));
    console.log(chalk.gray('下次使用 recommend 命令时将基于这些偏好进行推荐。\n'));
  });

// 辅助函数：输出基础报告
function printBasicReport(result) {
  console.log('\n' + chalk.bold('📊 Skill 评估报告'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`\n${chalk.bold('Skill:')} ${result.skill_id}`);
  
  // 评分
  const scoreColor = result.overall_score >= 80 ? 'green' : 
                    result.overall_score >= 60 ? 'yellow' : 'red';
  console.log(`${chalk.bold('综合评分:')} ${chalk[scoreColor](result.overall_score + '/100')}`);
  
  // 风险等级
  const riskEmoji = result.risk_level === 'LOW' ? '✅' :
                   result.risk_level === 'MEDIUM' ? '⚠️' : '❌';
  console.log(`${chalk.bold('风险等级:')} ${riskEmoji} ${result.risk_level}`);
  
  // 建议
  console.log(`${chalk.bold('建议:')} ${result.recommendation}`);
  
  // 维度评分
  console.log('\n' + chalk.bold('维度评分:'));
  for (const [key, dim] of Object.entries(result.dimensions)) {
    const dimColor = dim.score >= 80 ? 'green' : dim.score >= 60 ? 'yellow' : 'red';
    const bar = '█'.repeat(Math.floor(dim.score / 10)) + '░'.repeat(10 - Math.floor(dim.score / 10));
    console.log(`  ${chalk[dimColor](bar)} ${dim.score}/100 ${dim.name}`);
  }
  
  // 红旗信号
  if (result.red_flags.length > 0) {
    console.log('\n' + chalk.bold('⚠️  红旗信号:'));
    result.red_flags.forEach(flag => {
      console.log(`  • ${flag}`);
    });
  }
  
  // 替代方案
  if (result.alternatives.length > 0) {
    console.log('\n' + chalk.bold('💡 替代方案:'));
    result.alternatives.forEach(alt => {
      console.log(`  • ${alt}`);
    });
  }
}

// 辅助函数：输出预期报告
function printExpectationReport(report) {
  // 匹配分析
  if (report.match_analysis.matches.length > 0) {
    console.log(chalk.green('\n✅ 符合预期:'));
    report.match_analysis.matches.forEach(m => {
      console.log(`  • ${m.note}`);
    });
  }
  
  if (report.match_analysis.mismatches.length > 0) {
    console.log(chalk.red('\n❌ 不符合预期:'));
    report.match_analysis.mismatches.forEach(m => {
      console.log(`  • ${m.issue}`);
      if (m.severity === 'high') {
        console.log(chalk.red(`    ⚠️  这是一个严重的不匹配，建议重新考虑`));
      }
    });
  }
  
  if (report.match_analysis.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  需要注意:'));
    report.match_analysis.warnings.forEach(w => {
      console.log(`  • ${w.issue}`);
      if (w.suggestion) {
        console.log(chalk.gray(`    💡 ${w.suggestion}`));
      }
    });
  }
  
  // 建议
  if (report.recommendations.length > 0) {
    console.log(chalk.blue('\n💡 建议:'));
    report.recommendations.forEach(r => {
      const icon = r.type === 'warning' ? '⚠️' : r.type === 'tip' ? '💡' : 'ℹ️';
      console.log(`  ${icon} ${r.message}`);
    });
  }
}

// 辅助函数：输出检查清单
function printChecklist(checklist) {
  checklist.items.forEach(category => {
    console.log(chalk.bold(`\n${category.category}:`));
    category.items.forEach(item => {
      console.log(`  ${item}`);
    });
  });
  
  console.log(chalk.bold('\n安装前检查清单:'));
  checklist.checklist.forEach(item => {
    console.log(chalk.gray(`  ${item}`));
  });
}

// 模拟推荐生成（MVP）
function generateRecommendations(userNeed, userProfile) {
  // 根据用户需求和画像生成推荐
  // MVP: 返回硬编码的推荐结果
  
  const mockRecommendations = [
    {
      skill_id: 'inference-sh/skills@ai-video-generation',
      match_score: 85,
      overall_score: 72,
      why: '功能强大，支持多种视频生成模型',
      fit_analysis: [
        { type: 'match', message: '技术难度与你的水平匹配' },
        { type: 'warning', message: '需要云端处理，注意隐私数据' },
        { type: 'info', message: '首次使用需要学习提示词工程' }
      ]
    },
    {
      skill_id: 'vercel-labs/agent-skills@vercel-react-best-practices',
      match_score: 70,
      overall_score: 88,
      why: '官方出品，质量有保障',
      fit_analysis: [
        { type: 'match', message: '来自可信来源，安全有保障' },
        { type: 'match', message: '文档完善，学习曲线平缓' }
      ]
    }
  ];
  
  return mockRecommendations;
}

program.parse();
