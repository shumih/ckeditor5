/**
 * @module video/videostyle/videostylecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isVideo } from '../video/utils';

/**
 * The video style command. It is used to apply different video styles.
 *
 * @extends module:core/command~Command
 */
export default class VideoStyleCommand extends Command {
  /**
   * Creates an instance of the video style command. Each command instance is handling one style.
   *
   * @param {module:core/editor/editor~Editor} editor The editor instance.
   * @param {Array.<module:video/videostyle/videostyleediting~VideoStyleFormat>} styles The styles that this command supports.
   */
  constructor(editor, styles) {
    super(editor);

    /**
     * The name of the default style, if it is present. If there is no default style, it defaults to `false`.
     *
     * @readonly
     * @type {Boolean|String}
     */
    this.defaultStyle = false;

    /**
     * A style handled by this command.
     *
     * @readonly
     * @member {Array.<module:video/videostyle/videostyleediting~VideoStyleFormat>} #styles
     */
    this.styles = styles.reduce((styles, style) => {
      styles[style.name] = style;

      if (style.isDefault) {
        this.defaultStyle = style.name;
      }

      return styles;
    }, {});
  }

  /**
   * @inheritDoc
   */
  refresh() {
    const element = this.editor.model.document.selection.getSelectedElement();

    this.isEnabled = isVideo(element);

    if (!element) {
      this.value = false;
    } else if (element.hasAttribute('videoStyle')) {
      const attributeValue = element.getAttribute('videoStyle');
      this.value = this.styles[attributeValue] ? attributeValue : false;
    } else {
      this.value = this.defaultStyle;
    }
  }

  /**
   * Executes the command.
   *
   *		editor.execute( 'videoStyle', { value: 'side' } );
   *
   * @param {Object} options
   * @param {String} options.value The name of the style (based on the
   * {@link module:video/video~videoConfig#styles `video.styles`} configuration option).
   * @fires execute
   */
  execute(options) {
    const styleName = options.value;

    const model = this.editor.model;
    const videoElement = model.document.selection.getSelectedElement();

    model.change(writer => {
      // Default style means that there is no `videoStyle` attribute in the model.
      // https://github.com/ckeditor/ckeditor5-video/issues/147
      if (this.styles[styleName].isDefault) {
        writer.removeAttribute('videoStyle', videoElement);
      } else {
        writer.setAttribute('videoStyle', styleName, videoElement);
      }
    });
  }
}
