/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorcommand
 */

import FontCommand from '../fontcommand';
import { LINE_HEIGHT, LINE_HEIGHT_WRAPPER } from '../utils';

/**
 * The font color command. It is used by {@link module:font/fontcolor/fontcolorediting~Lineheightediting}
 * to apply the font color.
 *
 *		editor.execute( 'fontColor', { value: 'rgb(250, 20, 20)' } );
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class LineHeightCommand extends FontCommand {
  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor, LINE_HEIGHT);
  }

  execute(options = {}) {
    const model = this.editor.model;
    const document = model.document;
    const selection = document.selection;

    const value = options.value;

    model.change(writer => {
      if (selection.isCollapsed) {
        if (value != null) {
          writer.setSelectionAttribute(this.attributeKey, value);
        } else {
          writer.removeSelectionAttribute(this.attributeKey);
        }
      } else {
        const ranges = model.schema.getValidRanges(selection.getRanges(), this.attributeKey);

        for (const range of ranges) {
          if (value != null) {
            writer.setAttribute(this.attributeKey, value, range);
          } else {
            writer.removeAttribute(this.attributeKey, range);
          }
        }
      }

      const blocks = Array.from(selection.getSelectedBlocks()).filter(block =>
        this.editor.model.schema.checkAttribute(block, LINE_HEIGHT_WRAPPER)
      );

      for (const block of blocks) {
        if (value) {
          writer.setAttribute(LINE_HEIGHT_WRAPPER, true, block);
        } else {
          writer.removeAttribute(LINE_HEIGHT_WRAPPER, block);
        }
      }
    });
  }
}
