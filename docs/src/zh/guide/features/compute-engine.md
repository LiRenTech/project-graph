# 🧮 自动计算引擎

> [!TIP]
> 本页面中的示例都是可以交互的

当文本内容为特定的格式时，就会变成逻辑节点，例如 `#ADD#`

逻辑节点可以看成一个**函数**，一个有若干个输入值和若干个输出值的函数。

输入值的顺序由节点摆放的x坐标位置，即从左到右排布。输出值的顺序由节点的输出端口位置，即从上到下排布。

例如 `#ADD#` 节点会执行加法运算。它输入无穷多个参数，输出一个值。

按住 x 键时，所有逻辑节点就会以屏幕刷新率的速度不停的执行。松开 x 键时，所有逻辑节点就会停止执行。

> [!NOTE]
> 2025.1.19 日后的开发版中，以及 1.2.7+ 版本中，舞台上有多个逻辑节点交织在一起时，每一帧都会按照从上到下的顺序执行每个逻辑节点。
> 如果两个逻辑节点y轴坐标恰好对齐，相等了，则按照从左到右的顺序执行，即x轴坐标靠左的节点先执行。 节点的坐标位置按左上角顶点位置来算
> 请注意打开特效，能够看到执行顺序编号

> [!NOTE]
> 2025.1.19 日后的开发版中，以及 1.2.7+ 版本中，按住shift+x键，会以更慢的速度，每60帧执行一次。

<Frame :data='{"version":14,"entities":[{"location":[-291.9749994277954,-161],"size":[47.33333396911621,76],"text":"5","uuid":"6d7cef8a-9053-4961-9094-0d77da63fe20","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-129.39999961853027,-161],"size":[47.39999961853027,76],"text":"6","uuid":"bf60e84b-df3b-46f5-b630-ad0b2bf50238","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-260.3999996185303,-49],"size":[142.18333435058594,76],"text":"#ADD#","uuid":"1ff4b853-d34d-4429-803c-b05d254ae96e","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-215.20833206176758,62],"size":[51.79999923706055,76],"text":"...","uuid":"91c8b223-0d56-47c0-9efc-3230f5982fae","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-42.39999961853027,24],"size":[366.1833190917969,76],"text":"此处节点内容为#ADD#","uuid":"2320fc17-c95a-47f0-8607-c37ffa6de3b0","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-112,-7.980690649074305],"uuid":"eb78dfcf-939d-45ee-a0fd-1b0e74521483","type":"core:connect_point","details":""}],"associations":[{"source":"6d7cef8a-9053-4961-9094-0d77da63fe20","target":"1ff4b853-d34d-4429-803c-b05d254ae96e","text":"","uuid":"b450a316-734c-48e9-9950-e8d0c66c31c1","type":"core:line_edge","color":[0,0,0,0]},{"source":"bf60e84b-df3b-46f5-b630-ad0b2bf50238","target":"1ff4b853-d34d-4429-803c-b05d254ae96e","text":"","uuid":"e8f9cbae-1280-4c6a-9384-86f54e6e14b0","type":"core:line_edge","color":[0,0,0,0]},{"source":"1ff4b853-d34d-4429-803c-b05d254ae96e","target":"91c8b223-0d56-47c0-9efc-3230f5982fae","text":"","uuid":"dd2a7131-a3e3-4983-81d2-14ca0c259e9c","type":"core:line_edge","color":[0,0,0,0]},{"source":"2320fc17-c95a-47f0-8607-c37ffa6de3b0","target":"eb78dfcf-939d-45ee-a0fd-1b0e74521483","text":"","uuid":"6d69c2a6-1b11-48b3-a563-fb7359194f7c","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

以上是一个加法的例子，可以将各种逻辑节点组合起来，构筑成一套逻辑

