/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, setTimeout, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import env from '@ckeditor/ckeditor5-utils/src/env';

import MentionUI, { createRegExp } from '../src/mentionui';
import featureDetection from '../src/featuredetection';
import MentionEditing from '../src/mentionediting';
import MentionsView from '../src/ui/mentionsview';

describe('MentionUI', () => {
  let editor, model, doc, editingView, mentionUI, editorElement, mentionsView, panelView;

  const staticConfig = {
    feeds: [
      {
        feed: ['@Barney', '@Lily', '@Marshall', '@Robin', '@Ted'],
        marker: '@',
      },
    ],
  };

  testUtils.createSinonSandbox();

  beforeEach(() => {
    editorElement = document.createElement('div');
    document.body.appendChild(editorElement);
  });

  afterEach(() => {
    sinon.restore();
    editorElement.remove();

    if (editor) {
      return editor.destroy();
    }
  });

  it('should create a plugin instance', () => {
    return createClassicTestEditor().then(() => {
      expect(mentionUI).to.instanceOf(Plugin);
      expect(mentionUI).to.instanceOf(MentionUI);
    });
  });

  it('should load ContextualBalloon plugin', () => {
    return createClassicTestEditor().then(() => {
      expect(editor.plugins.get(ContextualBalloon)).to.be.instanceOf(ContextualBalloon);
    });
  });

  describe('init()', () => {
    it('should throw if marker was not provided for feed', () => {
      return createClassicTestEditor({ feeds: [{ feed: ['a'] }] }).catch(error => {
        expect(error).to.be.instanceOf(CKEditorError);
        expect(error.message).to.match(/mentionconfig-incorrect-marker/);
      });
    });

    it('should throw if marker is empty string', () => {
      return createClassicTestEditor({ feeds: [{ marker: '', feed: ['a'] }] }).catch(error => {
        expect(error).to.be.instanceOf(CKEditorError);
        expect(error.message).to.match(/mentionconfig-incorrect-marker/);
      });
    });

    it('should throw if marker is longer then 1 character', () => {
      return createClassicTestEditor({ feeds: [{ marker: '$$', feed: ['a'] }] }).catch(error => {
        expect(error).to.be.instanceOf(CKEditorError);
        expect(error.message).to.match(/mentionconfig-incorrect-marker/);
      });
    });
  });

  describe('pluginName', () => {
    it('should return plugin by its name', () => {
      return createClassicTestEditor().then(() => {
        expect(editor.plugins.get('MentionUI')).to.equal(mentionUI);
      });
    });
  });

  describe('contextual balloon', () => {
    let balloonAddSpy;

    beforeEach(() => {
      return createClassicTestEditor(staticConfig)
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');
          const contextualBalloon = editor.plugins.get(ContextualBalloon);

          balloonAddSpy = sinon.spy(contextualBalloon, 'add');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce);
    });

    it('should disable arrow', () => {
      sinon.assert.calledOnce(balloonAddSpy);
      sinon.assert.calledWithExactly(balloonAddSpy, sinon.match(data => data.singleViewMode));
      expect(panelView.isVisible).to.be.true;
      expect(panelView.withArrow).to.be.false;
    });

    it('should add MentionView to a panel', () => {
      expect(editor.plugins.get(ContextualBalloon).visibleView).to.be.instanceof(MentionsView);
    });
  });

  describe('position', () => {
    let pinSpy;

    const caretRect = {
      bottom: 118,
      height: 18,
      left: 500,
      right: 501,
      top: 100,
      width: 1,
    };

    const balloonRect = {
      bottom: 150,
      height: 150,
      left: 0,
      right: 200,
      top: 0,
      width: 200,
    };

    beforeEach(() => {
      return createClassicTestEditor(staticConfig).then(() => {
        pinSpy = sinon.spy(panelView, 'pin');
      });
    });

    it('should properly calculate position data', () => {
      const editableElement = editingView.document.selection.editableElement;

      setData(model, '<paragraph>foo []</paragraph>');
      stubSelectionRects([caretRect]);

      expect(editor.model.markers.has('mention')).to.be.false;

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      return waitForDebounce().then(() => {
        const pinArgument = pinSpy.firstCall.args[0];
        const { target, positions, limiter, fitInViewport } = pinArgument;

        expect(positions).to.have.length(4);

        // Mention UI should set limiter to the editable area.
        expect(limiter()).to.equal(editingView.domConverter.mapViewToDom(editableElement));
        expect(fitInViewport).to.be.undefined;

        expect(editor.model.markers.has('mention')).to.be.true;
        const mentionMarker = editor.model.markers.get('mention');
        const focus = doc.selection.focus;
        const expectedRange = editor.model.createRange(focus.getShiftedBy(-1), focus);

        // It should create a model marker for matcher marker character ('@').
        expect(expectedRange.isEqual(mentionMarker.getRange())).to.be.true;

        const toViewRangeSpy = sinon.spy(editor.editing.mapper, 'toViewRange');

        expect(target()).to.deep.equal(caretRect);

        sinon.assert.calledOnce(toViewRangeSpy);
        const range = toViewRangeSpy.firstCall.args[0];

        expect(mentionMarker.getRange().isEqual(range), 'Should position to mention marker.');

        const caretSouthEast = positions[0];
        const caretSouthWest = positions[1];
        const caretNorthEast = positions[2];
        const caretNorthWest = positions[3];

        expect(caretSouthEast(caretRect, balloonRect)).to.deep.equal({
          left: 501,
          name: 'caret_se',
          top: 121,
        });

        expect(caretSouthWest(caretRect, balloonRect)).to.deep.equal({
          left: 301,
          name: 'caret_sw',
          top: 121,
        });

        expect(caretNorthEast(caretRect, balloonRect)).to.deep.equal({
          left: 501,
          name: 'caret_ne',
          top: -53,
        });

        expect(caretNorthWest(caretRect, balloonRect)).to.deep.equal({
          left: 301,
          name: 'caret_nw',
          top: -53,
        });
      });
    });

    it('should re-calculate position on typing and stay on selected position', () => {
      setData(model, '<paragraph>foo []</paragraph>');
      stubSelectionRects([caretRect]);

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      let positionAfterFirstShow;

      return waitForDebounce()
        .then(() => {
          sinon.assert.calledOnce(pinSpy);

          const pinArgument = pinSpy.firstCall.args[0];
          const { positions } = pinArgument;

          expect(positions).to.have.length(4);

          positionAfterFirstShow = mentionsView.position;

          model.change(writer => {
            writer.insertText('t', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          sinon.assert.calledTwice(pinSpy);

          const pinArgument = pinSpy.secondCall.args[0];
          const { positions } = pinArgument;

          expect(positions, 'should reuse first matched position').to.have.length(1);
          expect(positions[0].name).to.equal(positionAfterFirstShow);
        });
    });

    it('does not fail if selection has no #editableElement', () => {
      setData(model, '<paragraph>foo []</paragraph>');
      stubSelectionRects([caretRect]);

      expect(editor.model.markers.has('mention')).to.be.false;

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      return waitForDebounce().then(() => {
        const pinArgument = pinSpy.firstCall.args[0];
        const { limiter } = pinArgument;

        sinon.stub(editingView.document.selection, 'editableElement').value(null);

        // Should not break;
        expect(limiter()).to.be.null;
      });
    });
  });

  describe('typing integration', () => {
    it('should show panel for matched marker after typing minimum characters', () => {
      return createClassicTestEditor({ feeds: [Object.assign({ minimumCharacters: 2 }, staticConfig.feeds[0])] })
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(() => {
          model.change(writer => {
            writer.insertText('B', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        })
        .then(waitForDebounce)
        .then(() => {
          model.change(writer => {
            writer.insertText('a', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(1);

          model.change(writer => {
            writer.insertText('r', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(1);
        });
    });

    describe('static list with large set of results', () => {
      const bigList = {
        marker: '@',
        feed: ['@a01', '@a02', '@a03', '@a04', '@a05', '@a06', '@a07', '@a08', '@a09', '@a10', '@a11', '@a12'],
      };

      beforeEach(() => {
        return createClassicTestEditor({ feeds: [bigList] });
      });

      it('should show panel with no more then 10 items for default static feed', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(mentionsView.items).to.have.length(10);
        });
      });

      it('should scroll mention panel to the selected item', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        const arrowDownEvtData = {
          keyCode: keyCodes.arrowdown,
          preventDefault: sinon.spy(),
          stopPropagation: sinon.spy(),
        };

        const arrowUpEvtData = {
          keyCode: keyCodes.arrowup,
          preventDefault: sinon.spy(),
          stopPropagation: sinon.spy(),
        };

        return waitForDebounce().then(() => {
          // The scroll test highly depends on browser styles.
          // Some CI test environments might not load theme which will result that tests will not render on CI as locally.
          // To make this test repeatable across different environments it enforces mentions view size to 100px...
          const reset = 'padding:0px;margin:0px;border:0 none;line-height: 1em;';

          const mentionElementSpy = testUtils.sinon.spy(mentionsView.element, 'scrollTop', ['set']);
          mentionsView.element.style = `min-height:100px;height:100px;max-height:100px;${reset};`;

          // ...and each list view item size to 25px...
          Array.from(mentionsView.items).forEach(item => {
            const listItemElement = item.children.get(0).element;

            listItemElement.style = `min-height:unset;height:25px;max-height:25px;${reset};min-width:12em;`;
          });

          // ...so after those changes it is safe to assume that:
          // - base offset is 0
          // - only 4 items are visible at once
          // - if scrolled to the last element scrollTop will be set to 150px. The 150px is the offset of the 7th item in the
          //   list as last four (7, 8, 9 & 10) will be visible.
          expect(panelView.isVisible).to.be.true;
          expectChildViewsIsOnState([true, false, false, false, false, false, false, false, false, false]);

          // Edge browser always tries to scroll in tests environment: See ckeditor5-utils#282.
          if (!env.isEdge) {
            sinon.assert.callCount(mentionElementSpy.set, 0);
          }

          fireKeyDownEvent(arrowDownEvtData);

          expectChildViewsIsOnState([false, true, false, false, false, false, false, false, false, false]);
          // Edge browser always tries to scroll in tests environment: See ckeditor5-utils#282.
          if (!env.isEdge) {
            expect(mentionsView.element.scrollTop).to.equal(0);
            sinon.assert.callCount(mentionElementSpy.set, 0);
          }

          fireKeyDownEvent(arrowUpEvtData);

          expectChildViewsIsOnState([true, false, false, false, false, false, false, false, false, false]);
          expect(mentionsView.element.scrollTop).to.equal(0);

          // Edge browser always tries to scroll in tests environment: See ckeditor5-utils#282.
          if (!env.isEdge) {
            sinon.assert.callCount(mentionElementSpy.set, 0);
          }

          fireKeyDownEvent(arrowUpEvtData);

          expectChildViewsIsOnState([false, false, false, false, false, false, false, false, false, true]);

          // We want 150, but sometimes we get e.g. 151.
          expect(mentionsView.element.scrollTop).to.be.within(140, 160, 'last item highlighted');

          // Edge browser always tries to scroll in tests environment: See ckeditor5-utils#282.
          if (!env.isEdge) {
            sinon.assert.callCount(mentionElementSpy.set, 1);
          }

          fireKeyDownEvent(arrowDownEvtData);

          expectChildViewsIsOnState([true, false, false, false, false, false, false, false, false, false]);

          // We want 0, but sometimes we get e.g. 1. (Firefox)
          expect(mentionsView.element.scrollTop).to.be.within(0, 10);

          // Edge browser always tries to scroll in tests environment: See ckeditor5-utils#282.
          if (!env.isEdge) {
            sinon.assert.callCount(mentionElementSpy.set, 2);
          }
        });
      });
    });

    describe('ES2018 RegExp Unicode property escapes fallback', () => {
      let regExpStub;

      // Cache the original value to restore it after the tests.
      const originalPunctuationSupport = featureDetection.isPunctuationGroupSupported;

      before(() => {
        featureDetection.isPunctuationGroupSupported = false;
      });

      beforeEach(() => {
        return createClassicTestEditor(staticConfig).then(editor => {
          regExpStub = sinon.stub(window, 'RegExp');

          return editor;
        });
      });

      after(() => {
        featureDetection.isPunctuationGroupSupported = originalPunctuationSupport;
      });

      it('returns a simplified RegExp for browsers not supporting Unicode punctuation groups', () => {
        featureDetection.isPunctuationGroupSupported = false;
        createRegExp('@', 2);
        sinon.assert.calledOnce(regExpStub);
        sinon.assert.calledWithExactly(regExpStub, '(^|[ \\(\\[{"\'])([@])([_a-zA-Z0-9À-ž]{2,}?)$', 'u');
      });

      it('returns a ES2018 RegExp for browsers supporting Unicode punctuation groups', () => {
        featureDetection.isPunctuationGroupSupported = true;
        createRegExp('@', 2);
        sinon.assert.calledOnce(regExpStub);
        sinon.assert.calledWithExactly(regExpStub, '(^|[ \\p{Ps}\\p{Pi}"\'])([@])([_a-zA-Z0-9À-ž]{2,}?)$', 'u');
      });
    });

    describe('static list with default trigger', () => {
      beforeEach(() => {
        return createClassicTestEditor(staticConfig);
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        expect(editor.model.markers.has('mention')).to.be.false;

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });

      it('should show panel for matched marker at the beginning of paragraph', () => {
        setData(model, '<paragraph>[] foo</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });

      it('should show panel for matched marker after a <softBreak>', () => {
        model.schema.register('softBreak', {
          allowWhere: '$text',
          isInline: true,
        });

        editor.conversion.for('upcast').elementToElement({
          model: 'softBreak',
          view: 'br',
        });

        editor.conversion.for('downcast').elementToElement({
          model: 'softBreak',
          view: (modelElement, viewWriter) => viewWriter.createEmptyElement('br'),
        });

        setData(model, '<paragraph>abc<softBreak></softBreak>[] foo</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });

      // Opening parenthesis type characters that should be supported on all environments.
      for (const character of ['(', "'", '"', '[', '{']) {
        testOpeningPunctuationCharacter(character);
      }

      // Excerpt of opening parenthesis type characters that tests ES2018 Unicode property escapes on supported environment.
      for (const character of [
        // Belongs to Ps (Punctuation, Open) group:
        '〈',
        '„',
        '﹛',
        '｟',
        '｛',
        // Belongs to Pi (Punctuation, Initial quote) group:
        '«',
        '‹',
        '⸌',
        ' ⸂',
        '⸠',
      ]) {
        testOpeningPunctuationCharacter(character, !featureDetection.isPunctuationGroupSupported);
      }

      it('should not show panel for marker in the middle of other word', () => {
        setData(model, '<paragraph>foo[]</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
      });

      it('should not show panel when selection is inside a mention', () => {
        setData(model, '<paragraph>foo [@Lily] bar</paragraph>');
        model.change(writer => {
          writer.setAttribute('mention', { id: '@Lily', _uid: 1234 }, doc.selection.getFirstRange());
        });

        model.change(writer => {
          writer.setSelection(doc.getRoot().getChild(0), 7);
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
      });

      it('should not show panel when selection is at the end of a mention', () => {
        setData(model, '<paragraph>foo [@Lily] bar</paragraph>');
        model.change(writer => {
          writer.setAttribute('mention', { id: '@Lily', _uid: 1234 }, doc.selection.getFirstRange());
        });

        model.change(writer => {
          writer.setSelection(doc.getRoot().getChild(0), 9);
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
      });

      it('should not show panel when selection is not collapsed', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => {
            expect(panelView.isVisible).to.be.true;
            expect(editor.model.markers.has('mention')).to.be.true;

            model.change(() => {
              model.modifySelection(doc.selection, { direction: 'backward', unit: 'character' });
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;
          });
      });

      it('should not show panel when selection is changing (non-collapsed)', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => {
            expect(panelView.isVisible).to.be.true;
            expect(editor.model.markers.has('mention')).to.be.true;

            model.change(() => {
              model.modifySelection(doc.selection, { direction: 'backward', unit: 'character' });
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;
          })
          .then(() => {
            model.change(() => {
              model.modifySelection(doc.selection, { direction: 'backward', unit: 'character' });
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;
          });
      });

      it('should not show panel when selection is after existing mention', () => {
        setData(model, '<paragraph>foo [@Lily] bar[]</paragraph>');
        model.change(writer => {
          writer.setAttribute('mention', { id: '@Lily', _uid: 1234 }, doc.selection.getFirstRange());
        });

        return waitForDebounce()
          .then(() => {
            expect(panelView.isVisible).to.be.false;

            model.change(writer => {
              writer.setSelection(doc.getRoot().getChild(0), 8);
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
          });
      });

      it('should not show panel when selection moves inside existing mention', () => {
        setData(model, '<paragraph>foo [@Lily] bar</paragraph>');

        model.change(writer => {
          writer.setAttribute('mention', { id: '@Lily', _uid: 1234 }, doc.selection.getFirstRange());
        });

        return waitForDebounce()
          .then(() => {
            model.change(writer => {
              writer.setSelection(doc.getRoot().getChild(0), 9);
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;

            model.change(writer => {
              writer.setSelection(doc.getRoot().getChild(0), 8);
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
          });
      });

      it('should show filtered results for matched text', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        model.change(writer => {
          writer.insertText('T', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(1);
        });
      });

      it('should focus the first item in panel', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          const button = mentionsView.items.get(0).children.get(0);

          expect(button.isOn).to.be.true;
        });
      });

      it('should hide panel if no matched items', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => expect(panelView.isVisible).to.be.true)
          .then(() => {
            model.change(writer => {
              writer.insertText('x', doc.selection.getFirstPosition());
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;
            expect(mentionsView.items).to.have.length(0);
          });
      });

      it('should hide panel when text was unmatched', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => expect(panelView.isVisible).to.be.true)
          .then(() => {
            model.change(writer => {
              const end = doc.selection.getFirstPosition();
              const start = end.getShiftedBy(-1);

              writer.remove(writer.createRange(start, end));
            });
          })
          .then(waitForDebounce)
          .then(() => expect(panelView.isVisible).to.be.false);
      });
    });

    describe('asynchronous list with custom trigger', () => {
      beforeEach(() => {
        const issuesNumbers = ['#100', '#101', '#102', '#103'];

        return createClassicTestEditor({
          feeds: [
            {
              marker: '#',
              feed: feedText => {
                return new Promise(resolve => {
                  setTimeout(() => {
                    resolve(issuesNumbers.filter(number => number.includes(feedText)));
                  }, 20);
                });
              },
            },
          ],
        });
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('#', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(4);
        });
      });

      it('should show filtered results for matched text', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('#', doc.selection.getFirstPosition());
        });

        model.change(writer => {
          writer.insertText('2', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(1);
        });
      });

      it('should hide panel if no matched items', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('#', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => expect(panelView.isVisible).to.be.true)
          .then(() => {
            model.change(writer => {
              writer.insertText('x', doc.selection.getFirstPosition());
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;
            expect(mentionsView.items).to.have.length(0);
          });
      });

      it('should hide panel when text was unmatched', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('#', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => expect(panelView.isVisible).to.be.true)
          .then(() => {
            model.change(writer => {
              const end = doc.selection.getFirstPosition();
              const start = end.getShiftedBy(-1);

              writer.remove(writer.createRange(start, end));
            });
          })
          .then(waitForDebounce)
          .then(() => expect(panelView.isVisible).to.be.false);
      });
    });

    function testOpeningPunctuationCharacter(character, skip = false) {
      it(`should show panel for matched marker after a "${character}" character`, function() {
        if (skip) {
          this.skip();
        }

        setData(model, '<paragraph>[] foo</paragraph>');

        model.change(writer => {
          writer.insertText(character, doc.selection.getFirstPosition());
        });

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible, 'panel is visible').to.be.true;
          expect(editor.model.markers.has('mention'), 'marker is inserted').to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });
    }
  });

  describe('panel behavior', () => {
    it('should close the opened panel on esc', () => {
      return createClassicTestEditor(staticConfig)
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;

          fireKeyDownEvent({
            keyCode: keyCodes.esc,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          });

          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
    });

    it('should close the opened panel when click outside the panel', () => {
      return createClassicTestEditor(staticConfig)
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;

          document.body.dispatchEvent(new Event('mousedown', { bubbles: true }));

          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
    });

    it('should hide the panel on selection change', () => {
      return createClassicTestEditor(staticConfig)
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;

          model.change(writer => {
            // Place position at the beginning of a paragraph.
            writer.setSelection(doc.getRoot().getChild(0), 0);
          });

          expect(panelView.isVisible).to.be.false;
          expect(mentionsView.position).to.be.undefined;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
    });

    it('should hide the panel on selection change triggered by mouse click', () => {
      return createClassicTestEditor(staticConfig)
        .then(() => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });
        })
        .then(waitForDebounce)
        .then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;

          // This happens when user clicks outside the panel view and selection is changed.
          // Two panel closing mechanisms are run:
          // - clickOutsideHandler
          // - unmatched text in text watcher
          // which may fail when trying to remove mention marker twice.
          document.body.dispatchEvent(new Event('mousedown', { bubbles: true }));
          model.change(writer => {
            // Place position at the beginning of a paragraph.
            writer.setSelection(doc.getRoot().getChild(0), 0);
          });

          expect(panelView.isVisible).to.be.false;
          expect(mentionsView.position).to.be.undefined;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
    });

    describe('default list item', () => {
      // Create map of expected feed items as objects as they will be stored internally.
      const feedItems = staticConfig.feeds[0].feed.map(text => ({ text: `${text}`, id: `${text}` }));

      beforeEach(() => {
        return createClassicTestEditor(staticConfig);
      });

      describe('on arrows', () => {
        it('should cycle down on arrow down', () => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });

          return waitForDebounce().then(() => {
            expectChildViewsIsOnState([true, false, false, false, false]);

            const keyEvtData = {
              keyCode: keyCodes.arrowdown,
              preventDefault: sinon.spy(),
              stopPropagation: sinon.spy(),
            };

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, true, false, false, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, true, false, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, false, true, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, false, false, true]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([true, false, false, false, false]);
          });
        });

        it('should cycle up on arrow up', () => {
          setData(model, '<paragraph>foo []</paragraph>');

          model.change(writer => {
            writer.insertText('@', doc.selection.getFirstPosition());
          });

          return waitForDebounce().then(() => {
            expectChildViewsIsOnState([true, false, false, false, false]);

            const keyEvtData = {
              keyCode: keyCodes.arrowup,
              preventDefault: sinon.spy(),
              stopPropagation: sinon.spy(),
            };

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, false, false, true]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, false, true, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, false, true, false, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([false, true, false, false, false]);

            fireKeyDownEvent(keyEvtData);
            expectChildViewsIsOnState([true, false, false, false, false]);
          });
        });

        it('should not cycle with only one item in the list', () => {
          setData(model, '<paragraph>foo []</paragraph>');

          const keyDownEvtData = {
            keyCode: keyCodes.arrowdown,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          };

          const keyUpEvtData = {
            keyCode: keyCodes.arrowdown,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          };

          model.change(writer => {
            writer.insertText('@T', doc.selection.getFirstPosition());
          });

          return waitForDebounce().then(() => {
            expectChildViewsIsOnState([true]);

            fireKeyDownEvent(keyDownEvtData);

            expectChildViewsIsOnState([true]);

            fireKeyDownEvent(keyUpEvtData);

            expectChildViewsIsOnState([true]);
          });
        });
      });

      describe('on "execute" keys', () => {
        testExecuteKey('enter', keyCodes.enter, feedItems);

        testExecuteKey('tab', keyCodes.tab, feedItems);

        testExecuteKey('space', keyCodes.space, feedItems);
      });
    });

    describe('default list item with custom feed', () => {
      const issues = [{ id: '@Ted' }, { id: '@Barney' }, { id: '@Robin' }, { id: '@Lily' }, { id: '@Marshal' }];

      beforeEach(() => {
        return createClassicTestEditor({
          feeds: [
            {
              marker: '@',
              feed: feedText => issues.filter(issue => issue.id.includes(feedText)),
            },
          ],
        });
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });
    });

    describe('custom list item (string)', () => {
      const issues = [
        { id: '@1002', title: 'Some bug in editor.' },
        { id: '@1003', title: 'Introduce this feature.' },
        { id: '@1004', title: 'Missing docs.' },
        { id: '@1005', title: 'Another bug.' },
        { id: '@1006', title: 'More bugs' },
      ];

      beforeEach(() => {
        return createClassicTestEditor({
          feeds: [
            {
              marker: '@',
              feed: issues,
              itemRenderer: item => item.title,
            },
          ],
        });
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });

      describe('keys', () => {
        describe('on arrows', () => {
          it('should cycle down on arrow down', () => {
            setData(model, '<paragraph>foo []</paragraph>');

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });

            return waitForDebounce().then(() => {
              expectChildViewsIsOnState([true, false, false, false, false]);

              const keyEvtData = {
                keyCode: keyCodes.arrowdown,
                preventDefault: sinon.spy(),
                stopPropagation: sinon.spy(),
              };

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, true, false, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, true, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, true, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, false, true]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([true, false, false, false, false]);
            });
          });

          it('should cycle up on arrow up', () => {
            setData(model, '<paragraph>foo []</paragraph>');

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });

            return waitForDebounce().then(() => {
              expectChildViewsIsOnState([true, false, false, false, false]);

              const keyEvtData = {
                keyCode: keyCodes.arrowup,
                preventDefault: sinon.spy(),
                stopPropagation: sinon.spy(),
              };

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, false, true]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, true, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, true, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, true, false, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([true, false, false, false, false]);
            });
          });
        });

        describe('on "execute" keys', () => {
          testExecuteKey('enter', keyCodes.enter, issues);

          testExecuteKey('tab', keyCodes.tab, issues);

          testExecuteKey('space', keyCodes.space, issues);
        });
      });
    });

    describe('custom list item (DOM Element)', () => {
      const issues = [
        { id: '@1002', title: 'Some bug in editor.' },
        { id: '@1003', title: 'Introduce this feature.' },
        { id: '@1004', title: 'Missing docs.' },
        { id: '@1005', title: 'Another bug.' },
        { id: '@1006', title: 'More bugs' },
      ];

      beforeEach(() => {
        return createClassicTestEditor({
          feeds: [
            {
              marker: '@',
              feed: feedText => {
                return Promise.resolve(issues.filter(issue => issue.id.includes(feedText)));
              },
              itemRenderer: item => {
                const span = global.document.createElementNS('http://www.w3.org/1999/xhtml', 'span');

                span.innerHTML = `<span id="issue-${item.id.slice(1)}">@${item.title}</span>`;

                return span;
              },
            },
          ],
        });
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;
          expect(mentionsView.items).to.have.length(5);
        });
      });

      describe('keys', () => {
        describe('on arrows', () => {
          it('should cycle down on arrow down', () => {
            setData(model, '<paragraph>foo []</paragraph>');

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });

            return waitForDebounce().then(() => {
              expectChildViewsIsOnState([true, false, false, false, false]);

              const keyEvtData = {
                keyCode: keyCodes.arrowdown,
                preventDefault: sinon.spy(),
                stopPropagation: sinon.spy(),
              };

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, true, false, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, true, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, true, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, false, true]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([true, false, false, false, false]);
            });
          });

          it('should cycle up on arrow up', () => {
            setData(model, '<paragraph>foo []</paragraph>');

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });

            return waitForDebounce().then(() => {
              expectChildViewsIsOnState([true, false, false, false, false]);

              const keyEvtData = {
                keyCode: keyCodes.arrowup,
                preventDefault: sinon.spy(),
                stopPropagation: sinon.spy(),
              };

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, false, true]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, false, true, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, false, true, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([false, true, false, false, false]);

              fireKeyDownEvent(keyEvtData);
              expectChildViewsIsOnState([true, false, false, false, false]);
            });
          });
        });

        describe('on "execute" keys', () => {
          testExecuteKey('enter', keyCodes.enter, issues);

          testExecuteKey('tab', keyCodes.tab, issues);

          testExecuteKey('space', keyCodes.space, issues);
        });

        describe('mouse', () => {
          it('should execute selected button on mouse click', () => {
            setData(model, '<paragraph>foo []</paragraph>');

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });

            const command = editor.commands.get('mention');
            const spy = testUtils.sinon.spy(command, 'execute');

            return waitForDebounce().then(() => {
              expectChildViewsIsOnState([true, false, false, false, false]);

              const element = panelView.element.querySelector('#issue-1004');
              element.dispatchEvent(new Event('click', { bubbles: true }));

              sinon.assert.calledOnce(spy);

              const commandOptions = spy.getCall(0).args[0];

              const item = issues[2];

              expect(commandOptions)
                .to.have.property('mention')
                .that.deep.equal(item);
              expect(commandOptions).to.have.property('marker', '@');
              expect(commandOptions).to.have.property('range');

              const start = model.createPositionAt(doc.getRoot().getChild(0), 4);
              const expectedRange = model.createRange(start, start.getShiftedBy(1));

              expect(commandOptions.range.isEqual(expectedRange)).to.be.true;
            });
          });
        });
      });
    });

    describe('multiple feeds configuration', () => {
      beforeEach(() => {
        return createClassicTestEditor({
          feeds: [
            {
              marker: '@',
              feed: ['@a1', '@a2', '@a3'],
            },
            {
              marker: '$',
              feed: ['$a1', '$a2', '$a3', '$a4', '$a5'],
            },
          ],
        });
      });

      it('should show panel for matched marker', () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        return waitForDebounce()
          .then(() => {
            expect(panelView.isVisible).to.be.true;
            expect(editor.model.markers.has('mention')).to.be.true;
            expect(mentionsView.items).to.have.length(3);

            mentionsView.items
              .get(0)
              .children.get(0)
              .fire('execute');
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;

            model.change(writer => {
              writer.insertText('$', doc.selection.getFirstPosition());
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.true;
            expect(editor.model.markers.has('mention')).to.be.true;
            expect(mentionsView.items).to.have.length(5);

            mentionsView.items
              .get(0)
              .children.get(0)
              .fire('execute');
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.false;
            expect(editor.model.markers.has('mention')).to.be.false;

            model.change(writer => {
              writer.insertText('@', doc.selection.getFirstPosition());
            });
          })
          .then(waitForDebounce)
          .then(() => {
            expect(panelView.isVisible).to.be.true;
            expect(editor.model.markers.has('mention')).to.be.true;

            expect(mentionsView.items).to.have.length(3);
          });
      });
    });

    function testExecuteKey(name, keyCode, feedItems) {
      it('should execute selected button on ' + name, () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        const command = editor.commands.get('mention');
        const spy = testUtils.sinon.spy(command, 'execute');

        return waitForDebounce().then(() => {
          expectChildViewsIsOnState([true, false, false, false, false]);

          fireKeyDownEvent({
            keyCode: keyCodes.arrowup,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          });

          expectChildViewsIsOnState([false, false, false, false, true]);

          fireKeyDownEvent({
            keyCode,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          });

          sinon.assert.calledOnce(spy);

          assertCommandOptions(spy.getCall(0).args[0], '@', feedItems[4]);

          const start = model.createPositionAt(doc.getRoot().getChild(0), 4);
          const expectedRange = model.createRange(start, start.getShiftedBy(1));

          expect(spy.getCall(0).args[0].range.isEqual(expectedRange)).to.be.true;
        });
      });

      it('should do nothing if panel is not visible on ' + name, () => {
        setData(model, '<paragraph>foo []</paragraph>');

        model.change(writer => {
          writer.insertText('@', doc.selection.getFirstPosition());
        });

        const command = editor.commands.get('mention');
        const spy = testUtils.sinon.spy(command, 'execute');

        return waitForDebounce().then(() => {
          expect(panelView.isVisible).to.be.true;
          expect(editor.model.markers.has('mention')).to.be.true;

          fireKeyDownEvent({
            keyCode: keyCodes.esc,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          });

          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;

          fireKeyDownEvent({
            keyCode,
            preventDefault: sinon.spy(),
            stopPropagation: sinon.spy(),
          });

          sinon.assert.notCalled(spy);

          expect(panelView.isVisible).to.be.false;
          expect(editor.model.markers.has('mention')).to.be.false;
        });
      });
    }
  });

  describe('execute', () => {
    beforeEach(() => createClassicTestEditor(staticConfig));

    it('should call the mention command with proper options', () => {
      setData(model, '<paragraph>foo []</paragraph>');

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      const command = editor.commands.get('mention');
      const spy = testUtils.sinon.spy(command, 'execute');

      return waitForDebounce().then(() => {
        mentionsView.items
          .get(0)
          .children.get(0)
          .fire('execute');

        sinon.assert.calledOnce(spy);

        const commandOptions = spy.getCall(0).args[0];

        assertCommandOptions(commandOptions, '@', { id: '@Barney', text: '@Barney' });

        const start = model.createPositionAt(doc.getRoot().getChild(0), 4);
        const expectedRange = model.createRange(start, start.getShiftedBy(1));

        expect(commandOptions.range.isEqual(expectedRange)).to.be.true;
      });
    });

    it('should hide panel on execute', () => {
      setData(model, '<paragraph>foo []</paragraph>');

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      return waitForDebounce().then(() => {
        mentionsView.items
          .get(0)
          .children.get(0)
          .fire('execute');

        expect(panelView.isVisible).to.be.false;
        expect(editor.model.markers.has('mention')).to.be.false;
      });
    });

    it('should focus view after command execution', () => {
      const focusSpy = testUtils.sinon.spy(editor.editing.view, 'focus');

      setData(model, '<paragraph>foo []</paragraph>');

      model.change(writer => {
        writer.insertText('@', doc.selection.getFirstPosition());
      });

      return waitForDebounce().then(() => {
        mentionsView.items
          .get(0)
          .children.get(0)
          .fire('execute');

        sinon.assert.calledOnce(focusSpy);
      });
    });
  });

  function createClassicTestEditor(mentionConfig) {
    return ClassicTestEditor.create(editorElement, {
      plugins: [Paragraph, MentionEditing, MentionUI],
      mention: mentionConfig,
    }).then(newEditor => {
      editor = newEditor;
      model = editor.model;
      doc = model.document;
      editingView = editor.editing.view;
      mentionUI = editor.plugins.get(MentionUI);
      panelView = editor.plugins.get(ContextualBalloon).view;
      mentionsView = mentionUI._mentionsView;
    });
  }

  function waitForDebounce() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
  }

  function fireKeyDownEvent(options) {
    const eventInfo = new EventInfo(editingView.document, 'keydown');
    const eventData = new DomEventData(
      editingView.document,
      {
        target: document.body,
      },
      options
    );

    editingView.document.fire(eventInfo, eventData);
  }

  function stubSelectionRects(rects) {
    const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

    // Mock selection rect.
    sinon.stub(editingView.domConverter, 'viewRangeToDom').callsFake((...args) => {
      const domRange = originalViewRangeToDom.apply(editingView.domConverter, args);

      sinon.stub(domRange, 'getClientRects').returns(rects);

      return domRange;
    });
  }

  function expectChildViewsIsOnState(expectedState) {
    const childViews = [...mentionsView.items].map(item => item.children.get(0));

    expect(childViews.map(child => child.isOn)).to.deep.equal(expectedState);
  }

  function assertCommandOptions(commandOptions, marker, item) {
    expect(commandOptions).to.have.property('marker', marker);
    expect(commandOptions).to.have.property('range');
    expect(commandOptions).to.have.property('mention');

    const mentionForCommand = commandOptions.mention;

    for (const key of Object.keys(item)) {
      expect(mentionForCommand[key]).to.equal(item[key]);
    }
  }
});
