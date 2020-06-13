/**
 * @module video/videostyle/videostyleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoStyleCommand from './videostylecommand';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import { normalizeVideoStyles } from './utils';

/**
 * The video style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:video/videostyle/videostylecommand~VideoStyleCommand VideoStyleCommand}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoStyleEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoStyleEditing';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const schema = editor.model.schema;
    const data = editor.data;
    const editing = editor.editing;

    // Define default configuration.
    editor.config.define('video.styles', ['full', 'side']);

    // Get configuration.
    const styles = normalizeVideoStyles(editor.config.get('video.styles'));

    // Allow videoStyle attribute in video.
    // We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
    schema.extend('video', { allowAttributes: 'videoStyle' });

    // Converters for videoStyle attribute from model to view.
    const modelToViewConverter = modelToViewStyleAttribute(styles);
    editing.downcastDispatcher.on('attribute:videoStyle:video', modelToViewConverter);
    data.downcastDispatcher.on('attribute:videoStyle:video', modelToViewConverter);

    // Converter for figure element from view to model.
    data.upcastDispatcher.on('element:figure', viewToModelStyleAttribute(styles), { priority: 'low' });

    // Register videoStyle command.
    editor.commands.add('videoStyle', new VideoStyleCommand(editor, styles));
  }
}

/**
 * The video style format descriptor.
 *
 *		import fullSizeIcon from 'path/to/icon.svg';
 *
 *		const videoStyleFormat = {
 *			name: 'fullSize',
 *			icon: fullSizeIcon,
 *			title: 'Full size video',
 *			className: 'video-full-size'
 *		}
 *
 * @typedef {Object} module:video/videostyle/videostyleediting~VideoStyleFormat
 *
 * @property {String} name The unique name of the style. It will be used to:
 *
 * * Store the chosen style in the model by setting the `videoStyle` attribute of the `<video>` element.
 * * As a value of the {@link module:video/videostyle/videostylecommand~VideoStyleCommand#execute `videoStyle` command},
 * * when registering a button for each of the styles (`'videoStyle:{name}'`) in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:video/videostyle/videostyleui~VideoStyleUI} plugin).
 *
 * @property {Boolean} [isDefault] When set, the style will be used as the default one.
 * A default style does not apply any CSS class to the view element.
 *
 * @property {String} icon One of the following to be used when creating the style's button:
 *
 * * An SVG icon source (as an XML string).
 * * One of {@link module:video/videostyle/utils~defaultIcons} to use a default icon provided by the plugin.
 *
 * @property {String} title The style's title.
 *
 * @property {String} className The CSS class used to represent the style in the view.
 */
