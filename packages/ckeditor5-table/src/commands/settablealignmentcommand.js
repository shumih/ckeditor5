import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';

export default class SetTableAlignmentCommand extends Command {
  constructor(editor, options = { side: 'center' }) {
    super(editor);

    this.side = options.side;
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
        writer.removeAttribute('tableAlignment', table);
      } else {
        writer.setAttribute('tableAlignment', this.side, table);
      }
    });
  }

  _hasBorder(tableCell) {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;

    return table.getAttribute('tableAlignment');
  }
}
