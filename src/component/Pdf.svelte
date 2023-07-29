<script>
  import { open } from '@tauri-apps/api/dialog';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Swal from "sweetalert2";
  import { PdfTool } from '../utils/pdf';
  import { downloadDirPathStore } from '../store';
  import { join} from "@tauri-apps/api/path";
  let files = []
  let downloadDirPath = ''
  async function getPdf() {
    const selectedPath = await open({
      multiple: true,
      filters: [{
        name: 'PDF',
        extensions: ['pdf']
      }]
    });
    if (Array.isArray(selectedPath)) {
      files = [...files, ...selectedPath].map((ele) => {
        return { name: ele.name ? ele.name : ele, select: false }
      })
    }
  }

  function selectItem(e) {
    const tag = files[e].select
    files[e].select = !tag
  }

  function init() {
    downloadDirPathStore.subscribe(value => {
		  downloadDirPath = decodeURIComponent(value);
	  });
  }
  init()
  async function start() {
    const input = files.map((ele) => {
      return ele.name
    })
    new PdfTool(input, await join(downloadDirPath, 'output.pdf')).pdfMerge()
  }

  function deletePdf() {
    let tag = files.find((ele) => {
      return ele.select
    })
    if (!tag) {
      Swal.fire({
        title: "未选中文件",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    files = files.filter((ele) => {
      return !ele.select
    })
  }
</script>


<div class="pdf-content">
  <div class="list">
    {#each files as f, i}
      <div class="item {f.select ? 'select' : ''}" on:click={selectItem.bind(this, i)}>
        {f.name}
      </div>
    {/each}

  </div>
  <Wrapper>
    <div class="add action" on:click={getPdf}></div>
  <Tooltip>可单选、多选，多次选择</Tooltip>
  </Wrapper>
  <div class="start action" on:click={start}></div>
  <Wrapper>
    <div class="delete action" on:click={deletePdf}></div>
    <Tooltip>删除选中的文件</Tooltip>
  </Wrapper>
</div>

<style>
  .pdf-content {
    width: 80%;
    height: auto;
    margin: 0 auto;
    margin-top: 20px;
  }

  .pdf-content .list {
    /* display: flex; */
  }
  .pdf-content .list .item {
    width: 100%;
    height: 30px;
    line-height: 30px;
    border: 1px solid rgb(66, 63, 63);
    display: inline-block;
    word-break: break-all;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    margin-left: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
  .pdf-content .list .select {
    border: 2px solid blue;
  }

  .pdf-content .action {
    cursor: pointer;
    background-size: 100% 100%;
    background-position: center;
    width: 30px;
    height: 30px;
    position: fixed;
    bottom: 50px;
  }
  .pdf-content .add {
    background: url(/static/add.svg) no-repeat;
    background-size: 100% 100%;
    right: 110px;
  }
  .pdf-content .start {
    background: url(/static/start.svg) no-repeat;
    background-size: 100% 100%;
    right: 70px;
  }
  .pdf-content .delete {
    background: url(/static/delete.svg) no-repeat;
    background-size: 100% 100%;
    right: 30px;
  }
</style>