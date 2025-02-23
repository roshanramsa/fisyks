const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1900;
canvas.height = 900;

c.fillRect(0,0,canvas.width, canvas.height);

let playground = {width:5000, height:2500}

//Color change based on no of collisions
const colors = ["#ff0505", "#05ff65", "#0597ff", "white","#f202ce","#eaf202"];


//COSTANTS

let GLOBAL_GX = 0;;
let GLOBAL_GY = 9.8;
const FAC_OF_DIV = 100;
const friction = 0.999
const canvas_shift = {x:canvas.getBoundingClientRect().left, y:canvas.getBoundingClientRect().top};

let tex = "";

// Force Strength and variable to store the point
let force = 100;
let forcePt = {x:0,y:0};

// Variables to store temporary and permananet shift in coordinates
let global_shift = {x:0, y:0};
let global_marker = {x:0, y:0};


// Values
let scale = 1;
let spawnNo = 1;

//FLAGS
let shift = false;
let ext = false;
let inverted = false;
let gOn = true;
let mass_dependecy = false;
let heat = true;


// Classes;
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
        this.v = Math.sqrt(this.vel.x**2 + this.vel.y**2);
        this.g = Math.floor(Math.random()*170);

        Circle.dynamics.push(this);
    }

    draw(){
        c.beginPath();
        c.fillStyle = this.fill;
        c.arc((this.pos.x - global_shift.x)/scale, (this.pos.y + global_shift.y)/scale, this.radius / scale, 0, Math.PI*2, 0);
        c.fill();
        
    }

    collision(){
        if (this.pos.y + this.radius >= playground.height){
            this.vel.y = -this.e*this.vel.y;
            this.pos.y = playground.height - this.radius;
            this.vel.x *= friction;
            this.collided = true;

        }

        if (this.pos.x + this.radius >= playground.width){
            this.vel.x = -this.e*this.vel.x;
            this.pos.x = playground.width - this.radius;
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

        let mass_relation = (mass_dependecy)?(100/this.radius**2) : (1);
        
        if(ext == true){
            let multiplier = (inverted) ? -1 : 1;
            let angle = Math.atan2(forcePt.y - this.pos.y, forcePt.x - this.pos.x);
            this.acc.x = multiplier*(GLOBAL_GX + force*Math.cos(angle)*mass_relation)/FAC_OF_DIV;
            this.acc.y = multiplier*(GLOBAL_GY + force*Math.sin(angle)*mass_relation)/FAC_OF_DIV; 
        }

        if(ext == false){
            this.acc.x = GLOBAL_GX/FAC_OF_DIV;
            this.acc.y = GLOBAL_GY/FAC_OF_DIV;
        }


        
        if(heat){
            let r = 255 * (Math.log(this.v + 1) / Math.log(60 + 1));
            let b = 255 - r;
            this.fill = `rgb(${r},${this.g},${b})`;
        }
        
        let subSteps = Math.ceil(this.v / (this.radius * 2));
        let stepSize = 1 / subSteps;
        
        this.vel.x += this.acc.x 
        this.vel.y += this.acc.y

        for (let i = 0; i < subSteps; i++) {
            this.pos.x += this.vel.x * stepSize;
            this.pos.y += this.vel.y * stepSize;
            this.collision();
        }


        this.v = Math.sqrt(this.vel.x**2 + this.vel.y**2);

        if(this.collided){
            if(!heat) this.fill = colors[this.count%colors.length];
            console.log(`POS : ${this.pos.x},${this.pos.y}`)
            this.count++;
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
        c.moveTo((this.p1.x - global_shift.x) / scale, (this.p1.y + global_shift.y) / scale);
        c.lineTo((this.p2.x - global_shift.x) / scale, (this.p2.y + global_shift.y) / scale);
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


// Animation Function;
function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = "black";
    
    c.fillRect(0,0,canvas.width, canvas.height);
    c.strokeStyle = "white";
   

    Circle.dynamics.forEach(element => {
        element.update();
    });
    Rigid.rigid.forEach(element => {
        element.draw();
    });
    if(1){
        c.font = "48px serif";
        c.fillStyle = "white";
        c.fillText(`No of objects spawned: ${Circle.dynamics.length}`, 10, 50);
    }
    c.strokeRect((0 - global_shift.x) / scale, (0 + global_shift.y) / scale, playground.width / scale, playground.height / scale);
}


// EVENT LISTENERS; 
document.addEventListener("mousedown", function(event){
    if (event.button === 0){
        ext = true;
        tex = `(${event.clientX - 60},${event.clientY - 30})`;
        forcePt.x = Math.floor((event.clientX - canvas_shift.x + global_shift.x/scale)*scale) ;
        forcePt.y = Math.floor((event.clientY - canvas_shift.y - global_shift.y/scale)*scale);
    }

    if (event.button === 1){
        event.preventDefault();
        global_marker = {x:event.clientX, y:event.clientY};
        shift = true;
    }
})

document.addEventListener("mousemove", function(event){
    tex = `(${event.clientX - 60},${event.clientY - 30})`;
    if (ext == true){
        forcePt.x = Math.floor((event.clientX - canvas_shift.x + global_shift.x/scale)*scale) ;
        forcePt.y = Math.floor((event.clientY - canvas_shift.y - global_shift.y/scale)*scale);
    }

    if (shift){
        global_shift.x += -3*(event.clientX - global_marker.x);
        global_shift.y += 3*(event.clientY- global_marker.y);
        global_marker.x = event.clientX;
        global_marker.y = event.clientY;
    }
})

document.addEventListener("mouseup", function(event){
    if (event.button === 0){
        ext = false;
    }
    if (event.button === 1){    
        shift = false;
    }
})

document.addEventListener("wheel", function(event){
    console.log(event.deltaY);
    scale += event.deltaY/138 * 0.3;

}, {passive: false})

document.addEventListener("keydown", function(event){
    if (event.code === "Space"){
      Circle.dynamics.forEach(element => {
        element.vel.x = 0;
        element.vel.y = 0;
    });
    }

    if (event.code === "KeyG"){
        console.log(GLOBAL_GY);
        if(gOn){
            gOn = false;
            GLOBAL_GY = 0;
        }
        else{
            gOn = true;
            GLOBAL_GY = 9.8;
        }
    }

    if (event.code === "KeyI"){
        inverted = !inverted;   
    }

    if (event.code === "KeyH"){
        heat = !heat;    
    }

    if (event.code === "KeyM"){
        mass_dependecy = !mass_dependecy;
    }

    if (event.code === "KeyA"){
        for(let i = 0; i<spawnNo; i++) new Circle({x:50,y:50}, Math.floor(Math.random()*5 + 10),{x: Math.floor(Math.random()*10)+1,y:0}, {x:GLOBAL_GX/FAC_OF_DIV, y:GLOBAL_GY/FAC_OF_DIV}, 1 - (Math.random() + 0.6)%1);
    }

    if(event.code === "KeyP")
        spawnNo++;
    
    if(event.code === "KeyO")
        spawnNo--
        
    
})

line2 = new Rigid({x:playground.width/2, y:playground.height},{x:playground.width, y:playground.height/2});

animate();