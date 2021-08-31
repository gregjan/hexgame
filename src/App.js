import React from 'react';
import { Client } from 'boardgame.io/react';
// import logo from './logo.svg';
import './App.css';
import { Cube, Hex, cubeSpiralVisitor, hexToPixel } from './hexagonal.js';

const radius = 3;
const center = new Cube(0, 0, 0);

const landTypes = ['clay', 'mountains', 'pasture', 'wheat', 'forest', 'desert'];

class Tile {
  constructor(myhex, type) {
    this.hex = myhex;
    this.type = type;
  }
  setOwner(player) {
    this.owner = player;
  }
}

const HexGame = {
  setup: () => {
    var lands = {};
    var sites = {};
    cubeSpiralVisitor(center, radius, function(cube) {
      var hex  = Hex.fromCube(cube);
      var type = landTypes[Math.floor(Math.random() * landTypes.length)]
      var tile = new Tile(hex, type);
      lands[hex.hash] = tile;
    });
    return {lands: lands, sites: sites};
  },

  moves: {
    claimTile: (G, ctx, hexid) => {
      var tile = G.lands[hexid];
      tile.setOwner(ctx.currentPlayer);
    },
  },
};

class HexBoard extends React.Component {
  onClick(id) {
    console.log(id);
    if (this.isActive(id)) {
      this.props.moves.claimTile(id);
      this.props.events.endTurn();
    }
  }

  isActive(id) {
    if (!this.props.isActive) return false;
    if (this.props.G.lands[id] == null) return false;
    return true;
  }

  render() {
    let svg_w = 1200;
    let translate_xy = svg_w / 2;
    let tiles_across = radius * 2 + 2;
    let tile_width = svg_w / tiles_across;
    let scaling = tile_width / 300;  // based on polygon
    let def_transform = "scale(" + scaling + ") translate(-150 -150) rotate(30)";
    let winner = '';
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    let polygons = [];
    for (var key in this.props.G.lands) {
      // check if the property/key is defined in the object itself, not in parent
      if (this.props.G.lands.hasOwnProperty(key)) {
        var tile = this.props.G.lands[key];
        var pixCtr = hexToPixel(tile.hex, tile_width/2);
        var transform = "translate("+translate_xy+" "+translate_xy+")"+
          " translate("+pixCtr.x + " "+pixCtr.y+")";
        var fill = "url('#"+tile.type+"-bg')";
        polygons.push(
          <use key={key} onClick={() => this.onClick(key)} fill={fill} href="#hex" transform={transform}/>
        )
      }
    }

    return (
      <div style={{width: '*'}} id="board">
        <svg id="color-fill" xmlns="http://www.w3.org/2000/svg" version="1.1" width={svg_w} height={svg_w}>
          <defs>
            <pattern id="forest-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="forest.png"></image>
            </pattern>
            <pattern id="wheat-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="wheat.png"></image>
            </pattern>
            <pattern id="mountains-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="mountains.png"></image>
            </pattern>
            <pattern id="pasture-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="pasture.png"></image>
            </pattern>
            <pattern id="desert-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="desert.png"></image>
            </pattern>
            <pattern id="clay-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
              <image width="300" height="300" href="clay.png"></image>
            </pattern>
            <polygon id="hex" className="hex" points="300,150 225,280 75,280 0,150 75,20 225,20"
              transform={def_transform}></polygon>
          </defs>
          {polygons}
        </svg>
        {winner}
      </div>
    );
  }
}

const App = Client({ game: HexGame, board: HexBoard });
export default App;
