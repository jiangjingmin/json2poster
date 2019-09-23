import cax from "./cax.min.js";
import TreeModel from "./TreeModel.min.js";

import { isWeapp, TYPE, copy } from "./util.js";
import Text from "./text.js";
import Graphics from "./graphics.js";


const tree = new TreeModel();

let stage = null;
let imageMap = new Map();
let imgError = false;

function draw(option, selecter, page = null, callback) {
    const root = tree.parse(Object.assign({
        scale: 1,
    }, copy(option)));

    restElement(root);

    const params = [root.model.width * root.model.scale, root.model.height * root.model.scale, selecter];
    if (isWeapp) {
        stage = new cax.Stage(...params, page);
    } else {
        stage = new cax.Stage(...params);
    }
    stage.scale = root.model.scale;

    /**
     * 1.处理需要加载的url 
     * 2.parent背景处理
     */
    let urls = [];
    let loadImages = [];
    root.all().forEach((item, index) => {
        let option = item.model;
        if (option.url && !urls.includes(option.url)) {
            urls.push(option.url);
            loadImages.push(loadImage(option.url));
        }

        if ((option.type === TYPE.group || index === 0) && option.width && option.height) {
            if (option.url) {
                let groupBg = {
                    type: TYPE.image,
                    width: option.width,
                    height: option.height,
                    url: option.url
                }
                item.addChildAtIndex(tree.parse(groupBg), 0)
            } else if (option.fillStyle) {
                let groupBg = copy(option);
                delete groupBg.children;
                groupBg.type = TYPE.rect;
                groupBg.x = 0;
                groupBg.y = 0;

                item.addChildAtIndex(tree.parse(groupBg), 0)
            }
        }
    });

    Promise.all(loadImages).then((results) => {
        results.forEach(({ url, bitmap }) => {
            imageMap.set(url, bitmap);
        });
        stage.add(handleGroup({ option: root.model }));
        stage.update();
        callback && callback(imgError);
    });

}

function handleGroup({ option, parent }) {
    const caxGroup = new cax.Group();
    option.width && (caxGroup.width = option.width);
    option.height && (caxGroup.height = option.height);

    setPosition(caxGroup, option, parent);

    option.children && option.children.forEach((child) => {
        let ele = null;
        let param = { option: child, parent: caxGroup };
        switch (child.type) {
            case TYPE.group:
                ele = handleGroup(param);
                break;
            case TYPE.rect:
            case TYPE.circle:
                ele = handleGraphics(param);
                break;
            case TYPE.image:
                ele = handleImage(param);
                break;
            case TYPE.text:
                ele = handleText(param);
                break;
        }
        ele && caxGroup.add(ele);
    });

    return caxGroup;
}

function handleGraphics({ option, parent }) {
    const ele = new Graphics(option);
    setPosition(ele, option, parent);
    return ele;
}

function handleImage({ option, parent }) {
    let bitmap = imageMap.get(option.url);

    if (bitmap) {
        //标记位,如果一张图用到两次,应该clone.
        if (bitmap.used) {
            bitmap = bitmap.clone()
        } else {
            bitmap.used = true;
        }

        let width = bitmap.width;
        let height = bitmap.height;

        // 缩放
        bitmap.scale = option.width / width;
        setPosition(bitmap, option, parent);

        // 固定高度，默认固定宽度
        if (option.fixHeight) {
          bitmap.scaleY = option.height/bitmap.height;
        }
        // 圆 - 以短边为直径
        if (option.isCircular) {
            const clipPath = new cax.Graphics();
            let rWidth = width;
            if(width > height){
                rWidth = height
            }
            clipPath.arc(width / 2, height / 2, rWidth / 2, 0, Math.PI * 2);
            bitmap.clip(clipPath);
        }
        // 宽度固定，高度裁切
        if (option.isHeightClip) {
            const clipPath = new cax.Graphics();
            clipPath.rect(0, 0, width, option.height/option.width*width);
            bitmap.clip(clipPath);
        }
        /** 
         * 圆角图片：
         * borderRadius
         * borderColor
         * borderWidth
         */
        console.log(bitmap);
        if (option.r > 0) {
            const clipPath = new cax.Graphics();
            setRoundedRect(clipPath, option, width, height);
            bitmap.clip(clipPath);
        }
        
        return bitmap;
    }
    return null;
}

