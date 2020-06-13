/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativeediting
 */

import VideoTextAlternativeCommand from './videotextalternativecommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The image text alternative editing plugin.
 *
 * Registers the `'videoTextAlternative'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoTextAlternativeEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoTextAlternativeEditing';
  }

  /**
   * @inheritDoc
   */
  init() {
    this.editor.commands.add('videoTextAlternative', new VideoTextAlternativeCommand(this.editor));
  }
}
