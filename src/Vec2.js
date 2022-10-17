export class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y;
    }

    static subtract(v1, v2) {
        const x = v1.x - v2.x;
        const y = v1.y - v2.y;
        return new Vec2(x, y);
    }

    normalize() {
        this.divide(this.magnitude());
    }

    divide(num) {
        this.x /= num;
        this.y /= num;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    static distance(v1, v2) {
        const dist_x = v1.x - v2.x;
        const dist_y = v1.y - v2.y;
        return Math.sqrt(dist_x * dist_x + dist_y * dist_y);
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
};