'use strict';

var test = require('tap').test;
var ShelfPack = require('../.');

test('ShelfPack', function(t) {
    t.test('packs same height bins on existing shelf', function(t) {
        var bp = new ShelfPack({ w: 64, h: 64 });
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 0, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'first 10x10 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 10, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'second 10x10 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 20, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'third 10x10 bin');
        t.end();
    });

    t.test('packs larger bins on new shelf', function(t) {
        var bp = new ShelfPack({ w: 64, h: 64 });
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 0, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'shelf 1, 10x10 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 15 }), { x: 0, y: 10, w: 10, h: 15, width: 10, height: 15 }, 'shelf 2, 10x15 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 20 }), { x: 0, y: 25, w: 10, h: 20, width: 10, height: 20 }, 'shelf 3, 10x20 bin');
        t.end();
    });

    t.test('packs shorter bins on existing shelf, minimizing waste', function(t) {
        var bp = new ShelfPack({ w: 64, h: 64 });
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 0, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'shelf 1, 10x10 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 15 }), { x: 0, y: 10, w: 10, h: 15, width: 10, height: 15 }, 'shelf 2, 10x15 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 20 }), { x: 0, y: 25, w: 10, h: 20, width: 10, height: 20 }, 'shelf 3, 10x20 bin');
        t.deepEqual(bp.allocate({ w: 10, h: 9 }),  { x: 10, y: 0, w: 10, h: 9, width: 10, height: 9 }, 'shelf 1, 10x9 bin');
        t.end();
    });

    t.test('not enough room', function(t) {
        var bp = new ShelfPack({ w: 10, h: 10 });
        t.deepEqual(bp.allocate({ w: 10, h: 10 }), { x: 0, y: 0, w: 10, h: 10, width: 10, height: 10 }, 'first 10x10 bin');
        t.notOk(bp.allocate({ w: 10, h: 10 }), 'not enough room');
        t.end();
    });

    t.test('resize larger succeeds', function(t) {
        var bp = new ShelfPack({ w: 10, h: 10 });
        t.ok(bp.resize({ w: 10, h: 20 }));
        t.ok(bp.resize({ w: 20, h: 20 }));
        t.end();
    });

    t.test('resize smaller fails', function(t) {
        var bp = new ShelfPack({ w: 10, h: 10 });
        t.notOk(bp.resize({ w: 10, h: 9 }));
        t.notOk(bp.resize({ w: 9, h: 10 }));
        t.end();
    });

    t.end();
});
