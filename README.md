[![npm version](https://badge.fury.io/js/shelf-pack.svg)](https://badge.fury.io/js/shelf-pack)
[![Build Status](https://circleci.com/gh/mapbox/shelf-pack.svg?style=svg)](https://circleci.com/gh/mapbox/shelf-pack)

## shelf-pack

A 2D rectangular [bin packing](https://en.wikipedia.org/wiki/Bin_packing_problem)
data structure that uses the Shelf Best Height Fit heuristic.


### What is it

`shelf-pack` is a library for packing little rectangles into a big rectangle.  This sounds simple enough,
but finding an optimal packing is a problem with [NP-Complete](https://en.wikipedia.org/wiki/NP-completeness)
complexity.  One useful application of bin packing is to assemble icons or glyphs into a sprite texture.

There are many ways to approach the bin packing problem, but `shelf-pack` uses the Shelf Best
Height Fit heuristic.  It works by dividing the total space into "shelves", each with a certain height.
The allocator packs rectangles onto whichever shelf minimizes the amount of wasted vertical space.

`shelf-pack` is simple, fast, and works best when the rectangles have similar heights (icons and glyphs
are like this).  It is not a generalized bin packer, and can potentially waste a lot of space if the
rectangles vary significantly in height.


### How fast is it?

Really fast!  `shelf-pack` is several orders of magnitude faster than the more general
[`bin-pack`](https://www.npmjs.com/package/bin-pack) library.

```bash
> npm run bench

ShelfPack allocate fixed bins x 1,923 ops/sec ±1.44% (85 runs sampled)
ShelfPack allocate random width bins x 1,707 ops/sec ±1.39% (84 runs sampled)
ShelfPack allocate random height bins x 1,632 ops/sec ±2.07% (86 runs sampled)
ShelfPack allocate random height and width bins x 1,212 ops/sec ±0.81% (89 runs sampled)
BinPack allocate fixed bins x 2.26 ops/sec ±6.89% (10 runs sampled)
BinPack allocate random width bins x 2.22 ops/sec ±7.21% (10 runs sampled)
BinPack allocate random height bins x 2.21 ops/sec ±7.34% (10 runs sampled)
BinPack allocate random height and width bins x 1.95 ops/sec ±4.81% (9 runs sampled)
```


### Usage

```js
var ShelfPack = require('shelf-pack');

// initialize the space
var sprite = new ShelfPack({w: 64, h: 64});

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
