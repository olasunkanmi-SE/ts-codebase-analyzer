import { TypeScriptCodeMapper } from "../ts-code-analyser";

export async function getCodeBase() {
  const code = new TypeScriptCodeMapper();
  let x = await code.buildCodebaseMap();
  return x;
}
