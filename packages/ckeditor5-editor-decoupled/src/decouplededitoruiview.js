/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-decoupled/decouplededitoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The decoupled editor UI view. It is a virtual view providing an inline
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable} and a
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}, but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more about this view.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class DecoupledEditorUIView extends EditorUIView {
  /**
   * Creates an instance of the decoupled editor UI view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
   * @param {HTMLElement} [editableElement] The editable element. If not specified, it will be automatically created by
   * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
   */
  constructor(locale, editingView, editableElement) {
    super(locale);

    /**
     * The main toolbar of the decoupled editor UI.
     *
     * @readonly
     * @member {module:ui/toolbar/toolbarview~ToolbarView}
     */
    this.toolbar = new ToolbarView(locale);

    /**
     * The editable of the decoupled editor UI.
     *
     * @readonly
     * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
     */
    this.editable = new InlineEditableUIView(locale, editingView, editableElement);

    // This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
    // Also because of the above, make sure the toolbar supports rounded corners.
    Template.extend(this.toolbar.template, {
      attributes: {
        class: ['ck-reset_all', 'ck-rounded-corners'],
      },
    });
  }

  /**
   * @inheritDoc
   */
  render() {
    super.render();

    this.registerChild([this.toolbar, this.editable]);
  }
}
