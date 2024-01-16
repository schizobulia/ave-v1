<script>
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  import Button, { Label } from '@smui/button';
  import { FFPlayer } from "../utils/ffplay";
  import { appConfigDir } from "@tauri-apps/api/path";
  import { open } from '@tauri-apps/api/dialog';
  import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
  import Swal from "sweetalert2";
  import { showType, downloadDirPathStore } from '../store';
  import { AVE_DOWNLOADDIR_KEY } from '../config'
  let isOpen = false;
  let qualityValArr = ['高', '中', '低']
  let qualityVal = '高'
  let ffmpegDir = ''
  let downloadDirPath = "";

  function settingClick () {
    isOpen = true;
  }
  init()
  function init () {
    appConfigDir().then((res) => {
      ffmpegDir = res
    }).catch((err) => {})

    downloadDirPathStore.subscribe(value => {
		  downloadDirPath = decodeURIComponent(value);
	  });
  }

  function closeDialog () {
    isOpen = false;
  }

  async function openFFmpegDir() {
    await open({
      directory: true,
      multiple: false,
      defaultPath: ffmpegDir,
    });
  }

  async function player () {
    const selectedPath = await open({
      multiple: false
    });
    new FFPlayer(selectedPath).play()
  }

  async function updater () {
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      console.log(`下载更新 ${update.manifest?.version}, ${update.manifest?.date}, ${update.manifest.body}`);
      await installUpdate();
    } else {
      Swal.fire({
        title: "已经是最新版",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  async function openDownloadDirPath () {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      defaultPath: downloadDirPath,
    });
    if (typeof selectedPath === 'string') {
      downloadDirPathStore.set(encodeURIComponent(selectedPath))
      window.localStorage.setItem(AVE_DOWNLOADDIR_KEY, encodeURIComponent(selectedPath));
    }
  }
</script>


<div class="setting-content">
  <img src='/static/home.svg' alt="home" on:click={() => { showType.set('home') }}/>
  <div style="height: 10px;"></div>
  <img src='/static/player.svg' alt="player" style="display: block;margin-bottom: 10px;" on:click={player} />
  <div style="height: 10px;"></div>
  <img src='/static/update.svg' alt="update" on:click={updater}/>
  <div style="height: 10px;"></div>
  <img src='/static/settings.svg' alt="setting" on:click={settingClick}/>
</div>


<Dialog
  bind:open={isOpen}
  aria-labelledby="mandatory-title"
  aria-describedby="mandatory-content"
>
  <Title id="mandatory-title">设置</Title>
  <Content id="mandatory-content">
    <div style="width: 500px;min-height: 300px;">
      <!-- <Select bind:qualityVal label="压缩质量" defaultValue={qualityVal}>
        {#each qualityValArr as fruit}
          <Option value={fruit}>{fruit}</Option>
        {/each}
      </Select> -->
      <div style="height: 30px;"></div>
      <!-- <Button variant="raised" style="width: 40%;" class="button-shaped-round" on:click={openFFmpegDir}>
        获取ffmpeg安装目录
      </Button> -->
      <Button variant="raised" style="width: 50%;" class="button-shaped-round" on:click={openDownloadDirPath}>
        设置安装和文件保存的目录
      </Button>
    </div>
  </Content>
  <Actions>
    <Button on:click={closeDialog}>
      <Label>取消</Label>
    </Button>
    <Button on:click={closeDialog}>
      <Label>确认</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .setting-content {
    position: fixed;top:20px;right:30px;z-index:100;
  }

  .setting-content img {
    cursor: pointer;
  }
</style>