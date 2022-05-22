// Main config!

let averagemspt = 0;
let globalMultiplier = 1;

const presets = [{ // index 0
        name: "Slow",
        velocity: 0.1,
        gradient: 2,
        lifespan: 100,
        lifespanBase: 50,
        lifeOpacity: 0.25,
        opacityMultiplier: 1,
        size: 3,
        rainbow: true,

        particles: 100,
        rate: 40, // lower = faster
        delayAll: 4000,
        delayPer: 5
    },
    { // index 1
        name: "Speed",
        velocity: 0.3,
        gradient: 10,
        lifespan: 250,
        lifespanBase: 450,
        lifeOpacity: 0.25,
        opacityMultiplier: 0.8,
        size: 3,
        rainbow: true,

        particles: 200,
        rate: 5, // lower = faster
        delayAll: 2000,
        delayPer: 20
    },
    { // index 2
        name: "Speeder",
        velocity: 0.35,
        gradient: 20,
        lifespan: 250,
        lifespanBase: 200,
        lifeOpacity: 0.25,
        opacityMultiplier: 0.8,
        size: 3,
        rainbow: true,

        particles: 100,
        rate: 4, // lower = faster
        delayAll: 2000,
        delayPer: 5
    },
    { // index 3
        name: "Speeder mess",
        velocity: 0.4,
        gradient: 15,
        lifespan: 100,
        lifespanBase: 50,
        lifeOpacity: 0.25,
        opacityMultiplier: 1,
        size: 3,
        rainbow: true,

        particles: 700,
        rate: 10, // lower = faster
        delayAll: 3000,
        delayPer: 1
    },
    { // index 4
        name: "Smol",
        velocity: 0.15,
        gradient: 15,
        lifespan: 100,
        lifespanBase: 50,
        lifeOpacity: 0.25,
        opacityMultiplier: 1,
        size: 1.4,
        rainbow: true,

        particles: 400,
        rate: 35, // lower = faster
        delayAll: 5000,
        delayPer: 10
    },
    { // index 5
        name: "Stars",
        velocity: 0.005,
        gradient: 0,
        lifespan: 300,
        lifespanBase: 100,
        lifeOpacity: 0.1,
        opacityMultiplier: 0.4,
        size: 2,
        rainbow: false,

        particles: 500,
        rate: 42, // lower = faster
        delayAll: 5000,
        delayPer: 10
    },
    { // index 6
        name: "Rainbow stars",
        velocity: 0.005,
        gradient: 0,
        lifespan: 300,
        lifespanBase: 100,
        lifeOpacity: 0.1,
        opacityMultiplier: 1,
        size: 2.2,
        rainbow: true,

        particles: 250,
        rate: 42, // lower = faster
        delayAll: 5000,
        delayPer: 10
    }
];
let config;

const concat = (arr1, arr2, cb) => arr1.map((e, i) => cb(e, arr2[i]));
const merge = (arr1, arr2) => concat(arr1, arr2, (a, b) => a + b);

class Particle {
    constructor() {
        this.started = false;
    }

    get lifespan() {
        return this._lifespan / globalMultiplier;
    }
    set lifespan(value) {
        return this._lifespan = value;
    }

    get velocity() {
        return this._velocity.map(e => e * globalMultiplier);
    }
    set velocity(value) {
        return this._velocity = value;
    }

    get gradient() {
        return this._gradient.map(e => e * globalMultiplier);
    }
    set gradient(value) {
        return this._gradient = value;
    }

    start() {
        this.started = true;
        this.lifespan = Math.random() * config.lifespan + config.lifespanBase;
        // this.lifespan = Math.random() * 35 + 35;
        this.age = 0;
        this.initial = [
            Math.random() * canvas.clientWidth,
            Math.random() * canvas.clientHeight
        ];
        this.pos = this.initial.slice(0);
        this.velocity = [
            Math.random() * config.velocity * 2 - config.velocity,
            Math.random() * config.velocity * 2 - config.velocity
        ];
        if (config.rainbow) {
            this.colour = [
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256)
            ];
            this.gradient = [
                Math.random() * config.gradient * 2 - config.gradient,
                Math.random() * config.gradient * 2 - config.gradient,
                Math.random() * config.gradient * 2 - config.gradient
            ];
        } else
            this.colour = [255, 255, 255];

        this.ctx = canvas.getContext("2d");
    }

    calcOpacity() {
        const quarter = this.lifespan * config.lifeOpacity;
        if (this.age < quarter)
            return this.age / quarter;
        else if (this.age > this.lifespan - quarter)
            return 1 - (this.age - this.lifespan + quarter) / quarter;
        return 1;
    }

    destroy() {
        clearInterval(this.renderer);
        this.start();
    }

    draw() {
        if (!this.started)
            return;

        this.age++;
        if (this.age >= this.lifespan)
            return this.destroy();

        this.pos = merge(this.pos, this.velocity);
        if (this.rainbow)
            this.colour = merge(this.colour, this.gradient);

        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(${this.colour[0]}, ${this.colour[1]}, ${this.colour[2]}, ${this.calcOpacity() * config.opacityMultiplier})`;
        this.ctx.arc(this.pos[0], this.pos[1], config.size, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

let particles = [];
const canvas = document.getElementById("bg");
let si = 0;

const initParticles = index => {
    if (index < 0 || index >= presets.length)
        return console.log("bruh");

    particles = [];
    si = 0;
    config = presets[index];
    globalMultiplier = averagemspt / config.rate;
    console.log(`preset ${index} - ${config.name}`);

    for (let i = 0; i < config.particles; i++)
        particles.push(new Particle());

    start();
};

const start = () => {
    if (si >= config.particles)
        return;
    particles[si].start();
    si++;
    setTimeout(start, Math.random() * config.delayPer + config.delayAll / config.particles);
};

let prev = 0;
let isSet = false;
const samples = [];
const render = t => {
    if (samples.length < 20) {
        if (prev !== 0)
            samples.push(t - prev);
        prev = t;
        window.requestAnimationFrame(render);
        return;
    } else if (!isSet) {
        averagemspt = samples.reduce((a, b) => a + b) / samples.length;
        initParticles(4);
        isSet = true;
    }

    if (canvas.clientHeight !== window.innerHeight)
        canvas.setAttribute("height", window.innerHeight);
    if (canvas.clientWidth !== window.innerWidth)
        canvas.setAttribute("width", window.innerWidth);

    canvas.getContext("2d").clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    particles.forEach(part => part.draw());

    window.requestAnimationFrame(render);
};

window.onload = () => {
    if (canvas.getContext)
        window.requestAnimationFrame(render);
};

// Listeners