<Frame :data='{"version":14,"entities":[{"location":[-191.39999961853027,-121],"size":[46.11666679382324,76],"text":"2","uuid":"12aab6c5-3ce4-4882-8879-ddcab5568765","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-101.6500015258789,-121],"size":[46.95000076293945,76],"text":"3","uuid":"742197e4-bea9-4008-abda-0a1289ffe7c8","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-12.399999618530273,-121],"size":[46.11666679382324,76],"text":"2","uuid":"5c4dbd5b-fa0e-415c-b75d-f3d4df6d1c45","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-153.39999961853027,5],"size":[148.4499969482422,76],"text":"#POW#","uuid":"4b61e4a2-eddb-4a59-a70e-30f09cc64561","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-112.33333396911621,122],"size":[66.31666564941406,76],"text":"64","uuid":"6026904c-c1a2-486b-ac79-b4effd39ce1a","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[121.45833492279053,-261],"size":[46.11666679382324,76],"text":"2","uuid":"b4574baa-8fa7-4ee5-97b5-f2f1d2f23ce1","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[222.95833110809326,-261],"size":[46.95000076293945,76],"text":"3","uuid":"898dc0c4-9849-4c99-a3af-e8b62867281b","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[121.45833492279053,-149],"size":[148.4499969482422,76],"text":"#POW#","uuid":"3abb5fd4-43de-4fdf-9d7d-4ca6278695f0","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[171.60000038146973,5],"size":[48.16666603088379,76],"text":"8","uuid":"a01e30c9-a2ff-4606-92f5-86cbe1c28fe5","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[279.6000003814697,5],"size":[46.11666679382324,76],"text":"2","uuid":"a7e7be93-138a-40f6-b68b-d37a435338b0","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[177.26667022705078,122],"size":[148.4499969482422,76],"text":"#POW#","uuid":"5015ed73-748d-4e81-83e5-6fcab7cd0c2c","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[218.33333587646484,245],"size":[66.31666564941406,76],"text":"64","uuid":"efabba48-7fa4-456c-9dd6-3a46480a767d","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[{"source":"b4574baa-8fa7-4ee5-97b5-f2f1d2f23ce1","target":"3abb5fd4-43de-4fdf-9d7d-4ca6278695f0","text":"","uuid":"1e8b749c-6625-4b44-83de-24c7dc6439c7","type":"core:line_edge","color":[0,0,0,0]},{"source":"898dc0c4-9849-4c99-a3af-e8b62867281b","target":"3abb5fd4-43de-4fdf-9d7d-4ca6278695f0","text":"","uuid":"4c4936e8-68a7-4b11-a91a-381b85b19434","type":"core:line_edge","color":[0,0,0,0]},{"source":"12aab6c5-3ce4-4882-8879-ddcab5568765","target":"4b61e4a2-eddb-4a59-a70e-30f09cc64561","text":"","uuid":"eed34862-a6ed-4904-920a-61eccef2429a","type":"core:line_edge","color":[0,0,0,0]},{"source":"742197e4-bea9-4008-abda-0a1289ffe7c8","target":"4b61e4a2-eddb-4a59-a70e-30f09cc64561","text":"","uuid":"ab4739ee-1e69-4cbe-9551-f06496324746","type":"core:line_edge","color":[0,0,0,0]},{"source":"5c4dbd5b-fa0e-415c-b75d-f3d4df6d1c45","target":"4b61e4a2-eddb-4a59-a70e-30f09cc64561","text":"","uuid":"1ebff708-04cc-4021-897a-d0380787eb4e","type":"core:line_edge","color":[0,0,0,0]},{"source":"4b61e4a2-eddb-4a59-a70e-30f09cc64561","target":"6026904c-c1a2-486b-ac79-b4effd39ce1a","text":"","uuid":"b79cebf8-6a76-4d32-a567-486cb53f917e","type":"core:line_edge","color":[0,0,0,0]},{"source":"3abb5fd4-43de-4fdf-9d7d-4ca6278695f0","target":"a01e30c9-a2ff-4606-92f5-86cbe1c28fe5","text":"","uuid":"627908b5-0dfe-48f9-b04f-7977eacd7afe","type":"core:line_edge","color":[0,0,0,0]},{"source":"a01e30c9-a2ff-4606-92f5-86cbe1c28fe5","target":"5015ed73-748d-4e81-83e5-6fcab7cd0c2c","text":"","uuid":"0ecc1697-1dc2-4359-ad9d-09c6814b7acc","type":"core:line_edge","color":[0,0,0,0]},{"source":"a7e7be93-138a-40f6-b68b-d37a435338b0","target":"5015ed73-748d-4e81-83e5-6fcab7cd0c2c","text":"","uuid":"de3f0b4f-c926-4bee-958c-5f3beba78907","type":"core:line_edge","color":[0,0,0,0]},{"source":"5015ed73-748d-4e81-83e5-6fcab7cd0c2c","target":"efabba48-7fa4-456c-9dd6-3a46480a767d","text":"","uuid":"d0d772dd-3677-42ae-b4ee-33dbfd1daca1","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

