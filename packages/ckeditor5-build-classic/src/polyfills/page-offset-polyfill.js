['X', 'Y'].forEach(coordinate => {
  Object.defineProperty(Window.prototype, 'scroll' + coordinate, {
    configurable: true,
    enumerable: true,
    get: function getBoundingClientRect() {
      return this['page' + coordinate + 'Offset'];
    },
  });
});
