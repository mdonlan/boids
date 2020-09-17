const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boids = [];

const spatial_hash = new Spatial_Hash(ctx);

// controls
let speed = 3;
let alignment_weight = 1;
let cohesion_weight = 1;
let separation_weight = 1;

function get_random_pos() {
    let x = Math.round(Math.random() * canvas.width);
    let y = Math.round(Math.random() * canvas.height);
    return { x: x, y: y };
}

function get_random_vel() {
    let x = Math.round(Math.random() * 6) - 3;
    let y = Math.round(Math.random() * 6) - 3;
    return { x: x, y: y };
}

function create_boid() {
    const boid = {
        pos: get_random_pos(), 
        vel: get_random_vel(),
        id: boids.length,
    }

    return boid;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < boids.length; i++) {

        boids[i].pos.x += boids[i].vel.x;
        boids[i].pos.y += boids[i].vel.y;

        let r = boids[i].pos.x / canvas.width * 255;
        let g = boids[i].pos.y / canvas.height * 255;
        let b = 255;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // ctx.fillRect(boids[i].pos.x, boids[i].pos.y, 5, 5);

        ctx.beginPath();
        ctx.arc(boids[i].pos.x, boids[i].pos.y, 3, 0, 2 * Math.PI);
        ctx.fill();

        // ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        // ctx.beginPath();
        // ctx.arc(boids[i].pos.x, boids[i].pos.y, 100, 0, 2 * Math.PI);
        // ctx.fill();

        if (i == 0) {
            ctx.strokeRect(boids[i].pos.x - spatial_hash.cell_width, boids[i].pos.y - spatial_hash.cell_height, spatial_hash.cell_width * 2, spatial_hash.cell_height * 2);
        }
    }
}

function sim() {
    for (let i = 0; i < boids.length; i++) {
        const alignment = get_alignment(boids[i]);
        // const alignment = { x: 0, y: 0 };
        // const cohesion = { x: 0, y: 0 };
        // const separation = { x: 0, y: 0 };
        const cohesion = get_cohesion(boids[i]);
        const separation = get_separation(boids[i]);

        if (i == 0) {
            // console.log("pos: " + boids[i].pos.x + ", " + boids[i].pos.y);
            // console.log("alignment: ", alignment);
            // console.log("cohesion: ", cohesion);
            // console.log("separation: ", separation);
        }

        boids[i].vel.x += alignment.x * alignment_weight + cohesion.x * cohesion_weight + separation.x * separation_weight;
        boids[i].vel.y += alignment.y + cohesion.y + separation.y;

        let vel = { x: boids[i].vel.x, y: boids[i].vel.y };
        vel = normalize(vel);
        boids[i].vel.x = vel.x * speed;
        boids[i].vel.y = vel.y * speed;

        boids[i].pos.x += boids[i].vel.x;
        boids[i].pos.y += boids[i].vel.y;
    }
}

function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}

function get_alignment(boid) {
    let pos = { x: 0, y: 0 };
    const nearby = spatial_hash.point_to_rect(boid.pos.x, boid.pos.y);
    for (let i = 0; i < nearby.length; i++) {
        // if (dist(boid.pos.x, boid.pos.y, nearby[i].pos.x, nearby[i].pos.y) < 50) {
            if (boid.id != nearby[i].id) {
                pos.x += nearby[i].vel.x;
                pos.y += nearby[i].vel.y;
            }
        // }
    }

    if (nearby.length == 0) return pos;

    pos.x /= nearby.length;
    pos.y /= nearby.length;

    return normalize(pos);

    // let count = 0;
    // let pos = { x: 0, y: 0 };
    // for (let i = 0; i < boids.length; i++) {
    //     if (dist(boid.pos.x, boid.pos.y, boids[i].pos.x, boids[i].pos.y) < 25) {
    //         if (boid.id != boids[i].id) {
    //             pos.x += boids[i].vel.x;
    //             pos.y += boids[i].vel.y;
    //             count++;
    //         }
    //     }
    // }

    // if (count == 0) return pos;

    // pos.x /= count;
    // pos.y /= count;

    // return normalize(pos);
}

