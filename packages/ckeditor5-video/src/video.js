/**
 * @module video/video
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoEditing from '../src/video/videoediting';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import VideoTextAlternative from './videotextalternative';

import '../theme/video.css';

/**
 * The video plugin.
 *
 * For a detailed overview, check the {@glink features/video video feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:video/video/videoediting~Videoediting},
 * * {@link module:video/videotextalternative~VideoTextAlternative}.
 *
 * Usually, it is used in conjuction with other plugins from this package. See the {@glink api/video package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Video extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [VideoEditing, Widget, VideoTextAlternative];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Video';
  }
}

/**
 * The configuration of the video features. Used by the video features in the `@ckeditor/ckeditor5-video` package.
 *
 * Read more in {@link module:video/video~VideoConfig}.
 *
 * @member {module:video/video~VideoConfig} module:core/editor/editorconfig~EditorConfig#video
 */

/**
 * The configuration of the video features. Used by the video features in the `@ckeditor/ckeditor5-video` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				video: ... // Video feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface VideoConfig
 */
