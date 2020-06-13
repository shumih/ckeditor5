/**
 * @module video/videostyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoStyleEditing from './videostyle/videostyleediting';
import VideoStyleUI from './videostyle/videostyleui';

/**
 * The video style plugin.
 *
 * For a detailed overview, check the {@glink features/video#video-styles video styles} documentation.
 *
 * This is a "glue" plugin which loads the {@link module:video/videostyle/videostyleediting~VideoStyleEditing}
 * and {@link module:video/videostyle/videostyleui~VideoStyleUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Videostyle extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [VideoStyleEditing, VideoStyleUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoStyle';
  }
}

/**
 * Available video styles.
 *
 * The default value is:
 *
 *		const videoConfig = {
 *			styles: [ 'full', 'side' ]
 *		};
 *
 * which configures two default styles:
 *
 *  * the "full" style which does not apply any class, e.g. for videos styled to span 100% width of the content,
 *  * the "side" style with the `.video-style-side` CSS class.
 *
 * See {@link module:video/videostyle/utils~defaultStyles} to learn more about default
 * styles provided by the video feature.
 *
 * The {@link module:video/videostyle/utils~defaultStyles default styles} can be customized,
 * e.g. to change the icon, title or CSS class of the style. The feature also provides several
 * {@link module:video/videostyle/utils~defaultIcons default icons} to choose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		const videoConfig = {
 *			styles: [
 *				// This will only customize the icon of the "full" style.
 *				// Note: 'right' is one of default icons provided by the feature.
 *				{ name: 'full', icon: 'right' },
 *
 *				// This will customize the icon, title and CSS class of the default "side" style.
 *				{ name: 'side', icon: customIcon, title: 'My side style', className: 'custom-side-video' }
 *			]
 *		};
 *
 * If none of the default styles is good enough, it is possible to define independent custom styles, too:
 *
 *		import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
 *		import sideIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
 *
 *		// ...
 *
 *		const videoConfig = {
 *			styles: [
 *				// A completely custom full size style with no class, used as a default.
 *				{ name: 'fullSize', title: 'Full size', icon: fullSizeIcon, isDefault: true },
 *
 *				{ name: 'side', title: 'To the side', icon: sideIcon, className: 'side-video' }
 *			]
 *		};
 *
 * Note: Setting `title` to one of {@link module:video/videostyle/videostyleui~VideoStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * Read more about styling videos in the {@glink features/image#image-styles Video styles guide}.
 *
 * The feature creates commands based on defined styles, so you can change the style of a selected image by executing
 * the following command:
 *
 *		editor.execute( 'imageStyle' { value: 'side' } );
 *
 * The feature also creates buttons that execute the commands. So, assuming that you use the
 * default image styles setting, you can {@link module:image/image~VideoConfig#toolbar configure the image toolbar}
 * (or any other toolbar) to contain these options:
 *
 *		const imageConfig = {
 *			toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
 *		};
 *
 * @member {Array.<module:image/imagestyle/imagestyleediting~VideoStyleFormat>} module:image/image~VideoConfig#styles
 */
