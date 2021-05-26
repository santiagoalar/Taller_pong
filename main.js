class Board {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.playing = false;
		this.game_over = false;
		this.bars = [];
		this.ball = null;
		this.playing = false;
	}

	get elements() {
		var elements = this.bars.map(function (bar) { return bar; });
		elements.push(this.ball);
		return elements;
	}
}

class Ball {
	constructor(x, y, radius, board) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speed_y = 0;
		this.speed_x = 3;
		this.board = board;
		this.direction = -1;
		this.bounce_angle = 0;
		this.max_bounce_angle = Math.PI / 12;
		this.speed = 5;

		board.ball = this;
		this.kind = "circle";
	}

	move() {
		if (this.x > board.width || this.x < 0) {
			updateScoreKeeper(this.x);
			this.returnBallOrigin();
			board.playing = false;
		}
		this.x += (this.speed_x * this.direction);
		this.y += (this.speed_y);
	}

	returnBallOrigin() {
		this.x = 350;
		this.y = 100;
	}

	get width() {
		return this.radius * 2;
	}
	get height() {
		return this.radius * 2;
	}
	collision(bar) {

		//Reacciona a la colisión con una barra que recibe como parámetro
		var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;

		var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

		this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
		console.log(this.bounce_angle);
		this.speed_y = this.speed * -Math.sin(this.bounce_angle);
		this.speed_x = this.speed * Math.cos(this.bounce_angle);

		if (this.x > (this.board.width / 2)) this.direction = -1;
		else this.direction = 1;
	}
}


class Bar {
	constructor(x, y, width, height, board) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.board = board;
		this.board.bars.push(this);
		this.kind = "rectangle";
		this.speed = 5;
	}

	down() {
		if (this.y < this.board.height - this.height)
			this.y += this.speed;
	}
	up() {
		if (this.y > 0)
			this.y -= this.speed;
	}
	toString() {
		return "x: " + this.x + " y: " + this.y;
	}
}



class BoardView {
	constructor(canvas, board) {

		this.canvas = canvas;
		this.canvas.width = board.width;
		this.canvas.height = board.height;
		this.board = board;
		this.ctx = canvas.getContext("2d");
	}


	clean() {
		this.ctx.clearRect(0, 0, this.board.width, this.board.height);
	}
	draw() {
		for (var i = this.board.elements.length - 1; i >= 0; i--) {
			var el = this.board.elements[i];
			draw(this.ctx, el);
		};
	}
	check_collisions() {
		for (var i = this.board.bars.length - 1; i >= 0; i--) {
			var bar = this.board.bars[i];
			if (hit(bar, this.board.ball)) {
				this.board.ball.collision(bar);
			}
		};
	}
	play() {
		if (this.board.playing) {
			this.clean();
			this.draw();
			this.check_collisions();
			this.board.ball.move();
		}

	}
}

function hit(a, b) {
	var hit = false;
	if (b.x + b.width >= a.x && b.x < a.x + a.width) {
		if (b.y + b.height >= a.y && b.y < a.y + a.height)
			hit = true;
	}
	//Colisión de a con b
	if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
		if (b.y <= a.y && b.y + b.height >= a.y + a.height)
			hit = true;
	}
	//Colisión b con a
	if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
		if (a.y <= b.y && a.y + a.height >= b.y + b.height)
			hit = true;
	}

	return hit;
}

function draw(ctx, element) {

	switch (element.kind) {
		case "rectangle":

			ctx.fillRect(element.x, element.y, element.width, element.height);
			break;
		case "circle":
			ctx.beginPath();
			ctx.arc(element.x, element.y, element.radius, 0, 7);
			ctx.fill();
			ctx.closePath();
			break;
	}


}
class Player {
	constructor(position) {
		this.position = position;
		this.points = 0;
	}
	get getPoints() {
		return this.points;
	}
	addPoint() {
		this.points++;
		document.getElementById("scorePlayer" + this.position).textContent = this.points + " points";
	}
}

var board = new Board(800, 400);
var bar = new Bar(20, 100, 40, 100, board);
var bar_2 = new Bar(735, 100, 40, 100, board);
var bar_3 = new Bar(0, 0, 800, 4, board)
var bar_4 = new Bar(0, 400, 800, 4, board)
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas, board);
var ball = new Ball(350, 100, 10, board);
var player1 = new Player(1);
var player2 = new Player(2);

document.addEventListener("keydown", function (ev) {

	if (ev.key == "ArrowUp") {
		ev.preventDefault();
		bar_2.up();
	}
	else if (ev.key == "ArrowDown") {
		ev.preventDefault();
		bar_2.down();
	} else if (ev.code === "KeyW") {
		ev.preventDefault();
		//W
		bar.up();
	} else if (ev.code === "KeyS") {
		ev.preventDefault();
		//S
		bar.down();
	} else if (ev.code === "Space") {
		ev.preventDefault();
		this.getElementById("messageDiv").innerHTML = "Click spacebar to pause";
		board.playing = !board.playing;
	}
});

board_view.draw();

window.requestAnimationFrame(controller);

function controller() {
	board_view.play();
	requestAnimationFrame(controller);
}

function updateScoreKeeper(x_position) {
	document.getElementById("messageDiv").innerHTML = "Click spacebar (Next round)";
	(x_position > board.width) ? player1.addPoint() : player2.addPoint();
}