function get_cohesion(boid) {

    let count = 0
    let pos = { x: 0, y: 0 };
    const nearby = spatial_hash.point_to_rect(boid.pos.x, boid.pos.y);
    for (let i = 0; i < nearby.length; i++) {
        // if (dist(boid.pos.x, boid.pos.y, nearby[i].pos.x, nearby[i].pos.y) < 50) {
            if (boid.id != nearby[i].id) {
                pos.x += nearby[i].pos.x;
                pos.y += nearby[i].pos.y;
                count++;
            }
        // }
    }

    if (count == 0) return pos;

    pos.x /= count;
    pos.y /= count;

    pos.x -= boid.pos.x;
    pos.y -= boid.pos.y;

    pos = normalize(pos)

    return pos;

    // let count = 0
    // let pos = { x: 0, y: 0 };
    // for (let i = 0; i < boids.length; i++) {
    //     if (dist(boid.pos.x, boid.pos.y, boids[i].pos.x, boids[i].pos.y) < 50) {
    //         if (boid.id != boids[i].id) {
    //             pos.x += boids[i].pos.x;
    //             pos.y += boids[i].pos.y;
    //             count++;
    //         }
    //     }
    // }

    // if (count == 0) return pos;

    // pos.x /= count;
    // pos.y /= count;

    // pos.x -= boid.pos.x;
    // pos.y -= boid.pos.y;

    // pos = normalize(pos)

    // return pos;
}

function get_separation(boid) {


    let pos = { x: 0, y: 0 };
    const nearby = spatial_hash.point_to_rect(boid.pos.x, boid.pos.y);
    for (let i = 0; i < nearby.length; i++) {
        // if (dist(boid.pos.x, boid.pos.y, nearby[i].pos.x, nearby[i].pos.y) < 50) {
            if (boid.id != nearby[i].id) {
                pos.x += nearby[i].pos.x - boid.pos.x;
                pos.y += nearby[i].pos.y - boid.pos.y;
            }
        // }
    }

    if (nearby.length == 0) return pos;

    pos.x /= nearby.length;
    pos.y /= nearby.length;

    pos = normalize(pos);

    pos.x *= -1;
    pos.y *= -1;

    return pos;


    // let count = 0;
    // let pos = { x: 0, y: 0 };
    // for (let i = 0; i < boids.length; i++) {
    //     if (Math.hypot(boid.pos.x - boids[i].pos.x, boid.pos.y - boids[i].pos.y) < 50) {
    //         if (boid.id != boids[i].id) {
    //             pos.x += boids[i].pos.x - boid.pos.x;
    //             pos.y += boids[i].pos.y - boid.pos.y;
    //             count++;
    //         }
    //     }
    // }

    // if (count == 0) return pos;

    // pos.x /= count;
    // pos.y /= count;

    // pos = normalize(pos);

    // pos.x *= -1;
    // pos.y *= -1;

    // return pos;
}

function normalize(pos) {
    // get mag
    let mag = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

    if (mag == 0) return pos;

    pos.x /= mag;
    pos.y /= mag;

    return pos;

    // const length = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
    // if (length == 0) {
    //     console.log("DIVIDED BY ZERO");
    // }
    // pos.x /= length;
    // pos.y /= length;
    // return pos;
}

function wrap() {
    for (let i = 0; i < boids.length; i++) {
        if (boids[i].pos.x > canvas.width) boids[i].pos.x = 0;
        else if (boids[i].pos.x < 0) boids[i].pos.x = canvas.width;

        if (boids[i].pos.y > canvas.height) boids[i].pos.y = 0;
        else if (boids[i].pos.y < 0) boids[i].pos.y = canvas.height;
    }
}

function update() {
    sim();
    // update_positions();
    wrap();
    draw();
    spatial_hash.remake(boids);
    spatial_hash.draw();

    requestAnimationFrame(update);
}

function reset() {
    for (let i = 0; i < boids.length; i++) {
        boids[i].pos = get_random_pos();
        boids[i].vel = get_random_vel();
    }
}

function init() {

    for (let i = 0; i < 1000; i++) {
        boids.push(create_boid());
        spatial_hash.insert(boids[i]);
    }

    console.log(spatial_hash)


    // setInterval(() => { reset() }, 10000); // reset every 10 sec
    update();
}

init();
