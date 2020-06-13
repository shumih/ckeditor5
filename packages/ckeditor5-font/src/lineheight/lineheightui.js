/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import { LINE_HEIGHT } from '../utils';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import lineHeightIcon from '../../theme/icons/line-height.svg';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { normalizeOptions } from './utils';

/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LineHeightUI extends Plugin {
  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = editor.t;

    const options = this._getLocalizedOptions();

    const command = editor.commands.get(LINE_HEIGHT);

    // Register UI component.
    editor.ui.componentFactory.add(LINE_HEIGHT, locale => {
      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, _prepareListOptions(options, command));

      // Create dropdown model.
      dropdownView.buttonView.set({
        label: t('Line Height'),
        icon: lineHeightIcon,
        tooltip: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ['ck-font-size-dropdown'],
        },
      });

      dropdownView.bind('isEnabled').to(command);

      // Execute command when an item from the dropdown is selected.
      this.listenTo(dropdownView, 'execute', evt => {
        editor.execute(evt.source.commandName, { value: evt.source.commandParam });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }

  _getLocalizedOptions() {
    const editor = this.editor;
    const t = editor.t;

    const localizedTitles = {
      Default: t('Default'),
      Tiny: t('Tiny'),
      Small: t('Small'),
      Big: t('Big'),
      Huge: t('Huge'),
    };

    const options = normalizeOptions(editor.config.get(LINE_HEIGHT).options);

    return options.map(option => {
      const title = localizedTitles[option.title];

      if (title && title != option.title) {
        // Clone the option to avoid altering the original `namedPresets` from `./utils.js`.
        option = Object.assign({}, option, { title });
      }

      return option;
    });
  }
}

// Prepares FontSize dropdown items.
// @private
// @param {Array.<module:font/fontsize~FontSizeOption>} options
// @param {module:font/fontsize/fontsizecommand~FontSizeCommand} command
function _prepareListOptions(options, command) {
  const itemDefinitions = new Collection();

  for (const option of options) {
    const def = {
      type: 'button',
      model: new Model({
        commandName: LINE_HEIGHT,
        commandParam: option.model,
        label: option.title,
        class: 'ck-fontsize-option',
        withText: true,
      }),
    };

    if (option.view && option.view.styles) {
      def.model.set('labelStyle', `line-height:${option.view.styles['line-height']}`);
    }

    if (option.view && option.view.classes) {
      def.model.set('class', `${def.model.class} ${option.view.classes}`);
    }

    def.model.bind('isOn').to(command, 'value', value => value === option.model);

    // Add the option to the collection.
    itemDefinitions.add(def);
  }

  return itemDefinitions;
}
