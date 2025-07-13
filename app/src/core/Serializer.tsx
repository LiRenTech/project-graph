import "reflect-metadata";
import { getOriginalNameOf } from "virtual:original-class-name";
import { Project } from "./Project";

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
  Serializer.classes.set(getOriginalNameOf(target.constructor), target.constructor);
};

const passProjectAtArg1Symbol = Symbol("passProjectAtArg1");
/**
 * 实例化对象时，将Project实例传入第一个参数
 */
export const passProjectAtArg1 = Reflect.metadata(passProjectAtArg1Symbol, true);

const flattenAllValuesSymbol = Symbol("flattenAllValues");
/**
 * 实例化对象时，按照使用serializable装饰器的顺序依次传入参数
 * 否则传入对象
 */
export const flattenAllValues = Reflect.metadata(flattenAllValuesSymbol, true);

export namespace Serializer {
  export const classes: Map<string, any> = new Map();

  /**
   * 序列化一个对象
   *
   * 支持的类型:
   * `object` `string` `number` `boolean` `null`
   */
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
      const result: any = {};
      for (const key in obj) {
        if (!Reflect.hasMetadata(serializableSymbol, obj, key)) continue;
        if (!Object.hasOwn(obj, key)) continue;
        result[key] = serialize(obj[key]);
        result._ = getOriginalNameOf(obj.constructor);
      }
      return result;
    } else {
      throw TypeError("[Serializer] 不支持的类型", obj);
    }
  }

  /**
   * 构造对象的时候，第一个参数是project，第二个参数是json对象
   */
  export function deserialize(project: Project, json: any): any {
    const className = json._;
    const class_ = Serializer.classes.get(className);
    if (!class_) {
      throw TypeError(`[Serializer] 找不到类 ${className}`);
    }
    // 先把json中有_的值反序列化
    for (const key in json) {
      if (key === "_") continue;
      const value = json[key];
      if (value !== null && typeof value === "object" && "_" in value) {
        json[key] = deserialize(project, value);
      }
      if (value !== null && value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
          if (value[i] !== null && typeof value[i] === "object" && "_" in value[i]) {
            value[i] = deserialize(project, value[i]);
          }
        }
      }
    }
    const args = [];
    if (Reflect.hasMetadata(passProjectAtArg1Symbol, class_)) {
      args.push(project);
    }
    if (Reflect.hasMetadata(flattenAllValuesSymbol, class_)) {
      for (const key in json) {
        if (key === "_") continue;
        args.push(json[key]);
      }
    } else {
      args.push(json);
    }
    return new class_(...args);
  }
}
