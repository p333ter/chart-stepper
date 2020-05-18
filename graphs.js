// convert 0..255 R,G,B values to a hexidecimal color string
RGBToHex = function(r,g,b){
    var bin = r << 16 | g << 8 | b;
    return (function(h){
        return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toUpperCase())
}

// convert a hexidecimal color string to 0..255 R,G,B
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/*
   Function: GraphMain()
   purpose:  the graph class. 
*/	
function GraphMain(canvas, circles, line1, line2, line3)                                       
{
	var cnvs = canvas;
	var ctx = canvas.getContext("2d");			//graph Context 2d
	var withCircles = circles;                  //1 if grapghwith circles.                           
	var plotGraph = this; 

	var aniSt1 = new AnimationState();
	var aniSt2 = new AnimationState();
	var aniSt3 = new AnimationState();


	//every graph line should call function fillInterCords(), which calculates the intermediate coordinates.
	if (line1) { fillInterCords(line1);  }
	if (line2) { fillInterCords(line2);  }
	if (line3) { fillInterCords(line3);  }
	
	this.startDrawing = function () {
				ctx.clearRect(0, 0, cnvs.width, cnvs.height);
				if (line1 && line1.startFunction) {
					line1.startFunction(line1.name);			
				}
				if (line2 && line2.startFunction) {
					line2.startFunction(line2.name);			
				}
				if (line3 && line3.startFunction) {
					line3.startFunction(line3.name);			
				}
				initAnimation(line1,line2,line3);
	}

	this.isRunning = function () {
		return (aniSt1.setIntrvl || aniSt2.setIntrvl || aniSt3.setIntrvl);		
	}

// Animation state object
function AnimationState() {
	this.pos = 0;
	this.curr_index = 0;
	this.cordIndex = 0;
	
	this.setIntrvl;
	
	this.resetState = function () {
		this.pos=0;
		this.curr_index=0;
		this.cordIndex=0;
		clearInterval(this.setIntrvl);
		this.setIntrvl=false;
	}
	
	this.increase = function (graphLineObj, asObj) {
		this.curr_index++;
		
		if (this.curr_index==1)
		{
			this.setIntrvl = setInterval(function(){	animateLineGraph(graphLineObj, asObj); }, graphLineObj.speed);
		}

	}
}

/*
   Function: fillInterCords()
   purpose: passes the (x,y) & (x1,y1) of a line object to function- getIntermediateCord(),
   Parameters:
		graphLineObj - line object. 
*/
function fillInterCords(graphLineObj)
{
	for(j=0;j<graphLineObj.cords.length-1;j++){
		graphLineObj.InterCords=getIntermediateCord(graphLineObj.cords[j][0],graphLineObj.cords[j][1],graphLineObj.cords[j+1][0],graphLineObj.cords[j+1][1],graphLineObj.InterCords,graphLineObj.cords[0][0],graphLineObj.cords[0][1], graphLineObj.line_interval);
	}
}
	
/*
   Function: getIntermediateCord()
   purpose: takes (x,y) & (x1,y1) and calculates intermediate cords depending on line_interval.
   Parameters:
		startX,startY - x,y coordinates.
		endX,endY - x1,y1 coordinates.
		tempArray - line objects InterCords array.
		firstX,firstY - first x,y coordinate of a line.
*/	
function getIntermediateCord(startX,startY,endX,endY,tempArray,firstX,firstY,line_interval)
{
		
	var prevX,prevY;
	var tri_base = endX - startX;	
	var tri_ht = endY - startY;

	var x_interval = tri_base/line_interval;
	var y_interval = tri_ht/line_interval;
	
	tempArray.push( [ startX,startY] );
	prevX=startX;
	prevY=startY;
	for(i=1;i<line_interval+1;i++){
		prevX=prevX+x_interval;
		prevY=prevY+y_interval;
		tempArray.push( [ prevX,prevY] );
	}
	return tempArray;
}

/*
   Function: drawSegment()
   purpose: actually draws a line between  (x,y) & (x1,y1) coordinate of a line object:
		Parameters:
		drawLineObj - line object.
		pointIndex - current index of the inter-cords (each line has its own index).
*/	
function drawSegment(drawLineObj,pointIndex)
{
	var percent = pointIndex / (drawLineObj.InterCords.length - 2);
	
	var startColor = hexToRgb(drawLineObj.startColor);
	var endColor = hexToRgb(drawLineObj.endColor);
	
	var r = startColor.r * percent + endColor.r * (1 - percent);
	var g = startColor.g * percent + endColor.g * (1 - percent);
	var b = startColor.b * percent + endColor.b * (1 - percent);

	drawLineObj.color = "#" + RGBToHex(r,g,b);
	
	ctx.beginPath();	
	if(withCircles==0)
	{
		ctx.moveTo(drawLineObj.InterCords[pointIndex][0], drawLineObj.InterCords[pointIndex][1]);
	}
	else{
		ctx.moveTo(drawLineObj.InterCords[pointIndex][0], drawLineObj.InterCords[pointIndex][1]);
	}
	ctx.lineTo(drawLineObj.InterCords[pointIndex+1][0],drawLineObj.InterCords[pointIndex+1][1]);
	ctx.strokeStyle = drawLineObj.color;
	ctx.lineWidth = drawLineObj.width;
    ctx.stroke();
	ctx.closePath();

	if (drawLineObj.counter) {
		drawLineObj.counter.innerHTML = Math.round(drawLineObj.counterNumber * percent);
		drawLineObj.counter.style.color=drawLineObj.color;
	}
}

/*
   Function: drawCircle()
   purpose: actually draws a circle at the (x,y) coordinate of a line object.
		Parameters:
		drawCircleObj - line object.
		index - current index of the inter-cords (each line has its own index).
*/
function drawInterCircle(drawCircleObj,index)
{
	
	ctx.beginPath();
	ctx.arc(drawCircleObj.InterCords[index][0],drawCircleObj.InterCords[index][1],drawCircleObj.circleWidth,0,2*Math.PI);  
	ctx.fillStyle = drawCircleObj.color;
	ctx.fill();
	ctx.closePath();

}

function drawCircle(x,y,width,color)
{
	ctx.beginPath();
	ctx.arc(x,y,width,0,2*Math.PI);  
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}


/*
   Function: initAnimation()
   purpose: initializes the animation.			
   Parameters:
		graphLineObj,graphLineObj1,graphLineObj2: line objects.

*/
function initAnimation(graphLineObj1,graphLineObj2,graphLineObj3)
{     
	
	if(graphLineObj1) {	animateLineGraph(graphLineObj1, aniSt1) }
	if(graphLineObj2) {	animateLineGraph(graphLineObj2, aniSt2) }
	if(graphLineObj3) {	animateLineGraph(graphLineObj3, aniSt3) }
}

/*
   Function: animateLineGraph()
   purpose: animation function for line 1.			
   Parameters:
		graphLineObj: first line object.

*/
function animateLineGraph(graphLineObj, asObj)
{		
	if(asObj.curr_index < graphLineObj.InterCords.length)
	{
		if(graphLineObj && asObj.curr_index < graphLineObj.InterCords.length-1 )									  
		{
			
			drawSegment(graphLineObj,asObj.pos);

			if(graphLineObj.InterCords[asObj.pos][0]==graphLineObj.cords[asObj.cordIndex][0] && graphLineObj.InterCords[asObj.pos][1]==graphLineObj.cords[asObj.cordIndex][1])
			{
				asObj.cordIndex++;
				if(withCircles==1)
				{
					drawInterCircle(graphLineObj,asObj.pos);	
				}
			}

			asObj.pos++;
		}		
		if (asObj.curr_index == graphLineObj.InterCords.length-1) {
			if (graphLineObj.endCircle) {
				drawCircle(graphLineObj.InterCords[asObj.pos][0],graphLineObj.InterCords[asObj.pos][1],graphLineObj.endCircle,graphLineObj.color);
				drawCircle(graphLineObj.InterCords[asObj.pos][0],graphLineObj.InterCords[asObj.pos][1],graphLineObj.endCircle-2,"#ffffff");
			} else {
				drawInterCircle(graphLineObj,asObj.pos);	
			}
		}

		asObj.increase(graphLineObj, asObj);

	}
	else
	{
		asObj.resetState();

		if (graphLineObj.endFunction) {
			graphLineObj.endFunction(graphLineObj.name);			
		}
	}
}

}