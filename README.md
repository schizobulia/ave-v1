# 一个简单的音视频处理器,基于FFmpeg与Tauri


### 开始前准备
- 下载编译好[ffmpeg的二进制文件](https://ffmpeg.org/download.html)到src-tauri/bin目录下
- 修改ffmpeg名称, 在yarn taurid dev时会提示应该怎么修改

### 备注
- 项目中尽可能不能使用网络，所有操作尽可能在本地完成
### 快速开始

```bash
$ yarn install

$ node script/ffmpeg.js #下载需要的二进制文件

$ yarn tauri dev
```

### 实现列表
+ 转换进度条
+ 终止转换任务
+ 播放功能
+ 用户可以自行输入ffmpeg的参数
+ 打包时自动将ffmpeg打包进项目中
+ 实现视频播放功能
+ 下载地址可以打开
+ 自动更新
+ 合并pdf
+ 图片批量添加水印
+ 图片合并
+ 发布v1版本

### 未实现功能

+ 背景去除
+ 国际化

### 下载地址
- [地址](https://github.com/schizobulia/ave-v1/releases/tag/v1.0.0)

### 部分代码参考来源:
- [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [ffmpegGUI](https://github.com/zhen-ke/ffmpegGUI)
- ChatGPT
