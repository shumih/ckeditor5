if (window.Selection && typeof Selection.prototype.extend !== 'function') {
  Selection.prototype.extend = function(el, offset) {
    const range = document.createRange();

    const anchor = document.createRange();
    anchor.setStart(this.anchorNode, this.anchorOffset);

    const focus = document.createRange();
    focus.setStart(el, offset);

    const v = focus.compareBoundaryPoints(Range.START_TO_START, anchor);
    if (v >= 0) {
      // focus is after anchor
      range.setStart(this.anchorNode, this.anchorOffset);
      range.setEnd(el, offset);
    } else {
      // anchor is after focus
      range.setStart(el, offset);
      range.setEnd(this.anchorNode, this.anchorOffset);
    }

    this.removeAllRanges();
    this.addRange(range);
  };
}
