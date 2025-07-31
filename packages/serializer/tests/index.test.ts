import { describe, expect, test } from "vitest";
import { deserialize, serializable, serialize } from "../src";

describe("serializer", () => {
  class A {
    @serializable
    public propString: string;
    @serializable
    public propNumber: number;
    @serializable
    public propBoolean: boolean;
    @serializable
    public propArray: string[];
    @serializable
    public nestedObject: { name: string; age: number };
    @serializable
    public nestedInstance?: A;

    constructor(
      propString: string,
      propNumber: number,
      propBoolean: boolean,
      propArray: string[],
      nestedObject: { name: string; age: number },
      nestedInstance?: A,
    ) {
      this.propString = propString;
      this.propNumber = propNumber;
      this.propBoolean = propBoolean;
      this.propArray = propArray;
      this.nestedObject = nestedObject;
      this.nestedInstance = nestedInstance;
    }
  }
  const instance = new A(
    "@graphif/serializer",
    114514,
    false,
    ["hello", "world"],
    { name: "Traveller", age: 1000 },
    new A("nested", 123, true, ["nested"], { name: "Trailblazer", age: 2000 }),
  );
  const serialized = {
    _: "A",
    propString: "@graphif/serializer",
    propNumber: 114514,
    propBoolean: false,
    propArray: ["hello", "world"],
    nestedObject: { name: "Traveller", age: 1000 },
    nestedInstance: {
      _: "A",
      propString: "nested",
      propNumber: 123,
      propBoolean: true,
      propArray: ["nested"],
      nestedObject: { name: "Trailblazer", age: 2000 },
    },
  };

  test("serialize instance with nested instance", () => {
    const serialized = serialize(instance);
    expect(serialized._).toBe("A");
    expect(serialized.nestedInstance._).toBe("A");
    expect(serialized.propString).toBe("@graphif/serializer");
  });
  test("deserialize instance with nested instance", () => {
    const deserialized = deserialize(serialized);
    expect(deserialized).toBeInstanceOf(A);
    expect(deserialized.nestedInstance).toBeInstanceOf(A);
    expect(deserialized.propString).toBe("@graphif/serializer");
  });
});
