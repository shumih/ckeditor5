/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LineHeightCommand from './lineheightcommand';
import { LINE_HEIGHT, buildDefinition, LINE_HEIGHT_WRAPPER } from '../utils';
import { normalizeOptions } from './utils';

/**
 * The font color editing feature.
 *
 * It introduces the {@link module:font/fontcolor/fontcolorcommand~Lineheightcommand command} and
 * the `fontColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="color: ...">`),
 * depending on the {@link module:font/fontcolor~FontColorConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LineHeightEditing extends Plugin {
  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);

    // Define default configuration using named presets.
    editor.config.define(LINE_HEIGHT, {
      options: ['0', '0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2', '2.25', '2.5'],
    });

    // Define view to model conversion.
    const options = normalizeOptions(this.editor.config.get('lineHeight.options')).filter(item => item.model);
    const attributeToElementDefinition = buildDefinition(LINE_HEIGHT, options);

    // Set-up the two-way conversion.
    editor.conversion.attributeToElement(attributeToElementDefinition);

    editor.conversion.attributeToAttribute({
      view: {
        key: 'class',
        value: 'ck-line-height-wrapper',
      },
      model: {
        key: LINE_HEIGHT_WRAPPER,
        value: true,
      },
      converterPriority: 'high',
    });

    // Add LineHeight command.
    editor.commands.add(LINE_HEIGHT, new LineHeightCommand(editor));
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    editor.model.schema.extend('$text', { allowAttributes: LINE_HEIGHT });
    editor.model.schema.setAttributeProperties(LINE_HEIGHT, { isFormatting: true });
  }

  afterInit() {
    const editor = this.editor;

    editor.model.schema.extend('$block', { allowAttributes: LINE_HEIGHT_WRAPPER });
  }
}
