import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';

export default class SetCellTextAlignmentCommand extends Command {
  constructor(editor, alignment = 'baseline') {
    super(editor);

    this.alignment = alignment;
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
  }

  execute() {
    const model = this.editor.model;
    const doc = model.document;
    const selection = doc.selection;

    const position = selection.getFirstPosition();
    const tableCell = findAncestor('tableCell', position.parent);

    model.change(writer => {
      writer.setAttribute('cellTextAlignment', this.alignment, tableCell);
    });
  }
}
