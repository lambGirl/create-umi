// 用于文件处理 
const fs = require('fs');

// 用于系统路径，文件路径
const path = require('path');

// 输出不再单调,添加文字背景， 改变字体颜色 https://blog.csdn.net/qq_41153478/article/details/81505630
const chalk = require('chalk'); 

 // 用于创建目录 https://www.cnblogs.com/xuepei/p/9429555.html
const mkdirp = require('mkdirp'); 

// 一个用户与命令行交互的工具， 用于窗口上选择 https://blog.csdn.net/qq_26733915/article/details/80461257
const inquirer = require('inquirer'); 

//是一款轻量级的实现复制文本到剪贴板功能的JavaScript插件。通过该插件可以将输入框，文本域，DIV元素中的文本等文本内容复制到剪贴板中 
const clipboardy = require('clipboardy'); 


// 获取模版信息
const generators = fs
  .readdirSync(`${__dirname}/generators`)
  .filter(f => !f.startsWith('.'))
  .map(f => {
    console.log('f', f);
    return {
      name: `${f.padEnd(15)} - ${chalk.gray(require(`./generators/${f}/meta.json`).description)}`,
      value: f,
      short: f,
    };
  });

 /**
  * 
  * @param {*} generatorPath ： 模版路径
  * @param {*} param1 ： 
  * name:  项目名称
  * cwd: process.cwd() 返回Node.js进程的当前工作目录。
  * args: process.argv的参数
  */ 
const runGenerator = async (generatorPath, { name = '', cwd = process.cwd(), args = {} }) => {
  
  // 返回一个Promise，  用于按照模版生成项目
  return new Promise(resolve => {
    // 创建一个name变量的文件夹
    if (name) {
      mkdirp.sync(name);

      // 将node的运行环境路径切换到项目目录+name下
      cwd = path.join(cwd, name);
    }

    // 导入生成模版的命令 generatorPath模版对应的路径generatorPath/index.js
    const Generator = require(generatorPath);

    // 通过yeoman-generator 生成模版生成器  https://yeoman.io/authoring/
    const generator = new Generator({
      name,
      env: {
        cwd,
      },
      resolved: require.resolve(generatorPath),
      args,
    });

    /**
     * yeoman-generator 执行run执行生成
     * 执行完执行callback回掉
     * 给用输出执行完成
     */
    return generator.run(() => {
      if (name) {
        if (process.platform !== `linux` || process.env.DISPLAY) {
          clipboardy.writeSync(`cd ${name}`);
          console.log('📋 Copied to clipboard, just use Ctrl+V');
        }
      }
      // 文件生成完成
      console.log('✨ File Generate Done');
      resolve(true);
    });
  });
};


/**
 * 主要的执行入口
 * @param {
 *  name: 项目名称
 *  type: 项目模版
 *  args：命令行参数 
 * } config 
 * 
 * process： node进程管理 http://nodejs.cn/api/process.html
 */
const run = async config => {
  
  // process.send()方法将消息发送到父进程, 消息将会作为父进程的childProcess对象上的'message' 事件被接收。
  // 消息会进行序列化和解析。
  process.send && process.send({ type: 'prompt' });

  // 发送事件 messages， process 通过on去监听
  process.emit('message', { type: 'prompt' });

  let { type } = config;
  // 验证是否存在模版，如果没有则向用户发起询问
  if (!type) {
    //  inquirer.prompt单选框，从generators选择
    const answers = await inquirer.prompt([
      {
        name: 'type',
        message: 'Select the boilerplate type',
        type: 'list',
        choices: generators,
      },
    ]);
    // answers用户的选择结果
    type = answers.type;
  }

  /**
   * 正式执行生成模版
   */
  try {
    return runGenerator(`./generators/${type}`, config);
  } catch(e) {
    console.error(chalk.red(`> Generate failed`), e);
    process.exit(1);
  }
};

module.exports = run;
