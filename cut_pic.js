$(function () {
    var downX = 0;
    var downY = 0;
    var boxLeft = 0;
    var boxTop = 0;
    var chooseBox = $('#chooseBox').get(0);
    var scaleImage = 1;
    // 点击线条和放大缩小按钮的开关
    var flag = true;
    // 初始化每次上传选择图片
    var init = false;
    //选择图片并实时预览
    $('#fileUpload').on('click', function () {
        $('#fileSrc').click();
    })

    $('#fileSrc').on('change', function () {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                if (init) {
                    $('.cut-img img').attr('src', e.target.result).css('transform', 'scale(1)');
                    $('#moveLine').css('width', 0 + 'px')
                    $('#dot').css('left', 0 + 'px')
                }
                $('.bgd-show img').attr('src', e.target.result);
                $('.preview-img img').css('display', 'none');
                $('.bgd-layer').removeClass('active');
                $('.box div').addClass('active');
                //添加 mousedown 事件监听
                chooseBox.addEventListener('mousedown', mouseDown, false);
            }
            reader.readAsDataURL($(this)[0].files[0]);
            init = true;
            $('#resize').show();
            setTimeout(function () {
                scaleImage = 1;
                startCanvas();
            }, 100)
        } else {
            alert("你的浏览器不支持FileReader.");
        }
    });

    //裁剪框拖拽
    // mousedown 事件监听
    function mouseDown(e) {
        downX = e.pageX;
        downY = e.pageY;
        boxTop = $('#chooseBox').css('top');
        boxTop = parseInt(boxTop.substring(0, boxTop.length - 2));
        boxLeft = $('#chooseBox').css('left');
        boxLeft = parseInt(boxLeft.substring(0, boxLeft.length - 2));
        $('.box').children('div').removeClass('default').removeClass('active');
        $('.preview-img img').css('display', 'block');
        chooseBox.addEventListener('mousemove', mouseMove, false);
        $('#box').css('border', '2px solid transparent');
    }

    // mousedown 事件中添加的 mousemove 事件监听
    function mouseMove(e) {
        var moveX = downX - e.pageX;
        var moveY = downY - e.pageY;
        var maxX = boxLeft - 80;
        var maxY = boxTop - 45;
        $('#box').css('border', '2px solid transparent');
        // 随着鼠标移动截取框的同时 调整截取框内图片的位置
        if (moveX >= 0 && moveX <= boxLeft) {
            changeImgX(moveX - boxLeft);
        }
        if (moveX <= 0 && moveX >= maxX) {
            changeImgX(moveX - boxLeft);
        }
        if (moveY >= 0 && moveY <= boxTop) {
            changeImgY(moveY - boxTop);
        }
        if (moveY <= 0 && moveY >= maxY) {
            changeImgY(moveY - boxTop);
        }
    }

    // mouseup事件，移除 mousedown 事件中添加的 mousemove 事件监听
    $('#chooseBox').on('mouseup', function () {
        $('#box').css('border', '2px dashed #aaaaaa');
        chooseBox
        $('.preview-img img').css('display', 'none');
        if (init) {
            $('.box').children('div').addClass('default').addClass('active');
        } else {
            $('.box').children('div').addClass('default');
        }
        // $('.box div').removeClass('active');
        //移除选中裁剪框后的 mousemove 事件监听
        chooseBox.removeEventListener('mousemove', mouseMove, false);
        // 创建画布开始绘制裁剪后的图片
        startCanvas();
    })

    // 改变图片的水平位置
    function changeImgX(num) {
        $('.bgd-show img').css('margin-left', num);
        $('#chooseBox').css('left', -num);
        $('.preview-img img').css('margin-left', num);
    }

    // 改变图片的垂直位置
    function changeImgY(num) {
        $('.bgd-show img').css('margin-top', num);
        $('#chooseBox').css('top', -num);
        $('.preview-img img').css('margin-top', num);
    }

    // Html5 canvas绘制图片
    function startCanvas() {
        // 创建画布绘制裁剪后的图片
        createcanvas();
        createCircleCanvas();
    }

    // 创建画布 画长方形的
    function createcanvas() {
        var mycanvas = document.getElementById('mycanvas');
        ctx = mycanvas.getContext('2d');
        mycanvas.width = 320;
        mycanvas.height = 180;
        var img = document.getElementById("old-img");
        var xc = $('.bgd-show img').css('margin-left');
        xc = parseInt(xc.substring(0, xc.length - 2));
        var yc = $('.bgd-show img').css('margin-top');
        yc = parseInt(yc.substring(0, yc.length - 2));
        if (xc < 0) {
            xc = 0 - xc;
        }
        if (yc < 0) {
            yc = 0 - yc;
        }
        xc = xc + (img.width * scaleImage - $('.cut-img').width()) / 2;
        yc = yc + (img.height * scaleImage - $('.cut-img').height()) / 2;

        // 计算图片宽度缩放比
        var rateX = img.width * scaleImage / img.naturalWidth;

        // 计算图片高度缩放比
        var rateY = img.height * scaleImage / img.naturalHeight;

        xc = parseInt(xc / rateX);
        yc = parseInt(yc / rateY);

        ctx.drawImage(img, xc, yc, mycanvas.width / rateX, mycanvas.height / rateY, 0, 0,
            mycanvas.width, mycanvas.height);

        // canvas的api中的toDataURL() 保存图像
        //var images = mycanvas.toDataURL('image/png');
        // ajax上传到服务器
        // canvas的api中的toDataURL() 保存图像
        //var images = mycanvas.toDataURL('image/png');
        // ajax上传到服务器
        var dataurl = mycanvas.toDataURL('image/png'); //base64图片数据
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var obj = new Blob([u8arr], {
            type: mime
        });
        var fd = new FormData();
        fd.append("upfile", obj, "image.png"); // upfile指图片存放路径
        // submitData(fd); Ajax上传到服务器 这里只传了图片参数
    }

    // 创建画布 画圆圈的
    function createCircleCanvas() {
        var mycanvas = document.getElementById('circleCanvas');
        ctx = mycanvas.getContext('2d');
        mycanvas.width = 180;
        mycanvas.height = 180;

        // 开始绘制图片
        /*var img = new Image();
        img.src = "../../images/wuhanzhan.png";
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        }*/

        var img = document.getElementById("old-img");

        var xc = $('.bgd-show img').css('margin-left');
        xc = parseInt(xc.substring(0, xc.length - 2));
        var yc = $('.bgd-show img').css('margin-top');
        yc = parseInt(yc.substring(0, yc.length - 2));
        if (xc < 0) {
            xc = 0 - xc;
        }
        if (yc < 0) {
            yc = 0 - yc;
        }

        xc = xc + (img.width * scaleImage - $('.cut-img').width()) / 2 + (320 - mycanvas.width) /
            2;
        yc = yc + (img.height * scaleImage - $('.cut-img').height()) / 2;

        // 计算图片宽度缩放比
        var rateX = img.width * scaleImage / img.naturalWidth;

        // 计算图片高度缩放比
        var rateY = img.height * scaleImage / img.naturalHeight;
        xc = parseInt(xc / rateX);
        yc = parseInt(yc / rateY);

        ctx.drawImage(img, xc, yc, mycanvas.width / rateX, mycanvas.height / rateY, 0, 0,
            mycanvas.width, mycanvas.height);

        // canvas的api中的toDataURL() 保存图像
        //var images = mycanvas.toDataURL('image/png');
        // ajax上传到服务器
        // canvas的api中的toDataURL() 保存图像
        //var images = mycanvas.toDataURL('image/png');
        // ajax上传到服务器
        var dataurl = mycanvas.toDataURL('image/png'); //base64图片数据
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var obj = new Blob([u8arr], {
            type: mime
        });
        var fd = new FormData();
        fd.append("upfile", obj, "image.png"); // upfile指图片存放路径
        // submitData(fd); Ajax上传到服务器 这里只传了图片参数
    }

    function submitData(fd) {
        // 将数据发以post方式，发送到服务器，"comment_shengcheng"：struts2的通配方式（Action名_处理方法名）
        $.ajax({
            url: "url路径",
            type: "POST",
            processData: false,
            contentType: false,
            data: fd,
            success: function (data) {
                console.log(data);
            }
        });
    }

    // 点击放大缩小的白色的点

    function getX(obj) {
        var parObj = obj;
        var left = obj.offsetLeft;
        while (parObj = parObj.offsetParent) {
            left += parObj.offsetLeft;
        }
        return left;
    }


    function DisplayCoord(event) {
        var top, left, oDiv, changeLeft;

        oDiv = document.getElementById("line");
        // top=getY(oDiv); 
        if (flag) {
            left = getX(oDiv);
            changeLeft = event.clientX - left + document.documentElement.scrollLeft;
            if (changeLeft <= 0) {
                changeLeft = 0
            } else if (changeLeft >= $('#line').width() - $('#dot').width()) {
                changeLeft = $('#line').width() - $('#dot').width() / 2
            }
            // 获取百分之并改变图片的scale
            scaleImage = 1 + changeLeft / $('#line').width();
        } else {
            changeLeft = $('#line').width() * (scaleImage - 1)
        }
        $('#old-img').css('transform', 'scale(' + scaleImage + ')');
        $('#highlightImg').css('transform', 'scale(' + scaleImage + ')');
        $('#moveLine').css('width', changeLeft + 'px')
        $('#dot').css('left', changeLeft + 'px')
    }

    // 点击横线的时候 放大缩小图片
    $('#line').on('click', function () {
        DisplayCoord(event);
        createcanvas();
        createCircleCanvas();
    })
    // 点击放大按钮
    $('#enlargeBtn').click(function () {
        console.log(1)
        // 默认能放大两倍 能点击4下放大按钮
        flag = false;
        scaleImage += 0.2;
        if (scaleImage >= 2) {
            scaleImage = 2;
        }
        $("#line").trigger("click");
        flag = true;
    })
    // 点击缩小按钮
    $('#reduceBtn').click(function () {
        // 默认能放大两倍 能点击4下放大按钮
        flag = false;
        scaleImage -= 0.2;
        if (scaleImage <= 1) {
            scaleImage = 1;
        }
        $("#line").trigger("click");
        flag = true;
    })
})