import { Project, SourceFile, Type, TypeAliasDeclaration } from "ts-morph";

export type Result = Record<string, any>;

const FILE_PATH = "./ts-to-compile.ts";

export function addSourceFileAtPath(filePath: string): SourceFile {
  const project = new Project({});
  return project.addSourceFileAtPath(filePath);
}

function isPrimitive(nodeType?: Type): boolean {
  const isString = nodeType?.isString() || nodeType?.isStringLiteral();
  const isBoolean = nodeType?.isBoolean() || nodeType?.isBooleanLiteral();
  const isNumber = nodeType?.isNumber() || nodeType?.isNumberLiteral();
  const isNullish = nodeType?.isNullable();

  return Boolean(isNumber || isString || isBoolean || isNullish);
}

type Props = { filePath: string; testCode?: string };
export function createTypeTree({ filePath, testCode }: Props) {
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

createTypeTree({ filePath: FILE_PATH });

export function handleTypes(t?: Type) {
  if (isPrimitive(t)) {
    return handlePrimitive(t);
  } else {
    return handleNotPrimitive(t);
  }
}

function handleArray(t?: Type) {
  console.log("Array");
  const arrayType = t?.getArrayElementType();
  const innerText = arrayType?.getText();
  console.log({ innerText });
  if (isPrimitive(arrayType)) {
    return innerText + "[]";
  } else {
    const arr: unknown[] = [];
    // TODO: handle not primitive
    return arr;
  }
}

function handleRecord(t: Type) {
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

function handlePrimitive(t?: Type) {
  const text = t?.getText();
  return text;
}

function handleNotPrimitive(t: Type | undefined) {
  if (typeof t === "undefined") {
    console.log(undefined);
    return undefined;
  }

  if (t.isTuple()) {
    console.log("Tuple");
    const tuple: unknown[] = [];
    t.getTupleElements().map((ele) => {
      const innerType = ele;
      if (isPrimitive(innerType)) {
        tuple.push(ele.getText());
      } else {
        return handleNotPrimitive(ele);
      }
    });
    return tuple;
  }

  if (t.isArray()) {
    console.log("Array");
    return handleArray(t);
  }
  if (t.isObject()) {
    const record = handleRecord(t);

    if (record.isRecord) {
      console.log("Record");
      return record.record;
    } else {
      return handleObject(t);
    }
  }
}

function handleObject(t?: Type) {
  console.log("Object", t?.isInterface(), t?.getText());

  const obj: Record<string, unknown> = {};
  t?.getProperties().forEach((prop) => {
    const name = prop?.getName();
    const innerDeclaration = prop.getDeclarations();
    innerDeclaration.forEach((p) => {
      const innerType = p.getType();
      if (isPrimitive(innerType)) {
        obj[name] = handlePrimitive(innerType);
      } else {
        obj[name] = handleNotPrimitive(innerType);
      }
    });
  });
  return obj;
}
