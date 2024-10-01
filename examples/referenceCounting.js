var ShelfPack = require('@mapbox/shelf-pack');

// Initialize the sprite with a width and height..
var sprite = new ShelfPack(64, 64);

// Allocated bins are automatically reference counted.
// They start out having a refcount of 1.
[100, 101, 102].forEach(function(id) {
    var bin = sprite.packOne(16, 16, id);
    console.log(bin);
});

/* output:
Bin { id: 100, x: 0, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 1 }
Bin { id: 101, x: 16, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 1 }
Bin { id: 102, x: 32, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 1 }
*/

// If you try to pack the same id again, shelf-pack will not re-pack it.
// Instead, it will increment the reference count automatically..
var bin102 = sprite.packOne(16, 16, 102);
console.log(bin102);

/* output:
Bin { id: 102, x: 32, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 2 }
*/

// You can also manually increment the reference count..
var bin101 = sprite.getBin(101);
sprite.ref(bin101);
console.log(bin101);

/* output:
Bin { id: 101, x: 16, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 2 }
*/

// ...and decrement it!
var bin100 = sprite.getBin(100);
sprite.unref(bin100);
console.log(bin100);

/* output:
Bin { id: 100, x: 0, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 0 }
*/

// Bins with a refcount of 0 are considered free space.
// Next time a bin is packed, shelf-back tries to reuse free space first.
// See how Bin 103 gets allocated at [0,0] - Bin 100's old spot!
var bin103 = sprite.packOne(16, 15, 103);
console.log(bin103);

/* output:
Bin { id: 103, x: 0, y: 0, w: 16, h: 15, maxw: 16, maxh: 16, refcount: 1 }
*/

// Bin 103 may be smaller (16x15) but it knows 16x16 was its original size.
// If that space becomes free again, a 16x16 bin will still fit there.
sprite.unref(bin103)
var bin104 = sprite.packOne(16, 16, 104);
console.log(bin104);

/* output:
Bin { id: 104, x: 0, y: 0, w: 16, h: 16, maxw: 16, maxh: 16, refcount: 1 }
*/