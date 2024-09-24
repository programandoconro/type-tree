import { Project, SourceFile, Type, TypeAliasDeclaration } from "ts-morph";

export type Result = Record<string, any>;

const FILE_PATH = "./ts-to-compile.ts";

export function createSourceFile(filePath: string): SourceFile {
  const project = new Project({});
  return project.addSourceFileAtPath(filePath);
}

function isPrimitive(nodeType?: Type, text?: string): boolean {
  const isString = nodeType?.isString() || nodeType?.isStringLiteral();
  const isBoolean = nodeType?.isBoolean() || nodeType?.isBooleanLiteral();
  const isNumber = nodeType?.isNumber() || nodeType?.isNumberLiteral();
  const isNullish = nodeType?.isNullable();

  return Boolean(isNumber || isString || isBoolean || isNullish);
}

function createTypeTree(filePath: string) {
  const result: Result = {};
  const sourceFile = createSourceFile(filePath);
  console.log(sourceFile.getText());

  sourceFile
    .getTypeAliases()
    .forEach((typeAlias) => handleTypes(typeAlias, result));

  console.log({ result, resultStringify: JSON.stringify(result) });
}

createTypeTree(FILE_PATH);

function handlePrimitive(typeAlias: TypeAliasDeclaration, result: Result) {
  const name = typeAlias.getName();
  const node = typeAlias?.getTypeNode();
  const text = node?.getText();
  result[name] = text;
}

export function handleTypes(typeAlias: TypeAliasDeclaration, result: Result) {
  const name = typeAlias.getName();
  const node = typeAlias?.getTypeNode();
  const nodeType = node?.getType();
  if (isPrimitive(nodeType, name)) {
    handlePrimitive(typeAlias, result);
  } else {
    handleNotPrimitiveTypes(nodeType, name, result);
  }
  return result;
}

function handleNotPrimitiveTypes(
  t: Type | undefined,
  name: string,
  result: Result,
): Result {
  if (typeof t === "undefined") {
    result[name] = undefined;
    return result;
  }
  const isArray = t.isArray();
  const isTuple = t.isTuple();

  if (isTuple) {
    console.log("Tuple");
    t.getTupleElements().map((ele, index) => {
      const innerType = ele;
      if (isPrimitive(innerType, ele.getText())) {
        result[name] = { ...result[name], [index]: ele.getText() };
      }
    });
    return result;
  }

  if (isArray) {
    console.log("Array");

    const arrayType = t?.getArrayElementType();
    const innerText = arrayType?.getText();
    console.log({ innerText });
    if (isPrimitive(arrayType, innerText)) {
      result[name] = innerText + "[]";
    } else {
      //  handleNotPrimitiveTypes(arrayType, name, result);
      arrayType?.getProperties().forEach((p) => {
        const value = p.getValueDeclaration()?.getType();
        const name = p.getName();
        handleNotPrimitiveTypes(value, name, result);
      });
    }
    return result;
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
        if (isPrimitive(innerType, name)) {
          result[upperName] = { ...result[upperName], [name]: value };
        } else {
          handleNotPrimitiveTypes(innerType, value, result);
          result[upperName] = {
            ...result[upperName],
            [name]: result[innerType.getText()],
          };
        }
      });
      return result;
    });
  }
  return result;
}
