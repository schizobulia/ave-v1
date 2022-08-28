import { Command } from "@tauri-apps/api/shell";
import { message } from 'antd';

/**
 * Parse progress line from ffmpeg stderr
 *
 * @param {String} line progress line
 * @return progress object
 * @private
 */
function parseProgressLine(line: string) {
  var progress = {};

  // Remove all spaces after = and trim
  line = line.replace(/=\s+/g, '=').trim();
  var progressParts = line.split(' ');

  // Split every progress part by "=" to get key and value
  for (var i = 0; i < progressParts.length; i++) {
    var progressSplit = progressParts[i].split('=', 2);
    var key = progressSplit[0];
    var value = progressSplit[1];

    // This is not a progress line
    if (typeof value === 'undefined')
      return null;
    // @ts-ignore
    progress[key] = value;
  }

  return progress;
}


/**
 * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
 *
 * @param {String} timemark timemark string
 * @return Number
 * @private
 */
function timemarkToSeconds (timemark: string) {
  if (typeof timemark === 'number') {
    return timemark;
  }

  if (timemark.indexOf(':') === -1 && timemark.indexOf('.') >= 0) {
    return Number(timemark);
  }

  var parts = timemark.split(':');

  // add seconds
  var secs = Number(parts.pop());

  if (parts.length) {
    // add minutes
    secs += Number(parts.pop()) * 60;
  }

  if (parts.length) {
    // add hours
    secs += Number(parts.pop()) * 3600;
  }

  return secs;
}

class FFmpegVideo {
  ffmpeg: any;
  input: string;
  output: string;
  meta: any;
  taskId: number;
  // @ts-ignore
  status: number;
  // @ts-ignore
  private progressCb: void;
  // @ts-ignore
  private child: null;

  constructor(file: string, output: string, meta: any, id: number) {
    this.ffmpeg = null;
    this.input = file;
    this.output = output;
    this.meta = meta;
    this.taskId = id
  }
  /**
   * 配置转换参数
   * @param arg 
   */
  conversionVideo(arg: Array<string>) {
    let args = [
      "-i", this.input
    ]
    if (arg.length && arg[0]) {
      args = args.concat(arg)
    }
    const ffmpeg = Command.sidecar("bin/ffmpeg", args.concat([this.output, "-y"]));
    ffmpeg.on("close", async ({ code }) => {
      this.status = 1;
      if (code) {
        message.error('转换失败')
      } else {
        this.progressData(100);
      }
    });
  
    ffmpeg.on("error", async (error) => {
      message.error("文件转换错误");
    });
  
    ffmpeg.stdout.on("data", (line) =>{
    });
  
    ffmpeg.stderr.on("data", (line) => {
      const progress = parseProgressLine(line);
      if (progress) {
        this.extractProgress(progress, this.meta);
      }
    });
    this.ffmpeg = ffmpeg
  }

  extractProgress(progress: any, meta: any) {
    var ret = {
      frames: parseInt(progress.frame, 10),
      currentFps: parseInt(progress.fps, 10),
      currentKbps: progress.bitrate ? parseFloat(progress.bitrate.replace('kbits/s', '')) : 0,
      targetSize: parseInt(progress.size || progress.Lsize, 10),
      timemark: progress.time
    };
    if (meta && meta.format && meta.format.duration) {
      var duration = Number(meta.format.duration);
      if (!isNaN(duration)) {
        // @ts-ignore
        ret.percent = (timemarkToSeconds(ret.timemark) / duration) * 100;
        // @ts-ignore
        this.progressData(ret.percent);
      }
    }
  }

  async start(cb: void) {
    if (this.ffmpeg) {
      this.child = await this.ffmpeg.spawn()
      this.progressCb = cb
    }
  }

  kill () {
    if (this.ffmpeg && this.child) {
      this.status = -1;
      // @ts-ignore
      this.child.kill();
    }
  }

  progressData (val: number) {
    if (typeof this.progressCb === 'function') {
      // @ts-ignore
      void this.progressCb(val, this.taskId, this.output)
    }
  }
}

export {
  FFmpegVideo
}