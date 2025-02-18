const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d");

const G = 9.8;
const FRICTION = 0.0001;
const FACTOR_OF_DIV = 1000000;

canvas.width = 1024;
canvas.height = 576;



c.fillRect(0,0,canvas.width, canvas.height);

class Circle{
  
    static dynamics = [];

    constructor(position, radius, e){
        this.position = position;
        this.radius = radius;
        this.e = e;
        this.vx = 1;
        this.vy = 0;
        this.ax = 0;
        this.ay = G/FACTOR_OF_DIV;
        Circle.dynamics.push(this);
    }

    draw(){
        c.beginPath();
        c.fillStyle = "white"
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, 0);
        c.fill();
    }

    update(){
        
        this.position.x += this.vx;
        this.position.y += this.vy;
        let val = this.checkCollision() 
        if(val === 0){
            this.vx += this.ax;
            this.vy += this.ay;
        } else if(val === 2){
            this.position.x = (this.position.x + this.radius >= canvas.width) ? canvas.width - this.radius : 0+this.radius;
            this.vx = -this.e*this.vx;
            this.vy *= (1-FRICTION);
        }
        else if (val === 1){
            this.position.y = (this.position.y + this.radius >= canvas.height) ? canvas.height - this.radius : 0+this.radius;
            this.vy = -this.e*this.vy;
            this.vx *=  (1-FRICTION);
        }

        if(Math.abs(this.vy) < 0.5) {
            this.vy *= 0.99;
        }
        if(Math.abs(this.vx) < 0.5) {
            this.vx *= 0.99;
        }
        
        console.log(this.vy);
        this.draw();

    }

    checkCollision(){
        if(this.position.y+this.radius>=canvas.height || this.position.y-this.radius<=0) return 1;
        else if(this.position.x+this.radius>=canvas.width || this.position.x - this.radius <= 0) return 2;
        else return 0;
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

circ = new Circle({x: 50,y: 50},7, 1);


animate();