import React, { useState } from 'react';
import { Modal, Col, Row, Select } from 'antd';
import SettingIcon from '../../assets/settings.svg';
import { getVideoExts } from '../../config/videoExts';
import { invoke } from "@tauri-apps/api/tauri";
import { message } from 'antd';

const { Option } = Select;

const videoExtChildren: React.ReactNode[] = [];
const exts = getVideoExts();
for (let i = 0; i < exts.length; i++) {
  videoExtChildren.push(<Option key={i} value={exts[i]}>{exts[i]}</Option>);
}

const Setting: React.FC = (props) => {
  const [visible, setVisible] = useState(false);
  const [quality, setQuality] = useState('中');
  const [videoExt, setVideoExt] = useState('MP4');
  const [saveFilePath, setSaveFilePath] = useState('加载中');
  const settingClick = () => {
    setVisible(true)
  }
  function settingOk() {
    // setVisible(false)
    invoke("update_video_config", { config: { ext: videoExt, quality: quality, save_path: saveFilePath } })
      .then((p: any) => {
        if (p) {
          setVisible(false)
          message.success('设置成功')
        } else {
          message.success('设置失败')
        }
      })
      .catch((err) => {
        message.success('设置失败')
      });
  }

  const handleChange = (value: string) => {
    setQuality(value)
  };

  const handleVideoExtChange = (value: string) => {
    setVideoExt(value)
  }

  const handleSaveFilePath = () => {
    invoke("select_save_file_path", {})
      .then((p: any) => {
        if (p) {
          setSaveFilePath(`${p}`)
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  React.useEffect(() => {
    init()
  }, [])

  const init = () => {
    invoke("get_video_config", {})
      .then((config: any) => {
        setQuality(config.quality);
        setVideoExt(config.ext);
        setSaveFilePath(config.save_path)
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div>
      <div style={{ position: 'fixed', top: '20px', right: '30px', zIndex: '100' }}>
        <img src={SettingIcon} alt="setting" onClick={settingClick} />
      </div>
      <Modal
        title="设置"
        centered
        visible={visible}
        onOk={settingOk}
        onCancel={() => setVisible(false)}
        width={500}
      >
        <Row>
          <Col span={4} style={{ lineHeight: '32px' }}>视频质量: </Col>
          <Col span={20}>
            <Select defaultValue={quality} style={{ width: '100%' }} onChange={handleChange}>
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
            <Select defaultValue={videoExt} style={{ width: '100%' }} onChange={handleVideoExtChange} >
              {videoExtChildren}
            </Select>
          </Col>
        </Row>
        <p style={{ marginTop: '10px' }}></p>
        <Row>
          <Col span={4}>下载地址: </Col>
          <Col span={20}>
            <span onClick={handleSaveFilePath}>{saveFilePath}</span>
          </Col>
        </Row>
      </Modal>
    </div>
  )
}
export default Setting
