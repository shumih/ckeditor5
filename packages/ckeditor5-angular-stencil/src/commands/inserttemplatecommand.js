import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertTemplateCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    // const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'stencilTemplatePreview');
    const isAllowed = model.schema.checkChild(selection.focus.parent, 'stencilTemplatePreview');

    this.isEnabled = isAllowed;
  }

  execute(block) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const { createBlock } = this.editor.config.get('stencil');

    const insertPosition = findOptimalInsertionPositionForInlineWidget(selection, model);

    model.change(writer => {
      const container = document.createElement('div');
      createBlock(block, container);

      const attributes = { ...container.firstChild.dataset };
      Object.keys(attributes)
        .filter(key => attributes[key] == null)
        .forEach(key => delete attributes[key]);

      const blockElement = writer.createElement('stencilTemplatePreview', {
        selector: block.selector,
        ...block.descriptors.reduce((result, { name, toString, value }) => {
          result[name] = toString(value);

          return result;
        }, {}),
      });

      model.insertContent(blockElement, insertPosition);

      // writer.setSelection(writer.createPositionAt(blockElement, 0));
    });
  }
}

function findOptimalInsertionPositionForInlineWidget(selection, model) {
  const selectedElement = selection.getSelectedElement();

  if (selectedElement && model.schema.isBlock(selectedElement)) {
    return model.createPositionAfter(selectedElement);
  }

  const firstBlock = selection.getSelectedBlocks().next().value;

  if (firstBlock) {
    if (firstBlock.isEmpty) {
      return model.createPositionAt(firstBlock, 0);
    }
  }

  return selection.focus;
}
