export { ShelfPack as default };


/**
 * Create a new ShelfPack bin allocator.
 *
 * Uses the Shelf Best Height Fit algorithm from
 * http://clb.demon.fi/files/RectangleBinPack.pdf
 *
 * @class  ShelfPack
 * @param  {number}  [w=64]  Initial width of the sprite
 * @param  {number}  [h=64]  Initial width of the sprite
 * @param  {Object}  [options]
 * @param  {boolean} [options.autoResize=false]  If `true`, the sprite will automatically grow
 * @example
 * var sprite = new ShelfPack(64, 64, { autoResize: false });
 */
function ShelfPack(w, h, options) {
    options = options || {};
    this.w = w || 64;
    this.h = h || 64;
    this.autoResize = !!options.autoResize;
    this.shelves = [];
    this.freebins = [];
    this.stats = {};
    this.bins = {};
    this.nextId = 1;
    this.count = function(h) {
        this.stats[h] = (this.stats[h] | 0) + 1;
    };
}


/**
 * Batch pack multiple bins into the sprite.
 *
 * @param   {Array}   bins Array of requested bins - each object should have `width`, `height` (or `w`, `h`) properties
 * @param   {Object}  [options]
 * @param   {boolean} [options.inPlace=false] If `true`, the supplied bin objects will be updated inplace with `x` and `y` properties
 * @returns {Array}   Array of allocated bins - each bin is an object with `id`, `x`, `y`, `w`, `h` properties
 * @example
 * var bins = [
 *     { id: 'a', width: 12, height: 12 },
 *     { id: 'b', width: 12, height: 16 },
 *     { id: 'c', width: 12, height: 24 }
 * ];
 * var results = sprite.pack(bins, { inPlace: false });
 */
ShelfPack.prototype.pack = function(bins, options) {
    bins = [].concat(bins);
    options = options || {};

    var results = [],
        w, h, id, allocation;

    for (var i = 0; i < bins.length; i++) {
        w  = bins[i].w || bins[i].width;
        h  = bins[i].h || bins[i].height;
        id = bins[i].id;

        if (w && h) {
            allocation = this.packOne(w, h, id);
            if (!allocation) {
                continue;
            }
            if (options.inPlace) {
                bins[i].x  = allocation.x;
                bins[i].y  = allocation.y;
                bins[i].id = allocation.id;
            }
            results.push(allocation);
        }
    }

    // Shrink the width/height of the sprite to the bare minimum.
    // Since shelf-pack doubles first width, then height when running out of shelf space
    // this can result in fairly large unused space both in width and height if that happens
    // towards the end of bin packing.
    if (this.shelves.length > 0) {
        var w2 = 0;
        var h2 = 0;

        for (var j = 0; j < this.shelves.length; j++) {
            var shelf = this.shelves[j];
            h2 += shelf.h;
            w2 = Math.max(shelf.w - shelf.free, w2);
        }

        this.resize(w2, h2);
    }

    return results;
};


/**
 * Pack a single bin into the sprite.
 * Bins can be associated with a unique identitifer.  If no identifier is
 * supplied in the `id` parameter, one will be created
 *
 * @param   {number}  w     Width of the bin to allocate
 * @param   {number}  h     Height of the bin to allocate
 * @param   {string}  [id]  Unique identifier for this bin, (if unsupplied, assume it's a new bin and create an id)
 * @returns {Object}  Allocated bin object with `id`, `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * var results = sprite.packOne(12, 16, 'a');
 */
ShelfPack.prototype.packOne = function(w, h, id) {
    var y = 0,
        best, bin, shelf, waste, i;


    bin = this.get(id);
    if (bin) {
        return bin;  // we packed this bin already
    } else {
        switch (typeof id) {
            case 'string': break;
            case 'number': id = id.toString(); break;
            default: id = (this.nextId++).toString();
        }
    }

    // first try to reuse a free bin..
    best = { index: -1, waste: Infinity };
    for (i = 0; i < this.freebins.length; i++) {
        bin = this.freebins[i];

        // exactly the right height and width, pack it..
        if (h === bin.h && w === bin.w) {
            bin.id = id;
            this.bins[id] = bin;
            return bin;
        }
        // not enough height or width, skip it..
        if (h > bin.h || w > bin.w) {
            continue;
        }
        // maybe enough height or width, minimize waste..
        if (h <= bin.h && w <= bin.w) {
            waste = (bin.h - h) * (bin.w - w);
            if (waste < best.waste) {
                best.waste = waste;
                best.index = i;
            }
        }
    }

    if (best.index !== -1) {
        bin = this.freebins[best.index];
        bin.id = id;
        bin.w = w;
        bin.h = h;
        this.bins[id] = bin;
        return bin;
    }


    // find the best shelf..
    best = { index: -1, waste: Infinity };
    for (i = 0; i < this.shelves.length; i++) {
        shelf = this.shelves[i];
        y += shelf.h;

        // exactly the right height with width to spare, pack it..
        if (h === shelf.h && w <= shelf.free) {
            this.count(h);
            bin = shelf.alloc(w, h, id);
            this.bins[id] = bin;
            return bin;
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
                best.index = i;
            }
        }
    }

    if (best.index !== -1) {
        shelf = this.shelves[best.index];
        this.count(h);
        bin = shelf.alloc(w, h, id);
        this.bins[id] = bin;
        return bin;
    }

    // add shelf..
    if (h <= (this.h - y) && w <= this.w) {
        shelf = new Shelf(y, this.w, h);
        this.shelves.push(shelf);
        this.count(h);
        bin = shelf.alloc(w, h, id);
        this.bins[id] = bin;
        return bin;
    }

    // no more space..
    // If `autoResize` option is set, grow the sprite as follows:
    //  * double whichever sprite dimension is smaller (`w1` or `h1`)
    //  * if sprite dimensions are equal, grow width before height
    //  * accomodate very large bin requests (big `w` or `h`)
    if (this.autoResize) {
        var h1, h2, w1, w2;

        h1 = h2 = this.h;
        w1 = w2 = this.w;

        if (w1 <= h1 || w > w1) {   // grow width..
            w2 = Math.max(w, w1) * 2;
        }
        if (h1 < w1 || h > h1) {    // grow height..
            h2 = Math.max(h, h1) * 2;
        }

        this.resize(w2, h2);
        return this.packOne(w, h, id);  // retry
    }

    return null;
};


