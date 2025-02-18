const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1800;
canvas.height = 900;

c.fillRect(0,0,canvas.width, canvas.height);

let colors = ["#ff0505", "#05ff65", "#0597ff", "white","#f202ce","#eaf202"];
let GLOBAL_GX = 0;;
let GLOBAL_GY = 9.8;
const FAC_OF_DIV = 100;

let tex = "";
let force = 100;
let ext = false;
let inverted = 0;
let extPt = {x:0,y:0};
let gOn = true;

let friction = 1.001

document.addEventListener("mousedown", function(event){
    if (event.button === 0){
        ext = true;
        tex = `(${event.clientX - 60},${event.clientY - 30})`;
        extPt.x = event.clientX - 60;
        extPt.y = event.clientY - 15;
    }
})

document.addEventListener("mousemove", function(event){
    if (ext == true){
        tex = `(${event.clientX - 60},${event.clientY - 30})`;
        extPt.x = event.clientX - 60;
        extPt.y = event.clientY - 30;
    }
})

document.addEventListener("mouseup", function(event){
    if (event.button === 0){
        ext = false;
    }
})

document.addEventListener("keydown", function(event){
    if (event.code === "Space"){
      Circle.dynamics.forEach(element => {
        element.vel.x = 0;
        element.vel.y = 0;
    });
    }

    if (event.code === "KeyG"){
        if(gOn) gOn = GLOBAL_GY = 0;
        else{
            gOn = true;
            GLOBAL_GY = 9.8;
        }
    }

    if (event.code === "KeyI"){
        inverted = !inverted;   
    }

    if (event.code === "KeyA"){
        new Circle({x:50,y:50}, Math.floor(Math.random()*10 + 5),{x: Math.floor(Math.random()*10)+1,y:0}, {x:GLOBAL_GX/FAC_OF_DIV, y:GLOBAL_GY/FAC_OF_DIV}, 1 - (Math.random()+0.4)%1);
    }
    
})

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
        this.text = "";

        Circle.dynamics.push(this);
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
            this.vel.x *= friction;
            this.collided = true;
        }

        if (this.pos.x + this.radius >= canvas.width){
            this.vel.x = -this.e*this.vel.x;
            this.pos.x = canvas.width - this.radius;
            this.vel.y *= friction;
            this.collided = true;
        }

        if (this.pos.x - this.radius <= 0){
            this.vel.x = -this.e*this.vel.x;
            this.pos.x = this.radius;
            this.vel.y *= friction;
            this.collided = true;
        }

        if (this.pos.y - this.radius <= 0){
            this.vel.y = -this.e*this.vel.y;
            this.pos.y = this.radius;
            this.vel.x *= friction;
            this.collided = true;
        }

        Rigid.rigid.forEach(element =>{
            if(((this.pos.x >= element.p1.x) == element.code && (this.pos.x <= element.p2.x) == element.code) && Math.abs(element.calcDist(this.pos)) <= this.radius){
                this.collided = true;
                let alpha = (this.vel.x != 0) ? (Math.atan2(this.vel.y,this.vel.x)) : (Math.PI/2);
                let theta = -element.angle;
                let v = Math.sqrt(this.vel.x**2 + this.vel.y**2);   
                this.vel.x = v*Math.cos(theta - alpha)*Math.cos(theta) - this.e*v*Math.sin(theta - alpha)*Math.sin(theta);
                this.vel.y = v*Math.cos(theta - alpha)*Math.sin(theta) + this.e*v*Math.sin(theta - alpha)*Math.cos(theta);


                
                let closestpt = element.closestPt(this.pos);
                this.pos.x = closestpt.x - this.radius*Math.cos(Math.PI/2 - element.angle);
                this.pos.y = closestpt.y - this.radius*Math.sin(Math.PI/2 - element.angle);

                
            }
        })

    }

    update(){
        
        if(ext == true){
            let multiplier = (inverted) ? -1 : 1;
            let angle = Math.atan2(extPt.y - this.pos.y, extPt.x - this.pos.x);
            this.acc.x = multiplier*(GLOBAL_GX + force*Math.cos(angle))/FAC_OF_DIV;
            this.acc.y = multiplier*(GLOBAL_GY + force*Math.sin(angle))/FAC_OF_DIV; 
        }

        if(ext == false){
            this.acc.x = GLOBAL_GX/FAC_OF_DIV;
            this.acc.y = GLOBAL_GY/FAC_OF_DIV;
        }

        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.collision();


        if(this.collided){
            
            console.log(`POS : ${this.pos.x},${this.pos.y}`)
            this.count++;
            this.fill = colors[this.count%colors.length];
            this.collided = false;
        }

        this.draw();
    }
}


class Rigid{

    static rigid = [];
    
    constructor(point1, point2){
        this.p1 = point1;
        this.p2 = point2;
        this.angle = Math.atan2((this.p1.y - this.p2.y),(this.p2.x - this.p1.x));
        this.slope = Math.tan(this.angle);
        this.midpt = {x: (this.p1.x + this.p2.x)/2, y: (this.p1.y + this.p2.y)/2};
        this.code = (this.midpt.x >= this.p1.x);

        Rigid.rigid.push(this);
    }

    calcDist(point){
        let val = this.p1.y - point.y - this.slope*(point.x - this.p1.x);
        let dist = val/Math.sqrt(1 + this.slope**2);
        return dist;
    }

    draw(){
        c.beginPath();
        c.strokeStyle = "white";
        c.moveTo(this.p1.x, this.p1.y);
        c.lineTo(this.p2.x, this.p2.y);
        c.stroke()
    }

    closestPt(point){
        let val = -1*(point.y - this.p1.y - this.slope*(this.p1.x - point.x)) / (this.slope**2 + 1);
        let h = val*this.slope + point.x;
        console.log(`::::: H ${h} ||||||||||| PX ${this.p1.x}`);
        let k = val + point.y;
        return {x:h, y:k};
    }

}


function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width, canvas.height);
    Circle.dynamics.forEach(element => {
        element.update();
    });
    Rigid.rigid.forEach(element => {
        element.draw();
    });
    if(ext){
        c.font = "48px serif";
        c.fillStyle = "white";
        c.fillText(tex, 10, 50);
    }
}

line = new Rigid({x:0, y:800},{x:900, y:700});
line2 = new Rigid({x:900, y:700},{x:1800, y:800});

animate();