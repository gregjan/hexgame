//import { Hashids } from 'hashids';
const Hashids = require('hashids/cjs')
const hashids = new Hashids()

class Hex {
  constructor(q, r) {
    this.r = r;
    this.q = q;
  }
  get hash() {
    return hashids.encode(this.r+20, this.q+20);
  }
  static fromCube(cube) {
    var q = cube.x;
    var r = cube.z;
    return new Hex(q, r);
  }
}

class Cube {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static fromHex(hex) {
    var x = hex.q;
    var z = hex.r;
    var y = -x-z;
    return new Cube(x, y, z);
  }
}

const cube_directions = [
    new Cube(+1, -1, 0), new Cube(+1, 0, -1), new Cube(0, +1, -1),
    new Cube(-1, +1, 0), new Cube(-1, 0, +1), new Cube(0, -1, +1),
];

function cubeAdd(cube, cube2) {
  var x = cube.x + cube2.x;
  var y = cube.y + cube2.y;
  var z = cube.z + cube2.z;
  return new Cube(x, y, z);
}

function cubeScale(cube, s) {
  var x = cube.x * s;
  var y = cube.y * s;
  var z = cube.z * s;
  return new Cube(x, y, z);
}

function cubeDirection(direction) {
  return cube_directions[direction];
}

function cubeNeighbor(cube, direction) {
  return cubeAdd(cube, cubeDirection(direction));
}

function cubeRingVisitor(center, radius, visitorFunc) {
  var cube = cubeAdd(center, cubeScale(cubeDirection(4), radius));
  for(let i = 0; i < 6; i++) {
    for(let j = 0; j < radius; j++) {
      cube = cubeNeighbor(cube, i);
      visitorFunc(cube);
    }
  }
}

function cubeSpiralVisitor(center, radius, visitorFunc) {
  visitorFunc(center);
  for (let i = 1; i <= radius; i++) {
    cubeRingVisitor(center, i, visitorFunc);
  }
}

function hexToPixel(hex, size) {
  var x = size * ((Math.sqrt(3) * hex.q)  +  (Math.sqrt(3)/2 * hex.r));
  var y = size * (3./2 * hex.r);
  return {x: x, y: y};
}

export { Cube, Hex, cubeSpiralVisitor, hexToPixel };
