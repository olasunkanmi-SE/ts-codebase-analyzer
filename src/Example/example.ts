import { TypeScriptCodeMapper } from "../services/typescript-code-mapper.service";

export async function getCodeBase() {
  const code = new TypeScriptCodeMapper();
  let x = await code.buildCodebaseMap();
  return x;
}
