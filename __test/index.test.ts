import { expect, it, test } from "bun:test";
import { createSourceFile, handleTypes, type Result } from "..";

test("handle primitives", () => {
  const fileNameOrPath = "./__test/primitives.ts";
  const sourceFile = createSourceFile(fileNameOrPath);

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
  const fileNameOrPath = "./__test/simple_array.ts";
  const sourceFile = createSourceFile(fileNameOrPath);

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
  const fileNameOrPath = "./__test/simple_object.ts";
  const sourceFile = createSourceFile(fileNameOrPath);

  const result: Result = {};
  sourceFile
    ?.getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  expect(result).toStrictEqual({
    Obj: { a: '"hello"', b: "123" },
  });
});

test("handle complex object", () => {
  const fileNameOrPath = "./__test/complex_object.ts";
  const sourceFile = createSourceFile(fileNameOrPath);

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
      },
    },
    NestedType: {
      c: "true",
      d: "boolean",
    },
  });
});
