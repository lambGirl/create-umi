// 脚手架生成器
const Generator = require('yeoman-generator');

// 在shell中使用正则去匹配文件，就好像stars，stuff
const glob = require('glob');

// 文件操作
const { statSync } = require('fs');
// path操作
const { basename } = require('path');

/**
 * 调试公开一个函数；只需将此函数作为模块的名称传递，
 * 它将返回经过修饰的console.error版本，以便您将调试语句传递给该模块。
 * 这将允许您切换模块不同部分以及整个模块的调试输出。
 * 所有的debug日志前面都会加上 create-umi:BasicGenerator
 */
const debug = require('debug')('create-umi:BasicGenerator');

function noop() {
  return true;
}

class BasicGenerator extends Generator {
  constructor(opts) {
    super(opts);
    //  初始化参数
    this.opts = opts;
    
    // 初始化名称
    this.name = basename(opts.env.cwd);
  }

  // 验证是否为Ts文件
  isTsFile(f) {
    return f.endsWith('.ts') || f.endsWith('.tsx') || !!/(tsconfig\.json)/g.test(f);
  }

  /**
   * 
   * To Do 写文件
   * 知识点： 
   * 1. this.templatePath()： templatePath(...path: string[]): string; // 获取当前templates的地址
   * 
   * 2. glob.sync(pattern, [options])
   *   - pattern {String} Pattern to be matched
   *   - options {Object}
   *  return: {Array<String>} filenames found matching the pattern
   * 
   * 3.  this.fs.copyTpl： https://haztivity.github.io/generator-haztivity/interfaces/generatorhaztivity.scogenerator.base.memfseditor.html#copytpl
   *     fs: Generator.MemFsEditor;
   *      copyTpl(
   *        from: string, 
   *        to: string, 
   *        context: __type, 
   *        templateOptions?: __type, 
   *        copyOptions?: __type): void
   */
  writeFiles({ context, filterFiles = noop }) {
    // We have multiple welcome file, random this
    
    // 获取 templates 里面符合此“**/assets/welcomeImgs/*”条件下的所有文件
    /**
     * 根据用户的回答依次执行文件copy操作
     * filterFiles： 过滤条件
     */
    const welcomeImages = glob
      .sync('**/assets/welcomeImgs/*', {
        cwd: this.templatePath(),
        dot: true,  // 包括dot文件
      })
      .filter(filterFiles);


    if (welcomeImages.length) {
      const welcomeImg = welcomeImages[Math.floor(Math.random() * welcomeImages.length)];
      debug(`copy ${welcomeImg}`);

      //     fs: Generator.MemFsEditor;
      this.fs.copyTpl(
        this.templatePath(welcomeImg),
        this.destinationPath(welcomeImg.replace(/welcomeImgs.*$/, 'yay.jpg')),
        context,
      );
    }

    debug(`context: ${JSON.stringify(context)}`);
    /**
     * 匹配所有文件
     * 不包含welcomeImgs
     * 一次copy文件到指定文件夹
     */
    glob
      .sync('**/*', {
        cwd: this.templatePath(),
        dot: true,
      })
      .filter(filterFiles)
      .filter(file => !file.includes('welcomeImgs'))
      .forEach(file => {
        debug(`copy ${file}`);
        const filePath = this.templatePath(file);
        if (statSync(filePath).isFile()) {
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(file.replace(/^_/, '.')),
            context,
          );
        }
      });
  }

  /**
   * 源码
   * Generator： prompt<A extends Generator.Answers = Generator.Answers>(questions: Generator.Questions<A>): Promise<A>;
   * 发起questions得到相应的回答
   * 
   */

  prompt(questions) {
    process.send && process.send({ type: 'prompt' });
    process.emit('message', { type: 'prompt' });
    /**
     * 发起question
     */
    return super.prompt(questions);
  }
}

module.exports = BasicGenerator;
