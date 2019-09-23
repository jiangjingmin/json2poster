# json2poster

#### 介绍
微信小程序生成canvas海报

#### 安装教程
```
// Gitee
git clone git@gitee.com:jiangjingmin/json2poster.git

// Github
git clone git@github.com:jiangjingmin/json2poster.git
```

#### 使用说明
- [x] 支持缩放 如果设计稿是750,而画布只有375时.你不需要任何换算,只需要将scale设置为0.5
- [x] 支持分组(cax里很好用的一个功能)
- [x] 图片支持圆角
- [x] 支持圆型,矩形,矩形圆角(背景色支持线性渐变)
- [x] 文本支持竖排,长文本自动换行
- [x] 支持动态文本


## 配置项

#### Canvas（画布）
属性 | 类型 | 默认值 | 必填 | 说明
--|--|--|--|--
width | Number | | 是 | 画布宽度，一般设计稿为750
height | Number | | 是 | 画布高度
x | Number | 0 | 否 | 相对于画布左侧的距离
y | Number | 0 | 否 | 相对于画布顶部的距离
scale | Number | 1 | 否 | 是否缩放画布   
fillStyle | String |  | 否 | 背景色，十六进制，例："#ffffff"
loadingMsg | String  | '长图生成中...' | 否 | 生成图片加载中
skeleton | String  | './images/skeleton.png' | 否 | 生成图片前骨架
errorMsg| String   | "生成图片失败" | 否 | 生成失败时提示文案
newCreateMsg | String | "点击重新生成" | 否 | 生成失败时按钮文案
url | String |  | 否 | 背景图，支持本地和网络图片，注意https
children | Array | | 否| 子元素数组  

#### Group（组）
属性 | 类型 | 默认值 | 必填 | 说明
--|--|--|--|--
type | String | group | 是 | 绘制类型
width | Number | | 是 | 宽度
height | Number | | 是 | 高度 
x | Number | 0 | 否 | 相对于父元素左侧的距离
y | Number | 0 | 否 | 相对于父元素顶部的距离
fillStyle | String |  | 否 | 背景色，支持十六进制和RGB，例："#ffffff",rgba(0,0,0,1)
url | String |  | 否 | 背景图，支持本地和网络图片，注意https
children | Array | | 否| 子元素数组

#### Text（文本）
属性 | 类型 | 默认值 / 示例 | 必填 | 说明
--|--|--|--|--
type | String | text | 是 | 绘制类型
height | Number | | 是 | 如果文本为动态内容可设置为'auto'  
uiheight | Number | | 否 | 如果是动态内容，可设置文本区域最大高度
x | Number | 0 | 否 | 相对于父元素左侧的距离
y | Number | 0 | 否 | 相对于父元素顶部的距离
text | String | | 是 | 文本内容
font | String | '10px sans-serif' | 否 | 字体及大小，例：'24px 微软雅黑'
color | String | 'black' | 否 | 字体颜色
textAlign | String | 'left' | 否 | 'left'，'center'，'right'
baseline | String | 'top' | 否 | 'bottom'，'alphabetic'，'ideographic'，'top'，'hanging'
orientation | String | ‘horizontal’ | 否 | 文字方向,‘horizontal’ 或 ‘vertical’
maxWidth | Number | | 否 | 最大宽度(设置后会自动换行,需要和lineHeight配合使用)
lineHeight | Number | | 否 | 行高
maxLine | Number | | 否 | 最大行数,超出则显示...
shadow | Object | {color,offsetY,offsetYblur} | 否 | 阴影
linearGradient | Object | [x1,y1,x2,y2] | 否 | 渐变点起始坐标，同canvas createLinearGradient
colors | Array | [[0,'#CCC'],[0.2,'#AAA'],[1,'#AAA']] | 否 | 填充颜色，同cavas addColorStop
pin | Boolean | | 否 | 固定位置(如果你有元素放在了动态文本的下方,又不希望这个元素位置被更新,可以设置该属性为truer)

