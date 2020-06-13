if (typeof MouseEvent !== 'function') {
  window.MouseEvent = function(type, dict) {
    var event = document.createEvent('MouseEvents');
    dict = dict || {};

    event.initMouseEvent(
      type,
      typeof dict.bubbles == 'undefined' ? true : !!dict.bubbles,
      typeof dict.cancelable == 'undefined' ? false : !!dict.cancelable,
      dict.view || window,
      dict.detail | 0,
      dict.screenX | 0,
      dict.screenY | 0,
      dict.clientX | 0,
      dict.clientY | 0,
      !!dict.ctrlKey,
      !!dict.altKey,
      !!dict.shiftKey,
      !!dict.metaKey,
      dict.button | 0,
      dict.relatedTarget || null
    );

    return event;
  };
}
