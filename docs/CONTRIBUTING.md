# 前言
主要是给开发者阅读，描述开发前后需要注意的一些事项。

# 开发环境

    node: 16.20.2

常用命令：
- 安装依赖 `npm install .`
- 测试用例 `npm run test`
- 发版 `npm publish` 直接使用 `src` 目录下的文件发版

# 提交Pull Request
提交Pull Request之前需要检查以下事项是否完成：
- 需包含测试用例，并通过`npm test`
- 测试覆盖度要求 `100%`

# 打包发版

  npm publish
