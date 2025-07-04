// Polyfills para compatibilidad con navegadores antiguos

// Polyfill para Object.entries
if (!Object.entries) {
  Object.entries = function(obj: any) {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
  };
}

// Polyfill para Object.fromEntries
if (!Object.fromEntries) {
  Object.fromEntries = function(entries: any) {
    if (!entries || !entries[Symbol.iterator]) {
      throw new Error('Object.fromEntries() requires a single iterable argument');
    }
    const obj: any = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}

// Polyfill para Array.prototype.includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }
    const O = Object(this);
    const len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    const n = fromIndex || 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (searchElement === O[k] || 
          (searchElement !== searchElement && O[k] !== O[k])) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// Polyfill para String.prototype.includes
if (!String.prototype.includes) {
  String.prototype.includes = function(search: string, start?: number) {
    if (typeof start !== 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill básico para Promise.allSettled
if (!Promise.allSettled) {
  Promise.allSettled = function(promises: Promise<any>[]) {
    return Promise.all(
      promises.map(p => Promise.resolve(p).then(
        value => ({ status: 'fulfilled', value }),
        reason => ({ status: 'rejected', reason })
      ))
    );
  };
}

// Export para asegurar que se ejecute
export {};