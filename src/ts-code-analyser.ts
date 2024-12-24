import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";
import * as ts from "typescript";
import {
  IClassInfo,
  ICodebaseMap,
  IEnumInfo,
  IFunctionInfo,
  IInterfaceInfo,
  IModuleInfo,
  IProperty,
  TNode,
} from "./interfaces";
import { handleErrorLog } from "./utils";

export class TypeScriptCodeMapper {
  private program: ts.Program | undefined;
  private typeChecker: ts.TypeChecker | undefined;

  constructor() {
    this.initializeTypescriptProgram();
  }

  /**
   * Initializes a TypeScript program by reading the TS configuration file and creating a new program instance.
   * This method sets up the program and type checker for further compilation and analysis.
   */
  initializeTypescriptProgram() {
    try {
      const rootDir = process.cwd();
      const tsConfigPath = path.join(rootDir, "tsconfig.json");
      const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
      const compilerOptions = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        rootDir
      );
      this.program = ts.createProgram(
        compilerOptions.fileNames,
        compilerOptions.options
      );
      this.typeChecker = this.program.getTypeChecker();
    } catch (error: any) {
      handleErrorLog(error, "initializeTypescriptProgram", "");
      throw Error(error);
    }
  }

  /**
   * Extracts information about a TypeScript class declaration.
   * This function iterates over the members of the class, identifying methods,
   * properties, interfaces, and enums, and compiles this information into an IClassInfo object.
   *
   * @param node The TypeScript class declaration to extract information from.
   * @param sourceFile The source file containing the class declaration.
   * @returns An IClassInfo object containing the name, methods, properties, interfaces, and enums of the class.
   */
  extractClassMetaData(node: ts.ClassDeclaration, sourceFile: ts.SourceFile) {
    try {
      const className = node?.name?.getText(sourceFile);
      const classInfo: IClassInfo = {
        name: className,
        functions: [],
        properties: [],
        interfaces: [],
        enums: [],
      };

      node.members.forEach((member) => {
        this.processClassMembers(node, sourceFile, classInfo, member);
      });
      return classInfo;
    } catch (error: any) {
      handleErrorLog(error, "extractClassInfo", { node, sourceFile });
      throw Error(error);
    }
  }

  /**
   * Retrieves and processes child elements of a class declaration, extracting
   * relevant information about methods, properties, interfaces, and enums.
   *
   * @param node The class declaration node to process.
   * @param member The current class element being processed.
   * @param sourceFile The source file containing the class declaration.
   * @param index The current index within the class declaration.
   * @param classInfo The object to store extracted class information.
   */
  processClassMembers(
    node: ts.ClassDeclaration | ts.Node,
    sourceFile: ts.SourceFile,
    info: IClassInfo | IModuleInfo,
    member?: ts.ClassElement
  ): void {
    const nodeOrMember = member ? member : node;
    if (
      ts.isMethodDeclaration(nodeOrMember) ||
      ts.isFunctionDeclaration(nodeOrMember)
    ) {
      const functionInfo = this.getFunctionDetails(nodeOrMember, sourceFile);
      if (functionInfo) {
        info?.functions?.push(functionInfo);
      }
    }

    if (ts.isPropertyDeclaration(nodeOrMember)) {
      const propertyInfo = this.extractPropertyParameters(
        nodeOrMember,
        sourceFile
      );
      if (propertyInfo) {
        info?.properties?.push(propertyInfo);
      }
    }

    if (ts.isInterfaceDeclaration(node)) {
      const interfaceInfo = this.extractInterfaceInfo(node, sourceFile);
      if (interfaceInfo) {
        info?.interfaces?.push(interfaceInfo);
      }
    }

    if (ts.isEnumDeclaration(node)) {
      const enumInfo = this.extractEnumInfo(node, sourceFile);
      if (enumInfo) {
        info?.enums?.push(enumInfo);
      }
    }
  }

  /**
   * Extracts property information from a TypeScript property declaration.
   *
   * This function takes a node representing a property declaration and its source file,
   * and returns an object containing the property's name and type. If the type is not
   * explicitly specified, it is inferred from the property declaration.
   *
   * @param node
   * @param sourceFile
   * @returns An object with 'name' and 'type' properties.
   */
  extractPropertyParameters(
    node: ts.PropertyDeclaration,
    sourceFile: ts.SourceFile
  ): IProperty {
    try {
      const propertyName = node.name.getText(sourceFile);
      let type;

      if (node.type) {
        type = this.typeChecker?.typeToString(
          this.typeChecker.getTypeAtLocation(node.type)
        );
      } else {
        const inferredType = this.typeChecker?.getTypeAtLocation(node);
        type = inferredType
          ? this.typeChecker?.typeToString(inferredType)
          : undefined;
      }
      return {
        name: propertyName,
        type: type,
      };
    } catch (error: any) {
      handleErrorLog(error, "extractPropertyParameters", { node, sourceFile });
      throw Error(error);
    }
  }

  /**
   * Extracts the parameters of a function from a given node.
   *
   * @param node The node containing the function parameters.
   * @param sourceFile The source file containing the node.
   * @returns An array of function parameter objects.
   */
  extractFunctionParameters(
    node: ts.FunctionDeclaration | ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ): IProperty[] {
    return node.parameters.map((param) => {
      const name = param.name.getText(sourceFile);
      const type = param.type ? this.getFunctionTypes(param) : undefined;
      return {
        name,
        type,
      };
    });
  }

  /**
   * Extracts and returns function details from a given function declaration or method declaration node.
   *
   * @param node The function declaration or method declaration node to extract details from.
   * @param sourceFile The source file containing the node.
   * @returns An object containing function details, or null if the node has no name.
   */
  getFunctionDetails(
    node: ts.FunctionDeclaration | ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ): IFunctionInfo | null {
    try {
      if (!node.name) {
        return null;
      }

      const functionName = node.name.getText(sourceFile);
      const functionContent = this.getPrintedNode(node, sourceFile);
      const parameters = this.extractFunctionParameters(node, sourceFile);
      return this.functionDetailsMapper(
        functionName,
        functionContent,
        parameters,
        node
      );
    } catch (error: any) {
      handleErrorLog(error, "extractFunctionInfo", { node, sourceFile });
      throw Error(error);
    }
  }

  /**
   * Maps a function declaration or method declaration to a details object,
   * extracting relevant information such as name, content, parameters, return type, and comments.
   *
   * @param name The name of the function.
   * @param content The content of the function.
   * @param parameters An array of property definitions for the function parameters.
   * @param node The TypeScript function or method declaration node.
   * @returns An object containing the function details.
   */
  private functionDetailsMapper(
    name: string,
    content: string,
    parameters: IProperty[],
    node: ts.FunctionDeclaration | ts.MethodDeclaration
  ) {
    return {
      name,
      content,
      parameters,
      returnType: node.type ? this.getFunctionTypes(node) : "any",
      comments: this.getComment(node),
    };
  }

  /**
   * Retrieves the type of a given function or method declaration.
   *
   * @param node A function or method declaration node.
   * @returns A string representation of the function or method type, or undefined if type checking is unavailable.
   */
  getFunctionTypes(
    node:
      | ts.FunctionDeclaration
      | ts.MethodDeclaration
      | ts.ParameterDeclaration
  ) {
    return this.typeChecker?.typeToString(
      this.typeChecker.getTypeAtLocation(node)
    );
  }

  /**
   * Retrieves and concatenates JSDoc comments associated with a given TypeScript node.
   *
   * @param {TNode} node - The TypeScript node to extract comments from.
   * @returns {string} Concatenated JSDoc comments.
   */
  getComment(node: TNode): string {
    return ts
      .getJSDocCommentsAndTags(node)
      .map((comment) => comment.comment || "")
      .join("\n");
  }

  /**
   * Generates a string representation of a given function or method declaration node.
   * This method leverages the TypeScript printer to produce a source code string,
   * removing any comments and using line feed as the new line character.
   *
   * @param node The function or method declaration node to be printed.
   * @param sourceFile The source file that contains the node to be printed.
   * @returns A string representation of the given node.
   */
  getPrintedNode(
    node: ts.FunctionDeclaration | ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ) {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: true,
    });
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }

  /**
   * Finds the root directory of a project by searching for a 'package.json' file
   * starting from the given current directory and traversing up the directory tree.
   *
   * @param {string} [currentDir=process.cwd()] - The directory to start searching from.
   * @returns {string} The root directory of the project, or the current working directory if no 'package.json' file is found.
   */
  findProjectRoot(currentDir: string = process.cwd()): string {
    while (currentDir !== path.parse(currentDir).root) {
      const packageJsonPath = path.join(currentDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  /**
   * Retrieves a list of TypeScript files, excluding test and mock files.
   * @returns A promise that resolves with a list of TypeScript files.
   */
  async getTsFiles(): Promise<string[]> {
    return await glob("**/!(*.d|*.spec|*.test|*.mock).ts?(x)", {
      ignore: ["node_modules/**", "dist/**", ".env"],
    });
  }

  /**
   * Extracts module information from a TypeScript source file.
   *
   * @param sourceFile The TypeScript source file.
   * @param relativePath The relative path of the module.
   * @returns The module information.
   */
  private extractModuleInfo(
    sourceFile: ts.SourceFile,
    relativePath: string
  ): IModuleInfo {
    return {
      path: relativePath,
      classes: [],
      functions: [],
      interfaces: [],
      enums: [],
      imports: this.extractImports(sourceFile),
    };
  }

  /**
   * Builds a hierarchical map of the codebase by traversing TypeScript files
   * and extracting module and class information.
   */
  async buildCodebaseMap(): Promise<ICodebaseMap> {
    const rootDir = process.cwd();
    const codebaseMap: ICodebaseMap = {};
    const repoNames = path.basename(rootDir);
    codebaseMap[repoNames] = { modules: {} };

    const tsFiles = await this.getTsFiles();
    tsFiles.forEach((filePath) => {
      const moduleRalativePath = path.relative(rootDir, filePath);
      const sourceFile = this.program?.getSourceFile(filePath);

      if (!sourceFile) {
        throw Error(`No source file found for ${filePath}`);
      }

      const moduleInfo: IModuleInfo = this.extractModuleInfo(
        sourceFile,
        moduleRalativePath
      );
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node)) {
          const classInfo = this.extractClassMetaData(node, sourceFile);
          if (classInfo) {
            moduleInfo?.classes?.push(classInfo);
          }
        }
        this.processClassMembers(node, sourceFile, moduleInfo);
        codebaseMap[repoNames].modules[moduleRalativePath] = moduleInfo;
      });
    });
    return codebaseMap;
  }

  extractInterfaceInfo(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile
  ): IInterfaceInfo {
    try {
      const interfaceName = node.name.getText(sourceFile);
      const properties = node.members
        .filter(ts.isPropertySignature)
        .map((prop) => {
          const name = prop.name.getText(sourceFile);
          const type = prop.type
            ? this.typeChecker?.typeToString(
                this.typeChecker.getTypeAtLocation(prop.type)
              )
            : "any";
          return { name, type };
        });
      return {
        name: interfaceName,
        properties,
        summary: this.getComment(node),
      };
    } catch (error: any) {
      handleErrorLog(error, "extractInterfaceInfo", {
        node,
        sourceFile,
      });
      throw Error(error);
    }
  }

  extractEnumInfo(
    node: ts.EnumDeclaration,
    sourceFile: ts.SourceFile
  ): IEnumInfo {
    const enumName = node.name.getText(sourceFile);
    const members = node.members.map((member) => {
      const name = member.name.getText(sourceFile);
      const value = member.initializer
        ? member.initializer.getText(sourceFile)
        : undefined;
      return { name, value };
    });

    return {
      name: enumName,
      members: members,
      summary: this.getComment(node),
    };
  }

  extractImports(sourceFile: ts.SourceFile): string[] {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    return imports.map((i) => {
      return ts
        .createPrinter()
        .printNode(ts.EmitHint.Unspecified, i, sourceFile);
    });
  }
}
