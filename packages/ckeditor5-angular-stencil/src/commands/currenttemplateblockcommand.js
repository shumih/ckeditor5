import Command from '@ckeditor/ckeditor5-core/src/command';

export default class CurrentTemplateBlockCommand extends Command {
  constructor(editor, blocks) {
    super(editor);

    this.blocks = blocks;
    this.set('blockLabel', '');
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    const stencilBlock = Array.from(selection.getFirstRange().getItems()).find(
      element => element.name === 'stencilTemplatePreview'
    );

    this.isEnabled = stencilBlock != null;

    if (stencilBlock != null && stencilBlock.getAttribute('properties')) {
      const properties = stencilBlock.getAttribute('properties');

      const block = this.blocks.find(b => {
        const { toString } = b.descriptors.find(d => d.name === 'properties');

        return toString(b.properties) === properties;
      });

      this.blockLabel = block != null ? block.label : '';
    }
  }

  execute(value) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const position = selection.getFirstPosition();
    const element = position.parent;

    model.change(writer => {
      const ranges = model.schema.getValidRanges(selection.getRanges(), 'minWidth');

      for (const range of ranges) {
        if (value) {
          writer.setAttribute('minWidth', value, range);
        } else {
          writer.removeAttribute('minWidth', range);
        }
      }
    });
  }
}
