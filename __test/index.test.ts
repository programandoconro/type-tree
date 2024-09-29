import { expect, test } from "bun:test";
import { createTypeTree } from "..";
import { Project } from "ts-morph";

test("handle primitives", () => {
  const sourceCode = `
    type S = string;
    type LiteralS = "hello";

    type N = number;
    type LiteralN = 123;

    type B = boolean;
    type T = true;
    type F = false;

    type U = undefined;
     
    `;
  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    S: "string",
    LiteralS: '"hello"',
    N: "number",
    LiteralN: 123,
    B: "boolean",
    T: true,
    F: false,
    U: undefined,
  });
});

test("handle simple array", () => {
  const sourceCode = `
      type Arr = string[];
      type LiteralA = ["hola", "hello", true, 123]
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Arr: "string[]",
    LiteralA: ['"hola"', '"hello"', true, 123],
  });
});

test("handle complex array", () => {
  const sourceCode = `
      type B = boolean;
      type Obj = {a: {a: "hola", b: B}};
      type Arr = Obj[];
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    B: "boolean",
    Obj: {
      a: {
        a: '"hola"',
        b: "boolean",
      },
    },
    Arr: [
      {
        a: {
          a: '"hola"',
          b: "boolean",
        },
      },
    ],
  });
});

test("handle simple object", () => {
  const sourceCode = `
      type Obj = { a: "hello"; b: 123 };
      interface Obj2 { a: "hola"; b: true };
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Obj: { a: '"hello"', b: 123 },
    Obj2: { a: '"hola"', b: true },
  });
});

test("handle complex object", () => {
  const sourceCode = `
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

`;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Obj: {
      a: '"hello"',
      b: {
        c: true,
        d: "boolean",
        e: "Record<string, boolean>",
      },
    },
    NestedType: {
      c: true,
      d: "boolean",
      e: "Record<string, boolean>",
    },
    MyRecord: "Record<string, boolean>",
  });
});
test("handle Records", () => {
  const project = new Project();
  const sourceCode = `
      type MyRecord = Record<string, number>;
`;
  const result = createTypeTree("temp.ts", sourceCode);
  expect(result).toStrictEqual({ MyRecord: "Record<string, number>" });
});