以上是一个计算 `(2^3)^2 = 64` 的运算方法，既可以使用两个逻辑节点分步骤运算，也可以直接用一个逻辑节点来计算，至于是否能接收超过两个以上的输入值，需要看对应逻辑节点的具体说明。

## 节点类型及功能

### 数学类

#### 一元运算

- `#ABS#`: 计算每一个父节点的绝对值，并依次输出这些值
- `#FLOOR#`: 将单个父节点文本转换为数字后取整（向下取整）。
- `#CEIL#`: 将单个父节点文本转换为数字后取整（向上取整）。
- `#SQRT#`: 将所有父节点数字开平方并依次输出

#### 二元运算

- `#ADD#`: 累加，计算所有父节点文本转换为数字的和。
- `#SUB#`: 累减，将所有的父节点按照从左到右的顺序依次做减法运算，例如 10 5 2 会变成 10 - 5 - 2，结果为3。
- `#MUL#`: 累乘，计算所有父节点文本转换为数字的乘积。
- `#DIV#`: 累除，原理同减法。
- `#MOD#`: 计算前两个父节点文本转换为数字的余数 例如 `5 % 2 = 1`。
- `#POW#`: 左侧父节点值为a，右侧父节点值为b，输出 a的b次方
- `#LOG#`: 左侧父节点值为a，右侧父节点值为b，输出 log以a为底，b的对数

#### 一元函数

- `#LN#`: 将所有父节点的数字取 ln(x) 并依次输出
- `#EXP#`: 将所有父节点的数字取 e^x 并依次输出
- `#SIN#`: 将所有父节点的数字 x 取 sin(x) 并依次输出
- `#COS#`: 同理sin
- `#TAN#`: 同理sin
- `#ASIN#`: 将所有父节点的数字 x 取 arcsin(x) 并依次输出
- `#ACOS#`: 同理arcsin
- `#ATAN#`: 同理arcsin

## 取值和比较

- `#MAX#`: 计算所有父节点文本转换为数字的最大值。
- `#MIN#`: 计算所有父节点文本转换为数字的最小值。

以下是比较节点，都是输入左右两个节点和输出一个节点。

若比较成立，则输出1，不成立输出0。

- `#LT#`: <
- `#GT#`: >
- `#LTE#`: ≤
- `#GTE#`: ≥
- `#EQ#`: 判断等于
- `#NEQ#`: 判断不等于

### 逻辑门运算

- `#AND#`: 计算所有父节点文本转换为数字的与运算。
- `#OR#`: 计算所有父节点文本转换为数字的或运算。
- `#NOT#`: 如果有一个父节点，计算其逻辑非值（0 变 1，非 0 变 0）。
- `#XOR#`: 异或运算

### 字符串操作

- `#UPPER#`: 将单个父节点文本转换为大写。
- `#LOWER#`: 将单个父节点文本转换为小写。
- `#LEN#`: 计算单个父节点文本的长度。
- `#COPY#`: 复制单个父节点的文本。
- `#SPLIT#`: 根据第二个父节点文本作为分隔符，对第一个父节点文本进行分割，输出多个结果。
- `#REPLACE#`: 将第一个父节点的文本中替换掉第二个父节点文本为第三个父节点的文本。
- `#CONNECT#`: 将所有父节点文本连接成一个字符串。

### 概率论与数理统计

