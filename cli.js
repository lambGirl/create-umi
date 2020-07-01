#!/usr/bin/env node

// 命名行解析，获取参数
const yParser = require('yargs-parser');

const semver = require('semver');
// 文件管理
const { existsSync } = require('fs');

// 路径管理
const { join } = require('path');

// 控制台内容颜色控制
const chalk = require('chalk');

const run = require('./lib/run');

// print version and @local
/**
 * process.argv： 返回一个数组，其中包含当启动 Node.js 进程时传入的命令行参数
 * 第一个元素是 process.execPath
 * 第二个元素将是正在执行的 JavaScript 文件的路径。
 * 其余元素将是任何其他命令行参数。
 * node cli.js umi-project
 * ["/usr/local/bin/node", "/Users/wangyangyang/Downloads/code/demo/create-umi…", "umi-project"]
 */
const args = yParser(process.argv.slice(2));

if (args.v || args.version) {
  console.log(require('./package').version);
  if (existsSync(join(__dirname, '.local'))) {
    console.log(chalk.cyan('@local'));
  }
  process.exit(0);
}
/**
 * semver: 对npm包的版本管理，比较， 规范等等解析
 * https://cnodejs.org/topic/570f8331510629637266685a
 */
if (!semver.satisfies(process.version, '>= 8.0.0')) {
  console.error(chalk.red('✘ The generator will only work with Node v8.0.0 and up!'));
  process.exit(1);
}

// 获取传入的项目名称
const name = args._[0] || '';

// 根据run文件得知，type设置项目的样板
/**
 * 目前umi包含5种代码样板
 * ant-design-pro - Create project with a layout-only ant-design-pro boilerplate, use together with umi block.
 * app - Create project with a simple boilerplate, support typescript.
 * block - Create a umi block.
 * library - Create a library with umi.
 * plugin - Create a umi plugin.
 */
const { type } = args;

delete args.type;

// 执行脚手架，开启项目构建程序
run({
  name,
  type,
  args,
});
