import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

export default class IEClipboardObserver extends DomEventObserver {
  constructor(view) {
    super(view);

    this.document.pasteInProcess = false;
    this.useCapture = true;
    this.domEventType = ['paste', 'copy', 'cut', 'drop', 'dragover'];
    this.clipboardInterceptorEL = createEditableClipboardInputIfNotExist();

    this.dataTransfer = {
      types: ['text/plain', 'text/html'],
      getFiles: () => [],
      getData: type => {
        if (!type.includes('html')) {
          return this.clipboardInterceptorEL.innerText;
        }

        return this.clipboardInterceptorEL.innerHTML;
      },
      setData(type, data) {
        window.clipboardData.setData('Text', data);
      },
    };
  }

  onDomEvent(domEvent) {
    const viewDocument = this.document;
    const targetRanges = domEvent.dropRange
      ? [domEvent.dropRange]
      : Array.from(viewDocument.selection.getRanges());
    const eventInfo = new EventInfo(viewDocument, 'clipboardInput');

    while (this.clipboardInterceptorEL.firstChild) {
      this.clipboardInterceptorEL.removeChild(this.clipboardInterceptorEL.firstChild);
    }

    if (domEvent.type === 'paste') {
      this.document.pasteInProcess = true;

      this.clipboardInterceptorEL.focus({ preventScroll: true });

      const intervalThreshold = 2500;
      let time = 0;
      this.waitToPasteInterval = setInterval(() => {
        time += 100;
        if (time > intervalThreshold) {
          this.clearClipboardInterval();
        }

        if (this.clipboardInterceptorEL.firstChild) {
          this.clearClipboardInterval();

          viewDocument.fire(eventInfo, {
            dataTransfer: this.dataTransfer,
            targetRanges,
          });
        }
      }, 100);

      return;
    }

    this.fire(domEvent.type, domEvent, {
      dataTransfer: this.dataTransfer,
      targetRanges,
    });
  }

  clearClipboardInterval() {
    this.document.pasteInProcess = false;
    clearInterval(this.waitToPasteInterval);
  }
}

function getDropViewRange(view, domEvent) {
  const domDoc = domEvent.target.ownerDocument;
  const x = domEvent.clientX;
  const y = domEvent.clientY;
  let domRange;

  // Webkit & Blink.
  if (domDoc.caretRangeFromPoint && domDoc.caretRangeFromPoint(x, y)) {
    domRange = domDoc.caretRangeFromPoint(x, y);
  }
  // FF.
  else if (domEvent.rangeParent) {
    domRange = domDoc.createRange();
    domRange.setStart(domEvent.rangeParent, domEvent.rangeOffset);
    domRange.collapse(true);
  }

  if (domRange) {
    return view.domConverter.domRangeToView(domRange);
  } else {
    return view.document.selection.getFirstRange();
  }
}

function createEditableClipboardInputIfNotExist() {
  const id = 'ckeditorClipboardInput';
  let el = window.document.getElementById(id);

  if (el) {
    return el;
  }

  el = window.document.createElement('div');
  el.setAttribute('contenteditable', 'true');
  el.setAttribute('id', id);
  el.setAttribute('class', 'hidden');
  window.document.body.appendChild(el);

  return el;
}
