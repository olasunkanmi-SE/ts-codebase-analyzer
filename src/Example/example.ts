import { TypeScriptCodeMapper } from "../services/typescript-code-mapper.service";

export async function getCodeBase() {
  const code = new TypeScriptCodeMapper();
  return await code.buildCodebaseMap();
}