- `#RANDOM#`: 生成一个随机数。
- `#RANDOM_INT#`: 输入a,b两个整数，输出一个[a, b]范围内的随机整数。
- `#RANDOM_FLOAT#`: 输入a,b两个浮点数（实数），输出一个[a, b]范围内的随机浮点数。
- `#RANDOM_POISSON#`: 泊松分布，输入一个参数λ，输出一个随机数。
- `#COUNT#`: 输出所有父节点的数量。
- `#AVE#`: 输出所有父节点的平均值。
- `#MEDIAN#`: 输出所有父节点的中位数。
- `#MODE#`: 输出所有父节点的众数。
- `#VARIANCE#`: 输出所有父节点的方差。
- `#STANDARD_DEVIATION#`: 输出所有父节点的标准差。

敬请期待

### 节点操作

- `#RGB#`: 将三个节点连向此逻辑节点，分别是0~255之间的数字。再将此逻辑节点连向一个节点，运行后即可将指定的节点填充颜色
- `#RGBA#`: 同上，只不过输入的节点数量变成4，新增一个0~1的透明度值
- `#GET_NODE_RGBA#`: 将一个节点连向此逻辑节点，会输出四个值，分别表示该输入节点的颜色，r，g，b，a
- `#COLLECT_NODE_NAME_BY_RGBA#`: 输入四个值（r,g,b,a），运行后，该逻辑节点将收集全舞台上所有和该颜色完全相等的文本节点的内容，并依次输出成新的文本节点。注：在收集的过程中，直接和逻辑节点相连接的节点会被过滤。

