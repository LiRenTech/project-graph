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

<svg xmlns="http://www.w3.org/2000/svg" width="652.671875" height="1185.9441159641426" viewBox="-529 -362.94411596414267 652.671875 1185.9441159641426" style="background-color:rgba(31, 31, 31, 1)"><rect x="-374.0" y="-332.9" width="67.3" height="76.0" rx="8" ry="8" fill="rgba(239, 68, 68, 1)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-340.3360061645508" y="-280.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n0</text><rect x="-266.0" y="-332.9" width="60.3" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-235.87200927734375" y="-280.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n1</text><rect x="-164.0" y="-332.9" width="65.2" height="76.0" rx="8" ry="8" fill="rgba(239, 68, 68, 1)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-131.37600708007812" y="-280.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n2</text><rect x="-374.0" y="-197.9" width="66.0" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-341.0080032348633" y="-145.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n3</text><rect x="-266.0" y="-197.9" width="66.0" height="76.0" rx="8" ry="8" fill="rgba(239, 68, 68, 1)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-232.97600555419922" y="-145.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n4</text><rect x="-164.0" y="-197.9" width="66.3" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-130.8320083618164" y="-145.94411596414267" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n5</text><rect x="-374.0" y="-65.9" width="66.5" height="76.0" rx="8" ry="8" fill="rgba(239, 68, 68, 1)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-340.7520065307617" y="-13.944115964142753" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n6</text><rect x="-266.0" y="-65.9" width="62.8" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-234.62400817871094" y="-13.944115964142753" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n7</text><rect x="-164.0" y="-65.9" width="67.2" height="76.0" rx="8" ry="8" fill="rgba(239, 68, 68, 1)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-130.38400268554688" y="-13.944115964142753" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n8</text><rect x="-499.0" y="217.0" width="592.7" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-202.6640625" y="269" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">#COLLECT_NODE_NAME_BY_RGBA#</text><rect x="-374.0" y="73.0" width="84.0" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-332.0160140991211" y="125" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">239</text><rect x="-266.0" y="73.0" width="68.1" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-231.9520034790039" y="125" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">68</text><rect x="-164.0" y="74.0" width="68.1" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-129.9520034790039" y="126" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">68</text><rect x="-67.0" y="74.0" width="41.4" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-46.280006408691406" y="126" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">1</text><rect x="-499.0" y="317.0" width="67.3" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-465.3360061645508" y="369" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n0</text><rect x="-499.0" y="417.0" width="65.2" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-466.3760070800781" y="469" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n2</text><rect x="-499.0" y="517.0" width="66.0" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-465.9760055541992" y="569" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n4</text><rect x="-499.0" y="617.0" width="66.5" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-465.7520065307617" y="669" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n6</text><rect x="-499.0" y="717.0" width="67.2" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-465.3840026855469" y="769" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">n8</text><line x1="-266.0" y1="-294.9" x2="-306.7" y2="-294.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-306.7,-294.9 -292.2,-291.1 -299.2,-294.9 -292.2,-298.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-235.1" y1="-256.9" x2="-233.8" y2="-197.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-233.8,-197.9 -230.2,-212.5 -234.0,-205.4 -238.0,-212.3" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-205.7" y1="-294.9" x2="-164.0" y2="-294.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-164.0,-294.9 -178.5,-298.8 -171.5,-294.9 -178.5,-291.1" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-266.0" y1="-159.9" x2="-308.0" y2="-159.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-308.0,-159.9 -293.5,-156.1 -300.5,-159.9 -293.5,-163.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-340.9" y1="-121.9" x2="-340.8" y2="-65.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-340.8,-65.9 -337.0,-80.4 -340.8,-73.4 -344.7,-80.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-307.5" y1="-27.9" x2="-266.0" y2="-27.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-266.0,-27.9 -280.5,-31.8 -273.5,-27.9 -280.5,-24.1" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-200.0" y1="-159.9" x2="-164.0" y2="-159.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-164.0,-159.9 -178.5,-163.8 -171.5,-159.9 -178.5,-156.1" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-130.7" y1="-121.9" x2="-130.5" y2="-65.9" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-130.5,-65.9 -126.7,-80.4 -130.5,-73.4 -134.4,-80.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-297.9" y1="149.0" x2="-236.8" y2="217.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-236.8,217.0 -243.6,203.6 -241.8,211.4 -249.4,208.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-224.2" y1="149.0" x2="-210.4" y2="217.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-210.4,217.0 -209.5,202.0 -211.9,209.7 -217.1,203.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-149.3" y1="150.0" x2="-183.3" y2="217.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-183.3,217.0 -173.3,205.8 -179.9,210.3 -180.2,202.3" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-67.0" y1="130.9" x2="-161.1" y2="217.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-161.1,217.0 -147.8,210.1 -155.6,211.9 -153.0,204.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-302.5" y1="293.0" x2="-431.7" y2="342.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-431.7,342.2 -416.7,340.7 -424.7,339.5 -419.5,333.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-252.8" y1="293.0" x2="-433.8" y2="430.3" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-433.8,430.3 -419.9,424.6 -427.8,425.7 -424.6,418.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-236.0" y1="293.0" x2="-433.0" y2="517.4" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-433.0,517.4 -420.5,509.0 -428.0,511.7 -426.3,503.9" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-227.7" y1="293.0" x2="-440.8" y2="617.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-440.8,617.0 -429.6,607.0 -436.6,610.7 -436.0,602.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-222.6" y1="293.0" x2="-445.4" y2="717.0" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-445.4,717.0 -435.2,706.0 -441.9,710.4 -442.1,702.4" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>

