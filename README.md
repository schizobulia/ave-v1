# 一个简单的音视频处理器,基于FFmpeg与Tauri


### 开始前准备
- 下载编译好[ffmpeg的二进制文件](https://ffmpeg.org/download.html)到src-tauri/bin目录下
- 修改ffmpeg名称, 在yarn taurid dev时会提示应该怎么修改

### 备注
- 项目中尽可能不能使用网络，所有操作尽可能在本地完成
### 快速开始

```Get started
yarn install

chmod u+x ave_java-aarch64-apple-darwin

yarn tauri dev
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
### 未实现功能
+ 发布v1版本(x)
+ 图片合并
+ 背景去除
+ 国际化

### 下载地址
- [mac](http://ave.jcbsb.com/ave_x64.dmg)
- [win](http://ave.jcbsb.com/ave_x64_en-US.msi)
### 部分代码参考来源:
- [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [ffmpegGUI](https://github.com/zhen-ke/ffmpegGUI)
