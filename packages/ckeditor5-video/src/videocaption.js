/**
/**
 * @module video/videocaption
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoCaptionEditing from './videocaption/videocaptionediting';

import '../theme/videocaption.css';

/**
 * The video caption plugin.
 *
 * For a detailed overview, check the {@glink features/video#video-captions video caption} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoCaption extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [VideoCaptionEditing];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoCaption';
  }
}
