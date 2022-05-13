const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const app = new PIXI.Application({width: WIDTH, height: HEIGHT, backgroundColor: 0x181818}); // resolution: window.devicePixelRatio || 1
document.body.appendChild(app.view);

const boids = [];
let boid_texture;

// controls

/* settings v1
const num_boids = 200;
const sight_radius = 200;
const avoid_radius = 20;
const separation_factor = 0.05;
const cohesion_factor = 0.001;
const alignment_factor = 0.5;
const turn_factor = .2;
const max_speed = 3;
const min_speed = 2;
*/
const num_boids = 200;
const sight_radius = 400;
const avoid_radius = 20;
const separation_factor = 0.005;
const cohesion_factor = 0.00005;
const alignment_factor = 0.5;
const turn_factor = .2;
const max_speed = 3;
const min_speed = 2;

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
        const alignment = get_alignment(boid);
        const cohesion = get_cohesion(boid);
        const separation = get_separation(boid);

        const new_vel = { x: boid.vel.x, y: boid.vel.y};

        if (alignment.x != 0 || alignment.y != 0) {
            new_vel.x += (alignment.x - boid.vel.x) * alignment_factor;
            new_vel.y += (alignment.y - boid.vel.y) * alignment_factor;
        }

        if (cohesion.x != 0 || cohesion.y != 0) {
            new_vel.x += (cohesion.x - boid.pos.x) * cohesion_factor;
            new_vel.y += (cohesion.y - boid.pos.y) * cohesion_factor;
        }
        if (separation.x != 0 || separation.y != 0) {
            new_vel.x += separation.x * separation_factor;
            new_vel.y += separation.y * separation_factor;
        }

        if (new_vel.x > max_speed) {
            new_vel.x = max_speed;
        } else if (new_vel.x < -max_speed) {
            new_vel.x = -max_speed;
        }

        if (new_vel.y > max_speed) {
            new_vel.y = max_speed;
        } else if (new_vel.y < -max_speed) {
            new_vel.y = -max_speed;
        }

        boid.vel = new_vel;


        // turn near edges
        // const margin = 50;
        // if (boid.pos.x < margin) {
        //     boid.vel.x += turn_factor;
        // }
        // if (boid.pos.x > WIDTH - margin) {
        //     boid.vel.x -= turn_factor;
        // }
        // if (boid.pos.y > HEIGHT - margin) {
        //     boid.vel.y -= turn_factor;
        // }
        // if (boid.pos.y < margin) {
        //     boid.vel.y += turn_factor;
        // }

        const speed = Math.sqrt(boid.vel.x*boid.vel.x + boid.vel.y*boid.vel.y);

        if (speed < min_speed) {
            boid.vel.x = (boid.vel.x / speed) * min_speed;
            boid.vel.y = (boid.vel.y / speed) * min_speed;
        } else if (speed > max_speed) {
            boid.vel.x = (boid.vel.x / speed) * max_speed;
            boid.vel.y = (boid.vel.y / speed) * max_speed;
        }

        // console.log("vel_x: " + boid.vel.x + ", vel_y: " + boid.vel.y);

        const angle = Math.atan2(boid.vel.y, boid.vel.x);
        
        boid.sprite.rotation = angle - (Math.PI/2);

        boids[i].pos.x += boids[i].vel.x;
        boids[i].pos.y += boids[i].vel.y;

        boids[i].sprite.x = boids[i].pos.x;
        boids[i].sprite.y = boids[i].pos.y;

        // boid.sprite.tint = "0xFF00FF";
        const x = boid.pos.x / (WIDTH / 255);
        const y = boid.pos.y / (WIDTH / 255);
        const r = x;
        const g = y;
        const b = 175;
        boid.sprite.tint = rgb2hex(r, g, b);

        if (i == 0) {
            console.log(b)

            let sight_circle = app.stage.getChildByName("sight_circle");
            let avoid_circle = app.stage.getChildByName("avoid_circle");

            if (sight_circle) {
                sight_circle.clear();
                sight_circle.lineStyle(2, 0xFF00FF);
                sight_circle.drawCircle(boid.pos.x, boid.pos.y, sight_radius);
                sight_circle.endFill();
            } else {
                const sight_circle = new PIXI.Graphics();
                sight_circle.lineStyle(2, 0xFF00FF);
                sight_circle.drawCircle(boid.pos.x, boid.pos.y, sight_radius);
                sight_circle.endFill();
                sight_circle.name = "sight_circle";
                app.stage.addChild(sight_circle);
            }

            if (avoid_circle) {
                avoid_circle.clear();
                avoid_circle.lineStyle(2, 0xFF00FF);
                avoid_circle.drawCircle(boid.pos.x, boid.pos.y, avoid_radius);
                avoid_circle.endFill();
            } else {
                const avoid_circle = new PIXI.Graphics();
                avoid_circle.lineStyle(2, 0xFF00FF);
                avoid_circle.drawCircle(boid.pos.x, boid.pos.y, avoid_radius);
                avoid_circle.endFill();
                avoid_circle.name = "avoid_circle";
                app.stage.addChild(avoid_circle)
            }

    // radius_texture = app.renderer.generateTexture(circle)
        }
    }
}

