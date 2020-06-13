/**
 * @module video/videostyle/videostyleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import { normalizeVideoStyles } from './utils';

import '../../theme/videostyle.css';

/**
 * The video style UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoStyleUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoStyleUI';
  }

  /**
   * Returns the default localized style titles provided by the plugin.
   *
   * The following localized titles corresponding with
   * {@link module:video/videostyle/utils~defaultStyles} are available:
   *
   * * `'Full size video'`,
   * * `'Side video'`,
   * * `'Left aligned video'`,
   * * `'Centered video'`,
   * * `'Right aligned video'`
   *
   * @returns {Object.<String,String>}
   */
  get localizedDefaultStylesTitles() {
    const t = this.editor.t;

    return {
      'Full size video': t('Full size video'),
      'Side video': t('Side video'),
      'Left aligned video': t('Left aligned video'),
      'Centered video': t('Centered video'),
      'Right aligned video': t('Right aligned video'),
    };
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const configuredStyles = editor.config.get('video.styles');

    const translatedStyles = translateStyles(normalizeVideoStyles(configuredStyles), this.localizedDefaultStylesTitles);

    for (const style of translatedStyles) {
      this._createButton(style);
    }
  }

  /**
   * Creates a button for each style and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
   *
   * @private
   * @param {module:video/videostyle/videostyleediting~VideoStyleFormat} style
   */
  _createButton(style) {
    const editor = this.editor;

    const componentName = `videoStyle:${style.name}`;

    editor.ui.componentFactory.add(componentName, locale => {
      const command = editor.commands.get('videoStyle');
      const view = new ButtonView(locale);

      view.set({
        label: style.title,
        icon: style.icon,
        tooltip: true,
        isToggleable: true,
      });

      view.bind('isEnabled').to(command, 'isEnabled');
      view.bind('isOn').to(command, 'value', value => value === style.name);

      this.listenTo(view, 'execute', () => editor.execute('videoStyle', { value: style.name }));

      return view;
    });
  }
}

/**
 * Returns the translated `title` from the passed styles array.
 *
 * @param {Array.<module:video/videostyle/videostyleediting~VideoStyleFormat>} styles
 * @param titles
 * @returns {Array.<module:video/videostyle/videostyleediting~VideoStyleFormat>}
 */
function translateStyles(styles, titles) {
  for (const style of styles) {
    // Localize the titles of the styles, if a title corresponds with
    // a localized default provided by the plugin.
    if (titles[style.title]) {
      style.title = titles[style.title];
    }
  }

  return styles;
}
