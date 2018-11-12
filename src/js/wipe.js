var cas = document.getElementById('cas');
var context = cas.getContext("2d");
var _w = cas.width,_h = cas.height;
var radius = 20;//涂抹的半径
var moveX;
var moveY;
function drawLine(context,x1,y1,x2,y2){
	context.save();
	context.lineCap = "round";
	context.lineWidth = radius*2;
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
	context.stroke();
	context.restore();
}
//生成画布上的遮罩，默认为颜色#666
function drawMask(context){

	context.fillStyle = "#666";
	context.fillRect(0,0,_w,_h);
	context.globalCompositeOperation = "destination-out";

}
//在画布上半径为30的圆
function drawPoint(context,moveX,moveY){
	context.save();
	context.beginPath();
	context.arc(moveX,moveY,radius,0,2*Math.PI);
	context.fillStyle = "red";
	context.fill();

	//恢复原有绘图状态
	context.restore();
}
//在canvas画布上监听自定义事件"mousedow"，调用drawPoint函数
var isMouseDown = false;

cas.addEventListener("mousedown",function(evt){
	var event = evt || window.event;
	//获取鼠标在视口的坐标，传递参数到drawPoint
	 moveX = event.clientX;
	 moveY = event.clientY;
	// drawPoint(context,moveX,moveY);
	isMouseDown = true;
},false);
//增加监听"mousemove"，调用drawPoint函数
cas.addEventListener("mousemove",function(evt){
	if(isMouseDown===true){
			var event = evt || window.event;
			var x2 = event.clientX;
		 	var	y2 = event.clientY;
		 	drawLine(context,moveX,moveY,x2,y2);
		 	// 每次的结束点变成下一次划线的开始点
		 	moveX = x2;
		 	moveY = y2;
		}
	},false);

var t = 0;
cas.addEventListener("mouseup",function(data){
	isMouseDown = false;
	if(getTransparencyPercent(context)>50){
		clear(context);
	}

});

function getTransparencyPercent(context){
	var imgdata = context.getImageData(0,0,_w,_h);
	for(var i = 0;i<imgdata.data.length;i+=4){
			var a = imgdata.data[i+3];
			if(a === 0){
				t++;
			}
		}
		var percent = (t/(_w*_h))*100;
	console.log("透明点的个数"+t);
	console.log("占总面积"+Math.ceil(percent)+"%");
	// return percent.toFixed(2); //截取小数点两位
	return Math.round(percent);
}
function clear(context){
	context.clearRect(0,0,_w,_h);
}
window.onload = function(){
	drawMask(context);
};