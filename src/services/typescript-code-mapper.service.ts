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
} from "../interfaces";
import { logError } from "../utils";
import { ITypeScriptCodeMapper } from "../interfaces/ts.code.mapper.interface";
import { Result } from "../result";

export class TypeScriptCodeMapper implements ITypeScriptCodeMapper {
  public program: ts.Program | undefined;
  public typeChecker: ts.TypeChecker | undefined;

  constructor() {
    this.initializeTypescriptProgram();
  }

  /**
   * Initializes a TypeScript program by reading the TS configuration file and creating a new program instance.
   * This method sets up the program and type checker for further compilation and analysis.
   */
  private initializeTypescriptProgram() {
    try {
      const rootDir: string = process.cwd();
      const tsConfigPath: string = path.join(rootDir, "tsconfig.json");

      const configFile: {
        config?: any;
        error?: ts.Diagnostic;
      } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

      const compilerOptions: ts.ParsedCommandLine =
        ts.parseJsonConfigFileContent(configFile.config, ts.sys, rootDir);

      this.program = ts.createProgram(
        compilerOptions.fileNames,
        compilerOptions.options
      );

      this.typeChecker = this.program.getTypeChecker();
    } catch (error: any) {
      logError(error, "initializeTypescriptProgram", "");
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
  extractClassMetaData(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): Result<IClassInfo> {
    try {
      const className: string | undefined = node?.name?.getText(sourceFile);
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
      return Result.ok(classInfo);
    } catch (error: any) {
      logError(error, "extractClassInfo", { node, sourceFile });
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
  private processClassMembers(
    node: ts.ClassDeclaration | ts.Node,
    sourceFile: ts.SourceFile,
    info: IClassInfo | IModuleInfo,
    member?: ts.ClassElement
  ): void {
    const currentElement = member ? member : node;
    if (
      ts.isMethodDeclaration(currentElement) ||
      ts.isFunctionDeclaration(currentElement)
    ) {
      const functionInfo: IFunctionInfo | null =
        this.getFunctionDetails(currentElement, sourceFile)?.getValue() ?? null;
      if (functionInfo) {
        info?.functions?.push(functionInfo);
      }
    }

    if (ts.isPropertyDeclaration(currentElement)) {
      const propertyInfo = this.extractPropertyParameters(
        currentElement,
        sourceFile
      ).getValue();
      if (propertyInfo) {
        info?.properties?.push(propertyInfo);
      }
    }

    if (ts.isInterfaceDeclaration(node)) {
      const interfaceInfo = this.extractInterfaceInfo(
        node,
        sourceFile
      ).getValue();
      if (interfaceInfo) {
        info?.interfaces?.push(interfaceInfo);
      }
    }

    if (ts.isEnumDeclaration(node)) {
      const enumInfo = this.extractEnumInfo(node, sourceFile).getValue();
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
  ): Result<IProperty> {
    try {
      const name: string = node.name.getText(sourceFile);
      let type;

      if (node.type) {
        type = this.getTypeAtLocation(node).getValue();
      } else {
        const inferredType: ts.Type | undefined =
          this.typeChecker?.getTypeAtLocation(node);
        type = inferredType
          ? this.typeChecker?.typeToString(inferredType)
          : undefined;
      }
      const property = {
        name,
        type,
      };
      return Result.ok(property);
    } catch (error: any) {
      logError(error, "extractPropertyParameters", { node, sourceFile });
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
  ): Result<IProperty[]> {
    const properties = node.parameters.map((param) => {
      const name = param.name.getText(sourceFile);
      const type = param.type
        ? this.getTypeAtLocation(param).getValue()
        : undefined;
      return {
        name,
        type,
      };
    });
    return Result.ok(properties);
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
  ): Result<IFunctionInfo> | null {
    try {
      if (!node.name) {
        return null;
      }

      const name: string = node.name.getText(sourceFile);
      const content: string = this.getPrintedNode(node, sourceFile);
      const parameters: IProperty[] = this.extractFunctionParameters(
        node,
        sourceFile
      ).getValue();
      const details = this.functionDetailsMapper(
        name,
        content,
        parameters,
        node
      );
      return Result.ok(details);
    } catch (error: any) {
      logError(error, "extractFunctionInfo", { node, sourceFile });
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
      returnType: node.type ? this.getTypeAtLocation(node).getValue() : "any",
      comments: this.getComment(node),
    };
  }

  /**
   * Retrieves the type of a given function or method declaration.
   *
   * @param node A function or method declaration node.
   * @returns A string representation of the function or method type, or undefined if type checking is unavailable.
   */
  getTypeAtLocation(
    node:
      | ts.FunctionDeclaration
      | ts.MethodDeclaration
      | ts.ParameterDeclaration
      | ts.PropertyDeclaration
      | ts.PropertySignature
  ): Result<string | undefined> {
    const type = this.typeChecker?.typeToString(
      this.typeChecker.getTypeAtLocation(node)
    );
    return Result.ok(type);
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
    const printer: ts.Printer = ts.createPrinter({
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
      dependencies: this.buildDependencyGraph(sourceFile),
    };
  }

  /**
   * Builds a hierarchical map of the codebase by traversing TypeScript files
   * and extracting module and class information.
   */
  async buildCodebaseMap(): Promise<Result<ICodebaseMap>> {
    const rootDir: string = process.cwd();
    const codebaseMap: ICodebaseMap = {};
    const repoNames: string = path.basename(rootDir);
    codebaseMap[repoNames] = { modules: {} };

    const tsFiles: string[] = await this.getTsFiles();
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
          const classInfo = this.extractClassMetaData(
            node,
            sourceFile
          ).getValue();
          if (classInfo) {
            moduleInfo?.classes?.push(classInfo);
          }
        }
        this.processClassMembers(node, sourceFile, moduleInfo);
        codebaseMap[repoNames].modules[moduleRalativePath] = moduleInfo;
      });
    });
    return Result.ok(codebaseMap);
  }

  extractInterfaceInfo(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile
  ): Result<IInterfaceInfo> {
    try {
      const interfaceName: string = node.name.getText(sourceFile);

      const properties: IProperty[] = node.members
        .filter(ts.isPropertySignature)
        .map((prop) => {
          const name = prop.name.getText(sourceFile);
          const type = prop.type
            ? this.getTypeAtLocation(prop).getValue()
            : "any";
          return { name, type };
        });

      return Result.ok({
        name: interfaceName,
        properties,
        summary: this.getComment(node),
      });
    } catch (error: any) {
      logError(error, "extractInterfaceInfo", {
        node,
        sourceFile,
      });
      throw Error(error);
    }
  }

  extractEnumInfo(
    node: ts.EnumDeclaration,
    sourceFile: ts.SourceFile
  ): Result<IEnumInfo> {
    const enumName = node.name.getText(sourceFile);
    const members = node.members.map((member) => {
      const name = member.name.getText(sourceFile);
      const value = member.initializer
        ? member.initializer.getText(sourceFile)
        : undefined;
      return { name, value };
    });

    return Result.ok({
      name: enumName,
      members: members,
      summary: this.getComment(node),
    });
  }

  buildDependencyGraph(sourceFile: ts.SourceFile): string[] {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    return imports.map((i) => {
      return ts
        .createPrinter()
        .printNode(ts.EmitHint.Unspecified, i, sourceFile);
    });
  }
}
