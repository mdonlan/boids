const boids = [];
let boid_texture;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const app = new PIXI.Application({width: WIDTH, height: HEIGHT, backgroundColor: 0x1099bb}); // resolution: window.devicePixelRatio || 1
document.body.appendChild(app.view);

// controls
let speed = 1;
let alignment_weight = 1;
let cohesion_weight = 1;
let separation_weight = 1;

function get_random_pos() {
    let x = Math.round(Math.random() * WIDTH);
    let y = Math.round(Math.random() * HEIGHT);
    return { x: x, y: y };
}

function get_random_vel() {
    let x = Math.round(Math.random() * 6) - 3;
    let y = Math.round(Math.random() * 6) - 3;
    return { x: x, y: y };
}

function sim() {
    for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        // const alignment = get_alignment(boids[i]);
        // const cohesion = get_cohesion(boids[i]);
        const separation = get_separation(boid);

        let vel = { x: boid.vel.x, y: boid.vel.y };
        vel = normalize(vel);

        boid.vel.x = vel.x * speed;
        boid.vel.y = vel.y * speed;

        const angle = Math.atan2(boid.vel.y, boid.vel.x);
        
        boid.sprite.rotation = angle - (Math.PI/2);
        
        boids[i].pos.x += boids[i].vel.x;
        boids[i].pos.y += boids[i].vel.y;

        boids[i].sprite.x = boids[i].pos.x;
        boids[i].sprite.y = boids[i].pos.y;
    }
}

function dist(boid_1, boid_2) {
    return Math.hypot(boid_1.pos.x - boid_2.pos.x, boid_1.pos.y - boid_2.pos.y);
}

function get_alignment(boid) {
    let pos = { x: 0, y: 0 };
    // const nearby = spatial_hash.point_to_rect(boid.pos.x, boid.pos.y);
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
    for (let i = 0; i < boids.length; i++) {
        if (dist(boid, boids[i]) < 100) {

        }
    }

    // // let pos = { x: 0, y: 0 };
    
    // // const nearby = spatial_hash.point_to_rect(boid.pos.x, boid.pos.y);
    // for (let i = 0; i < nearby.length; i++) {
    //     // if (dist(boid.pos.x, boid.pos.y, nearby[i].pos.x, nearby[i].pos.y) < 50) {
    //         if (boid.id != nearby[i].id) {
    //             pos.x += nearby[i].pos.x - boid.pos.x;
    //             pos.y += nearby[i].pos.y - boid.pos.y;
    //         }
    //     // }
    // }

    // if (nearby.length == 0) return pos;

    // pos.x /= nearby.length;
    // pos.y /= nearby.length;

    // pos = normalize(pos);

    // pos.x *= -1;
    // pos.y *= -1;

    // return pos;


    // // let count = 0;
    // // let pos = { x: 0, y: 0 };
    // // for (let i = 0; i < boids.length; i++) {
    // //     if (Math.hypot(boid.pos.x - boids[i].pos.x, boid.pos.y - boids[i].pos.y) < 50) {
    // //         if (boid.id != boids[i].id) {
    // //             pos.x += boids[i].pos.x - boid.pos.x;
    // //             pos.y += boids[i].pos.y - boid.pos.y;
    // //             count++;
    // //         }
    // //     }
    // // }

    // // if (count == 0) return pos;

    // // pos.x /= count;
    // // pos.y /= count;

    // // pos = normalize(pos);

    // // pos.x *= -1;
    // // pos.y *= -1;

    // // return pos;
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



function reset() {
    for (let i = 0; i < boids.length; i++) {
        boids[i].pos = get_random_pos();
        boids[i].vel = get_random_vel();
    }
}

function init() {
    create_texture();

    for (let i = 0; i < 50; i++) {
        create_boid();
        // spatial_hash.insert(boids[i]);
    }

    // console.log(spatial_hash)


    // setInterval(() => { reset() }, 10000); // reset every 10 sec
    update();
}

function create_boid() {
    const boid = {
        pos: get_random_pos(), 
        vel: get_random_vel(),
        id: boids.length,
        sprite: new PIXI.Sprite(boid_texture)
    }

    boid.sprite.x = boid.pos.x;
    boid.sprite.y = boid.pos.y;
    // boid.sprite.pivot.set(boid.sprite.width/2, boid.sprite.height/2);
    // boid.sprite.pivot.x = boid.sprite.width / 2;
    // boid.sprite.pivot.y = boid.sprite.height / 2;
    boid.sprite.anchor.x = 0.5;
    boid.sprite.anchor.y = 0.5;
    app.stage.addChild(boid.sprite);

    boids.push(boid);
}

function update() {
    sim();
    // update_positions();
    // wrap();
    draw();
    // spatial_hash.remake(boids);
    // spatial_hash.draw();

    requestAnimationFrame(update);
}

function draw() {
}

init();

function create_texture() {
    let triangle = new PIXI.Graphics();
    const triangleWidth = 32;
    const triangleHeight = triangleWidth;
    const triangleHalfway = triangleWidth / 2;

    triangle.beginFill(0xFFFF00, 1);
    // triangle.lineStyle(0, 0xFF0000, 2);
    triangle.moveTo(triangleWidth, 0);
    triangle.lineTo(triangleHalfway, triangleHeight); 
    triangle.lineTo(0, 0);
    triangle.lineTo(triangleHalfway, 0);
    triangle.endFill();

    boid_texture = app.renderer.generateTexture(triangle);
}

