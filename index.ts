import { Project, Type, TypeAliasDeclaration } from "ts-morph";
type Result = Record<string, string | undefined>;
const project = new Project({});

const sourceFile = project.addSourceFileAtPath("./ts-to-compile.ts");

const primitives = ["string", undefined, "boolean", "number"];
const result: Result = {};

console.log(sourceFile.getText());

sourceFile.getTypeAliases().forEach(recursion);

console.log({ result });

function recursion(typeAlias: TypeAliasDeclaration) {
  const name = typeAlias.getName();
  const node = typeAlias?.getTypeNode();
  const text = node?.getText();
  const nodeType = node?.getType();
  const isLiteralNumber = nodeType?.isNumberLiteral();
  const isLiteralString = nodeType?.isStringLiteral();

  if (primitives.includes(text) || isLiteralString || isLiteralNumber) {
    result[name] = text;
  } else {
    handleNotPrimitiveTypes(nodeType, name);
  }
}

function handleNotPrimitiveTypes(t: Type | undefined, name: string) {
  if (typeof t === "undefined") {
    result[name] = undefined;
    return;
  }
  if (t.isArray()) {
    console.log("Array");
    const arrayType = t?.getArrayElementType();
    const innerText = arrayType?.getText();
    if (primitives.includes(innerText)) {
      result[name] = innerText + "[]";
    } else {
      handleNotPrimitiveTypes(arrayType, name);
      console.log("recursion", {
        arrayType: arrayType?.getProperties().map((p) => p.getName()),
      });
    }
    return;
  }
  if (t.isObject()) {
    console.log("Object");
    return;
  }
}
