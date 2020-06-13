/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DeleteObserver from '../src/deleteobserver';
import View from '@ckeditor/ckeditor5-engine/src/view/view';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe('DeleteObserver', () => {
  let view, viewDocument;

  testUtils.createSinonSandbox();

  beforeEach(() => {
    view = new View();
    viewDocument = view.document;
    view.addObserver(DeleteObserver);
  });

  afterEach(() => {
    view.destroy();
  });

  // See ckeditor/ckeditor5-enter#10.
  it('can be initialized', () => {
    expect(() => {
      createViewRoot(viewDocument);
      view.attachDomRoot(document.createElement('div'));
    }).to.not.throw();
  });

  describe('delete event', () => {
    it('is fired on keydown', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      expect(spy.calledOnce).to.be.true;

      const data = spy.args[0][1];
      expect(data).to.have.property('direction', 'forward');
      expect(data).to.have.property('unit', 'character');
      expect(data).to.have.property('sequence', 1);
    });

    it('is fired with a proper direction and unit (on Mac)', () => {
      const spy = sinon.spy();

      testUtils.sinon.stub(env, 'isMac').value(true);

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('backspace'),
          altKey: true,
        })
      );

      expect(spy.calledOnce).to.be.true;

      const data = spy.args[0][1];
      expect(data).to.have.property('direction', 'backward');
      expect(data).to.have.property('unit', 'word');
      expect(data).to.have.property('sequence', 1);
    });

    it('is fired with a proper direction and unit (on non-Mac)', () => {
      const spy = sinon.spy();

      testUtils.sinon.stub(env, 'isMac').value(false);

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('backspace'),
          ctrlKey: true,
        })
      );

      expect(spy.calledOnce).to.be.true;

      const data = spy.args[0][1];
      expect(data).to.have.property('direction', 'backward');
      expect(data).to.have.property('unit', 'word');
      expect(data).to.have.property('sequence', 1);
    });

    it('is not fired on keydown when keyCode does not match backspace or delete', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: 1,
        })
      );

      expect(spy.calledOnce).to.be.false;
    });

    it('is fired with a proper sequence number', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      // Simulate that a user keeps the "Delete" key.
      for (let i = 0; i < 5; ++i) {
        viewDocument.fire(
          'keydown',
          new DomEventData(viewDocument, getDomEvent(), {
            keyCode: getCode('delete'),
          })
        );
      }

      expect(spy.callCount).to.equal(5);

      expect(spy.args[0][1]).to.have.property('sequence', 1);
      expect(spy.args[1][1]).to.have.property('sequence', 2);
      expect(spy.args[2][1]).to.have.property('sequence', 3);
      expect(spy.args[3][1]).to.have.property('sequence', 4);
      expect(spy.args[4][1]).to.have.property('sequence', 5);
    });

    it('clears the sequence when the key was released', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      // Simulate that a user keeps the "Delete" key.
      for (let i = 0; i < 3; ++i) {
        viewDocument.fire(
          'keydown',
          new DomEventData(viewDocument, getDomEvent(), {
            keyCode: getCode('delete'),
          })
        );
      }

      // Then the user has released the key.
      viewDocument.fire(
        'keyup',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      // And pressed it once again.
      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      expect(spy.callCount).to.equal(4);

      expect(spy.args[0][1]).to.have.property('sequence', 1);
      expect(spy.args[1][1]).to.have.property('sequence', 2);
      expect(spy.args[2][1]).to.have.property('sequence', 3);
      expect(spy.args[3][1]).to.have.property('sequence', 1);
    });

    it('works fine with Backspace key', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('backspace'),
        })
      );

      viewDocument.fire(
        'keyup',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('backspace'),
        })
      );

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('backspace'),
        })
      );

      expect(spy.callCount).to.equal(2);

      expect(spy.args[0][1]).to.have.property('sequence', 1);
      expect(spy.args[1][1]).to.have.property('sequence', 1);
    });

    it('does not reset the sequence if other than Backspace or Delete key was released', () => {
      const spy = sinon.spy();

      viewDocument.on('delete', spy);

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      viewDocument.fire(
        'keyup',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('A'),
        })
      );

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      expect(spy.args[0][1]).to.have.property('sequence', 1);
      expect(spy.args[1][1]).to.have.property('sequence', 2);
    });

    it('should stop keydown event when delete event is stopped', () => {
      const keydownSpy = sinon.spy();
      viewDocument.on('keydown', keydownSpy);
      viewDocument.on('delete', evt => evt.stop());

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      sinon.assert.notCalled(keydownSpy);
    });

    // https://github.com/ckeditor/ckeditor5-typing/issues/186
    it('should stop keydown event when delete event is stopped (delete event with highest priority)', () => {
      const keydownSpy = sinon.spy();
      viewDocument.on('keydown', keydownSpy);
      viewDocument.on('delete', evt => evt.stop(), { priority: 'highest' });

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('delete'),
        })
      );

      sinon.assert.notCalled(keydownSpy);
    });

    it('should not stop keydown event when delete event is not stopped', () => {
      const keydownSpy = sinon.spy();
      viewDocument.on('keydown', keydownSpy);
      viewDocument.on('delete', evt => evt.stop());

      viewDocument.fire(
        'keydown',
        new DomEventData(viewDocument, getDomEvent(), {
          keyCode: getCode('x'),
        })
      );

      sinon.assert.calledOnce(keydownSpy);
    });
  });

  function getDomEvent() {
    return {
      preventDefault: sinon.spy(),
    };
  }
});
