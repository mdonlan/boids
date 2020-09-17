// simple spatial hasing implementation

class Spatial_Hash {
    constructor(ctx) {
        this.ctx = ctx;
        this.cells = [];
        this.cells_per_col = 10;
        this.cells_per_row = 10;
        this.cell_width = Math.floor(window.innerWidth / this.cells_per_col) + 1;
        this.cell_height = Math.floor(window.innerHeight / this.cells_per_row) + 1;

        console.log("cells_per_row: " + this.cells_per_row);
        console.log("cells_per_col: " + this.cells_per_col);

        this.create_cells();
    }

    create_cells() {
        for (let y = 0; y < this.cells_per_row; y++) {
            this.cells.push([]);
            for (let x = 0; x < this.cells_per_col; x++) {
                this.cells[y].push([]);
            }
        }
    }

    remake(arr) {
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[y].length; x++) {
                this.cells[y][x] = [];
            }
        }

        for (let i = 0; i < arr.length; i++) {
            this.insert(arr[i]);
        }
    }

    insert(item) {
        // this.cells[this.to_grid].push(item);
        const cell = this.point_to_cell(item.pos.x, item.pos.y);
        cell.push(item);
    }

    point_to_rect(world_x, world_y) {
        let cell_x = Math.floor(world_x / this.cell_width);
        let cell_y = Math.floor(world_y / this.cell_height);
        if (cell_y < 0) cell_y = 0;
        if (cell_x < 0) cell_x = 0;
        if (cell_y >= this.cells_per_row) cell_y = this.cells_per_row - 1;
        if (cell_x >= this.cells_per_col) cell_x = this.cells_per_col - 1;

        let nearby = this.cells[cell_y][cell_x];

        if (cell_x - 1 >= 0) {
           nearby = nearby.concat(this.cells[cell_y][cell_x - 1]);
        }
        if (cell_x + 1 < this.cells[0].length) {
            nearby = nearby.concat(this.cells[cell_y][cell_x + 1]);
        }
        if (cell_y - 1 >= 0) {
            nearby = nearby.concat(this.cells[cell_y - 1][cell_x]);
        }
        if (cell_y + 1 < this.cells.length) {
            nearby = nearby.concat(this.cells[cell_y + 1][cell_x]);
        }
        return nearby;

        // const cell = this.cells[cell_y][cell_x];
        // return cell;
    }

    point_to_cell(world_x, world_y) {
        // console.log(world_x, world_y);
        let cell_x = Math.floor(world_x / this.cell_width);
        let cell_y = Math.floor(world_y / this.cell_height);
        // console.log("cell_x: " + cell_x);
        // console.log("cell_y: " + cell_y);
        // console.log(this.cells)
        if (cell_y < 0) cell_y = 0;
        if (cell_x < 0) cell_x = 0;
        if (cell_y >= this.cells_per_row) cell_y = this.cells_per_row - 1;
        if (cell_x >= this.cells_per_col) cell_x = this.cells_per_col - 1;

        const cell = this.cells[cell_y][cell_x];
        return cell;
    }

    // get_cell(x, y) {
    //     // const cell = this.cells[this.convert_xy_to_cell(x, y)];
    //     const cell = this.cells[Math.floor()]
    //     console.log(cell)
    //     return cell;
    // }

    convert_xy_to_cell(world_x, world_y) {
        // console.log('world_x: ' + world_x + " world_y: " + world_y);
        // const x = Math.floor(world_x / this.cell_width);
        // const y = Math.floor(world_y / this.cell_height);
        // let index = x * this.cells_per_col + y;
        // if (index < 0) {
        //     console.log('index was less than zero');
        //     index = 0;
        // }
        // if (index > this.cells.length) {
        //     console.log('index was larger than cells number')
        // }
        // console.log(index)
        // return index;
    }

    draw() {
        for (let y = 0; y < this.cells_per_row; y++) {
            for (let x = 0; x < this.cells_per_col; x++) {
                ctx.strokeStyle = "white";
                // ctx.beginPath();
                ctx.strokeRect(x * this.cell_width, y * this.cell_height, this.cell_width, this.cell_height);
                // ctx.endPath();
            }
        }
    }
}


// class Cell {
//     constructor(x, y, cell_width, cell_height) {
//         this.x = x;
//         this.y = y;

//         this.bounds = {
//             left: x * cell_width,
//             top: y * cell_height,
//             right: (x * cell_width) +  cell_width,
//             bot: (y * cell_height) + cell_height
//         };
//     }
// }

// class SH {
//     constructor() {
//         this.cells = [];

//         this.create();
//         console.log(this.cells);
//     }

//     create() {
//         const cells_per_col = 10;
//         const cells_per_row = 10;

//         const cell_width = Math.floor(window.innerWidth / cells_per_col) + 1;
//         const cell_height = Math.floor(window.innerHeight / cells_per_row) + 1;

//         console.log("cell_width: " + cell_width);
//         console.log("cell_height: " + cell_height);

//         for (let y = 0; y < cells_per_row; y++) {
//             for (let x = 0; x < cells_per_col; x++) {
//                 const cell = new Cell(x, y, cell_width, cell_height);
//                 this.cells.push(cell);
//             }
//         }
//     }

//     insert(item) {
        
//     }
// }