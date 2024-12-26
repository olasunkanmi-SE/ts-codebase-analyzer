# TypeScript Code Extractor and Analyzer

This project provides a robust toolkit for extracting, analyzing, and mapping TypeScript code structures.

The TypeScript Code Extractor and Analyzer is a comprehensive solution designed to parse and analyze TypeScript codebases. It traverses a TypeScript codebase and extracts structured metadata about its components. It provides a hierarchical representation of the codebase, including modules, classes, functions, interfaces, properties, and enums.

Key features include:

- Extraction of class metadata, including methods, properties, interfaces, and enums
- Function and method analysis, including parameter extraction and return type inference
- Interface and enum information extraction
- Dependency graph generation for TypeScript files

### Code Analysis

To analyze a TypeScript codebase:

```typescript

const codeMapper = new TypeScriptCodeMapper();
// Extract class metadata
const classInfo = codeMapper.extractClassMetaData(classNode, sourceFile);

// Build a dependency graph
const dependencies = codeMapper.buildDependencyGraph(sourceFile);

// Build a codebase map
const codebaseMap = await codeMapper.buildCodebaseMap();
```

### Sample Response Structure
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
        "interfaces": [],
        "enums": [],
        "dependencies": ["import { LogLevel } from './types';"]
      }
    }
  }
}

```

### Usage for Agentic RAG Systems
The TypeScript Code Extractor and Analyzer can be handy for RAG (Retrieval-Augmented Generation) systems for codebases. It provides a detailed and structured representation of the codebase that can be converted into embeddings, enabling more effective advanced code analysis, retrieval, and generation tasks.

