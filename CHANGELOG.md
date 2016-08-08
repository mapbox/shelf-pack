:warning: = Breaking change

## 2.0.0
##### 2016-Aug-08
* Avoid id collisions by updating `maxId` if a numeric `id` is supplied (closes #28)
* Skip free bins if they are more wasteful than free shelves (closes #25)
* Prefer numeric Bin ids over strings (3x perf boost)
* :warning: Remove convenience `width`, `height` properties from Bin object, use only `w`, `h`
* Reference counting (see #20 or README)
  * Each bin now gets a unique id.  An id can be passed as optional param to the
    `packOne()` function, otherwise a numeric id will be generated.
  * Bins are automatically reference counted (i.e. a newly packed Bin will have a `refcount` of 1).
  * Functions `ref(bin)` and `unref(bin)` track which bins are being used.
  * When a Bin's `refcount` decrements to 0, the Bin will be marked as free,
    and its space may be reused by the packing code.

## 1.1.0
##### 2016-Jul-15
* Release as ES6 module alongside UMD build, add `jsnext:main` to `package.json`

## 1.0.0
##### 2016-Mar-29
* :warning: Rename `allocate()` -> `packOne()` for API consistency
* Add `autoResize` option (closes #7)
* Add `clear()` method
* Generate API docs (closes #9)
* Add `pack()` batch allocator
* Add benchmarks (closes #2)
* :warning: Return `null` instead of `{-1,-1}` on failed allocation (closes #1)
