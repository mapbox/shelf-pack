var ShelfPack = require('@mapbox/shelf-pack');

// If you don't want to think about the size of the sprite,
// the `autoResize` option will allow it to grow as needed..
var sprite = new ShelfPack(10, 10, { autoResize: true });

// Bins can be allocated in batches..
// Each requested bin should have `w`, `h` (or `width`, `height`) properties..
var requests = [
    { id: 'a', width: 10, height: 10 },
    { id: 'b', width: 10, height: 12 },
    { id: 'c', w: 10, h: 12 },
    { id: 'd', w: 10, h: 10 }
];

// pack() returns an Array of packed Bin objects..
var results = sprite.pack(requests);

results.forEach(function(bin) {
    console.log(bin);
});

/* output:
Bin { id: 'a', x: 0, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
Bin { id: 'b', x: 0, y: 10, w: 10, h: 12, maxw: 10, maxh: 12, refcount: 1 }
Bin { id: 'c', x: 10, y: 10, w: 10, h: 12, maxw: 10, maxh: 12, refcount: 1 }
Bin { id: 'd', x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
*/

// If you don't mind letting ShelfPack modify your objects,
// the `inPlace` option will decorate your bin objects with `x` and `y` properties.
// Fancy!
var myBins = [
    { id: 'e', width: 12, height: 24 },
    { id: 'f', width: 12, height: 12 },
    { id: 'g', w: 10, h: 10 }
];

sprite.pack(myBins, { inPlace: true });
myBins.forEach(function(bin) {
    console.log(bin);
});

/* output:
{ id: 'e', width: 12, height: 24, x: 0, y: 22 }
{ id: 'f', width: 12, height: 12, x: 20, y: 10 }
{ id: 'g', w: 10, h: 10, x: 20, y: 0 }
*/