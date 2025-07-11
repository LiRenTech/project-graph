import "reflect-metadata";

const serializableMetadataKey = Symbol("serializable");
export const serializable = Reflect.metadata(serializableMetadataKey, true);

export namespace Serializer {
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
        if (!Reflect.hasMetadata(serializableMetadataKey, obj, key)) continue;
        if (!Object.hasOwn(obj, key)) continue;
        result[key] = serialize(obj[key]);
      }
      return result;
    } else {
      throw TypeError("[Serializer] 不支持的类型", obj);
    }
  }
}
