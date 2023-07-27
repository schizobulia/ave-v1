import { Command } from "@tauri-apps/api/shell";

class FFPlayer {
  input: string;
  constructor(input: string) {
    this.input = input;
  }

  async play() {
    const ffplay = Command.sidecar("bin/ffplay", [
      this.input
    ]);
    await ffplay.execute();
  }
}

export {
  FFPlayer
}