> Tip
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

<svg xmlns="http://www.w3.org/2000/svg" width="533.4020515312213" height="708.7241577758729" viewBox="141.05363505619334 227.8382750841514 533.4020515312213 708.7241577758729" style="background-color:rgba(31, 31, 31, 1)"><rect x="171.1" y="257.8" width="45.7" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="185.1" y="309.8" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">a</text><rect x="306.3" y="257.8" width="65.5" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="320.3" y="309.8" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">16</text><rect x="171.1" y="372.2" width="208.4" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="185.1" y="424.2" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">#SET_VAR#</text><rect x="200.2" y="485.2" width="142.4" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="214.2" y="537.2" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">success</text><rect x="432.0" y="372.2" width="212.5" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="446.0" y="424.2" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">#GET_VAR#</text><rect x="512.2" y="257.8" width="45.7" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="526.2" y="309.8" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">a</text><rect x="502.2" y="485.2" width="65.5" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="516.2" y="537.2" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">16</text><rect x="200.2" y="601.0" width="45.7" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="214.2" y="653.0" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">a</text><rect x="306.3" y="717.3" width="140.1" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="320.3" y="769.3" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">#ADD#</text><rect x="445.9" y="601.0" width="121.8" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="459.9" y="653.0" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">10000</text><rect x="315.4" y="830.6" width="121.8" height="76.0" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="329.4" y="882.6" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="start" font-family="MiSans">10016</text><line x1="216.7" y1="328.0" x2="248.2" y2="372.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="248.2,372.2 243.0,358.1 243.9,366.1 236.6,362.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="317.8" y1="333.8" x2="296.4" y2="372.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="296.4,372.2 306.9,361.4 300.1,365.6 300.1,357.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="273.9" y1="448.2" x2="272.7" y2="485.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="272.7,485.2 277.1,470.9 273.0,477.7 269.3,470.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="536.1" y1="333.8" x2="537.1" y2="372.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="537.1,372.2 540.6,357.6 536.9,364.7 532.9,357.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="537.1" y1="448.2" x2="536.1" y2="485.2" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="536.1,485.2 540.4,470.9 536.3,477.7 532.6,470.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="245.9" y1="656.4" x2="326.2" y2="717.3" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="326.2,717.3 317.0,705.5 320.3,712.8 312.3,711.6" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="464.2" y1="677.0" x2="419.0" y2="717.3" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="419.0,717.3 432.4,710.6 424.6,712.3 427.2,704.8" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="376.3" y1="793.3" x2="376.3" y2="830.6" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="376.3,830.6 380.2,816.1 376.3,823.1 372.4,816.1" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>

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

<svg xmlns="http://www.w3.org/2000/svg" width="323.43266367756337" height="120" viewBox="-1040.5456294005528 -830.9628914494324 323.43266367756337 120" style="background-color:rgba(31, 31, 31, 1)"><rect x="-1010.5456294005528" y="-800.9628914494324" width="41.43998718261719" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-989.8256358092442" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">1</text><rect x="-896.9294526884205" y="-800.9628914494324" width="46.43199157714844" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-873.7134568998463" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">2</text><rect x="-794.2809649905676" y="-800.9628914494324" width="47.167999267578125" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-770.6969653567785" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">3</text><line x1="-969.1056422179356" y1="-770.9628914494324" x2="-942.9055403120648" y2="-770.9628914494324" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><line x1="-896.9294526884205" y1="-770.9628914494324" x2="-923.1295545942913" y2="-770.9628914494324" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><text x="-933.017547453178" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">+</text><polygon points="-896.9294526884205,-770.9628914494324 -911.4183400827566,-774.8451771259702 -904.4294526884205,-770.9628914494324 -911.4183400827566,-767.0806057728946" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="-850.4974611112721" y1="-770.9628914494324" x2="-794.2809649905676" y2="-770.9628914494324" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="-794.2809649905676,-770.9628914494324 -808.7698523849036,-774.8451771259702 -801.7809649905676,-770.9628914494324 -808.7698523849036,-767.0806057728946" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>

可以直接把 + - \* / 等二元运算符号写在线上，然后按下`x`键直接生成计算结果

甚至还可以进一步简化：

<svg xmlns="http://www.w3.org/2000/svg" width="269.3659029817477" height="120" viewBox="-1040.5456294005528 -830.9628914494324 269.3659029817477 120" style="background-color:rgba(31, 31, 31, 1)"><rect x="-1010.5456294005528" y="-800.9628914494324" width="41.43998718261719" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-989.8256358092442" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">1</text><rect x="-848.3477256863832" y="-800.9628914494324" width="47.167999267578125" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="-824.7637260525942" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">3</text><line x1="-969.1056422179356" y1="-770.9628914494324" x2="-927.8306725996204" y2="-770.9628914494324" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><line x1="-848.3477256863832" y1="-770.9628914494324" x2="-889.6226953046985" y2="-770.9628914494324" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><text x="-908.7266839521594" y="-756.9628914494324" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">+2</text><polygon points="-848.3477256863832,-770.9628914494324 -862.8366130807193,-774.8451771259702 -855.8477256863832,-770.9628914494324 -862.8366130807193,-767.0806057728946" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>

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
