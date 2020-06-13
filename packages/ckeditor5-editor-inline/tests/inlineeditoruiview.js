/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InlineEditorUIView from '../src/inlineeditoruiview';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe('InlineEditorUIView', () => {
  let locale, view, editingView, editingViewRoot;

  testUtils.createSinonSandbox();

  beforeEach(() => {
    locale = new Locale('en');
    editingView = new EditingView();
    editingViewRoot = createRoot(editingView.document);
    view = new InlineEditorUIView(locale, editingView);
    view.editable.name = editingViewRoot.rootName;
  });

  describe('constructor()', () => {
    describe('#toolbar', () => {
      it('is created', () => {
        expect(view.toolbar).to.be.instanceof(ToolbarView);
      });

      it('is given a locale object', () => {
        expect(view.toolbar.locale).to.equal(locale);
      });

      it('is not rendered', () => {
        expect(view.toolbar.isRendered).to.be.false;
      });
    });

    describe('#panel', () => {
      it('is created', () => {
        expect(view.panel).to.be.instanceof(BalloonPanelView);
      });

      it('is given a locale object', () => {
        expect(view.panel.locale).to.equal(locale);
      });

      it('gets view.panel#withArrow set', () => {
        expect(view.panel.withArrow).to.be.false;
      });

      it('is not rendered', () => {
        expect(view.panel.isRendered).to.be.false;
      });
    });

    describe('#editable', () => {
      it('is created', () => {
        expect(view.editable).to.be.instanceof(InlineEditableUIView);
      });

      it('is given a locale object', () => {
        expect(view.editable.locale).to.equal(locale);
      });

      it('is not rendered', () => {
        expect(view.editable.isRendered).to.be.false;
      });
    });
  });

  describe('render()', () => {
    beforeEach(() => {
      view.render();
    });

    afterEach(() => {
      view.destroy();
    });

    describe('#toolbar', () => {
      it('is given the right CSS classes', () => {
        expect(view.toolbar.element.classList.contains('ck-toolbar_floating')).to.be.true;
      });

      it('sets the default value of the #viewportTopOffset attribute', () => {
        expect(view.viewportTopOffset).to.equal(0);
      });
    });

    describe('#panel', () => {
      it('is given the right CSS class', () => {
        expect(view.panel.element.classList.contains('ck-toolbar-container')).to.be.true;
      });

      it('is put into the #body collection', () => {
        expect(view.body.get(0)).to.equal(view.panel);
      });
    });

    describe('#editable', () => {
      it('is registered as a child', () => {
        const spy = sinon.spy(view.editable, 'destroy');

        view.destroy();
        sinon.assert.calledOnce(spy);
      });
    });
  });

  describe('init()', () => {
    it('appends #toolbar to panel#content', () => {
      locale = new Locale('en');
      const view = new InlineEditorUIView(locale, editingView);

      view.editable.name = editingViewRoot.rootName;

      expect(view.panel.content).to.have.length(0);

      view.render();
      expect(view.panel.content.get(0)).to.equal(view.toolbar);

      view.destroy();
    });
  });

  describe('panelPositions', () => {
    it('returns the positions in the right order', () => {
      const positions = view.panelPositions;
      const editableRect = {
        top: 100,
        bottom: 200,
        left: 100,
        right: 100,
        width: 100,
        height: 100,
      };
      const panelRect = {
        width: 50,
        height: 50,
      };

      expect(positions).to.have.length(2);
      expect(positions[0](editableRect, panelRect).name).to.equal('toolbar_west');
      expect(positions[1](editableRect, panelRect).name).to.equal('toolbar_east');
    });

    describe('west', () => {
      testTopPositions(0, 100);
    });

    describe('east', () => {
      testTopPositions(1, 150);
    });

    function testTopPositions(positionIndex, expectedLeft) {
      it("positions the panel above editable when there's enough space", () => {
        const position = view.panelPositions[positionIndex];
        const editableRect = {
          top: 101, // !
          bottom: 200,
          left: 100,
          right: 100,
          width: 100,
          height: 100,
        };
        const panelRect = {
          width: 50,
          height: 100, // !
        };

        const { top, left } = position(editableRect, panelRect);

        expect(top).to.equal(1);
        expect(left).to.equal(expectedLeft);
      });

      it("positions the panel over the editable when there's not enough space above (1)", () => {
        const position = view.panelPositions[positionIndex];
        const editableRect = {
          top: 100, // !
          bottom: 300,
          left: 100,
          right: 100,
          width: 100,
          height: 200,
        };
        const panelRect = {
          width: 50,
          height: 100, // !
        };

        const { top, left } = position(editableRect, panelRect);

        expect(top).to.equal(0);
        expect(left).to.equal(expectedLeft);
      });

      it("positions the panel over the editable when there's not enough space above (2)", () => {
        const position = view.panelPositions[positionIndex];
        const editableRect = {
          top: 99, // !
          bottom: 399,
          left: 100,
          right: 100,
          width: 100,
          height: 200,
        };
        const panelRect = {
          width: 50,
          height: 100, // !
        };

        const { top, left } = position(editableRect, panelRect);

        expect(top).to.equal(0);
        expect(left).to.equal(expectedLeft);
      });

      it("positions the panel over the editable when there's not enough space above (3)", () => {
        const position = view.panelPositions[positionIndex];
        const editableRect = {
          top: 51, // !
          bottom: 399,
          left: 100,
          right: 100,
          width: 100,
          height: 200,
        };
        const panelRect = {
          width: 50,
          height: 100, // !
        };

        const { top, left } = position(editableRect, panelRect);

        expect(top).to.equal(0);
        expect(left).to.equal(expectedLeft);
      });

      it("positions the panel below the editable when there's not enough space above/over", () => {
        const position = view.panelPositions[positionIndex];
        const editableRect = {
          top: 50,
          bottom: 150, // !
          left: 100,
          right: 100,
          width: 100,
          height: 100,
        };
        const panelRect = {
          width: 50,
          height: 100, // !
        };

        const { top, left } = position(editableRect, panelRect);

        expect(top).to.equal(150);
        expect(left).to.equal(expectedLeft);
      });

      describe('view#viewportTopOffset', () => {
        it("sticks the panel to the offset when there's not enough space above", () => {
          view.viewportTopOffset = 50;

          const position = view.panelPositions[positionIndex];
          const editableRect = {
            top: 0, // !
            bottom: 200,
            left: 100,
            right: 100,
            width: 100,
            height: 200,
          };
          const panelRect = {
            width: 50,
            height: 50,
          };

          const { top, left } = position(editableRect, panelRect);

          expect(top).to.equal(50);
          expect(left).to.equal(expectedLeft);
        });

        it("positions the panel below the editable when there's not enough space above/over", () => {
          view.viewportTopOffset = 50;

          const position = view.panelPositions[positionIndex];
          const editableRect = {
            top: 100,
            bottom: 150,
            left: 100,
            right: 100,
            width: 100,
            height: 50,
          };
          const panelRect = {
            width: 50,
            height: 80,
          };

          const { top, left } = position(editableRect, panelRect);

          expect(top).to.equal(150);
          expect(left).to.equal(expectedLeft);
        });
      });
    }
  });
});
