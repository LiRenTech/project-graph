import { encode } from "@msgpack/msgpack";
import { md5 } from "js-md5";
import "reflect-metadata";

let getOriginalNameOf: (class_: { [x: string | number | symbol]: any; new (...args: any[]): any }) => string = (
  class_,
) => class_.name;
export function configureSerializer(
  getOriginalNameOfFn: (class_: { [x: string | number | symbol]: any; new (...args: any[]): any }) => string,
) {
  getOriginalNameOf = getOriginalNameOfFn;
}

const serializableSymbol = Symbol("serializable");
const lastSerializableIndexSymbol = Symbol("lastSerializableIndex");
export const serializable = (target: any, key: string) => {
  if (!Reflect.hasMetadata(lastSerializableIndexSymbol, target)) {
    Reflect.defineMetadata(lastSerializableIndexSymbol, 0, target);
  }
  Reflect.defineMetadata(serializableSymbol, Reflect.getMetadata(lastSerializableIndexSymbol, target), target, key);
  Reflect.defineMetadata(
    lastSerializableIndexSymbol,
    Reflect.getMetadata(lastSerializableIndexSymbol, target) + 1,
    target,
  );
  classes.set(getOriginalNameOf(target.constructor), target.constructor);
};

const passExtraAtArg1Symbol = Symbol("passExtraAtArg1");
export const passExtraAtArg1 = Reflect.metadata(passExtraAtArg1Symbol, true);

const passExtraAtLastArgSymbol = Symbol("passExtraAtLastArg");
export const passExtraAtLastArg = Reflect.metadata(passExtraAtLastArgSymbol, true);

const passObjectSymbol = Symbol("passObject");
export const passObject = Reflect.metadata(passObjectSymbol, true);

const classes: Map<string, any> = new Map();

export function serialize(originalObj: any): any {
  const obj2path = new Map<any, string>();
  function _serialize(obj: any, path: string): any {
    if (obj instanceof Array) {
      return obj.map((v, i) => _serialize(v, `${path}/${i}`));
    } else if (typeof obj === "string") {
      return obj;
    } else if (typeof obj === "number") {
      // 判断是否是整数
      if (obj % 1 === 0) {
        return obj;
      } else {
        // 保留2位小数
        return parseFloat(obj.toFixed(2));
      }
    } else if (typeof obj === "boolean") {
      return obj;
    } else if (obj === null) {
      return null;
    } else if (typeof obj === "object") {
      const className = getOriginalNameOf(obj.constructor);
      if (!className) {
        throw TypeError("[Serializer] Cannot find class name of", obj);
      }
      if (className === "Object") {
        return obj;
      }
      const result: any = {
        _: className,
      };
      for (const key in obj) {
        if (!Reflect.hasMetadata(serializableSymbol, obj, key)) continue;
        result[key] = _serialize(obj[key], `${path}/${key}`);
      }
      const okey = md5(encode(result));
      if (obj2path.has(okey)) {
        return { $: obj2path.get(okey) };
        // 只有对象比较复杂的时候才会使用引用机制
      } else if (isComplex(result)) {
        obj2path.set(okey, path);
      }
      return result;
    } else if (typeof obj === "undefined") {
      return undefined;
    } else {
      throw TypeError(`[Serializer] Unsupported value type ${obj}`);
    }
  }
  return _serialize(originalObj, "");
}

function isComplex(obj: Record<string, any>): boolean {
  // const objects = Object.values(obj).filter((v) => typeof v === "object" && v !== null).length;
  // const arrays = Object.values(obj).filter((v) => v instanceof Array).length;
  const stringLengthTotal = Object.values(obj)
    .filter((v) => typeof v === "string")
    .reduce((acc, v) => acc + v.length, 0);
  // return objects + arrays >= 2 || stringLengthTotal >= 50;
  return Object.keys(obj).length > 5 || stringLengthTotal >= 50;
}

export function deserialize(originalJson: any, extra?: any): any {
  function _deserialize(json: any, extra?: any): any {
    if (json instanceof Array) {
      return json.map((v) => _deserialize(v, extra));
    }
    if (!isSerializedObject(json)) {
      return json;
    }
    const className = json._;
    const class_ = classes.get(className);
    if (!class_) {
      throw TypeError(`[Serializer] Cannot find class ${class_} of ${JSON.stringify(json)}`);
    }
    // 先把json中有_的值反序列化
    for (const key in json) {
      if (key === "_") continue;
      const value = json[key];
      if (isSerializedObject(value) || value instanceof Array) {
        json[key] = _deserialize(value, extra);
      }
    }
    const args = [];
    if (Reflect.hasMetadata(passExtraAtArg1Symbol, class_)) {
      args.push(extra);
    }
    if (Reflect.hasMetadata(passObjectSymbol, class_)) {
      args.push(json);
    } else {
      for (const key in json) {
        if (key === "_") continue;
        args.push(json[key]);
      }
    }
    if (Reflect.hasMetadata(passExtraAtLastArgSymbol, class_)) {
      args.push(extra);
    }
    return new class_(...args);
  }
  return _deserialize(replaceRef(originalJson), extra);
}

function isSerializedObject(obj: any): boolean {
  return typeof obj === "object" && obj !== null && "_" in obj;
}
function getByPath(obj: any, path: string): any {
  const segments = path.split("/").filter((s) => s !== "");
  let result = obj;
  for (const segment of segments) {
    if (typeof result !== "object" || result === null) {
      throw TypeError(`[Serializer] Cannot find object at path ${path}`);
    }
    result = result[segment];
  }
  return result;
}
/**
 * 将$替换为实际值
 * @param obj 要替换的对象
 * @param refPathObj obj参数中$的路径所在的对象
 */
function replaceRef(obj: any, refPathObj: any = obj): any {
  if (obj instanceof Array) {
    return obj.map((v) => replaceRef(v, refPathObj));
  }
  if (typeof obj === "object" && obj !== null) {
    if ("$" in obj) {
      const path = obj.$ as string;
      return getByPath(refPathObj, path);
    }
    for (const key in obj) {
      if (key === "_") continue;
      obj[key] = replaceRef(obj[key], refPathObj);
    }
  }
}
