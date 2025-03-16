type TestBaseType = {
  name: string;
  age: number;
};

type TestAType = TestBaseType & {
  level: number;
};

type TestBType = TestBaseType & {
  gender: "male" | "female";
};

/**
 * 测试类
 */
class TestAClass {
  name: string;
  age: number;
  level: number;

  constructor({ name = "", age = 0, level = 1 }: TestAType) {
    this.name = name;
    this.age = age;
    this.level = level;
  }
}

class TestBClass {
  name: string;
  age: number;
  gender: "male" | "female";

  constructor({ name = "", age = 0, gender = "male" }: TestBType) {
    this.name = name;
    this.age = age;
    this.gender = gender;
  }
}

const test = new TestAClass({ name: "test", age: 1, level: 2 });
console.log(JSON.stringify(test));
const testB = new TestBClass({ name: "testB", age: 2, gender: "male" });
console.log(JSON.stringify(testB));

const testArr: TestBaseType[] = [
  {
    name: "testArr",
    age: 3,
  },
  {
    name: "testArr2",
    age: 4,
  },
];

// 类型保护函数

const isA = (item: TestBaseType): item is TestAType => {
  return "level" in item;
};

const isB = (item: TestBaseType): item is TestBType => {
  return "gender" in item;
};

for (const item of testArr) {
  if (isA(item)) {
    console.log(item);
    console.log(item.level);
  } else if (isB(item)) {
    console.log(item);
    console.log(item.gender);
  }
}
