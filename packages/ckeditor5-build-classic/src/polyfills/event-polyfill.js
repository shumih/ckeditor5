if (typeof Event !== 'function') {
  window.Event = function(type) {
    var event = document.createEvent('Event');

    event.initEvent(type, true, true);

    return event;
  };
}