<Frame :data='{"version":14,"entities":[{"location":[-170.34166526794434,-214.5],"size":[66.81666564941406,76],"text":"n0","uuid":"3b2e6369-ad58-4bea-bd10-345b8ac94193","details":"","color":[239,68,68,1],"type":"core:text_node"},{"location":[-66.3916654586792,-213.5],"size":[59.433332443237305,76],"text":"n1","uuid":"0511b26f-bbd0-4d18-8ccb-112215d0c45d","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[30.100000381469727,-213.5],"size":[64.6500015258789,76],"text":"n2","uuid":"173bb43c-40da-4552-a7e1-4a68895d8b6d","details":"","color":[239,68,68,1],"type":"core:text_node"},{"location":[-68.39999961853027,-104],"size":[65.45000076293945,76],"text":"n4","uuid":"37a055d0-3ff1-4ff9-b371-8f859e0b06a8","details":"","color":[239,68,68,1],"type":"core:text_node"},{"location":[-169.67499923706055,-104],"size":[65.48333358764648,76],"text":"n3","uuid":"aab1b54c-3fa5-4f3f-8021-0b39e3a4b013","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[29.491668701171875,-104],"size":[65.86666488647461,76],"text":"n5","uuid":"c15f1535-4c55-4fab-8505-ac7df8f1e36e","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-169.89999961853027,-2],"size":[65.93333435058594,76],"text":"n6","uuid":"c790b841-e014-4d45-8c86-81837ba9d8c1","details":"","color":[239,68,68,1],"type":"core:text_node"},{"location":[-66.71666526794434,-2],"size":[62.08333206176758,76],"text":"n7","uuid":"9df36667-74a5-4d53-89c3-c87d222d7282","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[29.075000762939453,-2],"size":[66.70000076293945,76],"text":"n8","uuid":"3f0150d9-0511-4cf6-812d-4c02e86d28e2","details":"","color":[239,68,68,1],"type":"core:text_node"},{"location":[-216.39999961853027,139],"size":[84.26666641235352,76],"text":"239","uuid":"70eaac49-ac90-4e93-84b3-c525961a7538","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-93.39999961853027,139],"size":[67.56666564941406,76],"text":"68","uuid":"dfe0c17b-335a-4ae4-b5c3-0a638d3b8bbf","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[12.600000381469727,139],"size":[67.56666564941406,76],"text":"68","uuid":"f4eb15e2-bd4d-4be1-9ad2-76a7f86559f3","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[123.0697579714909,139],"size":[40.89999961853027,76],"text":"1","uuid":"b5877ba3-e484-4e39-b70b-8eaabf26aa89","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,268.6829182375031],"size":[584.816650390625,76],"text":"#COLLECT_NODE_NAME_BY_RGBA#","uuid":"d75c83e3-a433-4f6a-a971-4c41058e96c7","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,368.6829182375031],"size":[66.81666564941406,76],"text":"n0","uuid":"ce86fcf4-5aaa-42e4-96aa-36b19cfffbb3","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,468.6829182375031],"size":[64.6500015258789,76],"text":"n2","uuid":"4950dc04-0211-4e04-a789-8fd0203154bf","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,568.6829182375031],"size":[65.45000076293945,76],"text":"n4","uuid":"5faf06fe-7188-4b44-9f07-318beab66a8e","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,668.6829182375031],"size":[65.93333435058594,76],"text":"n6","uuid":"57a6ddf2-b069-4681-8d37-ce68603345f8","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-328.08332443237305,768.6829182375031],"size":[66.70000076293945,76],"text":"n8","uuid":"e79f9386-8af3-4429-8a24-bfb2bc3744bd","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[{"source":"0511b26f-bbd0-4d18-8ccb-112215d0c45d","target":"3b2e6369-ad58-4bea-bd10-345b8ac94193","text":"","uuid":"88458190-8e8f-4fa8-816d-367e31e7f754","type":"core:line_edge","color":[0,0,0,0]},{"source":"0511b26f-bbd0-4d18-8ccb-112215d0c45d","target":"173bb43c-40da-4552-a7e1-4a68895d8b6d","text":"","uuid":"049e8303-1c39-4a00-a291-3501c1bd22be","type":"core:line_edge","color":[0,0,0,0]},{"source":"0511b26f-bbd0-4d18-8ccb-112215d0c45d","target":"37a055d0-3ff1-4ff9-b371-8f859e0b06a8","text":"","uuid":"995842d5-e16f-4e32-bc59-93f58d461de7","type":"core:line_edge","color":[0,0,0,0]},{"source":"37a055d0-3ff1-4ff9-b371-8f859e0b06a8","target":"aab1b54c-3fa5-4f3f-8021-0b39e3a4b013","text":"","uuid":"abf8305e-d290-4b73-8ae5-0b3724802af9","type":"core:line_edge","color":[0,0,0,0]},{"source":"37a055d0-3ff1-4ff9-b371-8f859e0b06a8","target":"c15f1535-4c55-4fab-8505-ac7df8f1e36e","text":"","uuid":"7364bcdf-d4cc-46a4-af1a-a61e040d2219","type":"core:line_edge","color":[0,0,0,0]},{"source":"aab1b54c-3fa5-4f3f-8021-0b39e3a4b013","target":"c790b841-e014-4d45-8c86-81837ba9d8c1","text":"","uuid":"ecc578c2-6360-419c-874a-ab7a291bcbec","type":"core:line_edge","color":[0,0,0,0]},{"source":"c790b841-e014-4d45-8c86-81837ba9d8c1","target":"9df36667-74a5-4d53-89c3-c87d222d7282","text":"","uuid":"288fe81e-1c1b-497d-a2e0-4007f0f3f767","type":"core:line_edge","color":[0,0,0,0]},{"source":"c15f1535-4c55-4fab-8505-ac7df8f1e36e","target":"3f0150d9-0511-4cf6-812d-4c02e86d28e2","text":"","uuid":"5dd29193-fdae-49b5-96f5-f536c69fe452","type":"core:line_edge","color":[0,0,0,0]},{"source":"70eaac49-ac90-4e93-84b3-c525961a7538","target":"d75c83e3-a433-4f6a-a971-4c41058e96c7","text":"","uuid":"4b4f9c46-d442-47a3-84bd-e20df4359883","type":"core:line_edge","color":[0,0,0,0]},{"source":"dfe0c17b-335a-4ae4-b5c3-0a638d3b8bbf","target":"d75c83e3-a433-4f6a-a971-4c41058e96c7","text":"","uuid":"953ce026-ab1f-4b02-af8c-5836719af404","type":"core:line_edge","color":[0,0,0,0]},{"source":"f4eb15e2-bd4d-4be1-9ad2-76a7f86559f3","target":"d75c83e3-a433-4f6a-a971-4c41058e96c7","text":"","uuid":"65b615ef-dc0e-463a-9539-59c7190601cf","type":"core:line_edge","color":[0,0,0,0]},{"source":"b5877ba3-e484-4e39-b70b-8eaabf26aa89","target":"d75c83e3-a433-4f6a-a971-4c41058e96c7","text":"","uuid":"ac9e6f5d-b5a5-4e3a-b2d7-12adf53f805a","type":"core:line_edge","color":[0,0,0,0]},{"source":"d75c83e3-a433-4f6a-a971-4c41058e96c7","target":"ce86fcf4-5aaa-42e4-96aa-36b19cfffbb3","text":"","uuid":"46728a9f-badc-44d7-92e8-ef604e70f365","type":"core:line_edge","color":[0,0,0,0]},{"source":"d75c83e3-a433-4f6a-a971-4c41058e96c7","target":"4950dc04-0211-4e04-a789-8fd0203154bf","text":"","uuid":"2200328a-b41a-4716-9f1c-4e1ba0d9cf79","type":"core:line_edge","color":[0,0,0,0]},{"source":"d75c83e3-a433-4f6a-a971-4c41058e96c7","target":"5faf06fe-7188-4b44-9f07-318beab66a8e","text":"","uuid":"f3128c1b-c913-4eed-9b0f-b894fed4bee9","type":"core:line_edge","color":[0,0,0,0]},{"source":"d75c83e3-a433-4f6a-a971-4c41058e96c7","target":"57a6ddf2-b069-4681-8d37-ce68603345f8","text":"","uuid":"4acfce7b-1937-4597-9c84-9ac03e0bdc39","type":"core:line_edge","color":[0,0,0,0]},{"source":"d75c83e3-a433-4f6a-a971-4c41058e96c7","target":"e79f9386-8af3-4429-8a24-bfb2bc3744bd","text":"","uuid":"4e6a7772-cbe5-4996-9d50-44e119d27bb4","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

