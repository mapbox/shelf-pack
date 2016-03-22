[![npm version](https://badge.fury.io/js/shelf-pack.svg)](https://badge.fury.io/js/shelf-pack)
[![Build Status](https://circleci.com/gh/mapbox/shelf-pack.svg?style=svg)](https://circleci.com/gh/mapbox/shelf-pack)

## shelf-pack

A 2D rectangular bin packing data structure that uses the Shelf Best Height Fit heuristic.


### Usage

```js
var ShelfPack = require('shelf-pack');

// initialize the space
var sprite = new ShelfPack(64, 64);

// allocate bins
for (var i = 0; i < 5; i++) {
    var position = sprite.allocate(32, 32);
    if (position) {
        console.log('ok');
    } else {
        console.log('out of space');
    }
}

// resize
sprite.resize(128, 128);

```


### See also

J. Jylänky, "A Thousand Ways to Pack the Bin - A Practical
Approach to Two-Dimensional Rectangle Bin Packing,"
http://clb.demon.fi/files/RectangleBinPack.pdf, 2010
