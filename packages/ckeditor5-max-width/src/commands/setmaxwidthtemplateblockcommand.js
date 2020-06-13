import Command from '@ckeditor/ckeditor5-core/src/command';

export default class SetMaxWidthTemplateBlockCommand extends Command {
  constructor(editor) {
    super(editor);

    this.set('isActive', false);
    this.set('isStencilTemplateSelected', false);
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const ranges = Array.from(model.schema.getValidRanges(selection.getRanges(), 'max-width'));
    const items = (ranges[0] && Array.from(ranges[0].getItems())) || [];
    const selectedElement = selection.getSelectedElement();

    this.isEnabled = ranges.length;
    this.items = items;
    this.isActive = this.items.length > 0 && this.items.every(item => item.hasAttribute('max-width'));
    this.isStencilTemplateSelected = selectedElement && selectedElement.name === 'stencilTemplatePreview';
  }

  execute(value) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const range = selection.getFirstRange();
    const items = [...range.getItems()];

    if (items.length === 1 && selection.getSelectedElement()) {
      this.toggleMaxWidthAttribute(value, items[0]);
    } else {
      this.toggleMaxWidthTemplateBlockAttribute(value, items);
    }
  }

  toggleMaxWidthAttribute(value, block) {
    const model = this.editor.model;

    model.change(writer => {
      if (value) {
        if (!block.parent.hasAttribute('max-width-template-block')) {
          const paragraph = writer.createElement('paragraph', { 'max-width-template-block': true });

          writer.wrap(writer.createRangeOn(block), paragraph);
        }

        writer.setAttribute('max-width', true, block);
      } else {
        const hasOtherMaxWidthChildren = Array.from(block.parent.getChildren())
          .filter(child => child !== block)
          .some(child => child.hasAttribute('max-width'));

        if (block.parent.hasAttribute('max-width-template-block') && !hasOtherMaxWidthChildren) {
          writer.unwrap(block.parent);
        }

        writer.removeAttribute('max-width', block);
      }
    });
  }

  toggleMaxWidthTemplateBlockAttribute(value, items) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change(writer => {
      const range = selection.getFirstRange();
      const container = range.getCommonAncestor();

      if (container) {
        if (container.hasAttribute('max-width-template-block')) {
          writer.unwrap(container);

          return;
        }
      }

      if (value) {
        const paragraph = writer.createElement('paragraph', { 'max-width-template-block': true });

        items.filter(i => i.name === 'stencilTemplatePreview').forEach(i => writer.setAttribute('max-width', true, i));

        let item = items.pop();
        writer.wrap(writer.createRangeOn(item), paragraph);

        while ((item = items.pop())) {
          writer.insert(item, paragraph, 0);
        }
      } else {
        for (let item of items) {
          if (item.hasAttribute('max-width-template-block')) {
            writer.unwrap(item);
          }

          if (item.hasAttribute('max-width')) {
            writer.removeAttribute('max-width', item);
          }
        }
      }
    });
  }

  oldExecute(value) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const position = selection.getFirstPosition();

    model.change(writer => {
      if (selection.isCollapsed) {
        const parent = position.parent;

        if (value) {
          writer.setAttribute('max-width-template-block', true, parent);
          writer.setSelectionAttribute('max-width', true);
          writer.removeSelectionAttribute('width');
        } else {
          writer.removeSelectionAttribute('max-width');

          if (selection.hasAttribute('max-width')) {
            writer.removeAttribute('max-width-template-block', parent);
          }
        }
      } else {
        const item = selection.getFirstRange();
        const selectedBlock = selection.getSelectedElement();
        const children = Array.from(item.getCommonAncestor().getChildren());
        const indexOfSelectedBlock = children.indexOf(selectedBlock);
        const prevSibling = children[indexOfSelectedBlock - 1];
        const nextSibling = children[indexOfSelectedBlock + 1];
        const maxWidthTemplateSibling = [prevSibling, nextSibling].find(
          sibling => sibling && sibling.is('paragraph') && sibling.hasAttribute('max-width-template-block')
        );

        if (value) {
          writer.setAttribute('max-width', true, selectedBlock);

          if (selectedBlock.parent.hasAttribute('max-width-template-block')) {
            return;
          }

          if (maxWidthTemplateSibling != null) {
            const firstPosition = writer.createPositionAt(maxWidthTemplateSibling, 0);
            writer.move(writer.createRangeOn(selectedBlock), firstPosition);

            return;
          }

          const firstWrapChild = children
            .slice(0, indexOfSelectedBlock)
            .reverse()
            .find(child => !child.is('text'));
          const endWrapChild = children.slice(indexOfSelectedBlock + 1).find(child => !child.is('text'));
          const startWrapPosition = firstWrapChild
            ? writer.createPositionAfter(firstWrapChild)
            : writer.createPositionBefore(children[0]);
          const endWrapPosition = writer.createPositionAfter(selectedBlock);
          const range = writer.createRange(startWrapPosition, endWrapPosition);
          writer.wrap(range, 'paragraph');
          writer.setAttribute('max-width-template-block', true, selectedBlock.parent);
        } else {
          writer.removeAttribute('max-width', selectedBlock);

          const parent = item.getCommonAncestor();
          const hasOtherMaxWidthChildren = Array.from(parent.getChildren())
            .filter(child => child !== selectedBlock)
            .some(child => child.hasAttribute('max-width'));

          if (parent.hasAttribute('max-width-template-block') && !hasOtherMaxWidthChildren) {
            writer.unwrap(parent);
          }
        }
      }
    });
  }
}
