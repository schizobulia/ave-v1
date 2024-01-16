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
  const ff = {
    mac: ['ffmpeg-x86_64-apple-darwin', 'ffplay-x86_64-apple-darwin', 'ffprobe-x86_64-apple-darwin'],
    win: ['ffmpeg-x86_64-pc-windows-msvc.exe', 'ffplay-x86_64-pc-windows-msvc.exe', 'ffprobe-x86_64-pc-windows-msvc.exe'],
  }
  const urlRes = ff[arg]
  const dir = path.join(__dirname, '../', 'src-tauri/bin')
  if (!fs.existsSync(dir)) {
    await fs.mkdirSync(dir)
  }
  for (let index = 0; index < urlRes.length; index++) {
    const ele = urlRes[index]
    const tmp = path.join(dir, ele)
    const url = `${config.ffmpegZip}/${ele}`
    await getFfmpeg(url, tmp)
    console.log(ele)
  }
  await getAveJava(arg, dir)
}

async function getFfmpeg(url, tmp) {
  return new Promise((resolve, reject) => {
    urllib.request(url, {
      streaming: true,
      followRedirect: true,
    }).then(async result => {
      const r = result.res.pipe(fs.createWriteStream(tmp))
      r.on('finish', () => {
        resolve(r)
      })
      r.on('error', ((err) => {
        reject(err)
      }))
    }).catch((err) => {
      reject(err)
    });
  })
}

async function getAveJava(arg, dir) {
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
  return new Promise((resolve, reject) => {
    urllib.request(url, {
      streaming: true,
      followRedirect: true,
    }).then((result) => {
      const tmp = path.join(dir, name)
      const r = result.res.pipe(fs.createWriteStream(tmp))
      r.on('finish', () => {
        console.log('ave_java finish')
        resolve(true)
      })
      r.on('error', ((err) => {
        console.error(err)
        reject(err)
      }))
    }).catch((err) => {
      console.error(err)
      reject(err)
    })
  })
}

main()