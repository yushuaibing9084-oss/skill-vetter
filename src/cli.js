#!/usr/bin/env node
/**
 * Skill Vetter CLI - MVP 版本
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { assessSkill } = require('./assessor-mvp');

program
  .name('skill-vetter')
  .description('AI Skill 评估工具 - 让每一次安装都有据可依')
  .version('0.1.0');

program
  .command('check <skill-id>')
  .description('评估指定 Skill')
  .action(async (skillId) => {
    const spinner = ora(`正在评估 ${skillId}...`).start();
    
    try {
      const result = await assessSkill(skillId);
      spinner.stop();
      
      // 输出报告
      console.log('\n' + chalk.bold('📊 Skill 评估报告'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(`\n${chalk.bold('Skill:')} ${skillId}`);
      
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

program.parse();
