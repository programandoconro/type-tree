import { expect, it, test } from "bun:test";
import { handleTypes, type Result } from "..";
import { Project } from "ts-morph";

test("handle primitives", () => {
  const project = new Project();
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `
    type S = string;
    type LiteralS = "hello";

    type N = number;
    type LiteralN = 123;

    type B = boolean;
    type T = true;
    type F = false;

    type U = undefined;
     
    `,
  );

  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  expect(result).toStrictEqual({
    S: "string",
    LiteralS: '"hello"',
    N: "number",
    LiteralN: "123",
    B: "boolean",
    T: "true",
    F: "false",
  });
});

test("handle simple array", () => {
  const project = new Project();
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `
      type Arr = string[];
      type LiteralA = ["hola", "hello", true, 123]
     
    `,
  );

  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  expect(result).toStrictEqual({
    Arr: "string[]",
    LiteralA: {
      "0": '"hola"',
      "1": '"hello"',
      "2": "true",
      "3": "123",
    },
  });
});

test("handle simple object", () => {
  const project = new Project();
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `
      type Obj = { a: "hello"; b: 123 };
     
    `,
  );

  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  expect(result).toStrictEqual({
    Obj: { a: '"hello"', b: "123" },
  });
});

test("handle complex object", () => {
  const project = new Project();
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `
      type Obj = {
        a: "hello";
        b: NestedType;
      };

      interface NestedType {
        c: true;
        d: boolean;
        e: MyRecord;
      }
      
      type MyRecord = Record<string, boolean>;

`,
  );

  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  expect(result).toStrictEqual({
    Obj: {
      a: '"hello"',
      b: {
        c: "true",
        d: "boolean",
        e: "Record<string, boolean>",
      },
    },
    NestedType: {
      c: "true",
      d: "boolean",
      e: "Record<string, boolean>",
    },
    MyRecord: "Record<string, boolean>",
  });
});
test("handle Records", () => {
  const project = new Project();
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `
      type MyRecord = Record<string, number>;
`,
  );
  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));
  expect(result).toStrictEqual({ MyRecord: "Record<string, number>" });
});
