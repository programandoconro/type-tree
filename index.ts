import { Project, Type } from "ts-morph";

const FILE_PATH = "./ts-to-compile.ts"; // TODO: handle input file
createTypeTree(FILE_PATH);

type Result = Record<string, unknown>;
export function createTypeTree(filePath: string, testCode?: string): Result {
  const result: Result = {};
  const project = new Project({});
  const sourceFile = !testCode
    ? project.addSourceFileAtPath(filePath)
    : project.createSourceFile(filePath, testCode);
  //console.log(sourceFile.getText());

  [...sourceFile?.getInterfaces(), ...sourceFile?.getTypeAliases()].forEach(
    (typeAlias) => {
      const name = typeAlias.getName();
      result[name] = handleTypes(typeAlias.getType());
    }
  );

  // console.log({ result, resultStringify: JSON.stringify(result) });
  return result;
}

function handleTypes(t?: Type) {
  return isPrimitive(t) ? handlePrimitive(t) : handleNotPrimitive(t);
}

function isPrimitive(t?: Type): boolean {
  const isString = t?.isString() || t?.isStringLiteral();
  const isBoolean = t?.isBoolean() || t?.isBooleanLiteral();
  const isNumber = t?.isNumber() || t?.isNumberLiteral();
  const isNullish = t?.isNullable();

  return Boolean(isNumber || isString || isBoolean || isNullish);
}

function handlePrimitive(t?: Type) {
  switch (true) {
    case t?.isNumberLiteral(): {
      return Number(t?.getText());
    }
    case t?.isBooleanLiteral(): {
      return t?.getText() === "true";
    }
    default: {
      return t?.getText();
    }
  }
}

function handleNotPrimitive(t?: Type) {
  if (typeof t === "undefined") {
    return undefined;
  }

  if (t.isTuple()) {
    console.log("Tuple");
    const tuple: unknown[] = [];
    t.getTupleElements().map((ele) => {
      if (isPrimitive(ele)) {
        tuple.push(handlePrimitive(ele));
      } else {
        return handleNotPrimitive(ele);
      }
    });
    return tuple;
  }

  if (t.isArray()) {
    return handleArray(t);
  }
  if (t.isObject()) {
    const record = handleRecord(t);

    if (record.isRecord) {
      return record.record;
    }
    return handleObject(t);
  }
}

function handleArray(t?: Type): string | unknown[] {
  console.log("Array");
  const arrayType = t?.getArrayElementType();
  const innerText = arrayType?.getText();
  console.log({ innerText });
  if (isPrimitive(arrayType)) {
    return innerText + "[]";
  } else {
    return [handleNotPrimitive(arrayType)];
  }
}

function handleRecord(t: Type) {
  console.log("Record");
  const symbolDeclarations = t.getAliasSymbol()?.getDeclarations();
  const record = symbolDeclarations?.[0]
    ?.getText()
    .split("=")?.[1]
    ?.replace(" ", "")
    ?.replace(";", "");

  return {
    isRecord: symbolDeclarations?.length === 1 && record?.includes("Record<"),
    record,
  };
}

function handleObject(t?: Type) {
  console.log("Object");

  const obj: Record<string, unknown> = {};
  t?.getProperties().forEach((prop) => {
    const name = prop?.getName();
    const innerDeclaration = prop.getDeclarations();
    innerDeclaration.forEach((p) => {
      const innerType = p.getType();
      obj[name] = isPrimitive(innerType)
        ? handlePrimitive(innerType)
        : handleNotPrimitive(innerType);
    });
  });
  return obj;
}
