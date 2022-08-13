<script lang="ts">
  import { querystring } from 'svelte-spa-router'
  import { convertFileSrc } from '@tauri-apps/api/tauri';
  import VideoPlayer from 'svelte-video-player';

  const source = [];
  querystring.subscribe((value) => {
    source.push(convertFileSrc(value.substring(5)))
  })
</script>
<div style="margin-top: 15px;"></div>
<a href="/">Home</a>
<div style="margin-top: 10px;"></div>
{#if source.length}
  <VideoPlayer {source}  width="500" height="320" />
{/if}