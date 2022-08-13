import { Command } from "@tauri-apps/api/shell";

async function getMetadata (input: string, cb: void) {
  let res: string = "";
  const ffprobe = Command.sidecar("bin/ffprobe", [
    input,
    "-show_streams",
    "-show_format"
  ]);
  ffprobe.on("close", async ({ code }) => {
    var data = parseFfprobeOutput(res);
    // @ts-ignore
    void cb(data)
  });

  ffprobe.on("error", async (error) => {
  });

  ffprobe.stdout.on("data", (line: string) => {
    res += line + '\r\n';
  });

  ffprobe.stderr.on("data", (line) => {
  });
  await ffprobe.execute();
}

function parseFfprobeOutput(out) {
  var lines = out.split(/\r\n|\r|\n/);
  lines = lines.filter(function (line) {
    return line.length > 0;
  });

  var data = {
    streams: [],
    format: {},
    chapters: []
  };

  function parseBlock(name) {
    var data = {};

    var line = lines.shift();
    while (typeof line !== 'undefined') {
      if (line.toLowerCase() == '[/'+name+']') {
        return data;
      } else if (line.match(/^\[/)) {
        line = lines.shift();
        continue;
      }

      var kv = line.match(/^([^=]+)=(.*)$/);
      if (kv) {
        if (!(kv[1].match(/^TAG:/)) && kv[2].match(/^[0-9]+(\.[0-9]+)?$/)) {
          data[kv[1]] = Number(kv[2]);
        } else {
          data[kv[1]] = kv[2];
        }
      }

      line = lines.shift();
    }

    return data;
  }

  var line = lines.shift();
  while (typeof line !== 'undefined') {
    if (line.match(/^\[stream/i)) {
      var stream = parseBlock('stream');
      data.streams.push(stream);
    } else if (line.match(/^\[chapter/i)) {
      var chapter = parseBlock('chapter');
      data.chapters.push(chapter);
    } else if (line.toLowerCase() === '[format]') {
      data.format = parseBlock('format');
    }

    line = lines.shift();
  }

  return data;
}

export { getMetadata }