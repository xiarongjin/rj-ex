# Change Log

All notable changes to the "create zn template" extension will be documented in
this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how
to structure this file.

## [Unreleased]

- Initial release

v0.0.2

提取工具类代码

添加头像

绑定远程 git 仓库

提取 html 文件

v0.0.3

更新插件名称

增加了 auto video 功能

auto video 目前支持 mp4,mov,m4v 格式视频资源转换成 zn 可用的 flv 文件

auto video 支持将 mov,m4v 格式视频转换成 mp4 格式

auto video 借助使用 ffmpeg、ffprobe 指令

请提前备好或者 brew install ffmpeg 安装改指令

v0.0.4

修复已知 bug

v0.0.5

新增 mp4 格式视频的压缩

新增 minify img 面板

minify img 会收集工作区内图片资源

minify img 不会检查这些目录 ['node_modules', '.git', '.cache']

minify img 可以压缩图片，支持图片格式互相转换

\*当前功能可能仅支持在 arm64 环境下
