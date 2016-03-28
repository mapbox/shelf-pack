'use strict';

module.exports = ShelfPack;


/**
 * Create a new ShelfPack bin allocator.
 *
 * Uses the Shelf Best Height Fit algorithm from
 * http://clb.demon.fi/files/RectangleBinPack.pdf
 *
 * @class  ShelfPack
 * @param  {Object}  options
 * @param  {number}  [options.width=64]        Initial width of the sprite
 * @param  {number}  [options.height=64]       Initial width of the sprite
 * @param  {boolean} [options.autoGrow=false]  If `true`, the sprite will automatically grow
 * @example
 * var sprite = new ShelfPack({ width: 64, height: 64 });
 */
function ShelfPack(options) {
    options = options || {};
    this.w = options.w || options.width || 64;
    this.h = options.h || options.height || 64;
    this.autoResize = !!options.autoResize;
    this.shelves = [];
    this.stats = {};
    this.count = function(h) {
        this.stats[h] = (this.stats[h] | 0) + 1;
    };
}

/**
 * Batch allocate multiple bins into the sprite.
 *
 * @param   {Array}   bins Array of requested bins - each object should have `width` and `height` properties
 * @param   {Object}  options
 * @param   {boolean} [options.inPlace=false] If `true`, the supplied bin objects will be updated inplace with `x` and `y` properties
 * @returns {Array}   Array of allocated bins - each bin is an object with `x`, `y`, `w`, `h` properties
 * @example
 * var bins = [
 *     { id: 'a', width: 12, height: 12 },
 *     { id: 'b', width: 12, height: 16 },
 *     { id: 'c', width: 12, height: 24 }
 * ];
 * var results = sprite.pack(bins, { inPlace: true });
 */
ShelfPack.prototype.pack = function(bins, options) {
    bins = [].concat(bins);
    options = options || {};

    var results = [],
        w, h, allocation;

    for (var i = 0; i < bins.length; i++) {
        w = bins[i].w || bins[i].width;
        h = bins[i].h || bins[i].height;
        if (w && h) {
            allocation = this.allocate({ w: w, h: h });
            if (!allocation) {
                continue;
            }
            if (options.inPlace) {
                bins[i].x = allocation.x;
                bins[i].y = allocation.y;
            }
            results.push(allocation);
        }
    }

    return results;
};

/**
 * Allocate a single bin into the sprite.
 *
 * @param   {Object}  options
 * @param   {number}  options.width   Width of the bin to allocate
 * @param   {number}  options.height  Height of the bin to allocate
 * @returns {Object}  Allocated bin object with `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * var results = sprite.allocate({ width: 12, height: 16 });
 */
ShelfPack.prototype.allocate = function(options) {
    var w = options.w || options.width,
        h = options.h || options.height,
        y = 0,
        best = { shelf: -1, waste: Infinity },
        shelf, waste;

    // find the best shelf
    for (var i = 0; i < this.shelves.length; i++) {
        shelf = this.shelves[i];
        y += shelf.h;

        // exactly the right height with width to spare, pack it..
        if (h === shelf.h && w <= shelf.free) {
            this.count(h);
            return shelf.alloc({ w: w, h: h });
        }
        // not enough height or width, skip it..
        if (h > shelf.h || w > shelf.free) {
            continue;
        }
        // maybe enough height or width, minimize waste..
        if (h < shelf.h && w <= shelf.free) {
            waste = shelf.h - h;
            if (waste < best.waste) {
                best.waste = waste;
                best.shelf = i;
            }
        }
    }

    if (best.shelf !== -1) {
        shelf = this.shelves[best.shelf];
        this.count(h);
        return shelf.alloc({ w: w, h: h });
    }

    // add shelf
    if (h <= (this.h - y) && w <= this.w) {
        shelf = new Shelf({ y: y, w: this.w, h: h });
        this.shelves.push(shelf);
        this.count(h);
        return shelf.alloc({ w: w, h: h });
    }

    // no more space
    return null;
};

/**
 * Resize the sprite.
 * The resize will fail if the requested dimensions are smaller than the current sprite dimensions.
 *
 * @param   {Object}  options
 * @param   {number}  options.width   Requested new sprite width
 * @param   {number}  options.height  Requested new sprite height
 * @returns {boolean} true if resize succeeded, false if failed
 * @example
 * sprite.resize({ width: 512, height: 512 });
 */
ShelfPack.prototype.resize = function(options) {
    var w = options.w || options.width,
        h = options.h || options.height;

    if (w < this.w || h < this.h) {
        return false;
    }

    this.w = w;
    this.h = h;
    for (var i = 0; i < this.shelves.length; i++) {
        this.shelves[i].resize(w);
    }
    return true;
};



/**
 * Create a new Shelf.
 *
 * @private
 * @class  Shelf
 * @param  {Object}  options
 * @param  {number}  options.y       Top coordinate of the new shelf
 * @param  {number}  options.width   Width of the new shelf
 * @param  {number}  options.height  Height of the new shelf
 * @example
 * var shelf = new Shelf({ y: 24, width: 512, height: 24 });
 */
function Shelf(options) {
    var y = options.y,
        w = options.width || options.w,
        h = options.height || options.h;

    this.x = 0;
    this.y = y;
    this.w = this.free = w;
    this.h = h;
}

/**
 * Allocate a single bin into the shelf.
 *
 * @private
 * @param   {Object}  options
 * @param   {number}  options.width   Width of the bin to allocate
 * @param   {number}  options.height  Height of the bin to allocate
 * @returns {Object}  Allocated bin object with `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * shelf.alloc({ width: 12, height: 16 });
 */
Shelf.prototype.alloc = function(options) {
    var w = options.w || options.width,
        h = options.h || options.height;

    if (w > this.free || h > this.h) {
        return null;
    }
    var x = this.x;
    this.x += w;
    this.free -= w;
    return { x: x, y: this.y, w: w, h: h, width: w, height: h };
};

/**
 * Resize the shelf.
 * The resize will fail if the requested width is smaller than the current shelf width.
 *
 * @private
 * @param   {number}  w  Requested new width of the shelf
 * @returns {boolean} true if resize succeeded, false if failed
 * @example
 * shelf.resize(512);
 */
Shelf.prototype.resize = function(w) {
    if (w < this.w) {
        return false;
    }
    this.free += (w - this.w);
    this.w = w;
    return true;
};
