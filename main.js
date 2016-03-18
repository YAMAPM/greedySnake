
function Point(x, y){
	this.x = x;
	this.y = y;
}
function Snake(){
	var self = this;
	self.forward = 0;//移动方向
	self.targetX = 0;//目标位置
	self.targetY = 0;

	self.body = [];//保存蛇的定点信息
	self.square = [];//界面位置

	self.energy = null;//蛇的引擎
	self.state = {
		die:function(){
			self.energy.stop();
		},
		eatable:function(point){
			self.energy.removeFood(point);
			self.addPoint(point);
			self.energy.addScore();
			self.productFood();
		},
		moving:function(point){
			self.addPoint(point);
			self.delTail();
		}
	};//蛇的状态
	self.currentState = null;
}
//初始化蛇
Snake.prototype.init = function(option){
	var option = option||{};
	var size = option.size||20;
	this.body.length = 0;
	this.square.length = 0;

	for(var i = 0; i <= size+1; i++){
		this.square[i] = [];
	}
	//界面边界初始化
	for(var i = 0; i <= size+1; i++){
		this.square[i][0] = 1;
		this.square[0][i] = 1;
		this.square[size+1][i] = 1;
		this.square[i][size+1] = 1;
	}
	//将蛇初始化为一个点
	var initY = option.initY||10;
	var initX = option.initX||10;
	var point = new Point(initX, initY);
	this.addPoint(point);
	var forward = option.forward||3;
	this.forward = forward;
	
	this.currentState = 'moving';
	this.productFood();
};
//添加一个点
Snake.prototype.addPoint = function(point){
	this.square[point.x][point.y] = 1;
	this.body.unshift(point);
	this.energy.drawPoint(point);
};
//删除尾部点
Snake.prototype.delTail = function(){
	var point = this.body.pop();
	this.square[point.x][point.y] = 0;
	this.energy.removePoint(point);
}
//随机产生一个点当做食物
Snake.prototype.productFood = function(){
	do{
		var x = Math.round(Math.random() * 100 % 20);
		var y = Math.round(Math.random() * 100 % 20);
	}while(this.square[x][y] === 1);
	this.targetX = x;
	this.targetY = y;
	this.energy.drawFood(x, y);
};
//蛇移动方向，这里坐标原点在左上角
Snake.prototype.move = function(){
	var head = this.body[0];
	console.log(head);
	var point = new Point(head.x, head.y);
	switch(this.forward){
		case 1:
			point.x--;
			break;
		case 2:
			point.y--;
			break;
		case 3:
			point.x++;
			break;
		case 4:
			point.y++;
			break;
	}
	this.changeState(point);
	this.process(this.currentState,point);
};
Snake.prototype.changeState = function(point){
	if(this.square[point.x][point.y]===1){
		console.log(point.x,point.y);
		console.log(this.square[point.x][point.y]);
		this.currentState = 'die';
	}else if((point.x===this.targetX)&&(point.y===this.targetY)){
		this.currentState = 'eatable';
	}else{
		console.log(point.x,point.y);
		this.currentState = 'moving';
	}
}
//处理蛇的移动是在末尾删除节点，头部增加节点
Snake.prototype.process = function(currentState,point){
	this.state[currentState](point);
};
//蛇的转向方法
Snake.prototype.turn = function(code){
	var head = this.body[0];
	var point = new Point(head.x, head.y);
	switch(code-36){
		case 1:
			if(this.forward === 1 || this.forward === 3){
				return;
			}
			point.x--;
			break;
		case 2:
			if(this.forward === 2 || this.forward === 4){
				return;
			}
			point.y--;
			break;
		case 3:
			if(this.forward === 1 || this.forward === 3){
				return;
			}
			point.x++;
			break;
		case 4:
			if(this.forward === 2 || this.forward === 4){
				return;
			}
			point.y++;
			break;
	}
	this.forward = code-36;
	this.process(point);
}
//游戏引擎
function Energy(canvasId){
	var WIDTH = 20;
	var canvas = document.getElementById('myCanvas');
	var RED = '#EE7600';
	var BLANK = '#3B3B3B';
	var WHITE = '#FFFFFF';
	var snake = new Snake();
    this.snake = new Snake();
	this.ctx = canvas.getContext('2d');
	this.panel = document.getElementById('panel');
	this.scoreLabel = document.getElementById('score');
	this.moveHandler = null;//蛇的移动函数，定时触发
	this.step = 0;
	this.score = 0;

	snake.energy = this;
	this.startGame = function(step){
		this.clear();
		snake.init({
			initX:10,
			initY:10,
			size:20
		});
		this.score = 0;
		this.scoreLabel.innerHTML = this.score;
		this.panel.onkeydown = function(e){
			if(e.which < 37 || e.which > 40){
				return;
			}
			snake.turn(e.which);
		}
		this.step = parseInt(step);
		this.moveHandler = setInterval(move, 1000);

	};
	this.stop = function(){
		this.clear();
		clearInterval(this.moveHandler);
	};
	this.goon = function(){
		this.panel.onkeydown = function(e){
			if(e.which < 37 || e.which > 40)
				return;
			//console.log(e.which);
			snake.turn(e.which);
		};
		this.moveHandler = setInterval(move, 500-50 * this.step);
	}
	var move = function(){
		snake.move();
	};
	this.drawFood = function(x, y){
		this.ctx.fillStyle = RED;
		this.ctx.fillRect((x-1) * WIDTH, (y-1) * WIDTH, WIDTH, WIDTH);
	};
	this.removeFood = function(x, y){
		this.ctx.fillStyle = WHITE;
		this.ctx.fillRect((x-1) * WIDTH, (y-1) * WIDTH, WIDTH, WIDTH);
	}
	this.drawPoint = function(point){
		this.ctx.fillStyle = BLANK;
		this.ctx.fillRect((point.x-1) * WIDTH, (point.y-1) * WIDTH, WIDTH, WIDTH);
	}
	this.removePoint = function(food){
		this.ctx.fillStyle = WHITE;
		this.ctx.fillRect((food.x-1) * WIDTH, (food.y-1) * WIDTH, WIDTH, WIDTH);
	};
	this.addScore = function(){
		this.score++;
		this.scoreLabel.innerHTML = this.score;
	};
	this.clear = function(){
		this.ctx.fillStyle = WHITE;
		this.ctx.fillRect(0, 0, 20 * WIDTH, 20 * WIDTH);
	}

}













