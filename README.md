# TypeScript Code Extractor and Analyzer

This project provides a robust toolkit for extracting, analyzing, and mapping TypeScript code structures.

The TypeScript Code Extractor and Analyzer is a comprehensive solution designed to parse and analyze TypeScript codebases. It traverses a TypeScript codebase and extracts structured metadata about its components. It provides a hierarchical representation of the codebase, including modules, classes, functions, interfaces, properties, and enums.

Key features include:

- Extraction of class metadata, including methods, properties, interfaces, and enums
- Function and method analysis, including parameter extraction and return type inference
- Interface and enum information extraction
- Dependency graph generation for TypeScript files

### Installation
```
npm i @traversets/code-extractor
```

### Code Analysis

Here's how to perform code analysis with this tool:

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
The output provides a structured JSON representation of the codebase:
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
The TypeScript Code Extractor and Analyzer are particularly beneficial for Retrieval-Augmented Generation (RAG) systems focused on codebases. By providing a structured and detailed representation of the code, it facilitates:

- Semantic Search: Convert code structures into embeddings for similarity searches.
- Codebase Understanding: Enhance AI-driven code analysis, query resolution, or code generation tasks by leveraging the extracted metadata for better context awareness.

This tool thus bridges raw TypeScript code and more intelligent, automated code-related AI functionalities.

