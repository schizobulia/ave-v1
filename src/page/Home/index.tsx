import React, { useState, useEffect } from 'react';
import { Button, Input, Space, List, Progress, Modal } from 'antd';
import { invoke } from "@tauri-apps/api/tauri";
import { basename, join } from "@tauri-apps/api/path";
import { FFmpegVideo } from "../../utils/ffmpeg";
import { getArgByStr } from "../../utils/tool";
import { getVideoExts } from '../../config/videoExts';
import { DeleteOutlined } from '@ant-design/icons';
import { getMetadata } from "../../utils/ffprobe";
import Setting from '../../component/Setting/index';

const ffmpegTaskMap = new Map();
let videoExts = getVideoExts();

class HomePage extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {
      value: '',
      filesProgress: []
    }
  }

  state: {
    value: '',
    filesProgress: []
  };

  selectVideo() {
    invoke("select_video", { videoExts: videoExts.join(",") })
    .then((files: any) => {
      invoke("get_video_config", {})
        .then((videoConfig: any) => {
          this.start_ffmpeg(files, videoConfig);
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
  }

  async start_ffmpeg (files: Array<string>, videoConfig: any) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const id = new Date().getTime();
      this.setState({
        // @ts-ignore
        filesProgress: this.state.filesProgress.concat([{
          file: file,
          progress: 0,
          taskId: id
        }])
      })
      let outputFile = videoConfig.save_path + '/' + (await basename(file));
      // @ts-ignore
      await getMetadata(file, async (meta: any) => {
        outputFile =
          outputFile.substring(0, outputFile.lastIndexOf(".")) +
          `.${videoConfig.ext}`;

        const ffmpeg = new FFmpegVideo(file, outputFile, meta, id);
        ffmpegTaskMap.set(id, ffmpeg);
        ffmpeg.conversionVideo(getArgByStr(this.addValue(this.state.value, videoConfig.quality)));
        // @ts-ignore
        await ffmpeg.start(
          // @ts-ignore
          (progress: number, taskId: number, output: string) => {
            if (ffmpegTaskMap.has(taskId)) {
              this.updateTaskVideoProgress(taskId, progress, output);
            }
          }
        );
      });
    }
  }

  updateTaskVideoProgress(id: number, progress: number, output: string) {
    const arr = this.state.filesProgress.map((item: any) => {
      if (item.taskId === id) {
        item.progress = parseInt(`${progress}`);
        item.file = output;
      }
      return item;
    });
    this.setState({
      filesProgress: [...arr]
    })
  }

  addValue(value: string, quality: string): string {
    let res = ''
    if (quality === '高') {
      res += '-crf 0'
    } else if (quality === '中') {
      res += '-crf 25'
    } else {
      res += '-crf 51'
    }

    return value + ' ' + res + ' '
  }

  stopTask(id: number) {
    const task = ffmpegTaskMap.get(id);
    if (task && typeof task.kill === 'function') {
      task.kill();
      ffmpegTaskMap.delete(id);
    }
  }

  async deltetTask(id: number) {
    const data = this.state.filesProgress
    const index = data.findIndex((item: any) => {
      return item.taskId === id
    });
    if (index != -1) {
      this.stopTask(id);
      data.splice(index, 1);
      this.setState({
        filesProgress: data
      })
    }
  }

  render(): React.ReactNode {
    return (
      <div className='container'>
        <h1>Hello Ave!</h1>
        <div style={{ marginTop: '10px' }} />
        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
          <Space direction="vertical" size="large">
            <Button type="primary" size="large" onClick={this.selectVideo.bind(this)}>选择视频文件</Button>
            <Input placeholder="附加参数(选填) 例如: -b 200k" value={this.state.value} onChange={(e: any) => { this.setState({ value: e.target.value }) }} style={{ width: '450px' }} />
          </Space>
        </div>
        <div style={{ marginTop: '20px' }} />
        <div style={{ maxHeight: '324px', width: '450px', height: '300px', margin: '0 auto' }}>
          <List
            itemLayout="horizontal"
            locale={{ emptyText: '暂无任务' }}
            dataSource={this.state.filesProgress}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<DeleteOutlined style={{ color: 'red' }} onClick={this.deltetTask.bind(this, item.taskId)} />}
                  title={<span style={{ display: 'inline-block', width: '100%', textAlign: 'left' }}>{item.file}</span>}
                  description={<Progress percent={item.progress} size="small" />}
                />
              </List.Item>
            )}
          />
        </div>
        <Setting></Setting>
      </div>
    )
  }
}



export default HomePage;