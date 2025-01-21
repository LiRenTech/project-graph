# 🧮 自动计算引擎

当文本内容为特定的格式时，就会变成逻辑节点，例如 `#ADD#`

逻辑节点可以看成一个**函数**，一个有若干个输入值和若干个输出值的函数。

输入值的顺序由节点摆放的x坐标位置，即从左到右排布。输出值的顺序由节点的输出端口位置，即从上到下排布。

例如 `#ADD#` 节点会执行加法运算。它输入无穷多个参数，输出一个值。

按住 x 键时，所有逻辑节点就会以屏幕刷新率的速度不停的执行。松开 x 键时，所有逻辑节点就会停止执行。

> [!TIP]
> 2025.1.19 日后的开发版中，以及 1.2.7+ 版本中，舞台上有多个逻辑节点交织在一起时，每一帧都会按照从上到下的顺序执行每个逻辑节点。
> 如果两个逻辑节点y轴坐标恰好对齐，相等了，则按照从左到右的顺序执行，即x轴坐标靠左的节点先执行。 节点的坐标位置按左上角顶点位置来算
> 请注意打开特效，能够看到执行顺序编号

> [!TIP]
> 2025.1.19 日后的开发版中，以及 1.2.7+ 版本中，按住shift+x键，会以更慢的速度，每60帧执行一次。

<center>
<svg xmlns="http://www.w3.org/2000/svg" width="205.28272267699867" height="297.47410376385596" viewBox="5568.973032631503 -3118.505267408721 205.28272267699867 297.47410376385596" style="background-color:rgba(31, 31, 31, 1)"><rect x="5598.973032631503" y="-3088.505267408721" width="47.519989013671875" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="5622.733027138339" y="-3044.505267408721" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">5</text><rect x="5696.57576263272" y="-3086.5084800877767" width="47.67999267578125" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="5720.415758970611" y="-3042.5084800877767" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">6</text><rect x="5599.119252985801" y="-3002.381726281242" width="143.8399658203125" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="5671.039235895957" y="-2958.381726281242" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">#ADD#</text><rect x="5644.190722829665" y="-2911.031163644865" width="54.879974365234375" height="60" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="5671.630710012282" y="-2867.031163644865" fill="rgba(204, 204, 204, 1)" font-size="32" text-anchor="middle" font-family="MiSans">11</text><line x1="5639.559858034476" y1="-3028.505267408721" x2="5654.21240499982" y2="-3002.381726281242" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="5654.21240499982,-3002.381726281242 5650.510509495821,-3016.917749453949 5650.543426944478,-3008.9230258485622 5643.738457864848,-3013.119343866806" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="5702.807856309275" y1="-3026.5084800877767" x2="5688.647138557293" y2="-3002.381726281242" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="5688.647138557293,-3002.381726281242 5699.329359014567,-3012.9121662579096 5692.443515658555,-3008.8499192982304 5692.632992853784,-3016.8424650427005" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="5671.2334790727655" y1="-2942.381726281242" x2="5671.436466835474" y2="-2911.031163644865" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="5671.436466835474,-2911.031163644865 5675.2248608525,-2925.54488373214 5671.387907059139,-2918.531006439759 5667.460452250126,-2925.4946109523744" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>
</center>

以上是一个加法的例子，可以将各种逻辑节点组合起来，构筑成一套逻辑

