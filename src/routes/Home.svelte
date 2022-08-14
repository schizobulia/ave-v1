<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import Button, { Label } from "@smui/button";
  import CircularProgress from "@smui/circular-progress";
  import List, { Item, Text, Separator } from "@smui/list";
  import { push } from "svelte-spa-router";
  import Select, { Option } from "@smui/select";
  import IconButton from "@smui/icon-button";
  import Dialog, { Title, Content, Actions, Header } from "@smui/dialog";
  import Textfield from "@smui/textfield";
  import { convertFileSrc } from "@tauri-apps/api/tauri";
  import { downloadDir } from "@tauri-apps/api/path";
  import { FFmpegVideo } from "../utils/ffmpeg";
  import { basename, join } from "@tauri-apps/api/path";
  import { getMetadata } from "../utils/ffprobe";
  import { getArgByStr } from "../utils/tool";
  import DPlayer from "dplayer";
  import Swal from "sweetalert2";
  let videoExts = [
    "MP4",
    "MPEG",
    "WEBM",
    "MOV",
    "WMV",
    "MPG",
    "DIVX",
    "MPEG-2",
    "3GP",
    "OGV",
    "M4V",
    "FLV",
    "MKV",
    "MJPEG",
    "SWF",
    "HEVC",
    "XVID",
    "VOB",
    "AV1",
    "AVCHD",
    "TS",
    "MXF",
    "MTS",
    "ASF",
    "RMVB",
    "F4V",
    "3G2",
    "RM",
    "M2TS",
    "WTV",
    "M2V",
    "AVI"
  ];
  let openDialog = false;
  let videoExt = "";
  let value = "";
  let downloadDirPath = "";
  let videoPlayerOpen = false;
  let videoPlayerSource = "";
  let filesProgress = [
    // { file: 'xxx', progress: 0.3, taskId: new Date().getTime() }
  ];
  let DPlayerDom;
  let dpPlayer;

  function select_video() {
    if (!videoExt) {
      openDialog = true;
      return;
    }
    invoke("select_video", { videoExts: videoExts.join(",") })
      .then((files: Array<string>) => {
        start_ffmpeg(files);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function start_ffmpeg(files: Array<string>) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const id = new Date().getTime();
      filesProgress.push({
        file: file,
        progress: 0,
        taskId: id,
        child: null,
      });
      let outputFile = downloadDirPath + (await basename(file));
      // @ts-ignore
      await getMetadata(file, async (meta: any) => {
        outputFile =
          outputFile.substring(0, outputFile.lastIndexOf(".")) +
          `.${videoExt.toLowerCase()}`;
        const ffmpeg = new FFmpegVideo(file, outputFile, meta, id);
        const taskIndex = getTaskVideo(ffmpeg.taskId);
        if (filesProgress[taskIndex]) {
          filesProgress[taskIndex].child = ffmpeg;
        }
        ffmpeg.conversionVideo(getArgByStr(value));
        // @ts-ignore
        await ffmpeg.start(
          // @ts-ignore
          async (progress: number, taskId: number, output: string) => {
            const taskIndex = getTaskVideo(taskId);
            if (filesProgress[taskIndex]) {
              filesProgress[taskIndex].progress = Number(progress) / 100;
              filesProgress[taskIndex].file = await basename(output);
            }
          }
        );
      });
    }
  }

  function getTaskVideo(id: number): number {
    return filesProgress.findIndex((ele: any) => {
      return ele.taskId === id;
    });
  }

  function init() {
    downloadDir()
      .then((data) => {
        downloadDirPath = data;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function deltetTask(id: number) {
    const taskIndex = getTaskVideo(id);
    if (filesProgress[taskIndex]) {
      filesProgress[taskIndex].child.kill();
      filesProgress = filesProgress.filter((t) => t.taskId !== id);
    }
  }

  async function player_video(file: string, id: number) {
    const taskIndex = getTaskVideo(id);
    if (filesProgress[taskIndex] && filesProgress[taskIndex].child.status) {
      const playerFile = await join(downloadDirPath, file);
      videoPlayerSource = convertFileSrc(playerFile);
      videoPlayerOpen = true;
      player(videoPlayerSource);
      // push(encodeURI(`/player?file=${playerFile}`));
    } else {
      Swal.fire({
        title: "转换未结束",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  function player(url: string) {
    dpPlayer = new DPlayer({
      container: DPlayerDom,
      screenshot: true,
      video: {
        url: url
      }
    });
    dpPlayer.fullScreen.request('web');
  }
  init();
</script>

<main>
  <h1>Hello Ave!</h1>
  <div style="margin-top: 40px;" />
  <!-- on:click={() => push('/player')} -->
  <Button variant="raised" class="button-shaped-round" on:click={select_video}>
    选择视频文件
  </Button>
  <div style="margin-top: 20px;" />
  <div class="columns margins" style="justify-content: flex-start;">
    <div>
      <Select bind:value={videoExt} label="选择转换的视频格式">
        {#each videoExts as fruit}
          <Option value={fruit}>{fruit}</Option>
        {/each}
      </Select>
    </div>
  </div>
  <div style="margin-top: 20px;" />
  <Textfield
    type="text"
    bind:value
    label="附加参数(选填) 例如: -b 200k"
    style="width: 450px;"
  />
  <div style="margin-top: 30px;" />
  <div style="max-height: 325px;overflow: auto;">
    <List class="demo-list" style="margin: 0 auto;" nonInteractive>
      {#each filesProgress as item}
        <Item>
          <div
            style="margin-right: 15px;"
            on:click={() => deltetTask(item.taskId)}
          >
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5449"
              width="20"
              height="20"
              ><path
                d="M221.467345 252.510275h581.273652v581.273652c0 34.168057-27.917803 62.294201-62.294201 62.294201H283.761546c-34.168057 0-62.294201-27.917803-62.294201-62.294201v-581.273652z"
                fill="#FFB74D"
                p-id="5450"
              /><path
                d="M449.809969 356.264496c0-11.4588-9.375381-20.834181-20.834181-20.834181s-20.834181 9.375381-20.834181 20.834181v435.851069c0 11.4588 9.375381 20.834181 20.834181 20.834181s20.834181-9.375381 20.834181-20.834181V356.264496zM615.858393 356.264496c0-11.4588-9.375381-20.834181-20.834181-20.834181s-20.834181 9.375381-20.834181 20.834181v435.851069c0 11.4588 9.375381 20.834181 20.834181 20.834181s20.834181-9.375381 20.834181-20.834181V356.264496z"
                fill="#FB8C00"
                p-id="5451"
              /><path
                d="M194.591251 211.258596c-10.208749 0-18.750763 9.375381-18.750763 20.834181s8.333672 20.834181 18.750763 20.834181H829.200407c10.208749 0 18.750763-9.375381 18.750763-20.834181s-8.333672-20.834181-18.750763-20.834181H194.591251z"
                fill="#FB8C00"
                p-id="5452"
              /><path
                d="M449.809969 176.04883c-11.4588 0-20.834181 9.375381-20.834181 20.834181s9.375381 20.834181 20.834181 20.834181h124.588403c11.4588 0 20.834181-9.375381 20.834181-20.834181s-9.375381-20.834181-20.834181-20.834181h-124.588403z"
                fill="#EF6C00"
                p-id="5453"
              /></svg
            >
          </div>
          <Text on:click={() => player_video(item.file, item.taskId)}
            >{item.file}</Text
          >
          <div
            style="display: flex; justify-content: center;position: absolute;right: 50px;"
          >
            <CircularProgress
              style="height: 48px; width: 48px;"
              bind:progress={item.progress}
            />
          </div>
        </Item>
        <Separator />
      {/each}
    </List>
  </div>
  <div style="position: fixed; bottom: 20px; right: 10px;">
    文件保存地址: {downloadDirPath}
  </div>
  <Dialog
    bind:open={openDialog}
    aria-labelledby="simple-title"
    aria-describedby="simple-content"
  >
    <Title id="simple-title">错误</Title>
    <Content id="simple-content">请选择需要转换的视频格式</Content>
    <Actions>
      <Button on:click={() => (openDialog = false)}>
        <Label>确认</Label>
      </Button>
    </Actions>
  </Dialog>
  <Dialog
    bind:open={videoPlayerOpen}
    fullscreen
    aria-labelledby="fullscreen-title"
    aria-describedby="fullscreen-content"
  >
    <Header>
      <Title id="fullscreen-title">视频播放(因为播放的实现是基于web 部分视频编码无法播放)</Title>
      <IconButton
        action="close"
        class="material-icons"
        on:click={() => {
          videoPlayerOpen = false;
          dpPlayer.destroy();
        }}>x</IconButton
      >
    </Header>
    <Content id="fullscreen-content" style="max-height: 350px;">
      <div bind:this={DPlayerDom} width="500" height="320" />
    </Content>
  </Dialog>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  * :global(.demo-list) {
    max-width: 800px;
  }
</style>
