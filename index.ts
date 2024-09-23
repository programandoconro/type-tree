import { Project, Type, TypeAliasDeclaration } from "ts-morph";

type Result = Record<string, any>;

const project = new Project({});
const sourceFile = project.addSourceFileAtPath("./ts-to-compile.ts");

const primitives = ["string", undefined, "boolean", "number"];
const result: Result = {};

const condition = (nodeType: Type | undefined, text: string) => {
  const isLiteralNumber = nodeType?.isNumberLiteral();
  const isLiteralString = nodeType?.isStringLiteral();

  return primitives.includes(text) || isLiteralString || isLiteralNumber;
};

(function main() {
  console.log(sourceFile.getText());

  sourceFile.getTypeAliases().forEach(handleTypes);

  console.log({ result, resultStringify: JSON.stringify(result) });
})();

function handleTypes(typeAlias: TypeAliasDeclaration) {
  const name = typeAlias.getName();
  const node = typeAlias?.getTypeNode();
  const text = node?.getText();
  const nodeType = node?.getType();
  if (condition(nodeType, name)) {
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
      arrayType?.getProperties().map((p) => {
        const value = p.getValueDeclaration()?.getType();
        const name = p.getName();
        handleNotPrimitiveTypes(value, name);

        return name;
      });
    }
    return;
  }
  if (t.isObject()) {
    console.log("Object");
    const upperName = t.getText();

    t?.getProperties().forEach((p) => {
      const innerDeclaration = p.getDeclarations();
      const name = p.getName();
      innerDeclaration.map((p) => {
        const innerType = p.getType();
        const value = innerType.getText();
        if (condition(innerType, name)) {
          result[upperName] = { ...result[upperName], [name]: value };
        } else {
          handleNotPrimitiveTypes(innerType, value);
          result[upperName] = {
            ...result[upperName],
            [name]: result[innerType.getText()],
          };
        }
      });
      return;
    });
  }
}
