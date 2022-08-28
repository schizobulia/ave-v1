<div style="position: fixed;top:20px;right:30px;z-index:100;" on:click={settingClick}>
  <img src='/static/settings.svg' alt="setting"/>
</div>


<Dialog
  bind:open
  aria-labelledby="mandatory-title"
  aria-describedby="mandatory-content"
>
  <Title id="mandatory-title">设置</Title>
  <Content id="mandatory-content">
    <div style="width: 500px;min-height: 300px;">
      <Select bind:qualityVal label="压缩质量" defaultValue={qualityVal}>
        {#each qualityValArr as fruit}
          <Option value={fruit}>{fruit}</Option>
        {/each}
      </Select>
    </div>
  </Content>
  <Actions>
    <Button on:click={closeDialog}>
      <Label>确认</Label>
    </Button>
  </Actions>
</Dialog>

<script>
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  import Button, { Label } from '@smui/button';
  let open = true;
  let qualityValArr = ['高', '中', '低']
  let qualityVal = '中'
  function settingClick () {
    open = true;
    console.log('======')
  }

  function closeDialog () {
    open = false;
  }

  function qualityChange () {
    console.log('==1====')
  }
</script>