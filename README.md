# TypeScript Code Extractor and Analyzer

This project provides a robust toolkit for extracting, analyzing, and mapping TypeScript code structures.

The TypeScript Code Extractor and Analyzer is a comprehensive solution designed to parse and analyze TypeScript codebases. It offers a set of tools to extract detailed information about classes, interfaces, functions, and other TypeScript constructs, enabling developers to gain deep insights into their codebase structure and dependencies.

Key features include:

- Extraction of class metadata, including methods, properties, interfaces, and enums
- Function and method analysis, including parameter extraction and return type inference
- Interface and enum information extraction
- Dependency graph generation for TypeScript files

### Code Analysis

To analyze a TypeScript codebase:

```typescript
import { TypeScriptCodeMapper } from "./src/services/typescript-code-mapper.service";

const codeMapper = new TypeScriptCodeMapper();

// Build a codebase map
const codebaseMap = await codeMapper.buildCodebaseMap();

// Extract class metadata
const classInfo = codeMapper.extractClassMetaData(classNode, sourceFile);

// Build a dependency graph
const dependencies = codeMapper.buildDependencyGraph(sourceFile);
```