/**
 * Return a packed bin given its id, or null if it has not been packed
 *
 * @param   {string}  id
 * @example
 * sprite.get('a');
 */
ShelfPack.prototype.get = function(id) {
    switch (typeof id) {
        case 'string': break;
        case 'number': id = id.toString(); break;
        default: return null;
    }

    return this.bins.hasOwnProperty(id) ? this.bins[id] : null;
};

/**
 */
ShelfPack.prototype.ref = function(id) {
    var bin = this.get(id);
    if (bin) {
        return bin.ref();
    } else {
        return null;
    }
};

/**
 */
ShelfPack.prototype.unref = function(id) {
    var bin = this.get(id);
    if (bin) {
        var refcount = bin.unref();
        if (refcount === 0) {
            delete this.bins[id];
            this.freebins.push(bin);
        }
        return refcount;
    } else {
        return null;
    }
};


/**
 * Clear the sprite.
 *
 * @example
 * sprite.clear();
 */
ShelfPack.prototype.clear = function() {
    this.shelves = [];
    this.freebins = [];
    this.stats = {};
    this.bins = {};
};


/**
 * Resize the sprite.
 *
 * @param   {number}  w  Requested new sprite width
 * @param   {number}  h  Requested new sprite height
 * @returns {boolean} `true` if resize succeeded, `false` if failed
 * @example
 * sprite.resize(256, 256);
 */
ShelfPack.prototype.resize = function(w, h) {
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
 * @param  {number}  y   Top coordinate of the new shelf
 * @param  {number}  w   Width of the new shelf
 * @param  {number}  h   Height of the new shelf
 * @example
 * var shelf = new Shelf(64, 512, 24);
 */
function Shelf(y, w, h) {
    this.x = 0;
    this.y = y;
    this.w = this.free = w;
    this.h = h;
}


/**
 * Allocate a single bin into the shelf.
 *
 * @private
 * @param   {number}  w   Width of the bin to allocate
 * @param   {number}  h   Height of the bin to allocate
 * @param   {number}  id  Unique id of the bin to allocate
 * @returns {Object}  Allocated bin object with `id`, `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * shelf.alloc(12, 16);
 */
Shelf.prototype.alloc = function(w, h, id) {
    if (w > this.free || h > this.h) {
        return null;
    }
    var x = this.x;
    this.x += w;
    this.free -= w;
    return new Bin(id, x, this.y, w, h);
};


/**
 * Resize the shelf.
 *
 * @private
 * @param   {number}  w  Requested new width of the shelf
 * @returns {boolean} true if resize succeeded, false if failed
 * @example
 * shelf.resize(512);
 */
Shelf.prototype.resize = function(w) {
    this.free += (w - this.w);
    this.w = w;
    return true;
};


/**
 * Create a new Bin.
 *
 * @private
 * @class  Bin
 * @param  {string}  id  Unique id of the bin
 * @param  {number}  x   x position of the bin
 * @param  {number}  y   y position of the bin
 * @param  {number}  w   Width of the bin
 * @param  {number}  h   Height of the bin
 * @example
 * var bin = new Bin('a', 0, 0, 12, 16);
 */
function Bin(id, x, y, w, h) {
    this.id = id;
    this.x  = x;
    this.y  = y;
    this.w  = w;
    this.h  = h;
    this.refcount = 1;
}

/**
 * Increment the bin's ref count
 */
Bin.prototype.ref = function() {
    return ++this.refcount;
};

/**
 * Decrement the bin's ref count
 */
Bin.prototype.unref = function() {
    return --this.refcount;
};

