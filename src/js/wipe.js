/*
author: hyl
data:   2018-11-16
email: 1971702750@qq.com

 */
function Wipe(obj){
	this.conID = obj.id;
	this.canvas = document.getElementById(this.conID);
	this.context = this.canvas.getContext("2d");
	this._w = obj.width;
	this._h = obj.height;
	this.canvas.width = this._w;
	this.canvas.height = this._h;
	this.coverType = obj.coverType;//覆盖的是颜色还是图片
	// this.color = obj.color ? "#666" : obj.color;//覆盖的颜色
	this.color = obj.color || "#666";
	this.imgUrl = obj.imgUrl;//覆盖图
	this.backImgUrl = obj.backImgUrl//背景图
	this.canvas.style.background = "url("+this.backImgUrl+") center 0 no-repeat";
	this.canvas.style.backgroundSize = "cover";
	this.radius = obj.radius; // 涂抹的半径
	this.moveX = 0;
	this.moveY = 0;
	this.isMouseDown = false;//表示鼠标的状态，是否按下，默认为未按下false，按下true
	this.callback = obj.callback;
	this.transpercent = obj.transpercent;//用户定义的百分比
	this.t=0;
	//device保存设备类型，如果是移动端则为true，PC端为false
	this.device = (/android|webos|iPhone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	this.drawMask();
	this.click();
}

//drawT()画点画线函数
//参数：如果只有两个参数，函数功能画圆，x1,y1即圆点的中心坐标
//如果传递四个参数，函数功能画线，x1,y1为起始坐标,x2,y2为结束坐标
Wipe.prototype.drawT =  function(x1,y1,x2,y2){
	this.context.save();
	this.context.beginPath();
	if( arguments.length === 2 ){
		//调用的是画点功能
		this.context.arc(x1,y1,this.radius,0,2*Math.PI);
		this.context.fillStyle = "rgb(242,103,91)";
		this.context.fill();
	}else if( arguments.length === 4 ){
		//调用的是画线功能
		this.context.save();
		this.context.lineCap = "round";
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.lineWidth = this.radius*2;
		this.context.stroke();
	}else{
		return false;
	}
	this.context.restore();
}

//清除画布
Wipe.prototype.grawClear = function(){
	this.context.clearRect(0,0,this._w,this._h);
}

//获取透明点占整个画布的百分比
Wipe.prototype.getTransparency = function(){

	var imgData = this.context.getImageData(0,0,this._w,this._h);
	for(var i = 0; i < imgData.data.length; i+=4){
		var a = imgData.data[i+3];
		if(a===0){
			this.t++;
		}
	}
	console.log("透明点的个数："+ this.t);
	console.log("占总面积："+ (this.t/(this._w*this._h)*100).toFixed(2)+"%");
	return (this.t/(this._w*this._h)*100).toFixed(2);
}

//生成画布上的遮罩，默认颜色#666
Wipe.prototype.drawMask = function(){
	if(this.coverType === 'color'){
		this.context.fillStyle=this.color;
		this.context.fillRect(0,0,this._w,this._h);
		this.context.globalCompositeOperation = "destination-out";
	}else if(this.coverType === 'image'){
		//将imgUrl指定的图片填充画布
		var img1 = new Image();
		var that = this;
		img1.src = that.imgUrl;
		img1.onload = function(){
			that.context.drawImage(img1,0,0,img1.width,img1.height,0,0,that._w,that._h);
			that.context.globalCompositeOperation = "destination-out";
		}
	}
}



Wipe.prototype.click = function(){
	var that = this;
	that.fn1 = that.device ? "touchstart" : "mousedown";
	that.fn2 = that.device ? "touchmove" : "mousemove";
	that.fn3 = that.device ? "touchend" : "mouseup";
	var allLeft = this.canvas.offsetLeft;
	var allTop = this.canvas.offsetTop;
	var currentObj = this.canvas;
	while(currentObj = currentObj.offsetParent){
		allLeft += currentObj.offsetLeft;
		allTop += currentObj.offsetTop;
	}

	that.canvas.addEventListener(that.fn1,function(evt){
		var event = evt || window.event;
		var sLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
		var sTop = document.documentElement.scrollTop || document.body.scrollTop;
		//获取鼠标在视口的坐标，传递参数到drawPoint
		that.moveX = that.device ? event.touches[0].clientX-allLeft+sLeft : event.clientX-allLeft+sLeft;
		that.moveY = that.device ? event.touches[0].clientY-allTop+sTop : event.clientY-allTop+sTop;
		console.log(that.moveX,that.moveY);
		// draePoint(context,moveX,moveY);
		that.drawT(that.moveX,that.moveY);
		that.isMouseDown = true;
	},false);
	that.canvas.addEventListener(that.fn2,function(evt){
		//判断，当isMouseDown为true时，才能执行下面的操作
		var sLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
		var sTop = document.documentElement.scrollTop || document.body.scrollTop;
		if(that.isMouseDown){
			var event = evt || window.event;
			event.preventDefault();
			var X = that.device ? event.touches[0].clientX-allLeft+sLeft : event.clientX-allLeft+sLeft;
			var Y = that.device ? event.touches[0].clientY-allTop+sTop : event.clientY-allTop+sTop;

			// drawLine(context,moveX,moveY,X,Y);
			that.drawT(that.moveX,that.moveY,X,Y);
			//每次的结束点变成下一次画线的开始点
			that.moveX = X;
			that.moveY = Y;
		}else{
			return false;
		}
	},false);
	that.canvas.addEventListener(that.fn3,function(){
		//清空变量t
		that.t = 0;

		//还原isMouseDown 为false
		that.isMouseDown = false;

		//借用外部的处理函数
		var percent = that.getTransparency(that.context);
		that.callback.call(window,percent);
		if(percent>that.transpercent){
			that.grawClear();
		}
	},false);
}






