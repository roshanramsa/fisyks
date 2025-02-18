const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d");

const G = 9.8;
const FACTOR_OF_DIV = 50;

canvas.width = 1024;
canvas.height = 576;

const cell = {height: 5, width: 5};

c.fillRect(0,0,canvas.width, canvas.height);

class Circle{

    static dynamics = [];

    constructor(position, vel, radius, e){
        this.position = position;
        this.radius = radius;
        this.e = e;
        this.vel = vel;
        this.acc = {x:0, y:G/FACTOR_OF_DIV};
        Circle.dynamics.push(this);
    }

    draw(){
        c.beginPath();
        c.fillStyle = "white";
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, 0);
        c.fill();
    }

    update() {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.position.x += this.vel.x;
        this.position.y += this.vel.y;
    

        if (this.position.x + this.radius > canvas.width) {
            this.position.x = canvas.width - this.radius;
            this.vel.x = -this.vel.x * this.e;
        }
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.vel.x = -this.vel.x * this.e;
        }
        if (this.position.y + this.radius > canvas.height) {
            this.position.y = canvas.height - this.radius;
            this.vel.y = -this.vel.y * this.e;
        }
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.vel.y = -this.vel.y * this.e;
        }
    
        this.draw();
    }
    

}

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width, canvas.height);
    Circle.dynamics.forEach(element => {
        element.update();
    });
}

circ = new Circle({x: 50,y: 50}, {x:1, y: 0}, 7, 0.8);


animate();