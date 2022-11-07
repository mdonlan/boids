import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {spatial_grid} from './spatial_hash'
import { Vec2 } from './Vec2';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const app = new PIXI.Application({width: WIDTH, height: HEIGHT, backgroundColor: 0x181818}); // resolution: window.devicePixelRatio || 1

let el = document.querySelector(".boids_container");
el.appendChild(app.view);

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild( stats.dom );

const boids = [];
let boid_texture;

// controls

const num_boids = 500;
const sight_radius = 75;

const separation_factor = 0.005;
const cohesion_factor = 0.0002;
const alignment_factor = 0.02;
const turn_factor = .2;
const max_speed = 3;
const min_speed = 2;
const boid_size = 10;
const avoid_radius = boid_size * 1.5;

const bounds = [[0, 0], [window.innerWidth, window.innerHeight]];
const cell_size = [boid_size * 2, boid_size * 2];
const spatial_hash = new spatial_grid.SpatialHash_Fast(bounds, cell_size);
const clients = [];

function get_random_pos() {
    let x = Math.round(Math.random() * WIDTH);
    let y = Math.round(Math.random() * HEIGHT);
    return new Vec2(x, y);
}

function get_random_vel() {
    let x = Math.round(Math.random() * 6) - 3;
    let y = Math.round(Math.random() * 6) - 3;
    return new Vec2(x, y);
}

function set_boid_color(boid) {
// set sprite color based on x, y pos -- improve this?
    const x = boid.pos.x / (WIDTH / 255);
    const y = boid.pos.y / (WIDTH / 255);
    const r = x;
    const g = y;
    const b = 175;
    boid.sprite.tint = rgb2hex(r, g, b);
}

function sim() {
    for (let i = 0; i < boids.length; i++) {
        const nearby = spatial_hash.FindNear(clients[i].position, [100, 100]);

        const alignment = get_alignment(boids[i], nearby);
        const cohesion = get_cohesion(boids[i], nearby);
        const separation = get_separation(boids[i], nearby);

        // const new_vel = { x: boids[i].vel.x, y: boids[i].vel.y};

        boids[i].vel.x += separation.x * separation_factor;
        boids[i].vel.y += separation.y * separation_factor;

        boids[i].vel.x += (alignment.x - boids[i].vel.x) * alignment_factor;
        boids[i].vel.y += (alignment.y - boids[i].vel.y) * alignment_factor;

        boids[i].vel.x += (cohesion.x - boids[i].pos.x) * cohesion_factor;
        boids[i].vel.y += (cohesion.y - boids[i].pos.y) * cohesion_factor;

        // if (boids[i].x > max_speed) {
        //     boids[i].x = max_speed;
        // } else if (boids[i].x < -max_speed) {
        //     boids[i].x = -max_speed;
        // }

        // if (boids[i].y > max_speed) {
        //     boids[i].y = max_speed;
        // } else if (boids[i].y < -max_speed) {
        //     boids[i].y = -max_speed;
        // }

        // turn near edges
        const margin = 50;
        if (boids[i].pos.x < margin) {
            boids[i].vel.x += turn_factor;
        }
        if (boids[i].pos.x > WIDTH - margin) {
            boids[i].vel.x -= turn_factor;
        }
        if (boids[i].pos.y > HEIGHT - margin) {
            boids[i].vel.y -= turn_factor;
        }
        if (boids[i].pos.y < margin) {
            boids[i].vel.y += turn_factor;
        }

        const speed = Math.sqrt(boids[i].vel.x * boids[i].vel.x + boids[i].vel.y * boids[i].vel.y);

        if (speed < min_speed) {
            boids[i].vel.x = (boids[i].vel.x / speed) * min_speed;
            boids[i].vel.y = (boids[i].vel.y / speed) * min_speed;
        } else if (speed > max_speed) {
            boids[i].vel.x = (boids[i].vel.x / speed) * max_speed;
            boids[i].vel.y = (boids[i].vel.y / speed) * max_speed;
        }

        const angle = Math.atan2(boids[i].vel.y, boids[i].vel.x);
        
        boids[i].sprite.rotation = angle - (Math.PI/2);

        boids[i].pos.x += boids[i].vel.x;
        boids[i].pos.y += boids[i].vel.y;

        clients[i].position[0] = boids[i].pos.x;
        clients[i].position[1] = boids[i].pos.y;
        spatial_hash.UpdateClient(clients[i]);

        boids[i].sprite.x = boids[i].pos.x;
        boids[i].sprite.y = boids[i].pos.y;

        set_boid_color(boids[i]);

        // // DEV: view radius
        // if (i == 0) {
        //     let sight_circle = app.stage.getChildByName("sight_circle");
        //     let avoid_circle = app.stage.getChildByName("avoid_circle");

        //     if (sight_circle) {
        //         sight_circle.clear();
        //         sight_circle.lineStyle(2, 0xFF00FF);
        //         sight_circle.drawCircle(boids[i].pos.x, boids[i].pos.y, sight_radius);
        //         sight_circle.endFill();
        //     } else {
        //         const sight_circle = new PIXI.Graphics();
        //         sight_circle.lineStyle(2, 0xFF00FF);
        //         sight_circle.drawCircle(boids[i].pos.x, boids[i].pos.y, sight_radius);
        //         sight_circle.endFill();
        //         sight_circle.name = "sight_circle";
        //         app.stage.addChild(sight_circle);
        //     }

        //     if (avoid_circle) {
        //         avoid_circle.clear();
        //         avoid_circle.lineStyle(2, 0xFF00FF);
        //         avoid_circle.drawCircle(boids[i].pos.x, boids[i].pos.y, avoid_radius);
        //         avoid_circle.endFill();
        //     } else {
        //         const avoid_circle = new PIXI.Graphics();
        //         avoid_circle.lineStyle(2, 0xFF00FF);
        //         avoid_circle.drawCircle(boids[i].pos.x, boids[i].pos.y, avoid_radius);
        //         avoid_circle.endFill();
        //         avoid_circle.name = "avoid_circle";
        //         app.stage.addChild(avoid_circle)
        //     }
        // }
    }
}

