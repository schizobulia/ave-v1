import { Command } from "@tauri-apps/api/shell";
import Swal from 'sweetalert2';

class PdfTool {
  input: string;
  output: string;
  constructor(input: string, output: string) {
    this.input = input;
    this.output = output
  }

  async pdfMerge() {
    const pdf = Command.sidecar("bin/ave_java", [
      '-t',
      'pdf',
      '-data',
      JSON.stringify(this.input),
      '-output',
      this.output
    ]);
    pdf.on("close", async ({ code }) => {
      if (code) {
        Swal.fire('转换失败')
      } else {
        Swal.fire('转换成功')
      }
    });
  
    pdf.on("error", async (error) => {
      Swal.fire("文件转换错误");
    });
  
    pdf.stdout.on("data", (line) =>{
      console.log(line)
    });
  
    pdf.stderr.on("data", (line) => {
      console.log(line)
    });
    await pdf.spawn();
  }
}


export {
  PdfTool
}