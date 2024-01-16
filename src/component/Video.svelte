<script lang="ts">
  import Button, { Label } from "@smui/button";
  import CircularProgress from "@smui/circular-progress";
  import List, { Item, Text, Separator } from "@smui/list";
  // import { push } from "svelte-spa-router";
  import Select, { Option } from "@smui/select";
  // import IconButton from "@smui/icon-button";
  import Dialog, { Title, Content, Actions, Header } from "@smui/dialog";
  import Textfield from "@smui/textfield";
  // import { convertFileSrc } from "@tauri-apps/api/tauri";
  import { open } from '@tauri-apps/api/dialog';
  import { FFmpegVideo } from "../utils/ffmpeg";
  import { basename, join, downloadDir, sep, appConfigDir } from "@tauri-apps/api/path";
  import { getMetadata } from "../utils/ffprobe";
  import { getArgByStr } from "../utils/tool";
  import { FFPlayer } from "../utils/ffplay";
  import Swal from "sweetalert2";
  import { downloadDirPathStore } from '../store';
  import DownloadDirectory from './DownloadDirectoryPath.svelte';
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
  let videoExt = videoExts[0];
  let value = "";
  let filesProgress = [
    // { file: 'xxx', progress: 0.3, taskId: new Date().getTime() }
  ];
  let downloadDirectoryPath = ''
  async function select_video() {
    if (!videoExt) {
      openDialog = true;
      return;
    }
    const arr = videoExts.map((ele: string) => {
      return ele.toLowerCase();
    });
    const selectedPath = await open({
      multiple: true,
      filters: [{
        name: 'Video',
        extensions: [...videoExts, ...arr]
      }]
    });
    if (Array.isArray(selectedPath)) {
      start_ffmpeg(selectedPath);
    }
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
      let outputFile = downloadDirectoryPath + sep + (await basename(file));
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
    downloadDirPathStore.subscribe(value => {
		  downloadDirectoryPath = decodeURIComponent(value);
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
      const playerFile = await join(downloadDirectoryPath, file);
      new FFPlayer(playerFile).play();
    } else {
      Swal.fire({
        title: "转换未结束",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  init();

</script>

<main>
  <div style="margin-top: 40px;" />
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
          <Text style="cursor: pointer;" on:click={() => player_video(item.file, item.taskId)}
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
  <DownloadDirectory {downloadDirectoryPath} />
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
