/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videoresize/videoresizecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isVideo } from '../video/utils';

/**
 * The video resize command. Currently, it supports only the width attribute.
 *
 * @extends module:core/command~Command
 */
export default class VideoResizeCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    const element = this.editor.model.document.selection.getSelectedElement();

    this.isEnabled = isVideo(element);

    if (!element || !element.hasAttribute('width')) {
      this.value = null;
    } else {
      this.value = {
        width: element.getAttribute('width'),
        height: null,
      };
    }
  }

  /**
   * Executes the command.
   *
   *		// Sets the width to 50%:
   *		editor.execute( 'videoResize', { width: '50%' } );
   *
   *		// Removes the width attribute:
   *		editor.execute( 'videoResize', { width: null } );
   *
   * @param {Object} options
   * @param {String|null} options.width The new width of the video.
   * @fires execute
   */
  execute(options) {
    const model = this.editor.model;
    const videoElement = model.document.selection.getSelectedElement();

    model.change(writer => {
      writer.setAttribute('width', options.width, videoElement);
    });
  }
}
