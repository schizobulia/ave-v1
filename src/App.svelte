<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import Setting from "./component/Setting.svelte";
  import { AVE_DOWNLOADDIR_KEY } from "./config";
  import { downloadDirPathStore } from "./store";
  function init() {
    // 初始化下载地址
    const dir = window.localStorage.getItem(AVE_DOWNLOADDIR_KEY);
    if (dir) {
      downloadDirPathStore.set(decodeURIComponent(dir));
    } else {
      downloadDir()
        .then((data) => {
          downloadDirPathStore.set(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }
  init()
</script>

<div>
  <Setting />
  <Router {routes} />
</div>
