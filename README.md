
# TypeScript Code Extractor and Analyzer

The **TypeScript Code Extractor and Analyzer** is a robust library designed to parse and analyze TypeScript and JavaScript codebases using the TypeScript Abstract Syntax Tree (AST). It generates a structured, hierarchical representation of your codebase, detailing modules, classes, functions, properties, interfaces, enums, and dependencies. This tool is perfect for developers creating code analysis tools, documentation generators, or AI-driven systems like Retrieval-Augmented Generation (RAG) for codebases.

## Table of Contents
- [TypeScript Code Extractor and Analyzer](#typescript-code-extractor-and-analyzer)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Basic Example](#basic-example)
  - [API Reference](#api-reference)
    - [`TypeScriptCodeMapper`](#typescriptcodemapper)
  - [Data Structures](#data-structures)
    - [Sample `ICodebaseMap` Structure](#sample-icodebasemap-structure)
  - [Examples](#examples)
    - [Analyzing a Single File's Dependencies](#analyzing-a-single-files-dependencies)
    - [Handling Errors](#handling-errors)
  - [Notes](#notes)
  - [Contributing](#contributing)
  - [License](#license)

## Key Features

- **AST-based Class Metadata Extraction**: Captures detailed metadata about classes, including methods, properties, interfaces, and enums.
- **Function and Method Signature Analysis**: Parses function signatures to extract parameters, return types, and JSDoc comments.
- **Interface and Enum Parsing**: Extracts TypeScript-specific constructs for comprehensive type system analysis.
- **Dependency Graph Construction**: Builds a graph of file dependencies by analyzing import declarations.
- **JavaScript Support**: Analyzes JavaScript files with type inference from JSDoc comments when `"allowJs": true` is set in `tsconfig.json`.

## Installation

Install the library using npm:

```bash
npm install @traversets/code-extractor
```

Ensure your project includes a `tsconfig.json` file. For JavaScript projects, add the following to enable parsing:

```json
{
  "compilerOptions": {
    "allowJs": true
  }
}
```

## Getting Started

To begin analyzing your codebase, create an instance of `TypeScriptCodeMapper` and use the `buildCodebaseMap` method to generate a comprehensive map of your codebase. This map is returned as a `Result<ICodebaseMap>`, which you can inspect for success or errors.

### Basic Example

```typescript
import { TypeScriptCodeMapper } from '@traversets/code-extractor';

async function analyzeCodebase() {
  const codeMapper = new TypeScriptCodeMapper();
  const result = await codeMapper.buildCodebaseMap();
  if (result.isOk()) {
    console.log(JSON.stringify(result.getValue(), null, 2));
  } else {
    console.error('Error:', result.getError());
  }
}

analyzeCodebase();
```

This example outputs a JSON structure representing your codebase, including modules, classes, functions, and dependencies.

## API Reference

### `TypeScriptCodeMapper`

The primary class for codebase analysis, offering methods to extract and navigate metadata.

| Method | Description | Parameters | Return Type |
| --- | --- | --- | --- |
| `getRootFileNames()` | Retrieves the list of root file names from the TypeScript program, as specified in `tsconfig.json`. | None | `readonly string[] | undefined` |
| `getSourceFile(fileName: string)` | Retrieves the source file object for a given file name. | `fileName: string` | `ts.SourceFile | undefined` |
| `buildDependencyGraph(sourceFile: ts.SourceFile)` | Builds a dependency graph by extracting import statements from a source file. | `sourceFile: ts.SourceFile` | `string[]` |
| `buildCodebaseMap()` | Generates a hierarchical map of the codebase, including modules, classes, functions, properties, interfaces, enums, and dependencies. | None | `Promise<Result<ICodebaseMap>>` |
| `getProgram()` | Returns the current TypeScript program instance. | None | `ts.Program | undefined` |
| `getTypeChecker()` | Retrieves the TypeScript TypeChecker instance for type analysis. | None | `ts.TypeChecker | undefined` |

**Note**: For `buildCodebaseMap`, check `result.isOk()` to confirm success before accessing `result.getValue()`. Use `result.getError()` to handle errors.

## Data Structures

The library uses interfaces to represent extracted metadata:

| Interface | Description |
| --- | --- |
| `IClassInfo` | Represents a class with its name, functions, properties, interfaces, and enums. |
| `IModuleInfo` | Represents a module (file) with its path, classes, functions, interfaces, enums, and dependencies. |
| `IFunctionInfo` | Represents a function with its name, content, parameters, return type, and comments. |
| `IProperty` | Represents a property with its name and type. |
| `IInterfaceInfo` | Represents an interface with its name, properties, and summary. |
| `IEnumInfo` | Represents an enum with its name, members, and summary. |
| `ICodebaseMap` | A hierarchical map of the codebase, mapping project names to modules. |

### Sample `ICodebaseMap` Structure

```json
{
  "projectName": {
    "modules": {
      "src/index.ts": {
        "path": "src/index.ts",
        "classes": [
          {
            "name": "ExampleClass",
            "functions": [
              {
                "name": "exampleMethod",
                "content": "function exampleMethod(param: string) { ... }",
                "parameters": [
                  {
                    "name": "param",
                    "type": "string"
                  }
                ],
                "returnType": "void",
                "comments": "Example method description"
              }
            ],
            "properties": [
              {
                "name": "exampleProperty",
                "type": "number"
              }
            ],
            "interfaces": [],
            "enums": []
          }
        ],
        "functions": [],
        "interfaces": [],
        "enums": [],
        "dependencies": [
          "import * as fs from 'fs';"
        ]
      }
    }
  }
}
```

## Examples

### Analyzing a Single File's Dependencies

```typescript
import { TypeScriptCodeMapper } from '@traversets/code-extractor';

const codeMapper = new TypeScriptCodeMapper();
const rootFiles = codeMapper.getRootFileNames();
if (rootFiles && rootFiles.length > 0) {
  const sourceFile = codeMapper.getSourceFile(rootFiles[0]);
  if (sourceFile) {
    const dependencies = codeMapper.buildDependencyGraph(sourceFile);
    console.log('Dependencies:', dependencies);
  }
}
```

### Handling Errors

```typescript
import { TypeScriptCodeMapper } from '@traversets/code-extractor';

async function analyzeWithErrorHandling() {
  const codeMapper = new TypeScriptCodeMapper();
  try {
    const result = await codeMapper.buildCodebaseMap();
    if (result.isOk()) {
      console.log('Codebase Map:', JSON.stringify(result.getValue(), null, 2));
    } else {
      console.error('Failed to build codebase map:', result.getError());
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeWithErrorHandling();
```

## Notes

- **JavaScript Support**: The library supports JavaScript parsing by enabling `"allowJs": true` in `tsconfig.json`. Use JSDoc comments (e.g., `/** @returns {number} */`) to enhance type inference.
- **Error Handling**: Methods like `buildCodebaseMap` return a `Result` type. Always check `isOk()` before accessing `getValue()` to handle errors gracefully.
- **Performance**: For large codebases, optimize `tsconfig.json` to include only necessary files, reducing processing time.

## Contributing

Contributions are welcome! Please submit issues or pull requests to the [GitHub Repository](https://github.com/olasunkanmi-SE/ts-codebase-analyzer). Follow the contribution guidelines in the repository for coding standards and testing requirements.

## License

This library is licensed under the MIT License. See the [LICENSE](https://github.com/olasunkanmi-SE/ts-codebase-analyzer/blob/main/LICENSE) file for details.