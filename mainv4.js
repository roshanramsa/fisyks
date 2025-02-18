const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1800;
canvas.height = 900;

c.fillRect(0,0,canvas.width, canvas.height);

let colors = ["#ff0505", "#05ff65", "#0597ff", "white"];
let global_gx = 0;;
let global_gy = 9.8;
const fac = 100;

let tex = "";
let ext = false;
let extPt = {x:0,y:0};

document.addEventListener("mousedown", function(event){
    if (event.button === 0){
        ext = true;
        tex = `(${event.clientX},${event.clientY})`;
        extPt.x = event.clientX;
        extPt.y = event.clientY;
    }
})

document.addEventListener("mousemove", function(event){
    if (ext == true){
        tex = `(${event.clientX},${event.clientY})`;
        extPt.x = event.clientX;
        extPt.y = event.clientY;
    }
})

document.addEventListener("mouseup", function(event){
    if (event.button === 0){
        ext = false;
    }
})

class vector{
    constructor(x, y){
        this.x = x;
        this.y = y
    }
    magn(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

}

class Circle{ 

    static dynamics = [];

    constructor(position, radius, velocity, acceleration, e){
        this.pos = position;
        this.radius = radius;
        this.vel = velocity;
        this.acc = acceleration;
        this.e = e;
        this.fill = "#FFF";
        this.count = 0;
        this.collided = false;
        this.drawtext = false;
        this.text = "";

        Circle.dynamics.push(this);

        this.onMousedown = this.onMousedown.bind(this)

        document.addEventListener("mousedown", this.onMousedown);

        this.onMouseup = this.onMouseup.bind(this)

        document.addEventListener("mouseup", this.onMouseup);

        this.onMousemove = this.onMousemove.bind(this)

        document.addEventListener("mousemove", this.onMousemove);
    }

    draw(){
        c.beginPath();
        c.fillStyle = this.fill;
        c.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2, 0);
        c.fill();
        
    }

    collision(){
        if (this.pos.y + this.radius >= canvas.height){
            this.vel.y = -this.e*this.vel.y;
            this.pos.y = canvas.height - this.radius;
            this.collided = true;
        }

        if (this.pos.x + this.radius >= canvas.width){
            this.vel.x = -this.e*this.vel.x;
            this.pos.x = canvas.width - this.radius;
            this.collided = true;
        }

        if (this.pos.x - this.radius <= 0){
            this.vel.x = -this.e*this.vel.x;
            this.pos.x = this.radius;
            this.collided = true;
        }

        if (this.pos.y - this.radius <= 0){
            this.vel.y = -this.e*this.vel.y;
            this.pos.y = this.radius;
            this.collided = true;
        }
    }

    update(){
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.collision();

        if(this.collided){
            this.count++;
            this.fill = colors[this.count%colors.length];
            this.collided = false;
        }

        this.draw();
    }

    onMousedown(event){
        if(event.button === 0){
            this.drawtext = true;
        }
    }

    onMousemove(event){
        if(this.drawtext){
            this.text = `(${event.clientX},${event.clientY})`;
        }
    }

    onMouseup(event){
        if(event.button === 0){
            this.drawtext = false;
        }
    }


}

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width, canvas.height);
    Circle.dynamics.forEach(element => {
        element.update();
    });
    if(ext){
        c.font = "48px serif";
        c.fillStyle = "white";
        c.fillText(tex, 10, 50);
    }
}

circ = new Circle({x: 50,y: 50}, 5, {x:10, y: 0}, {x:global_gx/fac,y:global_gy/fac}, 0.9);
circ = new Circle({x: 50,y: 50}, 5, {x:1, y: 0}, {x:global_gx/fac,y:global_gy/fac}, 0.9);
circ = new Circle({x: 50,y: 50}, 5, {x:5, y: 0}, {x:global_gx/fac,y:global_gy/fac}, 0.9);


animate();