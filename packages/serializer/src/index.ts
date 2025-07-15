import "reflect-metadata";
import { getOriginalNameOf } from "virtual:original-class-name";

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

export function serialize(obj: any): any {
  if (obj instanceof Array) {
    return obj.map((v) => serialize(v));
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
    const className = getOriginalNameOf(obj.constructor) ?? obj.constructor.name;
    if (!className) {
      throw TypeError("[Serializer] Cannot find class name of", obj);
    }
    const result: any = {
      _: className,
    };
    for (const key in obj) {
      if (!Reflect.hasMetadata(serializableSymbol, obj, key)) continue;
      result[key] = serialize(obj[key]);
    }
    return result;
  } else {
    throw TypeError("[Serializer] Unsupported value type", obj);
  }
}

export function deserialize(json: Record<string, any>, extra?: any): any {
  const className = json._;
  const class_ = classes.get(className);
  if (!class_) {
    throw TypeError(`[Serializer] Cannot find class ${class_}`);
  }
  // 先把json中有_的值反序列化
  for (const key in json) {
    if (key === "_") continue;
    const value = json[key];
    if (value !== null && typeof value === "object" && "_" in value) {
      json[key] = deserialize(value, extra);
    }
    if (value !== null && value instanceof Array) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== null && typeof value[i] === "object" && "_" in value[i]) {
          value[i] = deserialize(value[i], extra);
        }
      }
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
