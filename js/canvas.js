document.addEventListener("DOMContentLoaded", () => {
    const canvasbox = {
        // canvas对象容器
        canvas: {},
        // canvas 2d上下文
        content: {},
        // 图片的总数
        img_total: 28,
        // 图片排列的总列数
        row_max: 7,
        // 图片排列的总行数
        line_max: 4,
        // 源图片的实际宽高，这里因为图片太大，会占据画布太多位置，故除以一个数让其缩小
        img_width: Math.floor(700 / 2),
        img_height: Math.floor(1000 / 2),
        // 图片间的上下左右间距
        img_margin: 50,
        // 所有图片纵横排列之后的总宽高，用作图片超出范围的界限判定
        total_width: 0,
        total_height: 0,
        // 图片数据，用以储存每张图片的源以及xy坐标位置
        img_data: [],
        // 当前画布是否可以移动
        if_movable: false,
        // 当前悬停的图片
        hover_img: null,
        // 初始化
        init() {
            this.canvas = document.querySelector("#canvas");
            this.content = this.canvas.getContext("2d");
            // 总宽度等于横向排列的所有图片的宽度和间隔相加，最后一张图片没有右间隔，故需要减去一个间隔，总高度同理
            this.total_width = this.row_max * (this.img_width + this.img_margin) - this.img_margin;
            this.total_height = this.line_max * (this.img_height + this.img_margin) - this.img_margin;
            this.resize();
            this.create_events();
            this.create_img_data();
        },
        resize() {
            // 修改canvas宽高以填充满页面
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // 修改canvas宽高之后，画布内容会被清除，故需要调用一次move_imgs函数，重新生成所有图片
            if (this.img_data.length > 0) this.move_imgs(0, 0);
        },
        // 创建图片数据即img_data
        create_img_data() {
            let imagesLoaded = 0;
            for (let i = 0; i < this.img_total; i++) {
                let img = new Image();
                img.src = `../images/photo-pocket-${i + 1}.webp`;
                // 当图片加载完成之后，创建对应图片数据并添加到img_data中
                img.onload = () => {
                    // 计算该序号图片处于第几行第几列
                    let col_index = i % this.row_max;
                    let line_index = Math.floor(i / this.row_max);
                    // 通过行列序号算出xy坐标
                    let x = col_index * (this.img_width + this.img_margin);
                    let y = line_index * (this.img_height + this.img_margin);
                    // 将其添加到img_data中
                    this.img_data.push({ img, x, y, scale: 1 });
                    imagesLoaded++;
                    // 如果所有图片都加载完成，再进行绘制
                    if (imagesLoaded === this.img_total) {
                        this.move_imgs(0, 0);
                    }
                };
            }
        },
        // 绑定所有监听事件
        create_events() {
            window.addEventListener("resize", () => {
                this.resize();
            });
            // 当鼠标按下时，才可以移动所有图片
            this.canvas.addEventListener("mousedown", (e) => {
                this.if_movable = true;
            });
            // 当鼠标弹起时，图片无法被移动，并且调用check_img函数，获取当前鼠标所指向的图片
            this.canvas.addEventListener("mouseup", (e) => {
                this.if_movable = false;
                this.check_img(e.offsetX, e.offsetY);
            });
            // 当鼠标离开选区时，图片无法被移动，
            this.canvas.addEventListener("mouseleave", () => {
                this.if_movable = false;
            });
            // 当鼠标移动时，调用move_imgs函数，移动所有图片
            this.canvas.addEventListener("mousemove", (e) => {
                // if_movable为false则不可以移动图片，即鼠标未按下时
                if (!this.if_movable) {
                    this.handle_hover(e.offsetX, e.offsetY);
                    return;
                }
                this.move_imgs(e.movementX, e.movementY);
            });
        },
        // 增加一个绘制圆角矩形的函数
        drawRoundedRect(x, y, width, height, radius) {
            this.content.beginPath();
            this.content.moveTo(x + radius, y);
            this.content.lineTo(x + width - radius, y);
            this.content.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.content.lineTo(x + width, y + height - radius);
            this.content.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.content.lineTo(x + radius, y + height);
            this.content.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.content.lineTo(x, y + radius);
            this.content.quadraticCurveTo(x, y, x + radius, y);
            this.content.closePath();
        },
        // 移动所有图片
        move_imgs(x, y) {
            // 清除content，重新进行绘制
            this.content.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // 遍历所有图片，对每一张图片进行移动，并进行判断
            this.img_data.forEach((img) => {
                img.x += x;
                // 当图片超出总宽度范围时，将图片移动到最右侧，
                // 注意这里减去一个图片宽度是为了让图片提前位移，防止最左侧的图片出现空白行
                if (img.x > (this.total_width - this.img_width))
                    img.x -= this.total_width + this.img_margin;
                // 当图片小于一个负的图片宽度，即向左超出总宽度范围时，将图片移动到最右侧
                if (img.x < -this.img_width)
                    img.x += this.total_width + this.img_margin;
                // 竖向同上
                img.y += y;
                if (img.y > (this.total_height - this.img_height))
                    img.y -= this.total_height + this.img_margin;
                if (img.y < -this.img_height)
                    img.y += this.total_height + this.img_margin;
                // 创建圆角矩形剪切路径
                this.content.save(); // 保存当前状态
                this.drawRoundedRect(img.x, img.y, this.img_width, this.img_height, 20); // 20是圆角半径，可调整
                this.content.clip(); // 设置剪切路径

                // 绘制图片，更新画布
                const scale = img.scale;
                const dx = (this.img_width * (scale - 1)) / 2;
                const dy = (this.img_height * (scale - 1)) / 2;
                this.content.drawImage(img.img, img.x - dx, img.y - dy, this.img_width * scale, this.img_height * scale);

                this.content.restore(); // 恢复之前保存的状态
            });
        },
        // 获取当前鼠标点击位置下的对应图片数据
        check_img(x, y) {
            // 遍历所有图片，找出鼠标xy坐标处于图片内部的那张图片
            let img = this.img_data.find(img =>
                x >= img.x && x < img.x + this.img_width &&
                y >= img.y && y < img.y + this.img_height
            );
            // 如果存在，则输出
            // if (img) console.log(img, img.img);
        },
        // 处理悬停效果
        handle_hover(x, y) {
            // 查找鼠标悬停的图片
            let img = this.img_data.find(img =>
                x >= img.x && x < img.x + this.img_width &&
                y >= img.y && y < img.y + this.img_height
            );

            if (img) {
                // 将 hover_img 恢复到原始大小
                if (this.hover_img && this.hover_img !== img) {
                    this.animate_scale(this.hover_img, 1);
                }
                // 将当前悬停图片设置为 hover_img，并进行放大
                this.hover_img = img;
                this.animate_scale(img, 1.2);
            } else if (this.hover_img) {
                // 鼠标移开所有图片时，恢复 hover_img 到原始大小
                this.animate_scale(this.hover_img, 1);
                this.hover_img = null;
            }
        },
        // 动画缩放函数
        animate_scale(img, targetScale) {
            const duration = 300;
            const frameRate = 1000 / 60; // 每秒 60 帧
            const totalFrames = duration / frameRate;
            const startScale = img.scale;
            const scaleChange = targetScale - startScale;
            let currentFrame = 0;

            const animate = () => {
                currentFrame++;
                img.scale = startScale + (scaleChange * (currentFrame / totalFrames));

                if (currentFrame < totalFrames) {
                    requestAnimationFrame(animate);
                } else {
                    img.scale = targetScale; // 确保最终比例准确
                }

                this.move_imgs(0, 0); // 重新绘制所有图片
            };

            animate();
        }
    };

    // 初始化
    canvasbox.init();
});
