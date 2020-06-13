const _getBoundingClientRect = Element.prototype.getBoundingClientRect;

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: function getBoundingClientRect() {
    if (this.parentNode !== null) {
      return _getBoundingClientRect.apply(this);
    } else {
      return {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
      };
    }
  },
});
