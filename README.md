# 一个简单的音视频处理器,基于FFmpeg与Tauri


### 开始前准备
- 下载编译好[ffmpeg的二进制文件](https://ffmpeg.org/download.html)到src-tauri/bin目录下
- 修改ffmpeg名称, 在yarn taurid dev时会提示应该怎么修改

### 快速开始

```Get started
yarn install

yarn tauri dev
```

### 实现列表
+ 转换进度条
+ 终止转换任务
+ 播放功能
+ 用户可以自行输入ffmpeg的参数
+ 打包时自动将ffmpeg打包进项目中

### 未实现功能
+ 播放器不在基于web实现(因为web对音视频的编码有局限性)
+ 发布v1版本(x)

### 下载地址
- [alpha版本](http://gofile.me/5ZhEh/v8RqfbzIe)
### 部分代码参考来源:
- [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [ffmpegGUI](https://github.com/zhen-ke/ffmpegGUI)