function handleText({ option, parent }) {
    const text = new Text(option);
    // const text = new cax.Text(option.text, option);

    if (option.shadow) {
        text.shadow = option.shadow;
    }
    setPosition(text, option, parent);

    return text;
}

/**
 * 处理元素的位置
 * @param {*} ele canvas元素
 * @param {*} option 配置参数
 * @param {*} parent 父元素,用于计算相对位置
 */
function setPosition(ele, option, parent) {
    _setPosition({ ele, option, value: 'x', parent });
    _setPosition({ ele, option, value: 'y', parent });
}

/**
 *
 * @param ele 处理的方向关键词 center / bottom
 * @param option
 * @param value 【x,y】
 */
function _setPosition({ ele, option, value, parent }) {
    switch (option[value]) {
        case 'center':
            switch (option.type) {
                case TYPE.image:
                    ele[value] = (parent.width - ele.width * ele.scale) / 2;
                    break;
                case TYPE.text:
                    ele[value] = (parent.width - ele.getWidth()) / 2;
                    break;
            }
            break;
        case 'bottom':
            switch (option.type) {
                case TYPE.image:
                    ele[value] = (parent ? parent.height : (option.height / option.scale)) - ele.height * ele.scale;
                    break;
                case TYPE.rect:
                case TYPE.group:
                    ele[value] = (parent ? parent.height : (option.height / option.scale)) - option.height;
                    break;
            }
            break;
        default:
            switch (option.type) {
                case TYPE.circle:
                    ele[value] = option[value] + option.r;
                    break;
                default:
                    ele[value] = option[value] || 0;
                    break;
            }
    }
}

/**
 * 加载图片
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        if (isWeapp) {
            wx.getImageInfo({
                src: url,
                success(res) {
                    new cax.Bitmap(res.path.startsWith('http') ? res.path : url, function () {
                        resolve({ url, bitmap: this });
                    });
                },
                fail(res) {
                    imgError = true;
                    reject({ url, bitmap: null });
                }
            });
        } else {
            const img = new Image()
            // img.crossOrigin = '';
            img.onload = function () {
                new cax.Bitmap(url, function () {
                    resolve({ url, bitmap: this });
                });
            };
            img.onerror = function (res) {
                imgError = true;
                reject({ url, bitmap: null });
            };
            img.src = url;
        }
    });
}

/**
 * 更新元素位置
 * @param {} root 
 */
function restElement(root) {
    root.all().forEach((item) => {
        let option = item.model;
        if (option.type === TYPE.text && option.height === 'auto') {
            let text = new Text(option);
            let height = text.getHeight() - (option.uiheight || 0);
            
            item.getPath().forEach((node, index, array) => {
                //更新父元素的高度
                if (index !== (array.length - 1)) {
                    node.model.height += height;
                }

                // 更新兄弟元素y值
                if (index !== 0) {
                    let parent = array[index - 1];
                    parent.children.slice(node.getIndex() + 1, parent.children.length).forEach((item) => {
                        if (!item.model.pin) {
                            item.model.y += height;
                        }
                    });
                }
            });
        }
    });
}
/**
 * 画圆角矩形
 */
function setRoundedRect(_this, option, width, height) {
    option = Object.assign({
        lineWidth: 1,
        lt: true,
        rt: true,
        lb: true,
        rb: true
      }, option)
    const r = option.r,
      ax = option.r,
      ay = 0,
      bx = width,
      by = 0,
      cx = width,
      cy = height,
      dx = 0,
      dy = height,
      ex = 0,
      ey = 0;
      
      _this.moveTo(ax, ay)
    if (option.rt) {
        _this.arcTo(bx, by, cx, cy, r)
    } else {
        _this.lineTo(bx, by)
    }

    if (option.rb) {
        _this.arcTo(cx, cy, dx, dy, r)
    } else {
        _this.lineTo(cx, cy)
    }

    if (option.lb) {
        _this.arcTo(dx, dy, ex, ey, r)
    } else {
        _this.lineTo(dx, dy)
    }

    if (option.lt) {
        _this.arcTo(ex, ey, ax, ay, r)
    } else {
        _this.lineTo(ex, ey)
    }
}
export { draw }