import * as ts from "typescript";
import { TypeScriptCodeMapper } from "./typescript-code-mapper.service";

jest.mock("glob");

describe("TypeScriptCodeMapper", () => {
  let codeMapper: TypeScriptCodeMapper;
  let mockProgram: ts.Program;
  let mockTypeChecker: ts.TypeChecker;
  let mockSourceFile: ts.SourceFile;
  let originalCwd = process.cwd;

  beforeEach(() => {
    jest.spyOn(process, "cwd").mockReturnValue(originalCwd());
    codeMapper = new TypeScriptCodeMapper();

    mockProgram = {
      getSourceFile: jest.fn(),
      getRootFileNames: jest.fn(),
      getTypeChecker: jest.fn().mockReturnValue({
        getTypeAtLocation: jest.fn(),
        typeToString: jest.fn(),
        getSignatureFromDeclaration: jest.fn(),
        getReturnTypeOfSignature: jest.fn(),
      }),
    } as any;

    mockTypeChecker = mockProgram.getTypeChecker() as any;

    mockSourceFile = {
      fileName: "test.ts",
      text: "class TestClass {}",
    } as any;

    jest.spyOn(codeMapper, "getProgram").mockReturnValue(mockProgram);
    jest.spyOn(codeMapper, "getSourceFile").mockReturnValue(mockSourceFile);
    jest.spyOn(codeMapper, "getTypeChecker").mockReturnValue(mockTypeChecker);
    jest.spyOn(codeMapper, "getRootFileNames").mockReturnValue(["test.ts"]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("extractClassMetaData", () => {
    it("Should extract class metadata correctly", () => {
      const mockClass = {
        name: { getText: jest.fn().mockReturnValue("TestClass") },
        members: [],
      } as any;
      const result = codeMapper.extractClassMetaData(mockClass, mockSourceFile);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe("TestClass");
    });

    it("Should extract class metadata with various members correctly", () => {
      const mockMembers = [
        {
          kind: ts.SyntaxKind.MethodDeclaration,
          name: { getText: jest.fn().mockReturnValue("testMethod") },
          parameters: [],
          type: { getText: jest.fn().mockReturnValue("void") },
        },
        {
          kind: ts.SyntaxKind.PropertyDeclaration,
          name: { getText: jest.fn().mockReturnValue("testProperty") },
          type: { getText: jest.fn().mockReturnValue("string") },
        },
        {
          kind: ts.SyntaxKind.GetAccessor,
          name: { getText: jest.fn().mockReturnValue("testGetter") },
          type: { getText: jest.fn().mockReturnValue("number") },
          parameters: [],
        },
        {
          kind: ts.SyntaxKind.SetAccessor,
          name: { getText: jest.fn().mockReturnValue("testSetter") },
          parameters: [
            {
              name: { getText: jest.fn().mockReturnValue("value") },
              type: { getText: jest.fn().mockReturnValue("string") },
            },
          ],
        },
      ];

      const mockClass = {
        name: { getText: jest.fn().mockReturnValue("TestClass") },
        members: mockMembers,
      } as any;

      jest.spyOn(codeMapper as any, "getFunctionDetails").mockReturnValue({
        getValue: () => ({
          name: "testMethod",
          parameters: [],
          returnType: "void",
          content: "test content",
        }),
      });

      jest
        .spyOn(codeMapper as any, "extractPropertyParameters")
        .mockReturnValue({
          getValue: () => ({
            name: "testProperty",
            type: "string",
          }),
        });

      jest
        .spyOn(codeMapper as any, "getAccessorDetails")
        .mockImplementation((node, sourceFile, kind) => ({
          name: kind === "get" ? "testGetter" : "testSetter",
          content: "test content",
          parameters: kind === "set" ? [{ name: "value", type: "string" }] : [],
          returnType: kind === "get" ? "number" : "void",
        }));

      const result = codeMapper.extractClassMetaData(mockClass, mockSourceFile);
      expect(result.isSuccess).toBe(true);
      const classInfo = result.getValue();
      expect(classInfo.name).toBe("TestClass");
      expect(classInfo.functions).toHaveLength(3); // method, getter, setter
      expect(classInfo.properties).toHaveLength(1);
    });
  });
});