#### Image（图片）
属性 | 类型 | 默认值 / 示例 | 必填 | 说明
--|--|--|--|--
type | String | image | 是 | 绘制类型
width | Number | | 是 | 宽度
height | Number | | 是 | 高度  
x | Number | 0 | 否 | 相对于父元素左侧的距离
y | Number | 0 | 否 | 相对于父元素顶部的距离
isCircular | Boolean | false | 否 | 圆，以短边为直径
fixHeight | Boolean | false | 否 | 固定宽高，默认固定宽度，高度自适应，有溢出
isHeightClip | Boolean | false | 否 | 宽度固定，裁切底部高度溢出部分

#### Circle（圆）
属性 | 类型 | 默认值 / 示例 | 必填 | 说明
--|--|--|--|--
type | String | circle | 是 | 绘制类型
width | Number | | 是 | 宽度
height | Number | | 是 | 高度  
x | Number | 0 | 否 | 相对于父元素左侧的距离
y | Number | 0 | 否 | 相对于父元素顶部的距离
r | Number | 20 | 否 | 半径
strokeStyle | Number | | 否 | 边框颜色，例：'#FFFFFF'
rt,rb,lt,lb	| Boolean | true | 分别控制四个角是否圆角，上,右下,左上,左下
strokeStyle | String | | 否 | 边框颜色，例：'#FFFFFF'	
lineWidth | String | 1 | 否 | 边框宽度
fillStyle | String | | 否 | 填充颜色，例：#FFFFFF	
linearGradient | String | | 否 | 渐变点起始坐标	[x1,y1,x2,y2]，同createLinearGradient
colors | String | | 否 | 填充颜色，例：	[[0,'#CCC'],[0.2,'#AAA'],[1,'#AAA']]，同 addColorStop

#### Rect（矩形）
属性 | 类型 | 默认值 / 示例 | 必填 | 说明
--|--|--|--|--
type | String | rect  | 是 | 绘制类型
width | Number | | 是 | 宽度
height | Number | | 是 | 高度  
x | Number | 0 | 否 | 相对于父元素左侧的距离
y | Number | 0 | 否 | 相对于父元素顶部的距离
r | Number | 20 | 否 | 半径
strokeStyle | Number | | 否 | 边框颜色，例：'#FFFFFF'
rt,rb,lt,lb	| Boolean | true | 分别控制四个角是否圆角，右上,右下,左上,左下
strokeStyle | String | | 否 | 边框颜色，例：'#FFFFFF'	
lineWidth | String | 1 | 否 | 边框宽度
fillStyle | String | | 否 | 填充颜色，例：#FFFFFF	
linearGradient | String | | 否 | 渐变点起始坐标	[x1,y1,x2,y2]，同createLinearGradient，例：[0,0,100,0]由左向右渐变，[0,0,0,100]由上向下渐变
colors | Array | | 否 | 填充颜色，也可理解为颜色节点，例：[[0,'#CCC'],[0.2,'#AAA'],[1,'#AAA']]，同 addColorStop

> 示例：

```
var posterConfig = {
    "width": 750,
    "height": 1370,
    "scale": 1,
    "fillStyle": "#FFFFFF",
    "children": [
        {
            "type": "group",
            "width": 600,
            "height": 460,
            "x": 0,
            "y": 0,
            "children": [
               {
                    "type": "text",
                    "text": "内容",
                    "maxWidth": 580,
                    "lineHeight": 40,
                    "textAlign": "right",
                    "font": "30px Arial",
                    "color": "#333333",
                    "height": "auto",
                    "uiheight": 200,
                    "x": 30,
                    "y": 30
                },
                {
                    "type": "image",
                    "width": 100,
                    "height": 200,
                    "x": 30,
                    "y": 260,
                    "url": "/images/default-person.png",
                    "isCircular": true,
                    "fixHeight": true,
                    "r": 10,
                } 
            ]
        }
    ]


```

#### 参与贡献

1. https://github.com/willnewii/json2canvas