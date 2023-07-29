const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const urlConfig = require('../config/index')

const VERSION = '0.1.2'
const NOTES = '更新内容:'

/**
 * 本地打包实现，目前不在使用
 * @returns 
 */
function main () {
  // 1、修改src-tauri/tauri.conf.json中的版本号和pubkey
  const tauri_json = path.join(__dirname, '../', 'src-tauri/tauri.conf.json')
  const pub_key = fs.readFileSync(`${process.env.HOME || process.env.USERPROFILE}/.tauri/ave.key.pub`).toString()
  const tauri_json_data = JSON.parse(fs.readFileSync(tauri_json, 'utf-8'))
  tauri_json_data.package.version = VERSION
  tauri_json_data.tauri.updater.pubkey = pub_key
  fs.writeFileSync(tauri_json, JSON.stringify(tauri_json_data))
  // 2、yarn tauri build
  const output = child_process.execSync('yarn tauri build')
  console.log(output)
  if (process.platform === 'linux') {
    return // linux目前无法设置自动更新
  }
  // 3、获取xxx.sig文件内容
  const mac_sign_file = path.join(__dirname, '../', 'src-tauri/target/release/bundle/macos/ave.app.tar.gz.sig')
  const mac_sign_file_data = fs.readFileSync(mac_sign_file).toString()
  // 4、修改update.json中的内容
  const update_json = {
    version: VERSION,
    notes: NOTES,
    pub_date: new Date().toISOString(),
    platforms: {
      "darwin-aarch64": {
        "signature": mac_sign_file_data,
        "url": `${urlConfig.serviceUrl}/ave.app.tar.gz`
      }
    }
  }
  fs.writeFileSync('update.json', JSON.stringify(update_json))
}

main()