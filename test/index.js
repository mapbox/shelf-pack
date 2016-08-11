'use strict';

var test = require('tap').test;
var ShelfPack = require('../.');

test('ShelfPack', function(t) {

    t.test('batch pack()', function(t) {
        t.test('batch pack() allocates same height bins on existing shelf', function(t) {
            var sprite = new ShelfPack(64, 64),
                bins = [
                    { id: 'a', width: 10, height: 10 },
                    { id: 'b', width: 10, height: 10 },
                    { id: 'c', width: 10, height: 10 }
                ],
                expectedResults = [
                    { id: 'a', x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'c', x: 20, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
                ];

            var results = sprite.pack(bins);
            t.deepEqual(results, expectedResults);
            t.end();
        });

        t.test('batch pack() allocates larger bins on new shelf', function(t) {
            var sprite = new ShelfPack(64, 64),
                bins = [
                    { id: 'a', width: 10, height: 10 },
                    { id: 'b', width: 10, height: 15 },
                    { id: 'c', width: 10, height: 20 }
                ],
                expectedResults = [
                    { id: 'a', x: 0, y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 0, y: 10, w: 10, h: 15, maxw: 10, maxh: 15, refcount: 1 },
                    { id: 'c', x: 0, y: 25, w: 10, h: 20, maxw: 10, maxh: 20, refcount: 1 }
                ];

            var results = sprite.pack(bins);
            t.deepEqual(results, expectedResults);
            t.end();
        });

        t.test('batch pack() allocates shorter bins on existing shelf, minimizing waste', function(t) {
            var sprite = new ShelfPack(64, 64),
                bins = [
                    { id: 'a', width: 10, height: 10 },
                    { id: 'b', width: 10, height: 15 },
                    { id: 'c', width: 10, height: 20 },
                    { id: 'd', width: 10, height: 9  }
                ],
                expectedResults = [
                    { id: 'a', x: 0,  y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 0,  y: 10, w: 10, h: 15, maxw: 10, maxh: 15, refcount: 1 },
                    { id: 'c', x: 0,  y: 25, w: 10, h: 20, maxw: 10, maxh: 20, refcount: 1 },
                    { id: 'd', x: 10, y: 0,  w: 10, h: 9,  maxw: 10, maxh: 9,  refcount: 1 }
                ];

            var results = sprite.pack(bins);
            t.deepEqual(results, expectedResults);
            t.end();
        });

        t.test('batch pack() accepts `w`, `h` for `width`, `height`', function(t) {
            var sprite = new ShelfPack(64, 64),
                bins = [
                    { id: 'a', w: 10, h: 10 },
                    { id: 'b', w: 10, h: 10 },
                    { id: 'c', w: 10, h: 10 }
                ],
                expectedResults = [
                    { id: 'a', x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'c', x: 20, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
                ];

            var results = sprite.pack(bins);
            t.deepEqual(results, expectedResults);
            t.end();
        });

        t.test('batch pack() adds `x`, `y` properties to bins with `inPlace` option', function(t) {
            var sprite = new ShelfPack(64, 64),
                bins = [
                    { id: 'a', w: 10, h: 10 },
                    { id: 'b', w: 10, h: 10 },
                    { id: 'c', w: 10, h: 10 }
                ],
                expectedResults = [
                    { id: 'a', x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'c', x: 20, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
                ],
                expectedBins = [
                    { id: 'a', w: 10, h: 10, x: 0,  y: 0 },
                    { id: 'b', w: 10, h: 10, x: 10, y: 0 },
                    { id: 'c', w: 10, h: 10, x: 20, y: 0 }
                ];

            var results = sprite.pack(bins, { inPlace: true });
            t.deepEqual(results, expectedResults);
            t.deepEqual(bins, expectedBins);
            t.end();
        });

        t.test('batch pack() skips bins if not enough room', function(t) {
            var sprite = new ShelfPack(20, 20),
                bins = [
                    { id: 'a', w: 10, h: 10 },
                    { id: 'b', w: 10, h: 10 },
                    { id: 'c', w: 10, h: 30 },  // should skip
                    { id: 'd', w: 10, h: 10 }
                ],
                expectedResults = [
                    { id: 'a', x: 0,  y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'b', x: 10, y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 },
                    { id: 'd', x: 0,  y: 10, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }
                ],
                expectedBins = [
                    { id: 'a', w: 10, h: 10, x: 0,  y: 0 },
                    { id: 'b', w: 10, h: 10, x: 10, y: 0 },
                    { id: 'c', w: 10, h: 30 },
                    { id: 'd', w: 10, h: 10, x: 0, y: 10 }
                ];

            var results = sprite.pack(bins, { inPlace: true });
            t.deepEqual(results, expectedResults);
            t.deepEqual(bins, expectedBins);
            t.end();
        });

        t.test('batch pack() results in minimal sprite width and height', function(t) {
            var bins = [
                { id: 'a', width: 10, height: 10 },
                { id: 'b', width: 5,  height: 15 },
                { id: 'c', width: 25, height: 15 },
                { id: 'd', width: 10, height: 20 }
            ];

            var sprite = new ShelfPack(10, 10, { autoResize: true });
            sprite.pack(bins);

            // Since shelf-pack doubles width/height when packing bins one by one
            // (first width, then height) this would result in a 50x60 sprite here.
            // But this can be shrunk to a 30x45 sprite.
            t.same([sprite.w, sprite.h], [30, 45]);

            t.end();
        });

        t.end();
    });


    t.test('packOne()', function(t) {
        t.test('packOne() allocates bins with numeric id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin = sprite.packOne(10, 10, 1000);
            t.deepEqual(bin, { id: 1000, x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'packed bin 1000');
            t.deepEqual(bin, sprite.getBin(1000), 'got bin 1000');
            t.end();
        });

        t.test('packOne() allocates bins with string id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin = sprite.packOne(10, 10, 'foo');
            t.deepEqual(bin, { id: 'foo', x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'packed bin "foo"');
            t.deepEqual(bin, sprite.getBin('foo'), 'got bin "foo"');
            t.end();
        });

        t.test('packOne() generates incremental numeric ids, if id not provided', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin1 = sprite.packOne(10, 10);
            var bin2 = sprite.packOne(10, 10);
            t.deepEqual(bin1.id, 1, 'packed bin 1');
            t.deepEqual(bin2.id, 2, 'packed bin 2');
            t.end();
        });

        t.test('packOne() does not generate an id that collides with an existing id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin1 = sprite.packOne(10, 10, 1);
            var bin2 = sprite.packOne(10, 10);
            t.deepEqual(bin1.id, 1, 'packed bin 1');
            t.deepEqual(bin2.id, 2, 'packed bin 2');
            t.end();
        });

        t.test('packOne() does not reallocate a bin with existing id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin1 = sprite.packOne(10, 10, 1000);
            t.deepEqual(bin1, { id: 1000, x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'bin 1000 refcount 1');
            t.deepEqual(bin1, sprite.getBin(1000), 'got bin 1000');

            var bin2 = sprite.packOne(10, 10, 1000);
            t.deepEqual(bin2, { id: 1000, x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 2 }, 'bin 1000 refcount 2');
            t.deepEqual(bin1, bin2, 'bin1 and bin2 are the same bin');
            t.end();
        });

        t.test('packOne() allocates same height bins on existing shelf', function(t) {
            var sprite = new ShelfPack(64, 64);
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.deepEqual(sprite.packOne(10, 10), { id: 2, x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'second 10x10 bin');
            t.deepEqual(sprite.packOne(10, 10), { id: 3, x: 20, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'third 10x10 bin');
            t.end();
        });

        t.test('packOne() allocates larger bins on new shelf', function(t) {
            var sprite = new ShelfPack(64, 64);
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0, y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'shelf 1, 10x10 bin');
            t.deepEqual(sprite.packOne(10, 15), { id: 2, x: 0, y: 10, w: 10, h: 15, maxw: 10, maxh: 15, refcount: 1 }, 'shelf 2, 10x15 bin');
            t.deepEqual(sprite.packOne(10, 20), { id: 3, x: 0, y: 25, w: 10, h: 20, maxw: 10, maxh: 20, refcount: 1 }, 'shelf 3, 10x20 bin');
            t.end();
        });

        t.test('packOne() allocates shorter bins on existing shelf, minimizing waste', function(t) {
            var sprite = new ShelfPack(64, 64);
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0,  y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'shelf 1, 10x10 bin');
            t.deepEqual(sprite.packOne(10, 15), { id: 2, x: 0,  y: 10, w: 10, h: 15, maxw: 10, maxh: 15, refcount: 1 }, 'shelf 2, 10x15 bin');
            t.deepEqual(sprite.packOne(10, 20), { id: 3, x: 0,  y: 25, w: 10, h: 20, maxw: 10, maxh: 20, refcount: 1 }, 'shelf 3, 10x20 bin');
            t.deepEqual(sprite.packOne(10, 9),  { id: 4, x: 10, y: 0,  w: 10, h: 9,  maxw: 10, maxh: 9,  refcount: 1 }, 'shelf 1, 10x9 bin');
            t.end();
        });

        t.test('packOne() returns nothing if not enough room', function(t) {
            var sprite = new ShelfPack(10, 10);
            t.deepEqual(sprite.packOne(10, 10, 1), { id: 1, x: 0, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.notOk(sprite.packOne(10, 10, 2), 'not enough room');
            t.notOk(sprite.shelves[0].alloc(10, 10, 2), 'not enough room on shelf');
            t.end();
        });

        t.test('packOne() allocates in free bin if possible', function(t) {
            var sprite = new ShelfPack(64, 64);
            sprite.packOne(10, 10, 1);
            sprite.packOne(10, 10, 2);
            sprite.packOne(10, 10, 3);

            var bin2 = sprite.getBin(2);
            sprite.unref(bin2);
            t.deepEqual(sprite.freebins.length, 1, 'freebins length 1');
            t.deepEqual(sprite.freebins[0], bin2, 'bin2 moved to freebins');

            t.deepEqual(sprite.packOne(10, 10, 4), { id: 4, x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'reused 10x10 free bin for bin4');
            t.deepEqual(sprite.freebins.length, 0, 'freebins length 0');
            t.end();
        });

        t.test('packOne() allocates new bin in least wasteful free bin', function(t) {
            var sprite = new ShelfPack(64, 64);
            sprite.packOne(10, 10, 1);
            sprite.packOne(10, 15, 2);
            sprite.packOne(10, 20, 3);

            sprite.unref(sprite.getBin(1));
            sprite.unref(sprite.getBin(2));
            sprite.unref(sprite.getBin(3));

            t.deepEqual(sprite.freebins.length, 3, 'freebins length 3');
            t.deepEqual(sprite.packOne(10, 13, 4), { id: 4, x: 0,  y: 10, w: 10, h: 13, maxw: 10, maxh: 15, refcount: 1 }, 'reused free bin for 10x13 bin4');
            t.deepEqual(sprite.freebins.length, 2, 'freebins length 2');
            t.end();
        });

        t.test('packOne() avoids free bin if all are more wasteful than packing on a shelf', function(t) {
            var sprite = new ShelfPack(64, 64);
            sprite.packOne(10, 10, 1);
            sprite.packOne(10, 15, 2);

            sprite.unref(sprite.getBin(2));

            t.deepEqual(sprite.freebins.length, 1, 'freebins length 1');
            t.deepEqual(sprite.packOne(10, 10, 3), { id: 3, x: 10,  y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'bin3 packs on shelf instead of 10x15 free bin');
            t.deepEqual(sprite.freebins.length, 1, 'freebins still length 1');
            t.end();
        });

        t.test('packOne() considers max bin dimensions when reusing a free bin', function(t) {
            var sprite = new ShelfPack(64, 64);
            sprite.packOne(10, 10, 1);
            sprite.packOne(10, 15, 2);
            sprite.unref(sprite.getBin(2));
            t.deepEqual(sprite.freebins.length, 1, 'freebins length 1');

            t.deepEqual(sprite.packOne(10, 13, 3), { id: 3, x: 0, y: 10, w: 10, h: 13, maxw: 10, maxh: 15, refcount: 1 }, 'reused free bin for 10x13 bin3');
            t.deepEqual(sprite.freebins.length, 0, 'freebins length 0');
            sprite.unref(sprite.getBin(3));
            t.deepEqual(sprite.freebins.length, 1, 'freebins length back to 1');

            t.deepEqual(sprite.packOne(10, 14, 4), { id: 4, x: 0, y: 10, w: 10, h: 14, maxw: 10, maxh: 15, refcount: 1 }, 'reused free bin for 10x14 bin4');
            t.deepEqual(sprite.freebins.length, 0, 'freebins length back to 0');

            t.end();
        });

        t.end();
    });


    t.test('getBin()', function(t) {
        t.test('getBin() returns undefined if Bin not found', function(t) {
            var sprite = new ShelfPack(64, 64);
            t.deepEqual(sprite.getBin(1), undefined, 'undefined bin');
            t.end();
        });

        t.test('getBin() gets a Bin by numeric id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin = sprite.packOne(10, 10, 1);
            t.deepEqual(sprite.getBin(1), bin, 'Bin 1');
            t.end();
        });

        t.test('getBin() gets a Bin by string id', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin = sprite.packOne(10, 10, 'foo');
            t.deepEqual(sprite.getBin('foo'), bin, 'Bin "foo"');
            t.end();
        });

        t.end();
    });


    t.test('ref()', function(t) {
        t.test('ref() increments the Bin refcount and updates stats', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin1 = sprite.packOne(10, 10, 1);
            t.deepEqual(bin1.refcount, 1, 'Bin1 refcount is 1');
            t.deepEqual(sprite.stats, { 10: 1 }, 'one bin of height 10');
            t.deepEqual(sprite.ref(bin1), 2, 'Bin1 refcount is 2');
            t.deepEqual(sprite.stats, { 10: 1 }, 'still one bin of height 10');

            var bin2 = sprite.packOne(10, 10, 2);
            t.deepEqual(bin2.refcount, 1, 'Bin2 refcount is 1');
            t.deepEqual(sprite.stats, { 10: 2 }, 'two bins of height 10');
            t.deepEqual(sprite.ref(bin2), 2, 'Bin2 refcount is 2');
            t.deepEqual(sprite.stats, { 10: 2 }, 'still two bins of height 10');

            var bin3 = sprite.packOne(10, 15, 3);
            t.deepEqual(bin3.refcount, 1, 'Bin3 refcount is 1');
            t.deepEqual(sprite.stats, { 10: 2, 15: 1}, 'two bins of height 10, one bin of height 15');
            t.deepEqual(sprite.ref(bin3), 2, 'Bin3 refcount is 2');
            t.deepEqual(sprite.stats, { 10: 2, 15: 1}, 'still two bins of height 10, one bin of height 15');

            t.end();
        });

        t.end();
    });


    t.test('unref()', function(t) {
        t.test('unref() decrements the Bin refcount and updates stats', function(t) {
            var sprite = new ShelfPack(64, 64);

            // setup..
            var bin1 = sprite.packOne(10, 10, 1);
            sprite.ref(bin1);
            var bin2 = sprite.packOne(10, 10, 2);
            sprite.ref(bin2);
            var bin3 = sprite.packOne(10, 15, 3);
            sprite.ref(bin3);

            t.deepEqual(sprite.unref(bin3), 1, 'Bin3 refcount is 1');
            t.deepEqual(sprite.stats, { 10: 2, 15: 1}, 'two bins of height 10, one bin of height 15');
            t.deepEqual(sprite.freebins.length, 0, 'freebins empty');

            t.deepEqual(sprite.unref(bin3), 0, 'Bin3 refcount is 0');
            t.deepEqual(sprite.stats, { 10: 2, 15: 0}, 'two bins of height 10, no bins of height 15');
            t.deepEqual(sprite.freebins.length, 1, 'freebins length 1');
            t.deepEqual(sprite.freebins[0], bin3, 'bin3 moved to freebins');
            t.deepEqual(sprite.getBin(3), undefined, 'getBin for Bin3 returns undefined');

            t.deepEqual(sprite.unref(bin2), 1, 'Bin2 refcount is 1');
            t.deepEqual(sprite.stats, { 10: 2, 15: 0}, 'still two bins of height 10, no bins of height 15');

            t.deepEqual(sprite.unref(bin2), 0, 'Bin2 refcount is 0');
            t.deepEqual(sprite.stats, { 10: 1, 15: 0}, 'one bin of height 10, no bins of height 15');
            t.deepEqual(sprite.freebins.length, 2, 'freebins length 2');
            t.deepEqual(sprite.freebins[1], bin2, 'bin2 moved to freebins');
            t.deepEqual(sprite.getBin(2), undefined, 'getBin for Bin2 returns undefined');

            t.end();
        });

        t.test('unref() does nothing if refcount is already 0', function(t) {
            var sprite = new ShelfPack(64, 64);
            var bin = sprite.packOne(10, 10, 1);
            t.deepEqual(sprite.unref(bin), 0, 'Bin3 refcount is 0');
            t.deepEqual(sprite.stats, { 10: 0}, 'no bins of height 10');

            t.deepEqual(sprite.unref(bin), 0, 'Bin3 refcount is still 0');
            t.deepEqual(sprite.stats, { 10: 0}, 'still no bins of height 10');

            t.end();
        });

        t.end();
    });


    t.test('clear()', function(t) {
        t.test('clear() succeeds', function(t) {
            var sprite = new ShelfPack(10, 10);
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.notOk(sprite.packOne(10, 10), 'not enough room');

            sprite.clear();
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.end();
        });

        t.end();
    });


    t.test('resize()', function(t) {
        t.test('resize larger succeeds', function(t) {
            var sprite = new ShelfPack(10, 10);
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.ok(sprite.resize(20, 10));
            t.deepEqual(sprite.packOne(10, 10), { id: 2, x: 10, y: 0, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'second 10x10 bin');
            t.ok(sprite.resize(20, 20));
            t.deepEqual(sprite.packOne(10, 10), { id: 3, x: 0, y: 10, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'third 10x10 bin');
            t.end();
        });

        t.test('autoResize grows sprite dimensions by width then height', function(t) {
            var sprite = new ShelfPack(10, 10, { autoResize: true });
            t.deepEqual(sprite.packOne(10, 10), { id: 1, x: 0,  y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'first 10x10 bin');
            t.same([sprite.w, sprite.h], [10, 10]);
            t.deepEqual(sprite.packOne(10, 10), { id: 2, x: 10, y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'second 10x10 bin');
            t.same([sprite.w, sprite.h], [20, 10]);
            t.deepEqual(sprite.packOne(10, 10), { id: 3, x: 0,  y: 10, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'third 10x10 bin');
            t.same([sprite.w, sprite.h], [20, 20]);
            t.deepEqual(sprite.packOne(10, 10), { id: 4, x: 10, y: 10, w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'fourth 10x10 bin');
            t.same([sprite.w, sprite.h], [20, 20]);
            t.deepEqual(sprite.packOne(10, 10), { id: 5, x: 20, y: 0,  w: 10, h: 10, maxw: 10, maxh: 10, refcount: 1 }, 'fifth 10x10 bin');
            t.same([sprite.w, sprite.h], [40, 20]);
            t.end();
        });

        t.test('autoResize accomodates big bin requests', function(t) {
            var sprite = new ShelfPack(10, 10, { autoResize: true });
            t.deepEqual(sprite.packOne(20, 10), { id: 1, x: 0,  y: 0,  w: 20, h: 10, maxw: 20, maxh: 10, refcount: 1 }, '20x10 bin');
            t.same([sprite.w, sprite.h], [40, 10]);
            t.deepEqual(sprite.packOne(10, 40), { id: 2, x: 0,  y: 10, w: 10, h: 40, maxw: 10, maxh: 40, refcount: 1 }, '40x10 bin');
            t.same([sprite.w, sprite.h], [40, 80]);
            t.end();
        });

        t.end();
    });

    t.end();
});