<center>
<svg xmlns="http://www.w3.org/2000/svg" width="598.2459798963409" height="640.5717337093981" viewBox="3535.9408923041065 -351.99257974635515 598.2459798963409 640.5717337093981" style="background-color:rgba(31, 31, 31, 1)"><rect x="3603.3440448555357" y="30.84585348364636" width="147.0625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3676.8752948555357" y="82.84585348364635" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">#POW#</text><rect x="3565.9408923041065" y="-127.18227506996743" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3589.3237048041065" y="-75.18227506996743" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">2</text><rect x="3648.9108918579627" y="182.57915396304304" width="65.53125" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3681.6765168579627" y="234.57915396304304" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">64</text><rect x="3648.9108918579627" y="-127.18227506996743" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3672.2937043579627" y="-75.18227506996743" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">3</text><rect x="3737.606003030457" y="-127.18227506996743" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3760.988815530457" y="-75.18227506996743" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">2</text><rect x="3883.8397498293407" y="-166.8634220580841" width="147.0625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3957.3709998293407" y="-114.8634220580841" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">#POW#</text><rect x="3846.4365972779115" y="-321.99257974635515" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3869.8194097779115" y="-269.99257974635515" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">2</text><rect x="3953.3572670979074" y="-38.30450374654629" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="3976.7400795979074" y="13.695496253453712" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">8</text><rect x="3987.16772224145" y="-321.99257974635515" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="4010.55053474145" y="-269.99257974635515" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">3</text><rect x="4057.4212472004474" y="-38.30450374654629" width="46.765625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="4080.8040597004474" y="13.695496253453712" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">2</text><rect x="3953.3572670979074" y="93.62166510209278" width="147.0625" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="4026.8885170979074" y="145.62166510209278" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">#POW#</text><rect x="3996.8128554865743" y="211.00390045755802" width="65.53125" height="76" rx="8" ry="8" fill="rgba(0, 0, 0, 0)" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></rect><text x="4029.5784804865743" y="263.003900457558" fill="rgba(255, 255, 255, 1)" font-size="32" text-anchor="middle" font-family="MiSans">64</text><line x1="3610.376668301207" y1="-51.18227506996743" x2="3655.8223313584353" y2="30.84585348364636" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3655.8223313584353,30.84585348364636 3652.1966619380814,16.29063032306548 3652.187683013244,24.285416653160134 3645.404797954394,20.053495179008674" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3678.0777101164954" y1="106.84585348364635" x2="3680.474101597003" y2="182.57915396304304" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3680.474101597003,182.57915396304304 3683.896209793377,167.97473081482144 3680.2369015138715,175.08290582677097 3676.135522655451,168.2202984108787" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3673.3954097347287" y1="-51.18227506996743" x2="3675.7735894787697" y2="30.84585348364636" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3675.7735894787697,30.84585348364636 3679.2343555881275,16.25054266351237 3675.5562389559364,23.34900356183093 3671.473045435963,16.475560482601523" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3740.762582296526" y1="-51.18227506996743" x2="3697.1015280894667" y2="30.84585348364636" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3697.1015280894667,30.84585348364636 3707.336289591924,19.88001302393629 3700.625454141769,24.225283630687542 3700.4821713224146,16.23177632046147" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3891.265799815301" y1="-245.99257974635515" x2="3935.9246097919513" y2="-166.8634220580841" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3935.9246097919513,-166.8634220580841 3932.184257201501,-181.38959713960892 3932.238332826884,-173.39498864940134 3925.4222818887483,-177.57328240328002" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3963.096196034103" y1="-90.8634220580841" x2="3971.0148833931453" y2="-38.30450374654629" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3971.0148833931453,-38.30450374654629 3972.695264223405,-53.21008391859244 3969.8975210007056,-45.720803449495314 3965.0173457941596,-52.05330524881377" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3997.523826179537" y1="-245.99257974635515" x2="3970.3977083912537" y2="-166.8634220580841" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="3970.3977083912537,-166.8634220580841 3978.768693400717,-179.31037389262326 3972.829829603187,-173.95812334922127 3971.4237181468784,-181.82829105120805" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="3991.184830337136" y1="37.69549625345371" x2="4012.4437663586787" y2="93.62166510209278" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="4012.4437663586787,93.62166510209278 4010.92452294719,78.6988001138726 4009.778867301668,86.61107931943931 4003.6666304756873,81.45770663079317" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="4065.2742323979724" y1="37.69549625345371" x2="4042.4183444003825" y2="93.62166510209278" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="4042.4183444003825,93.62166510209278 4051.493343224469,81.67828214989578 4045.255644783756,86.67906281372068 4044.305832445257,78.74089264632097" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon><line x1="4027.75933548418" y1="169.62166510209278" x2="4028.7076621003016" y2="211.00390045755802" stroke="rgba(204, 204, 204, 1)" stroke-width="2"></line><polygon points="4028.7076621003016,211.00390045755802 4032.2569846222214,196.42987185749718 4028.5358351623954,203.50586901567877 4024.4944512704783,196.60776019346437" fill="rgba(204, 204, 204, 1)" stroke="rgba(204, 204, 204, 1)"></polygon></svg>
</center>

以上是一个计算 `(2^3)^2 = 64` 的运算方法，既可以使用两个逻辑节点分步骤运算，也可以直接用一个逻辑节点来计算，至于是否能接收超过两个以上的输入值，需要看对应逻辑节点的具体说明。

## 节点类型及功能

### 数学运算

- `#ADD#`: 计算所有父节点文本转换为数字的和。
- `#SUB#`: 将所有的父节点按照从左到右的顺序依次做减法运算，例如 10 5 2 会变成 10 - 5 - 2，结果为3。
- `#MUL#`: 计算所有父节点文本转换为数字的乘积。
- `#DIV#`: 除法，原理同减法。
- `#MOD#`: 计算前两个父节点文本转换为数字的余数。
- `#ABS#`: 计算每一个父节点的绝对值，并依次输出这些值
- `#RANDOM#`: 生成一个随机数。
- `#FLOOR#`: 将单个父节点文本转换为数字后取整（向下取整）。
- `#CEIL#`: 将单个父节点文本转换为数字后取整（向上取整）。
- `#SQRT#`: 将所有父节点数字开平方并依次输出
- `#POW#`: 左侧父节点值为a，右侧父节点值为b，输出 a的b次方
- `#LOG#`: 将所有父节点的数字取 ln(x) 并依次输出

### 三角函数

- `#SIN#`: 将所有父节点的数字x 取 sin(x) 并依次输出
- `#COS#`: 同理sin
- `#TAN#`: 同理sin

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

### 逻辑运算

- `#AND#`: 计算所有父节点文本转换为数字的与运算。
- `#OR#`: 计算所有父节点文本转换为数字的或运算。
- `#NOT#`: 如果有一个父节点，计算其逻辑非值（0 变 1，非 0 变 0）。
- `#XOR#`: 异或运算

### 字符串操作

- `#UPPER#`: 将单个父节点文本转换为大写。
- `#LOWER#`: 将单个父节点文本转换为小写。
- `#LEN#`: 计算单个父节点文本的长度。
- `#COPY#`: 复制单个父节点的文本。
- `#SPLIT#`: 根据第二个父节点文本作为分隔符，对第一个父节点文本进行分割，返回多个结果。
- `#REPLACE#`: 将第一个父节点的文本中替换掉第二个父节点文本为第三个父节点的文本。
- `#CONNECT#`: 将所有父节点文本连接成一个字符串。

### 计数

- `#COUNT#`: 返回所有父节点的数量。

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
