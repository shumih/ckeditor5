import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';

export default class SetBorderCommand extends Command {
  constructor(editor, options = {}) {
    super(editor);

    /**
     * The order of insertion relative to the row in which the caret is located.
     *
     * @readonly
     * @member {String} module:table/commands/insertrowcommand~InsertRowCommand#order
     */
    this.type = options.type || 'outer';
  }

  /**
   * @inheritDoc
   */
  refresh() {
    const model = this.editor.model;
    const doc = model.document;
    const selection = doc.selection;

    const position = selection.getFirstPosition();
    const tableCell = findAncestor('tableCell', position);

    const isInTable = !!tableCell;

    this.isEnabled = isInTable;

    /**
     * Flag indicating whether the command is active. The command is active when the
     * {@link module:engine/model/selection~Selection} is in a header column.
     *
     * @observable
     * @readonly
     * @member {Boolean} #value
     */
    this.value = isInTable && this._hasBorder(tableCell);
  }

  /**
   * Executes the command.
   *
   * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
   *
   * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
   *
   * @fires execute
   */
  execute() {
    const model = this.editor.model;
    const doc = model.document;
    const selection = doc.selection;

    const position = selection.getFirstPosition();
    const tableCell = findAncestor('tableCell', position.parent);
    const tableRow = tableCell.parent;
    const table = tableRow.parent;

    model.change(writer => {
      if (this.value) {
        writer.removeAttribute(`${this.type}Border`, table);
      } else {
        writer.setAttribute(`${this.type}Border`, true, table);
      }
    });
  }

  _hasBorder(tableCell) {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;

    return table.getAttribute(`${this.type}Border`);
  }
}