function get_dist(boid_1, boid_2) {
    return Math.hypot(boid_1.pos.x - boid_2.pos.x, boid_1.pos.y - boid_2.pos.y);
}

// find avg velocity of nearby boids
function get_alignment(boid, nearby) {
    // return {x: 0, y: 0}
    const vel = { x: 0, y: 0 };
    let nearby_count = 0;
    for (let i = 0; i < nearby.length; i++) {
            if (boid.id != nearby[i].id && get_dist(boid, boids[nearby[i].id]) < sight_radius) {
                vel.x += boids[nearby[i].id].vel.x;
                vel.y += boids[nearby[i].id].vel.y;
                nearby_count++;
            }
    }

    if (nearby_count == 0) return vel;

    vel.x /= nearby_count;
    vel.y /= nearby_count;

    return vel;
}

// find center pos of nearby boids
function get_cohesion(boid, nearby) {
    // return {x: 0, y: 0}
    const pos = { x: 0, y: 0 };
    let nearby_count = 0;
    for (let i = 0; i < nearby.length; i++) {
        if (boid.id != nearby[i].id && get_dist(boid, boids[nearby[i].id]) < sight_radius) {
            pos.x += boids[nearby[i].id].pos.x;
            pos.y += boids[nearby[i].id].pos.y;
            nearby_count++;
        }
    }

    if (nearby_count == 0) return pos;

    pos.x /= nearby_count;
    pos.y /= nearby_count;

    return pos;
}

// move away from nearby boids
function get_separation(boid, nearby) {
    // return {x: 0, y: 0}
    const pos = new Vec2(0, 0);
    let count = 0;
    for (let i = 0; i < nearby.length; i++) {
        if (boid.id != nearby[i].id && get_dist(boid, boids[nearby[i].id]) < avoid_radius) {
            pos.x += boid.pos.x - boids[nearby[i].id].pos.x;
            pos.y += boid.pos.y - boids[nearby[i].id].pos.y;
        }
    }

    // if (count > 0) {
    //     pos.divide(count);
    // }

    return pos;
}

function wrap() {
    for (let i = 0; i < boids.length; i++) {
        if (boids[i].pos.x > WIDTH) boids[i].pos.x = 0;
        else if (boids[i].pos.x < 0) boids[i].pos.x = WIDTH;

        if (boids[i].pos.y > HEIGHT) boids[i].pos.y = 0;
        else if (boids[i].pos.y < 0) boids[i].pos.y = HEIGHT;
    }
}

function init() {
    create_boid_texture();

    const spawn_interval = setInterval(() => {
        if (boids.length < num_boids) {
            create_boid();
        } else {
            clearInterval(spawn_interval);
        }
    }, 20);
    

    // for (let i = 0; i < num_boids; i++) {
    //     create_boid();
    // }

    update();
}

function create_boid() {
    const boid = {
        pos: get_random_pos(), 
        vel: get_random_vel(),
        id: boids.length,
        sprite: new PIXI.Sprite(boid_texture)
    }

    const client = spatial_hash.NewClient([boid.pos.x, boid.pos.y], [10, 10]);
    client.id = boid.id;
    clients.push(client);

    boid.sprite.x = boid.pos.x;
    boid.sprite.y = boid.pos.y;
    boid.sprite.anchor.x = 0.5;
    boid.sprite.anchor.y = 0.5;

    set_boid_color(boid);
    
    app.stage.addChild(boid.sprite);

    boids.push(boid);
}

function create_boid_texture() {
    let triangle = new PIXI.Graphics();
    const triangleWidth = boid_size;
    const triangleHeight = triangleWidth;
    const triangleHalfway = triangleWidth / 2;

    triangle.beginFill(0xFFFFFF, 1);
    triangle.moveTo(triangleWidth, 0);
    triangle.lineTo(triangleHalfway, triangleHeight); 
    triangle.lineTo(0, 0);
    triangle.lineTo(triangleHalfway, 0);
    triangle.endFill();

    boid_texture = app.renderer.generateTexture(triangle);
}

function rgb2hex(r, g, b) {
    try {
        var rHex = parseInt(r).toString(16).padStart(2, '0');
        var gHex = parseInt(g).toString(16).padStart(2, '0');
        var bHex = parseInt(b).toString(16).padStart(2, '0');
    } catch (e) {
        return false;
    }
    if (rHex.length > 2 || gHex.length > 2 || bHex.length > 2) return false;
    return '0x' + rHex + gHex + bHex;
}

function update() {
    stats.begin();
    sim();
    // wrap();
	stats.end();
    requestAnimationFrame(update);
}

init();


