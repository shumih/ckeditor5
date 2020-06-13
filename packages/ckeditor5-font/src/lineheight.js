/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LineHeightUI from './lineheight/lineheightui';
import LineHeightEditing from './lineheight/lineheightediting';

/**
 * The font color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontcolor/fontcolorediting~Lineheightediting} and
 * {@link module:font/fontcolor/fontcolorui~Lineheightui} features in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LineHeight extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [LineHeightEditing, LineHeightUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'LineHeight';
  }
}
