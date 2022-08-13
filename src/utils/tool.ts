
function getArgByStr(input: string): Array<string> {
  return input.trim().split(/\s+/)
}

export {
  getArgByStr
}