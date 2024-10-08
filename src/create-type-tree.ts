import { Project, Type } from "ts-morph";

type Result = Record<string, unknown>;
export default function createTypeTree(
  filePath: string,
  testCode?: string,
  configFile?: string,
): Result {
  const result: Result = {};
  const project = new Project({
    tsConfigFilePath: configFile,
    skipAddingFilesFromTsConfig: true,
  });
  const sourceFile = !testCode
    ? project.addSourceFileAtPath(filePath)
    : project.createSourceFile(filePath, testCode);

  [...sourceFile?.getInterfaces(), ...sourceFile?.getTypeAliases()].forEach(
    (typeAlias) => {
      const name = typeAlias.getName();
      result[name] = handleTypes(typeAlias.getType());
    },
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

function isPartialRecord(t?: Type) {
  const name = t?.getAliasSymbol()?.getName();
  return name?.includes("Partial") && name?.includes("Record");
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
  if (t?.isAny() || isPartialRecord(t)) {
    return t?.getText();
  }

  if (t.isTuple()) {
    return handleTuple(t);
  }

  if (t.isArray()) {
    return handleArray(t);
  }

  if (t.isObject()) {
    return handleObject(t);
  }

  if (t.isUnion()) {
    return handleUnion(t);
  }

  if (t.isIntersection()) {
    return handleIntersection(t);
  }

  return "Type not handled";
}

function handleArray(t?: Type): string | unknown[] {
  const arrayType = t?.getArrayElementType();
  const innerText = arrayType?.getText();

  if (isPrimitive(arrayType)) {
    return innerText + "[]";
  } else {
    return [handleNotPrimitive(arrayType)];
  }
}

function handleRecord(t?: Type) {
  const symbolDeclarations = t?.getAliasSymbol()?.getDeclarations();
  const externalRecord = symbolDeclarations?.[0]
    ?.getText()
    .split("=")?.[1]
    ?.replace(" ", "")
    ?.replace(";", "");
  const internalRecord = t?.getText();

  const isExternalRecord = externalRecord?.startsWith("Record");
  const isInternalRecord = internalRecord?.startsWith("Record");
  const record = isExternalRecord ? externalRecord : internalRecord;

  return {
    isRecord: isInternalRecord || isExternalRecord,
    record,
  };
}

function handleObject(t?: Type) {
  const record = handleRecord(t);
  if (record.isRecord) {
    return record.record;
  }

  const obj: Record<string, unknown> = {};
  t?.getProperties().forEach((prop) => {
    const name = prop?.isOptional() ? prop?.getName() + "?" : prop?.getName();
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

function handleTuple(t?: Type) {
  const tuple: unknown[] = [];
  t?.getTupleElements().map((ele) => {
    if (isPrimitive(ele)) {
      tuple.push(handlePrimitive(ele));
    } else {
      return handleNotPrimitive(ele);
    }
  });
  return tuple;
}

function handleUnion(t?: Type): unknown[] | undefined {
  return t?.getUnionTypes().map(handleTypes);
}

function handleIntersection(t?: Type): unknown[] | undefined {
  return t?.getIntersectionTypes().map(handleTypes);
}
