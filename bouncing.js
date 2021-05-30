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

    changeIfColor(nowColor, newColor, getBackColor) {
        let hasChange = this.color == nowColor;
        if (hasChange) {
            this.color = newColor;
            this.getBackColor = getBackColor;    
        }
        return hasChange;
    }

    updateColor() {
        if (this.getBackColor) {
            this.color = this.getBackColor;
            delete (this.getBackColor);
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
    constructor(canvas, radio, changeColor) {
        this.changeColor = changeColor;
        this.radio = radio;
        this.ctx = canvas.getContext("2d");
        this.circles = [];
    }

    add(ballsNumber, ballsColor) {
        this.circles.push(...Array.from({length: ballsNumber}, () => new Circle(
            Math.random() * this.ctx.canvas.width,
            Math.random() * this.ctx.canvas.height,
            this.radio,
            1,
            0.5,
            ballsColor 
        )))
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "#FAF7F8";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "#003300";
        this.circles.forEach((circle) => circle.draw(this.ctx));
    }

    change(ballsNumber, ballsColor, nextColor) {
        for(let circle of this.circles) {
            if (ballsNumber && circle.changeIfColor(ballsColor, this.changeColor, nextColor)) {
                ballsNumber--;
            }
        }
        this.draw();
    }

    update() {
        this.circles.forEach((circle) => circle.updateColor());
        this.draw();
    }

    move() {
        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].outOfBoundsX(0, this.ctx.canvas.width))
                this.circles[i].bounceX();
            if (this.circles[i].outOfBoundsY(0, this.ctx.canvas.height))
                this.circles[i].bounceY();
            for (var j = i + 1; j < this.circles.length; j++) {
                this.circles[i].hits(this.circles[j]);
            }
            this.circles[i].move();
        }
        this.draw();
    }
}
