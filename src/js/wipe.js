var canvas = document.getElementById('cas');
var context = canvas.getContext("2d");
var _w = canvas.width,_h = canvas.height;
var radius = 20; // 涂抹的半径
var moveX = 0;
var moveY = 0;
var isMouseDown = false;//表示鼠标的状态，是否按下，默认为未按下false，按下true

//device保存设备类型，如果是移动端则为true，PC端为false
var device = (/android|webos|iPhone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
console.log(navigator.userAgent);

var clickEvtName = device ? "touchstart" : "mousedown";
var moveEvtName = device ? "touchmove" : "mousemove";
var endEvtName = device ? "touchend" : "mouseup";

/*var fn1;
var fn2;
var fn3;
if(device){
	fn1 = "touchstart";
	fn2 = "touchmove";
	fn3 = "touchend";
}else{
	fn1 = "mousedown";
	fn2 = "mousemove";
	fn3 = "mouseup";
}*/
//生成画布上的遮罩，默认颜色#666
function drawMask(context){
	context.fillStyle="#666";
	context.fillRect(0,0,_w,_h);
	context.globalCompositeOperation = "destination-out";
}
//在画布上画半径为30的圆
function draePoint(context,pisX,pisY){
	//保存当前绘图状态
	context.save();
	context.beginPath();
	context.arc(pisX,pisY,radius,0,2*Math.PI);
	context.fillStyle = "rgb(242,103,91)";
	context.fill();
	context.restore();
}
function drawLine(context,x1,y1,x2,y2){
	console.log("传递的实参个数:"+ arguments.length);
	//保存当前绘图状态
	context.save();
	context.lineCap = "round";
	//以原点为起点，绘制一条线
	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
	context.lineWidth = radius*2;
	context.stroke();
	//回复原有绘图状态
	context.restore();
}

/*function drawLine(context,moveX,moveY,X,Y){
	context.save();
	context.beginPath();
	if(arguments.length==3){
		context.arc(moveX,moveY,radius,0,2*Math.PI);
		context.fillStyle = "rgb(242,103,91)";
		context.fill();
	}else if(arguments.length==5){
		// console.log("传递的实参个数:"+ arguments.length);
		//保存当前绘图状态
		context.lineCap = "round";
		//以原点为起点，绘制一条线
		context.moveTo(moveX,moveY);
		context.lineTo(X,Y);
		context.lineWidth = radius*2;
	}else{
		return false;
	}
	context.stroke();
	context.restore();
}*/
//在canvas画布上监听自定义时间"mousedown",调用drawPoint函数
canvas.addEventListener(clickEvtName,function(evt){
	var event = evt || window.event;
	//获取鼠标在视口的坐标，传递参数到drawPoint
	moveX = device ? event.touches[0].clientX : event.clientX;
	moveY = device ? event.touches[0].clientY : event.clientY;
	draePoint(context,moveX,moveY);
	isMouseDown = true;
},false);



//增加监听"mousemove",调用drawPoint函数
canvas.addEventListener(moveEvtName,function(evt){
	//判断，当isMouseDown为true时，才能执行下面的操作
	if(isMouseDown){
		var event = evt || window.event;
			event.preventDefault();
			var X = device ? event.touches[0].clientX : event.clientX;
			var Y = device ? event.touches[0].clientY : event.clientY;
		drawLine(context,moveX,moveY,X,Y);
		//每次的结束点变成下一次画线的开始点
		moveX = X;
		moveY = Y;
	}
},false);

canvas.addEventListener(endEvtName,function(){
	//清空变量t
	t = 0;
	//还原isMouseDown 为false
	isMouseDown = false;
	if(getTransparency(context)>50){
		grawClear(context);
	}
},false);


var t=0;
function getTransparency(context){
	var imgData = context.getImageData(0,0,_w,_h);
	for(var i = 0; i < imgData.data.length; i+=4){
		var a = imgData.data[i+3];
		if(a===0){
			t++;
		}
	}
	console.log("透明点的个数："+ t);
	console.log("占总面积："+ (t/(_w*_h)*100).toFixed(2)+"%");
	return (t/(_w*_h)*100).toFixed(2);
}
function grawClear(context){
	context.clearRect(0,0,_w,_h);
}

window.onload = function(){
	drawMask(context);
};