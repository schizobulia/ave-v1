import React, { useState } from 'react';
import { Modal, Col, Row, Select } from 'antd';
import Terminal from 'react-console-emulator';
import SettingIcon from '../../assets/settings.svg';
import TerminalIcon from '../../assets/terminal.svg';
import { getVideoExts } from '../../config/videoExts';
import { invoke } from "@tauri-apps/api/tauri";
import { message } from 'antd';
import { Command } from "@tauri-apps/api/shell";

const { Option } = Select;

const videoExtChildren: React.ReactNode[] = [];
const exts = getVideoExts();
for (let i = 0; i < exts.length; i++) {
  videoExtChildren.push(<Option key={i} value={exts[i]}>{exts[i]}</Option>);
}


class Setting extends React.Component {
  constructor(props: any) {
    super(props)
    // this.terminal = React.createRef()
    this.state = {
      visible: false,
      quality: '中',
      videoExt: 'MP4',
      saveFilePath: '加载中',
      showTerminal: false
    }
    this.terminal = React.createRef()
  }
  terminal: any

  state: {
    visible: false,
    quality: '中',
    videoExt: 'MP4',
    saveFilePath: '加载中',
    showTerminal: false
  }
  componentDidMount() {
    const self = this
    invoke("get_video_config", {})
      .then((config: any) => {
        self.setState({
          quality: config.quality,
          videoExt: config.ext,
          saveFilePath: config.save_path
        })
      })
      .catch((err) => {
        console.error(err);
      });
  }

  settingClick() {
    this.setState({
      visible: true
    })
  }

  terminalClick() {
    this.setState({
      showTerminal: true
    })
  }

  handleChange(value: string) {
    this.setState({
      value: value
    })
  }

  settingOk() {
    const { videoExt, quality, saveFilePath } = this.state
    invoke("update_video_config", { config: { ext: videoExt, quality: quality, save_path: saveFilePath } })
      .then((p: any) => {
        if (p) {
          this.setState({
            visible: false
          })
          message.success('设置成功')
        } else {
          message.success('设置失败')
        }
      })
      .catch((err) => {
        message.success('设置失败')
      });
  }
  handleVideoExtChange(value: string) {
    this.setState({
      videoExt: value
    })
  }

  handleSaveFilePath() {
    invoke("select_save_file_path", {})
      .then((p: any) => {
        if (p) {
          this.setState({
            saveFilePath: `${p}`
          })
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  render(): React.ReactNode {
    const commands = {
      ffmpeg: {
        description: 'ffmpeg cli',
        fn: async (...args: any) => {
          const terminal = this.terminal.current
          const ffmpeg = Command.sidecar("bin/ffmpeg", args);
          ffmpeg.on("close", async ({ code }) => {
          });
          ffmpeg.on("error", async (error) => {
            terminal.pushToStdout(error)
          });
          ffmpeg.stdout.on("data", (line) => {
            terminal.pushToStdout(line)
          });
          ffmpeg.stderr.on("data", (line) => {
            terminal.pushToStdout(line)
          });
          await ffmpeg.execute()
          return '结束';
        }
      },
      ffprobe: {
        description: 'ffprobe cli',
        fn: async (...args: any) => {
          const terminal = this.terminal.current
          const ffprobe = Command.sidecar("bin/ffprobe", args);
          ffprobe.on("close", async ({ code }) => {
          });
        
          ffprobe.on("error", async (error) => {
            terminal.pushToStdout(error)
          });
        
          ffprobe.stdout.on("data", (line: string) => {
            terminal.pushToStdout(line)
          });
        
          ffprobe.stderr.on("data", (line) => {
            terminal.pushToStdout(line)
          });
          await ffprobe.execute();
          return '结束';
        }
      },
      exit: {
        description: 'ffmpeg cli',
        fn: () => {
          this.setState({
            showTerminal: false
          })
        }
      }
    }
    const TerminalRender: React.FC = () => {
      if (this.state.showTerminal) {
        return (
          <div style={{ position: 'fixed', top: '0px', left: '0px', width: '100%', height: '100%', zIndex: '1002' }}>
            <Terminal
              style={{ width: '100%', height: '100%' }}
              commands={commands}
              welcomeMessage={'👏🏻欢迎使用Ave!\r\n支持: ffmpeg、ffprobe、exit'}
              promptLabel={'ave:~$'}
              rawInput="asdasd"
              ref={this.terminal}
            />
          </div>
        )
      }
      return (<div></div>)
    }
    return (
      <div>
        <div style={{ position: 'fixed', top: '20px', right: '30px', zIndex: '100' }}>
          <img src={TerminalIcon} alt="terminal" onClick={this.terminalClick.bind(this)} />
          <div style={{ marginTop: '10px' }}></div>
          <img src={SettingIcon} alt="setting" onClick={this.settingClick.bind(this)} />
        </div>
        <Modal
          title="设置"
          centered
          visible={this.state.visible}
          onOk={this.settingOk.bind(this)}
          onCancel={() => this.setState({ visible: false })}
          width={500}
        >
          <Row>
            <Col span={4} style={{ lineHeight: '32px' }}>视频质量: </Col>
            <Col span={20}>
              <Select defaultValue={this.state.quality} style={{ width: '100%' }} onChange={this.handleChange.bind(this)}>
                <Option value="高">高</Option>
                <Option value="中">中</Option>
                <Option value="低">低</Option>
              </Select>
            </Col>
          </Row>
          <p style={{ marginTop: '10px' }}></p>
          <Row>
            <Col span={4} style={{ lineHeight: '32px' }}>视频格式: </Col>
            <Col span={20}>
              <Select defaultValue={this.state.videoExt} style={{ width: '100%' }} onChange={this.handleVideoExtChange.bind(this)} >
                {videoExtChildren}
              </Select>
            </Col>
          </Row>
          <p style={{ marginTop: '10px' }}></p>
          <Row>
            <Col span={4}>下载地址: </Col>
            <Col span={20}>
              <span onClick={this.handleSaveFilePath.bind(this)}>{this.state.saveFilePath}</span>
            </Col>
          </Row>
        </Modal>
        <TerminalRender></TerminalRender>
      </div>
    )
  }
}

export default Setting
