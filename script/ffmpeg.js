const compressing = require('compressing');
const fs= require('fs')
const path = require('path')
const urllib = require('urllib');
const config = require('../config/index')

const platform = process.platform

async function main () {
  let tag = `${process.argv.slice(2)}`.substring(1)
  const tauri_json = path.join(__dirname, '../', 'src-tauri/tauri.conf.json')
  const tauri_json_data = JSON.parse(fs.readFileSync(tauri_json, 'utf-8'))
  tauri_json_data.package.version = `${tag || '0.0.1'}`
  // tauri_json_data.tauri.updater.endpoints = [config.serviceUrl + 'update.json']
  fs.writeFileSync(tauri_json, JSON.stringify(tauri_json_data))

  let arg = ''
  if (platform === 'darwin') {
    arg = 'mac'
  } else if (platform === 'linux') {
    arg = 'ubuntu'
  } else if (platform === 'win32') {
    arg = 'win'
  }
  const url = `${config.ffmpegZip}/ave/${arg}/ffmpeg.zip`
  const dir = path.join(__dirname, '../', 'src-tauri/bin')
  await fs.mkdirSync(dir)
  const tmp = path.join(dir, 'test.zip')
  return urllib.request(url, {
    streaming: true,
    followRedirect: true,
  })
  .then(async result => {
    const r = result.res.pipe(fs.createWriteStream(tmp))
    r.on('finish', () => {
      console.log('ffmpeg finish')
      compressing.zip.uncompress(tmp, dir).then(() => {
        console.log('unzip ffmpeg success');
        getAveJava(arg, dir)
        }).catch(console.error);
    })
    r.on('error', ((err) => {
      console.error(err)
    }))
  })
  .then(() => {
    console.log('get ffmpeg done')
  })
  .catch(console.error);
}

function getAveJava(arg, dir) {
  let url = ''
  let name = ''
  if (arg === 'darwin' || arg === 'mac') {
    let arch = process.arch
    name = 'ave_java-x86_64-apple-darwin'
    url = `https://github.com/schizobulia/ave_java/releases/download/v0.0.1/ave_java`
    if (arch === 'arm64' || arch === 'arm') {
      name = 'ave_java-aarch64-apple-darwin'
    }
  } else if (arg === 'linux') {
    name = 'ave_java-x86_64-unknown-linux-gnu'
    url = `https://github.com/schizobulia/ave_java/releases/download/v0.0.1/ave_java_sh`
  } else if (arg === 'win') {
    name = 'ave_java-x86_64-pc-windows-msvc.exe'
    url = `https://github.com/schizobulia/ave_java/releases/download/v0.0.1/ave_java.exe`
  }
  urllib.request(url, {
    streaming: true,
    followRedirect: true,
  }).then((result) => {
    const tmp = path.join(dir, name)
    const r = result.res.pipe(fs.createWriteStream(tmp))
    r.on('finish', () => {
      console.log('ave_java finish')
    })
    r.on('error', ((err) => {
      console.error(err)
    }))
  }).catch(console.error)
}

main()