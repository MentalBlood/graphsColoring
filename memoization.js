'use strict';

function memoize(f) {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache[key] === undefined) cache[key] = f(...args);
    return cache[key];
  };
}