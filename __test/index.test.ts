import { expect, test } from "bun:test";
import createTypeTree from "../ext/src/create-type-tree";

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
    U: "Type not handled",
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
  const sourceCode = `
      type MyRecord = Record<string, number>;
`;
  const result = createTypeTree("temp.ts", sourceCode);
  expect(result).toStrictEqual({ MyRecord: "Record<string, number>" });
});

test("handle simple union", () => {
  const sourceCode = `
      type Union = string | number;
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Union: ["string", "number"],
  });
});

test("handle simple intesection", () => {
  const sourceCode = `
      type Intersection = {a: 'hola'} & {b: 'chao'};
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Intersection: [{ a: '"hola"' }, { b: '"chao"' }],
  });
});

test("handle simple intesection and simple union", () => {
  const sourceCode = `
      type IntersectionAndUnion = {a: 'hola'} & {b: 'chao'} | {c: 'hello', d: 'bye'};
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    IntersectionAndUnion: [
      [{ a: '"hola"' }, { b: '"chao"' }],

      { c: '"hello"', d: '"bye"' },
    ],
  });
});

test("handle optional props", () => {
  const sourceCode = `
      type Obj = { a?: "hello"; b: 123 };
      interface Obj2 { a?: "hola"; b: true };
     
    `;

  const result = createTypeTree("temp.ts", sourceCode);

  expect(result).toStrictEqual({
    Obj: { "a?": '"hello"', b: 123 },
    Obj2: { "a?": '"hola"', b: true },
  });
});

test("handle types from internal and  external dependencies", () => {
  const result = createTypeTree("./__test/ts-to-compile.ts");

  expect(result).toStrictEqual({
    Stringo: "string",
    Arr: [
      {
        a: '"hol"',
        b: {
          a: '"hol"',
          b: '"chao"',
        },
      },
    ],
    LiteralArr: [1, 2, '"hello"'],
    LiteralComplexArr: [1, 2],
    OtherArr: "string[]",
    num: "number",
    literalNumber: 14,
    AnotherType: {
      a: '"hol"',
      b: '"chao"',
    },
    Bool: "boolean",
    Topo: '"topo"',
    Recordo: "Record<string, OtherType>",
    AnotherNestedExternalDependency: {
      "selectedState?": {
        id: "string[]",
      },
    },
    OtherType: {
      a: '"hol"',
      b: {
        a: '"hol"',
        b: '"chao"',
      },
    },
    TypeFromExternalDependency: '"This is type coming from an external file"',
  });
});