> [!TIP]
> 例如上图的例子，可以将所有通过颜色标注的节点提取出来，统一看看

- `#COLLECT_NODE_DETAILS_BY_RGBA#`: 同上，只是收集的是所有目标颜色节点的详细信息并将他们输出成新的文本节点。

- `#GET_LOCATION#`: 获取输入节点的左上角位置，并输出两个值，一个是x值（偏上），一个是y值（偏下）
- `#SET_LOCATION#`: 将两个值连向此逻辑节点，左侧代表x，右侧代表y，再将此逻辑节点连向一个节点，运行后即可将此节点的左上角位置对准指定的目标位置。
- `#GET_SIZE#`: 将一个节点连向此逻辑节点，逻辑节点将输出该节点的大小，一个是宽度，一个是高度
- `#GET_MOUSE_LOCATION#`: 运行后，此逻辑节点直接输出鼠标的x值和y值，注意是世界坐标系，不是窗口坐标系。
- `#IS_COLLISION#`: 输入两个节点，输出一个0/1的节点，如果两个节点碰撞了，则输出值为1
- `#CREATE_TEXT_NODE_ON_LOCATION#`: 在特定位置创建一个文本节点，第一个输入x值，第二个输入y值，第三个输入节点文本内容，第四个输入0/1代表是否创建（1代表创建，0代表不创建，可以在上游增加一个瞬时脉冲电路来防止按下x后创建很多重叠的重复节点）。

### 类编程操作

- `#SET_VAR#`: 输入两个节点，左节点是变量名，右节点是变量的值，相当于编程语言中最基础的赋值操作。
- `#GET_VAR#`: 输入一个节点，当节点名称恰好是曾经赋值过的变量名时，会输出这个变量的值。

