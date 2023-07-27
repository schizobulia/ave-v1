<div style="position: fixed;top:20px;right:30px;z-index:100;">
  <img src='/static/player.svg' alt="player" style="display: block;margin-bottom: 10px;" on:click={player} />
  <div style="height: 10px;"></div>
  <img src='/static/update.svg' alt="update" on:click={updater}/>
  <!-- <img src='/static/settings.svg' alt="setting" on:click={settingClick}/> -->
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
      <Button variant="raised" style="width: 40%;" class="button-shaped-round" on:click={openFFmpegDir}>
        获取ffmpeg安装目录
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

<script>
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  import Button, { Label } from '@smui/button';
  import { invoke } from "@tauri-apps/api/tauri";
  import { FFPlayer } from "../utils/ffplay";
  import { appConfigDir } from "@tauri-apps/api/path";
  import { open } from '@tauri-apps/api/dialog';
  import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
  let isOpen = false;
  let qualityValArr = ['高', '中', '低']
  let qualityVal = '高'
  let ffmpegDir = ''
  function settingClick () {
    isOpen = true;
  }
  init()
  function init () {
      appConfigDir().then((res) => {
        ffmpegDir = res
      }).catch((err) => {})
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

  function player () {
    invoke("select_single_video", { videoExts: [].join(",") })
      .then(async (file) => {
        if (!file) {
          return
        }
        new FFPlayer(file).play()
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function updater () {
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      console.log(`下载更新 ${update.manifest?.version}, ${update.manifest?.date}, ${update.manifest.body}`);
      await installUpdate();
    }
  }
</script>