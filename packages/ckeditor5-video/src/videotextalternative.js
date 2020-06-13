/**
 * @module video/videotextalternative
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoTextAlternativeEditing from './videoalternative/videotextalternativeediting';
import VideoTextAlternativeUI from './videoalternative/videotextalternativeui';

/**
 * The video text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/video#video-styles video styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:video/videotextalternative/videotextalternativeediting~VideoTextAlternativeEditing}
 * and {@link module:video/videotextalternative/VideoTextAlternativeUI~VideoTextAlternativeUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoTextAlternative extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [VideoTextAlternativeEditing, VideoTextAlternativeUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoTextAlternative';
  }
}