<Frame :data='{"version":14,"entities":[{"location":[-234.5191610915388,-239.28829721107098],"size":[45.28333282470703,76],"text":"a","uuid":"7b915d6c-08c4-4ef4-9416-99e1a7ed21e5","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-152.18665142646424,-239.28829721107098],"size":[59.816667556762695,76],"text":"14","uuid":"1ba845ba-7899-466a-936a-92fcb1bb11bf","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-266.144079581711,-113.18400617901315],"size":[205.4499969482422,76],"text":"#SET_VAR#","uuid":"a782416b-b2cd-48e7-9e99-50103027ae4d","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-234.860746757004,-3.8631007196321434],"size":[142.88333129882812,76],"text":"success","uuid":"b4771905-9259-4eb9-9b03-770049274886","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[98.70279125717038,-239.28829721107098],"size":[45.28333282470703,76],"text":"a","uuid":"bf35f854-95fa-49ec-ac47-306588f2912e","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[16.494459195402783,-113.18400617901315],"size":[209.6999969482422,76],"text":"#GET_VAR#","uuid":"cf418ad1-bbe4-47d3-898b-88253d3c0cae","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[91.1944580509936,-3.8631007196321434],"size":[59.816667556762695,76],"text":"14","uuid":"ba8bd238-b121-4b88-9140-63e272e5da63","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-137.2607482828829,121.1701882282209],"size":[45.28333282470703,76],"text":"a","uuid":"396e00ef-57b8-4f04-b192-c5916395242a","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[11.369455380705517,121.1701882282209],"size":[132.61666870117188,76],"text":"114500","uuid":"ad8b613a-2806-4c30-b355-34a5953670b9","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-72.90560814543284,229.0263799724529],"size":[142.18333435058594,76],"text":"#ADD#","uuid":"98479ba6-7ec4-42f6-9097-df695452c24c","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-63.747275320725805,346.3366329684542],"size":[123.86666870117188,76],"text":"114514","uuid":"98816e5d-95d5-45e5-b976-f4208e9f7692","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[{"source":"7b915d6c-08c4-4ef4-9416-99e1a7ed21e5","target":"a782416b-b2cd-48e7-9e99-50103027ae4d","text":"","uuid":"103ad333-cc40-44b0-a79b-8b70a219c9bc","type":"core:line_edge","color":[0,0,0,0]},{"source":"1ba845ba-7899-466a-936a-92fcb1bb11bf","target":"a782416b-b2cd-48e7-9e99-50103027ae4d","text":"","uuid":"d5935aa5-fb0a-48bf-9f46-05c9f9e53c17","type":"core:line_edge","color":[0,0,0,0]},{"source":"a782416b-b2cd-48e7-9e99-50103027ae4d","target":"b4771905-9259-4eb9-9b03-770049274886","text":"","uuid":"a77c6107-5819-4c44-97ad-f4d8860f7903","type":"core:line_edge","color":[0,0,0,0]},{"source":"bf35f854-95fa-49ec-ac47-306588f2912e","target":"cf418ad1-bbe4-47d3-898b-88253d3c0cae","text":"","uuid":"0b39cc27-5c48-439f-a66c-a47073e2cd84","type":"core:line_edge","color":[0,0,0,0]},{"source":"cf418ad1-bbe4-47d3-898b-88253d3c0cae","target":"ba8bd238-b121-4b88-9140-63e272e5da63","text":"","uuid":"f3abfe73-8545-4e96-b146-07b07e8686e5","type":"core:line_edge","color":[0,0,0,0]},{"source":"396e00ef-57b8-4f04-b192-c5916395242a","target":"98479ba6-7ec4-42f6-9097-df695452c24c","text":"","uuid":"51be11fc-52ed-49ed-8128-1aa8ac79409b","type":"core:line_edge","color":[0,0,0,0]},{"source":"ad8b613a-2806-4c30-b355-34a5953670b9","target":"98479ba6-7ec4-42f6-9097-df695452c24c","text":"","uuid":"7aac0b1a-0dbe-496f-850d-09c5ebf90621","type":"core:line_edge","color":[0,0,0,0]},{"source":"98479ba6-7ec4-42f6-9097-df695452c24c","target":"98816e5d-95d5-45e5-b976-f4208e9f7692","text":"","uuid":"3273c244-58cb-4375-bce0-15af72272b1b","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

