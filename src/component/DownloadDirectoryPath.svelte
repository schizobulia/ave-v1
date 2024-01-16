<script>
    export let downloadDirectoryPath;
  </script>
  
  <style>
    div {
      position: fixed;
      bottom: 20px;
      right: 10px;
      cursor: pointer;
      width: 450px;
      overflow: hidden;
      text-align: right;
      height: 20px;
      word-break: break-all;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  </style>
  
  <div>
    文件保存地址: {downloadDirectoryPath}
  </div>
  