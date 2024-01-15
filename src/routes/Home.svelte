<script lang="ts">
  import Video from '../component/Video.svelte';
  import Pdf from '../component/Pdf.svelte';
  import ImgWatermark from '../component/ImgWatermark.svelte';
  import { showType } from '../store';

  let showTypeVal;
	showType.subscribe(value => {
		showTypeVal = value;
	});

</script>

<main>
  <h1>Hello Ave!</h1>
  {#if showTypeVal === 'home'}
    <div class="ave-content">
      <div class="ave-layout">
        <div class="ave-item" on:click={() => { showType.set('video') } }>
          <img src="static/video.png" alt="">
          <div class="ave-cell">视频处理</div>
        </div>
        <div class="ave-item" on:click={() => { showType.set('pdf') } }>
          <img src="static/video.png" alt="">
          <div class="ave-cell">PDF合并</div>
        </div>
      </div>
      <div class="ave-layout">
        <div class="ave-item" on:click={() => { showType.set('imgWatermark') } }>
          <img src="static/video.png" alt="">
          <div class="ave-cell">图片添加水印</div>
        </div>
        <div class="ave-item">
        </div>
      </div>
    </div>
  {:else if showTypeVal === 'video'}
    <Video></Video>
  {:else if showTypeVal === 'pdf'}
    <Pdf></Pdf>
  {:else if showTypeVal === 'imgWatermark'}
    <ImgWatermark></ImgWatermark>
  {/if}
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

  .ave-content {
    width: 300px;
    margin: 0 auto;
    margin-top: 80px;
  }
  .ave-content .ave-layout {
    width: 100%;
    height: auto;
    display: flex;
  }
  .ave-content .ave-layout .ave-item {
    flex: auto;
    width: 90px;
    height: 150px;
    cursor: pointer;
  }
  .ave-content .ave-layout .ave-item img {
    width: 84px;
    height: 84px;
  }
</style>
