/**
 * @module video/videoupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoUploadUI from './videoupload/videouploadui';
import VideoUploadProgress from './videoupload/videouploadprogress';
import VideoUploadEditing from './videoupload/videouploadediting';

/**
 * The video upload plugin.
 *
 * For a detailed overview, check the {@glink features/video-upload/video-upload video upload feature} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins to enable video uploading:
 *
 * * {@link module:video/videoupload/videouploadediting~VideoUploadEditing},
 * * {@link module:video/videoupload/videouploadui~VideoUploadUI},
 * * {@link module:video/videoupload/videouploadprogress~VideoUploadProgress}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUpload extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoUpload';
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [VideoUploadEditing, VideoUploadUI, VideoUploadProgress];
  }
}

/**
 * Video upload configuration.
 *
 * @member {module:video/videoupload~VideoUploadConfig} module:video/video~VideoConfig#upload
 */

/**
 * The configuration of the video upload feature. Used by the video upload feature in the `@ckeditor/ckeditor5-video` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				video: {
 * 					upload:  ... // Video upload feature options.
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:video/videoupload~VideoUploadConfig
 */
