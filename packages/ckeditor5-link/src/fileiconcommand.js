import Command from '@ckeditor/ckeditor5-core/src/command';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import first from '@ckeditor/ckeditor5-utils/src/first';

function findLinkIcon(elementOrPosition) {
  return elementOrPosition.name == 'i' ? elementOrPosition : null;
}

export default class FileIconCommand extends Command {
  constructor(editor) {
    super(editor);

    this.manualDecorators = new Collection();
  }

  restoreManualDecoratorStates() {
    for (const manualDecorator of this.manualDecorators) {
      manualDecorator.value = this._getDecoratorStateFromModel(manualDecorator.id);
    }
  }

  refresh() {
    const model = this.editor.model;
    const doc = model.document;

    this.value = this._getValue();

    for (const manualDecorator of this.manualDecorators) {
      manualDecorator.value = this._getDecoratorStateFromModel(manualDecorator.id);
    }

    this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'fileIcon');
  }

  execute(href, manualDecoratorIds = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const blocks = Array.from(selection.getTopMostBlocks());

    model.change(writer => {
      if (this.value) {
        this._removeIcon(writer, blocks[0]);
      }
    });
  }

  _removeIcon(writer, groupRange) {
    if (groupRange.start.isAtStart && groupRange.end.isAtEnd) {
      writer.unwrap(groupRange.start.parent);

      return;
    }

    // The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
    if (groupRange.start.isAtStart) {
      const positionBefore = writer.createPositionBefore(groupRange.start.parent);

      writer.move(groupRange, positionBefore);

      return;
    }

    // The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
    // so we move the items there.
    if (!groupRange.end.isAtEnd) {
      writer.split(groupRange.end);
    }

    // Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

    const positionAfter = writer.createPositionAfter(groupRange.end.parent);

    writer.move(groupRange, positionAfter);
  }

  _getValue() {
    const selection = this.editor.model.document.selection;

    const firstBlock = first(selection.getTopMostBlocks());

    // In the current implementation, the block quote must be an immediate parent of a block element.
    return !!(firstBlock && findLinkIcon(firstBlock));
  }

  _getDecoratorStateFromModel(decoratorName) {
    const doc = this.editor.model.document;
    return doc.selection.getAttribute(decoratorName) || false;
  }
}
