# namespace转换为class的方法

一个namespace：

```ts
namespace Cat {
  export let TYPE = "cat";
  export let name: string = "Diona";
  let meowCount: number = 0;
  export let color: Color = new Color(255, 0, 0);
  export function init() {
    console.log("wow, a new cat");
  }
  export function meow() {
    meowCount++;
  }
  function sleep() {}
}
```

转换为class：

```ts
class Cat {
  static TYPE = "cat";
  name: string = "Diona";
  private meowCount: number = 0;
  readonly color: Color = new Color(255, 0, 0);
  constructor() {
    console.log("wow, a new cat");
  }
  meow() {
    this.meowCount++;
  }
  private sleep() {}
}
```

注意语法！
比如class的属性不能加let

namespace转换为class的时候，
注意只有**大写下划线命名**的属性**才**能用static(不是const常量**也可以**),其他**都是**对象实例的**属性or方法**
eg. 上面的TYPE属性

init要改成无参数的constructor

GIVE ME THE **FULL** CODE!!!
TALK IS CHEAP, SHOW ME THE CODE!