function get_dist(boid_1, boid_2) {
    return Math.hypot(boid_1.pos.x - boid_2.pos.x, boid_1.pos.y - boid_2.pos.y);
}

// find avg velocity of nearby boids
function get_alignment(boid) {
    // return {x: 0, y: 0}
    const vel = { x: 0, y: 0 };
    let nearby_count = 0;
    for (let i = 0; i < boids.length; i++) {
            if (boid.id != boids[i].id && get_dist(boid, boids[i]) < sight_radius) {
                vel.x -= boids[i].vel.x;
                vel.y -= boids[i].vel.y;
                nearby_count++;
            }
    }

    if (nearby_count == 0) return vel;

    vel.x /= nearby_count;
    vel.y /= nearby_count;
    return { x: vel.x, y: vel.y};
}

// find center pos of nearby boids
function get_cohesion(boid) {
    // return {x: 0, y: 0}
    const pos = { x: 0, y: 0 };
    let nearby_count = 0;
    for (let i = 0; i < boids.length; i++) {
        if (boid.id != boids[i].id && get_dist(boid, boids[i]) < sight_radius) {
            pos.x += boids[i].pos.x;
            pos.y += boids[i].pos.y;
            nearby_count++;
        }
    }

    if (nearby_count == 0) return pos;

    pos.x /= nearby_count;
    pos.y /= nearby_count;

    return pos;
}

// move away from nearby boids
function get_separation(boid) {
    // return {x: 0, y: 0}
    const pos = { x: 0, y: 0 };
    for (let i = 0; i < boids.length; i++) {
            if (boid.id != boids[i].id && get_dist(boid, boids[i]) < avoid_radius) {
                pos.x += boid.pos.x - boids[i].pos.x;
                pos.y += boid.pos.y - boids[i].pos.y;
            }
    }
    return pos;
}

// function normalize(pos) {
//     let mag = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
//     if (mag == 0) return pos;
//     pos.x /= mag;
//     pos.y /= mag;
//     return pos;
// }

function wrap() {
    for (let i = 0; i < boids.length; i++) {
        if (boids[i].pos.x > WIDTH) boids[i].pos.x = 0;
        else if (boids[i].pos.x < 0) boids[i].pos.x = WIDTH;

        if (boids[i].pos.y > HEIGHT) boids[i].pos.y = 0;
        else if (boids[i].pos.y < 0) boids[i].pos.y = HEIGHT;
    }
}

// function reset() {
//     for (let i = 0; i < boids.length; i++) {
//         boids[i].pos = get_random_pos();
//         boids[i].vel = get_random_vel();
//     }
// }

function init() {
    create_boid_texture();

    for (let i = 0; i < num_boids; i++) {
        create_boid();
    }

    update();
}

function create_boid() {
    const boid = {
        pos: get_random_pos(), 
        vel: get_random_vel(),
        id: boids.length,
        sprite: new PIXI.Sprite(boid_texture)
    }

    // boid.sprite.filters = [
    //     new PIXI.filters.GlowFilter({ distance: 15, outerStrength: 2 })
    // ];

    boid.sprite.x = boid.pos.x;
    boid.sprite.y = boid.pos.y;
    boid.sprite.anchor.x = 0.5;
    boid.sprite.anchor.y = 0.5;
    app.stage.addChild(boid.sprite);

    boids.push(boid);
}

function create_boid_texture() {
    let triangle = new PIXI.Graphics();
    const triangleWidth = 16;
    const triangleHeight = triangleWidth;
    const triangleHalfway = triangleWidth / 2;

    triangle.beginFill(0xFFFFFF, 1);
    // triangle.lineStyle(0, 0xFF0000, 2);
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
    sim();
    wrap();
    requestAnimationFrame(update);
}

init();
