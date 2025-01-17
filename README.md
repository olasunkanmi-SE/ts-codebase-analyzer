# TypeScript Code Extractor and Analyzer

This project provides an advanced toolkit for parsing TypeScript code using the TypeScript Abstract Syntax Tree (AST) to extract, analyze, and map code structures.

TypeScript Code Extractor and Analyzer is a robust system that utilizes a TypeScript parser to navigate through the codebase's AST, extracting structured metadata about various components such as modules, classes, functions, interfaces, properties, and enums.

Key features:

- AST-based Class Metadata Extraction: Utilizes TypeScript's AST to gather comprehensive metadata on class methods, properties, interfaces, and enums.
- Function and Method Signature Analysis: Parses function signatures from the AST for details on parameters, return types, and inferred type information.
- Interface and Enum Parsing: Extracts information from AST nodes representing interfaces and enums in TypeScript.
- Dependency Graph Construction: Builds a graph of file dependencies by analyzing import declarations within the AST.

### Installation
To integrate this tool into your project, install it via npm:
```
npm i @traversets/code-extractor
```

### Code Analysis

Below is an example of how to use the AST parser for code analysis:

```typescript

const codeMapper: TypeScriptCodeMapper = new TypeScriptCodeMapper();

// Get Root files
const rootFiles: readonly string[] = codeMapper.getRootFileNames();

// Convert a rootFile into a sourceFile
const sourceFile: ts.SourceFile = codeMapper.getSourceFile(rootFiles[5]);

// Build a dependency graph
const getSourceFileDepencies: string[] = codeMapper.buildDependencyGraph(sourceFile);

// Build a codebase map
const codebaseMap = await codeMapper.buildCodebaseMap().getValue();
```

### Sample Response Structure
The resulting JSON structure reflects the TypeScript AST's hierarchical representation:
```
{
  "MyProject": {
    "modules": {
      "src/utils/logger.ts": {
        "classes": [
          {
            "name": "Logger",
            "functions": [
              {
                "name": "log",
                "parameters": [{ "name": "message", "type": "string" }],
                "returnType": "void",
                "content": "",
                "comment": "Logs application Error"
              }
            ],
            "properties": [
              { "name": "logLevel", "type": "LogLevel" }
            ]
          }
        ],
        "functions": [],
        "interfaces": [],
        "enums": [],
        "dependencies": ["import { LogLevel } from './types';"]
      }
    }
  }
}

```

### Usage for Agentic RAG Systems
This tool enhances Retrieval-Augmented Generation (RAG) systems by:

- Parsing the TypeScript AST into embeddings for semantic code search and similarity matching
- Leveraging AST metadata for advanced code analysis, query resolution, or to aid in code generation, thereby improving the understanding and manipulation of TypeScript codebases within AI systems.

