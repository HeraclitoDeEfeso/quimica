        class Circle {
            constructor(x, y, radio, dx, dy, color) {
                this.x = x;
                this.y = y;
                this.r = radio;
                this.dx = dx;
                this.dy = dy;
	            this.color = color;
            }

            draw(ctx) {
               ctx.beginPath();
               ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
               ctx.fillStyle = this.color;
               ctx.fill();
            }

            changeColor(newColor, getBackColor) {
                this.color = newColor;
                this.getBackColor = getBackColor;
            }

            updateColor() {
                if (this.getBackColor) {
                    this.color = this.getBackColor;
                    delete(this.getBackColor);
                }
            }

            move() {
                this.x += this.dx;
                this.y += this.dy;
            }

            outOfBoundsX(min, max) {
                return this.x + this.dx > max || this.x + this.dx < min;
            }

            outOfBoundsY(min, max) {
                return this.y + this.dy > max || this.y + this.dy < min;
            }
            
            bounceX() {
                this.dx = -this.dx;
            }

            bounceY() {
                this.dy = -this.dy;
            }

            hits(circle) {
                var dx = circle.x - this.x;
                var dy = circle.y - this.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < (circle.r + this.r)) {
                    var normalX = dx / dist;
                    var normalY = dy / dist;
                    var midpointX = (this.x + circle.x) / 2;
                    var midpointY = (this.y + circle.y) / 2;
                    this.x = midpointX - normalX * this.r;
                    this.y = midpointY - normalY * this.r;
                    circle.x = midpointX + normalX * circle.r;
                    circle.y = midpointY + normalY * circle.r;
                    var dVector = (this.dx - circle.dx) * normalX;
                    dVector += (this.dy - circle.dy) * normalY;
                    var dvx = dVector * normalX;
                    var dvy = dVector * normalY;
                    this.dx -= dvx;
                    this.dy -= dvy;
                    circle.dx += dvx;
                    circle.dy += dvy;
                }
            }
        }

	    class Bouncing {
            constructor(canvas, distrib, radio, changeColor) {
                this.changeColor = changeColor;
                this.canvas = canvas;
                this.ctx = canvas.getContext("2d");
                this.circles = [];
                for (const color in distrib) {
                    this.circles.push(
                        ...Array.from(
                            {length: distrib[color]}, 
                            () => new Circle(
                                Math.random() * canvas.width, 
                                Math.random() * canvas.height,
                                radio,
                                0.25,
                                0.5,
                                color
                            )
                        )
                    );
                }
                this.draw();
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "#FAF7F8";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "#003300";
                this.circles.forEach((circle) => circle.draw(this.ctx));
            }

            change(deltas) {
                for (let circle of this.circles) {
                    if (deltas[circle.color] && deltas[circle.color].size) {
                        deltas[circle.color].size--;
                        circle.changeColor(this.changeColor, deltas[circle.color].color);
                    }
                }
                this.draw();
            }
            
            update() {
                this.circles.forEach((circle) => circle.updateColor());
            }

            move() {
                for (let i = 0; i < this.circles.length; i++) {
                    if (this.circles[i].outOfBoundsX(0, this.canvas.width))
                        this.circles[i].bounceX();
                    if (this.circles[i].outOfBoundsY(0, this.canvas.height))
                        this.circles[i].bounceY();
                    for (var j = i + 1; j < this.circles.length; j++) {
                        this.circles[i].hits(this.circles[j]);
                    }
                    this.circles[i].move();
                }
                this.draw();
            }
         }
