const qiniu = require('qiniu')
const path = require('path')
const fs = require('fs')

function main() {
  let tag = `${process.argv.slice(2)}`.substring(1)
  console.log('tag: ', tag)
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  let localFile = ''
  let prox = ''

  let sigFile = ''
  let sigProx = ''

  let apkFile = ''
  let sigApk = ''
  if (process.platform === 'darwin') {
    localFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/macos/ave.app.tar.gz`)
    sigFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/macos/ave.app.tar.gz.sig`)
    apkFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/dmg/ave_${tag}_x64.dmg`)
    prox = 'ave.app.tar.gz'
    sigProx = 'ave.app.tar.gz.sig'
    sigApk = 'ave_x64.dmg'
  } else if (process.platform === 'win32') {
    localFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/msi/ave_${tag}_x64_en-US.msi.zip`)
    sigFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/msi/ave_${tag}_x64_en-US.msi.zip.sig`)
    apkFile = path.join(__dirname, '../', `src-tauri/target/release/bundle/msi/ave_${tag}_x64_en-US.msi`)
    prox = 'ave_x64_en-US.msi.zip'
    sigProx = 'ave_x64_en-US.msi.zip.sig'
    sigApk = 'ave_x64_en-US.msi'
  }

  const filename = prox

  uploadZipFile(filename, mac, localFile, () => {
    uploadSigFile(sigProx, mac, sigFile, () => {
      uploadZipFile(sigApk, mac, apkFile, () => {})
    })
  })
}

function uploadZipFile (filename, mac, localFile, cb) {
  const options = {
    scope: 'ave' + ':' + filename
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_na0;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  formUploader.putFile(uploadToken, filename, localFile, putExtra, (err, respBody, respInfo) => {
    if (err) {
      throw err;
    }
    if (respInfo.statusCode == 200) {
      console.log(respBody);
      cb()
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  })
}

function uploadSigFile (filename, mac, localFile, cb) {
  const options = {
    scope: 'ave' + ':' + filename
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_na0;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  formUploader.putFile(uploadToken, filename, localFile, putExtra, (err, respBody, respInfo) => {
    if (err) {
      throw err;
    }
    if (respInfo.statusCode == 200) {
      console.log(respBody);
      cb()
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  })
}

main()
