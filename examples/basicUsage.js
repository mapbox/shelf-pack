var ShelfPack = require('@mapbox/shelf-pack');

// Initialize the sprite with a width and height..
var sprite = new ShelfPack(64, 64);

// Pack bins one at a time..
for (var i = 0; i < 5; i++) {
    // packOne() accepts parameters: `width`, `height`, `id`
    // and returns a single allocated Bin object..
    // `id` is optional - if you skip it, shelf-pack will make up a number for you..
    // (Protip: numeric ids are much faster than string ids)

    var bin = sprite.packOne(32, 32);
    console.log(bin || 'out of space');
}

/* output:
Bin { id: 1, x: 0, y: 0, w: 32, h: 32, maxw: 32, maxh: 32, refcount: 1 }
Bin { id: 2, x: 32, y: 0, w: 32, h: 32, maxw: 32, maxh: 32, refcount: 1 }
Bin { id: 3, x: 0, y: 32, w: 32, h: 32, maxw: 32, maxh: 32, refcount: 1 }
Bin { id: 4, x: 32, y: 32, w: 32, h: 32, maxw: 32, maxh: 32, refcount: 1 }
out of space
*/

// Clear sprite and start over..
sprite.clear();

// Or, resize sprite by passing larger dimensions..
sprite.resize(128, 128);   // width, height