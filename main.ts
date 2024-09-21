import { Project, Type, TypeAliasDeclaration } from "ts-morph";
type Result = Record<string, string | undefined>;
const project = new Project({});

const sourceFile = project.addSourceFileAtPath("./ts-to-compile.ts");

const primitives = ["string", undefined, "boolean", "number"];
const result: Result = {};

sourceFile.getTypeAliases().forEach(recursion);

console.log({ result });

function recursion(typeAlias: TypeAliasDeclaration) {
  const name = typeAlias.getName();
  const node = typeAlias?.getTypeNode();
  const text = node?.getText();
  const nodeType = node?.getType();
  const isArray = nodeType?.isArray();
  const isLiteralNumber = nodeType?.isNumberLiteral();
  const isLiteralString = nodeType?.isStringLiteral();

  if (primitives.includes(text) || isLiteralString || isLiteralNumber) {
    result[name] = text;
  } else {
    if (isArray) {
      const arrayType = nodeType?.getArrayElementType();
      console.log(arrayType?.isObject());
    }
    console.log(`${name}: ${text}`);
  }
}

function handleNotPrimitiveTypes(t: Type) {
  if (t.isArray()) {
    console.log("Array");
    return;
  }
  if (t.isObject()) {
    console.log("Object");
    return;
  }
}
