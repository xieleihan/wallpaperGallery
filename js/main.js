// 业务逻辑
// 拖动背景海报
// start
const photobox = {
    container: document.querySelector(".photos"),
    img_data: [],
    container_width: 0,
    container_height: 0,
    photo_width: 0,
    photo_height: 0,
    if_movable: false,
    mouse_x: 0,
    mouse_y: 0,
    standard_width: 1440,
    scale_nums: 1,
    init() {
        this.resize();
        window.addEventListener("resize", () => {
            this.resize();
        });
        this.container.addEventListener("mousedown", () => {
            this.if_movable = true;
            this.mouse_x = event.clientX;
            this.mouse_y = event.clientY;
        });
        this.container.addEventListener("mouseup", () => {
            this.if_movable = false;
        });
        this.container.addEventListener("mouseleave", () => {
            this.if_movable = false;
        });
        this.container.addEventListener("mousemove", () => {
            this.move(event.clientX, event.clientY);
        });
    },
    resize() {
        let imgs = [...document.querySelectorAll(".photos_line_photo")];
        this.container_width = this.container.offsetWidth;
        this.container_height = this.container.offsetHeight;
        this.photo_width = imgs[0].offsetWidth;
        this.photo_height = imgs[0].offsetHeight;
        this.scale_nums = document.body.offsetWidth / this.standard_width;
        this.container.style.transform = `scale(${this.scale_nums})`;
        gsap.to(imgs, {
            transform: `translate(0,0)`,
            duration: 0,
            ease: 'power4.out'
        });
        this.img_data = [];
        imgs.forEach(img => {
            this.img_data.push({
                node: img,
                x: img.offsetLeft,
                y: img.offsetTop,
                mov_x: 0,
                mov_y: 0,
                ani: 0
            });
        });
    },
    move(x, y) {
        if (!this.if_movable) return 0;
        let distance_x = (x - this.mouse_x) / this.scale_nums;
        let distance_y = (y - this.mouse_y) / this.scale_nums;
        this.img_data.forEach((img) => {
            let duration = 1;
            img.mov_x += distance_x;
            if (img.x + img.mov_x > this.container_width) {
                img.mov_x -= this.container_width;
                duration = 0;
            }
            if (img.x + img.mov_x < -this.photo_width) {
                img.mov_x += this.container_width;
                duration = 0;
            }
            img.mov_y += distance_y;
            if (img.y + img.mov_y > this.container_height) {
                img.mov_y -= this.container_height;
                duration = 0;
            }
            if (img.y + img.mov_y < -this.photo_height) {
                img.mov_y += this.container_height;
                duration = 0;
            }
            if (img.ani) img.ani.kill();
            img.ani = gsap.to(img.node, {
                transform: `translate(${img.mov_x}px,${img.mov_y}px)`,
                duration: duration,
                ease: 'power4.out'
            });
        });
        this.mouse_x = x;
        this.mouse_y = y;
    }
};
photobox.init();
// end

/* 导航栏 */
// start
// 查询dom里相应的元素
var phoneWallpaper = document.getElementById("phoneWallpaper");
var southakiWallpaper = document.getElementById("southakiWallpaper");
var aboutPages = document.getElementById("aboutPages");

// 查询对应选项卡的id
var photos = document.getElementById("photos");
var canvas = document.getElementById("canvas");
var codeWaterFill = document.getElementById("codeWaterFill");

phoneWallpaper.onclick = function () {
    // 添加activityItem类
    this.classList.add("activityItem");
    // 去掉其他的activityItem类
    southakiWallpaper.classList.remove("activityItem");
    aboutPages.classList.remove("activityItem");
    // 对photos选项卡显示
    photos.style.opacity = 1;
    canvas.style.opacity = 0;
    codeWaterFill.style.opacity = 0;
    setTimeout(() => {
        photos.style.display = "block";
        canvas.style.display = "none";
        codeWaterFill.style.display = "none";
    }, 1000);
}
southakiWallpaper.onclick = function () {
    this.classList.add("activityItem");
    phoneWallpaper.classList.remove("activityItem");
    aboutPages.classList.remove("activityItem");
    canvas.style.opacity = 0;
    canvas.style.opacity = 1;
    codeWaterFill.style.opacity = 0;
    setTimeout(() => {
        photos.style.display = "none";
        canvas.style.display = "block";
        codeWaterFill.style.display = "none";
    }, 1000);
}
aboutPages.onclick = function () {
    this.classList.add("activityItem");
    phoneWallpaper.classList.remove("activityItem");
    southakiWallpaper.classList.remove("activityItem");
    canvas.style.opacity = 0;
    canvas.style.opacity = 0;
    codeWaterFill.style.opacity = 1;
    setTimeout(() => {
        photos.style.display = "none";
        canvas.style.display = "none";
        codeWaterFill.style.display = "block";
    }, 1000);
}
// end