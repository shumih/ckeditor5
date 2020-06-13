/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import InsertTableView from './ui/inserttableview';

import tableIcon from './../theme/icons/table.svg';
import tableColumnIcon from './../theme/icons/table-column.svg';
import tableRowIcon from './../theme/icons/table-row.svg';
import tableMergeCellIcon from './../theme/icons/table-merge-cell.svg';
import tableBorderIcon from './../theme/icons/table-border.svg';
import tableAlignIcon from './../theme/icons/table-align.svg';
import tableCellTextAlignIcon from './../theme/icons/table-cell-text-align.svg';

/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` dropdown.
 *
 * The `'tableColumn'`, `'tableRow'`, `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUI extends Plugin {
  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = this.editor.t;

    editor.ui.componentFactory.add('insertTable', locale => {
      const command = editor.commands.get('insertTable');
      const dropdownView = createDropdown(locale);

      dropdownView.bind('isEnabled').to(command);

      // Decorate dropdown's button.
      dropdownView.buttonView.set({
        icon: tableIcon,
        label: t('Insert table'),
        tooltip: true,
      });

      // Prepare custom view for dropdown's panel.
      const insertTableView = new InsertTableView(locale);
      dropdownView.panelView.children.add(insertTableView);

      insertTableView.delegate('execute').to(dropdownView);

      dropdownView.buttonView.on('open', () => {
        // Reset the chooser before showing it to the user.
        insertTableView.rows = 0;
        insertTableView.columns = 0;
      });

      dropdownView.on('execute', () => {
        editor.execute('insertTable', { rows: insertTableView.rows, columns: insertTableView.columns });
        editor.editing.view.focus();
      });

      return dropdownView;
    });

    editor.ui.componentFactory.add('tableColumn', locale => {
      const options = [
        {
          type: 'switchbutton',
          model: {
            commandName: 'setTableColumnHeader',
            label: t('Header column'),
            bindIsOn: true,
          },
        },
        { type: 'separator' },
        {
          type: 'button',
          model: {
            commandName: 'insertTableColumnLeft',
            label: t('Insert column left'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'insertTableColumnRight',
            label: t('Insert column right'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'removeTableColumn',
            label: t('Delete column'),
          },
        },
      ];

      return this._prepareDropdown(t('Column'), tableColumnIcon, options, locale);
    });

    editor.ui.componentFactory.add('tableRow', locale => {
      const options = [
        {
          type: 'switchbutton',
          model: {
            commandName: 'setTableRowHeader',
            label: t('Header row'),
            bindIsOn: true,
          },
        },
        { type: 'separator' },
        {
          type: 'button',
          model: {
            commandName: 'insertTableRowBelow',
            label: t('Insert row below'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'insertTableRowAbove',
            label: t('Insert row above'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'removeTableRow',
            label: t('Delete row'),
          },
        },
      ];

      return this._prepareDropdown(t('Row'), tableRowIcon, options, locale);
    });

    editor.ui.componentFactory.add('mergeTableCells', locale => {
      const options = [
        {
          type: 'button',
          model: {
            commandName: 'mergeTableCellUp',
            label: t('Merge cell up'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'mergeTableCellRight',
            label: t('Merge cell right'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'mergeTableCellDown',
            label: t('Merge cell down'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'mergeTableCellLeft',
            label: t('Merge cell left'),
          },
        },
        { type: 'separator' },
        {
          type: 'button',
          model: {
            commandName: 'splitTableCellVertically',
            label: t('Split cell vertically'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'splitTableCellHorizontally',
            label: t('Split cell horizontally'),
          },
        },
      ];

      return this._prepareDropdown(t('Merge cells'), tableMergeCellIcon, options, locale);
    });

    editor.ui.componentFactory.add('tableAlignment', locale => {
      const options = [
        {
          type: 'button',
          model: {
            commandName: 'setTableAlignmentLeft',
            label: t('Align left'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'setTableAlignmentRight',
            label: t('Align right'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'setTableAlignmentCenter',
            label: t('Align center'),
          },
        },
      ];

      return this._prepareDropdown(t('Table Align'), tableAlignIcon, options, locale);
    });

    editor.ui.componentFactory.add('cellTextAlignment', locale => {
      const options = [
        {
          type: 'button',
          model: {
            commandName: 'setCellTextAlignmentTop',
            label: t('Cell Text Align Top'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'setCellTextAlignmentCenter',
            label: t('Cell Text Align Center'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'setCellTextAlignmentBaseline',
            label: t('Cell Text Align Baseline'),
          },
        },
        {
          type: 'button',
          model: {
            commandName: 'setCellTextAlignmentBottom',
            label: t('Cell Text Align Bottom'),
          },
        },
      ];

      return this._prepareDropdown(t('Cell Text Align'), tableCellTextAlignIcon, options, locale);
    });

    editor.ui.componentFactory.add('tableBorder', locale => {
      const options = [
        {
          type: 'switchbutton',
          model: {
            commandName: 'setTableOuterBorder',
            label: t('Outer border'),
            bindIsOn: true,
          },
        },
        {
          type: 'switchbutton',
          model: {
            commandName: 'setTableInnerBorder',
            label: t('Inner border'),
            bindIsOn: true,
          },
        },
      ];

      return this._prepareDropdown(t('Border'), tableBorderIcon, options, locale);
    });
  }

  /**
   * Creates a dropdown view from the set of options.
   *
   * @private
   * @param {String} label The dropdown button label.
   * @param {String} icon An icon for the dropdown button.
   * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
   * @param {module:utils/locale~Locale} locale
   * @returns {module:ui/dropdown/dropdownview~DropdownView}
   */
  _prepareDropdown(label, icon, options, locale) {
    const editor = this.editor;

    const dropdownView = createDropdown(locale);
    const commands = [];

    // Prepare dropdown list items for list dropdown.
    const itemDefinitions = new Collection();

    for (const option of options) {
      addListOption(option, editor, commands, itemDefinitions);
    }

    addListToDropdown(dropdownView, itemDefinitions);

    // Decorate dropdown's button.
    dropdownView.buttonView.set({
      label,
      icon,
      tooltip: true,
    });

    // Make dropdown button disabled when all options are disabled.
    dropdownView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled) => {
      return areEnabled.some(isEnabled => isEnabled);
    });

    this.listenTo(dropdownView, 'execute', evt => {
      editor.execute(evt.source.commandName);
      editor.editing.view.focus();
    });

    return dropdownView;
  }
}

// Adds an option to a list view.
//
// @param {module:table/tableui~DropdownOption} option Configuration option.
// @param {module:core/editor/editor~Editor} editor
// @param {Array.<module:core/command~Command>} commands List of commands to update.
// @param {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>} itemDefinitions
// Collection of dropdown items to update with given option.
function addListOption(option, editor, commands, itemDefinitions) {
  const model = (option.model = new Model(option.model));
  const { commandName, bindIsOn } = option.model;

  if (option.type !== 'separator') {
    const command = editor.commands.get(commandName);

    commands.push(command);

    model.set({ commandName });

    model.bind('isEnabled').to(command);

    if (bindIsOn) {
      model.bind('isOn').to(command, 'value');
    }
  }

  model.set({
    withText: true,
  });

  itemDefinitions.add(option);
}
