const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu')
const urllib = require('urllib');
const urlConfig = require('../config/index')

let macSign = ''
let winSing = ''
function main () {
  console.log('tag: ', process.argv.slice(2))
  const url = urlConfig.serviceUrl
  uploadSign(`${url}ave.app.tar.gz.sig`, (macs) => {
    macSign = macs
    uploadSign(`${url}ave_x64_en-US.msi.zip.sig`, (wins) => {
      winSing = wins
      uploadUpdateFile()
    })
  })
}

function uploadSign (url, cb) {
  urllib.request(url, {
    streaming: true,
    followRedirect: true,
  })
  .then(result => {
    const sigTmpFile = path.join(__dirname, 'tmp')
    const buffer = fs.createWriteStream(sigTmpFile)
    const r = result.res.pipe(buffer)
    r.on('finish', () => {
      const t = fs.readFileSync(sigTmpFile).toString()
      fs.rmSync(sigTmpFile)
      cb(t)
    })
  }).catch((err) => {
    console.error(err)
  })
}

function uploadUpdateFile () {
  const filename = 'update.json'
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  const options = {
    scope: 'ave' + ':' + filename
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_na0;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  const localFile = path.join(__dirname, '../update.json')
  const updateJson = {
    version: process.argv.slice(2),
    notes: "添加新功能",
    pub_date: new Date().toISOString(),
    platforms: {
      "darwin-x86_64": {
        "signature": macSign,
        "url": `${urlConfig.serviceUrl}ave.app.tar.gz`
      },
      "windows-x86_64": {
        "signature": winSing,
        "url": `${urlConfig.serviceUrl}ave_x64_en-US.msi.zip`
      }
    }
  }
  fs.writeFileSync(localFile, JSON.stringify(updateJson))
  formUploader.putFile(uploadToken, filename, localFile, putExtra, (err, respBody, respInfo) => {
    if (err) {
      throw err;
    }
    if (respInfo.statusCode == 200) {
      console.log(respBody);
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  })
}

main()
