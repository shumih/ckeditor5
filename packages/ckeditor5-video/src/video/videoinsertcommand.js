import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertVideo, isVideoAllowed } from './utils';

/**
 * @module video/video/videoinsertcommand
 */

/**
 * Insert video command.
 *
 * The command is registered by the {@link module:video/video/videoediting~VideoEditing} plugin as `'videoInsert'`.
 *
 * In order to insert an video at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and specify the video source:
 *
 *		editor.execute( 'videoInsert', { source: 'http://url.to.the/video' } );
 *
 * It is also possible to insert multiple videos at once:
 *
 *		editor.execute( 'videoInsert', {
 *			source:  [
 *				'path/to/video.mp4',
 *				'path/to/other-video.mp4'
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class VideoInsertCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    this.isEnabled = isVideoAllowed(this.editor.model);
  }

  /**
   * Executes the command.
   *
   * @fires execute
   * @param {Object} options Options for the executed command.
   * @param {String|Array.<String>} options.source The video source or an array of video sources to insert.
   */
  execute(options) {
    const model = this.editor.model;

    model.change(writer => {
      const sources = Array.isArray(options.source) ? options.source : [options.source];

      for (const src of sources) {
        insertVideo(writer, model, { src });
      }
    });
  }
}