> [!TIP]
> 这里的设计思路是按照脚本语言python设计的，直接赋值即可完成声明。如果使用了不存在的变量，会输出NaN

### 摄像机操作

- `#GET_CAMERA_LOCATION#`: 运行后，直接输出摄像机所在的世界位置
- `#SET_CAMERA_LOCATION#`: 运行后，将两个输入的值作为x值和y值，将摄像机移动到此位置上。
- `#GET_CAMERA_SCALE#`: 获取摄像机的缩放等级数字
- `#SET_CAMERA_SCALE#`: 设置摄像机的缩放等级数字

### 声音操作

- `#PLAY_SOUND#`: 输入一个绝对文件路径和一个0/1，当第二个节点为1时，运行即可播放该文件对应的音频

### 其他操作

- `#GET_TIME#`: 获取此时此刻的时间戳
- `#FPS#`: 获取此时渲染帧率（不同的电脑和显示器可能不同，一般为60，如果您的显卡和显示器强劲，可能达到100+）

## 简化的运算方法

<Frame :data='{"version":14,"entities":[{"location":[-130.3251714592078,-51.93234173201536],"size":[40.89999961853027,76],"text":"1","uuid":"5540a567-736e-4774-8f47-3b522c16fe80","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[-3.827168796091925,-51.93234173201536],"size":[46.11666679382324,76],"text":"2","uuid":"2c12f5cd-f246-4290-baf5-c8f66880c033","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[100.03434917994,-51.93234173201536],"size":[46.95000076293945,76],"text":"3","uuid":"56d8ab61-1edb-452a-8f6f-cf827142a231","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[{"source":"5540a567-736e-4774-8f47-3b522c16fe80","target":"2c12f5cd-f246-4290-baf5-c8f66880c033","text":"+","uuid":"c42eee27-e4b5-42be-a8cc-5f1a31db83bf","type":"core:line_edge","color":[0,0,0,0]},{"source":"2c12f5cd-f246-4290-baf5-c8f66880c033","target":"56d8ab61-1edb-452a-8f6f-cf827142a231","text":"","uuid":"d10aa6c3-8dde-4a09-8e49-8704e2068ac8","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

可以直接把 + - \* / 等二元运算符号写在线上，然后按下`x`键直接生成计算结果

甚至还可以进一步简化：

<Frame :data='{"version":14,"entities":[{"location":[-87.71531793057927,-45.27455211816715],"size":[40.89999961853027,76],"text":"1","uuid":"5540a567-736e-4774-8f47-3b522c16fe80","details":"","color":[0,0,0,0],"type":"core:text_node"},{"location":[38.78268473253657,-45.27455211816715],"size":[46.95000076293945,76],"text":"3","uuid":"2c12f5cd-f246-4290-baf5-c8f66880c033","details":"","color":[0,0,0,0],"type":"core:text_node"}],"associations":[{"source":"5540a567-736e-4774-8f47-3b522c16fe80","target":"2c12f5cd-f246-4290-baf5-c8f66880c033","text":"+2","uuid":"c42eee27-e4b5-42be-a8cc-5f1a31db83bf","type":"core:line_edge","color":[0,0,0,0]}],"tags":[]}' />

将 `+2` 写在线上，然后按下 `x` 键，生成计算结果

## 使用流程

1. 创建所需功能的节点（如 `#ADD#`， `#SUB#` 等）。
2. 确保每个逻辑节点都有正确的父节点输入。
3. 运行自动计算引擎，输出结果将在相关子节点中显示。

## 注意事项

- 在进行数学运算时，确保输入可以正确转换为数字。
- 特定节点功能如 `#SPLIT#` 和 `#REPLACE#` 需要满足父节点的数量要求。
- 使用时，确保节点的逻辑关系正确，以避免计算错误。
- 若发现使用情况和文档说明不一致，可以在github issue中反馈。
