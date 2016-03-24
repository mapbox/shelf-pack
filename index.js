'use strict';

module.exports = ShelfPack;

/**
 * Uses the Shelf Best Height Fit algorithm from
 * http://clb.demon.fi/files/RectangleBinPack.pdf
 *
 * @class ShelfPack
 * @param {Object} options
 * @param {number} [options.width=64] Initial width of the sprite
 * @param {number} [options.height=64] Initial width of the sprite
 * @param {boolean} [options.autoGrow=false] If `true`, the sprite will automatically grow
 * @example
 * var sprite = new ShelfPack({width: 64, height: 64});
 */
function ShelfPack(options) {
    options = options || {};
    this.width = options.width || options.w || 64;
    this.height = options.height || options.h || 64;
    this.autoResize = !!options.autoResize;
    this.shelves = [];
    this.stats = {};
    this.count = function(h) {
        this.stats[h] = (this.stats[h] | 0) + 1;
    };
}

/**
 * Batch bin allocator
 *
 * @param {Array} bins Array of requested bins - each object should have `width` and `height` properties
 * @param {Object} options
 * @param {boolean} [options.inPlace=false] If `true`, the supplied bin objects will be updated inplace with `x` and `y` properties
 * @returns {Array} Array of allocated bins - each bin is an object with `x`, `y`, `w`, `h` properties
 */
ShelfPack.prototype.pack = function(bins, options) {
    bins = [].concat(bins);
    options = options || {};

    var results = [],
        w, h, allocation;

    for (var i = 0; i < bins.length; i++) {
        w = bins[i].width || bins[i].w;
        h = bins[i].height || bins[i].h;
        if (w && h) {
            allocation = this.allocate(w, h);
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
 * Single bin allocator
 *
 * @param {number} reqWidth Requested bin width
 * @param {number} reqHeight Requested bin height
 * @returns {Object} Allocated bin object with `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 */
ShelfPack.prototype.allocate = function(reqWidth, reqHeight) {
    var y = 0,
        best = { shelf: -1, waste: Infinity },
        shelf, waste;

    // find shelf
    for (var i = 0; i < this.shelves.length; i++) {
        shelf = this.shelves[i];
        y += shelf.height;

        // exactly the right height with width to spare, pack it..
        if (reqHeight === shelf.height && reqWidth <= shelf.free) {
            this.count(reqHeight);
            return shelf.alloc(reqWidth, reqHeight);
        }
        // not enough height or width, skip it..
        if (reqHeight > shelf.height || reqWidth > shelf.free) {
            continue;
        }
        // maybe enough height or width, minimize waste..
        if (reqHeight < shelf.height && reqWidth <= shelf.free) {
            waste = shelf.height - reqHeight;
            if (waste < best.waste) {
                best.waste = waste;
                best.shelf = i;
            }
        }
    }

    if (best.shelf !== -1) {
        shelf = this.shelves[best.shelf];
        this.count(reqHeight);
        return shelf.alloc(reqWidth, reqHeight);
    }

    // add shelf
    if (reqHeight <= (this.height - y) && reqWidth <= this.width) {
        shelf = new Shelf(y, this.width, reqHeight);
        this.shelves.push(shelf);
        this.count(reqHeight);
        return shelf.alloc(reqWidth, reqHeight);
    }

    // no more space
    return null;
};


/**
 * Resizes the sprite
 * The resize will fail if the requested dimensions are smaller than the current sprite dimensions
 *
 * @param {number} reqWidth Requested sprite width
 * @param {number} reqHeight Requested sprite height
 * @returns {boolean} true if resize succeeded, false if failed
 */
ShelfPack.prototype.resize = function(reqWidth, reqHeight) {
    if (reqWidth < this.width || reqHeight < this.height) {
        return false;
    }
    this.height = reqHeight;
    this.width = reqWidth;
    for (var i = 0; i < this.shelves.length; i++) {
        this.shelves[i].resize(reqWidth);
    }
    return true;
};


function Shelf(y, width, height) {
    this.y = y;
    this.x = 0;
    this.width = this.free = width;
    this.height = height;
}

Shelf.prototype = {
    alloc: function(reqWidth, reqHeight) {
        if (reqWidth > this.free || reqHeight > this.height) {
            return null;
        }
        var x = this.x;
        this.x += reqWidth;
        this.free -= reqWidth;
        return { x: x, y: this.y, w: reqWidth, h: reqHeight, width: reqWidth, height: reqHeight };
    },

    resize: function(reqWidth) {
        if (reqWidth < this.width) {
            return false;
        }
        this.free += (reqWidth - this.width);
        this.width = reqWidth;
        return true;
    }
};

