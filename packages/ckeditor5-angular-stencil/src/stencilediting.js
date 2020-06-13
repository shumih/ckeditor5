import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import InsertTemplateCommand from './commands/inserttemplatecommand';

import '../theme/stencilediting.css';
import {
  getInlineStyles,
  getNextStencilWidget,
  isStencilBlockName,
  parseModelStyles,
  toStencilWidget,
  stencilTemplateStyles,
} from './utils';
import CurrentTemplateBlockCommand from './commands/currenttemplateblockcommand';

export default class StencilEditing extends Plugin {
  init() {
    const editor = this.editor;

    this._defineSchema(editor);
    this._defineConverters(editor);
    this._defineCommands(editor);

    this.editor.keystrokes.set('Tab', (...args) => this._handleTabOnSelectedBlock(...args), { priority: 'low' });
  }

  _handleTabOnSelectedBlock(domEventData, cancel) {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    const selectedElement = selection.getSelectedElement();
    const nextSibling = selectedElement && getNextStencilWidget(selectedElement);

    if (!selectedElement || !isStencilBlockName(selectedElement.name) || !nextSibling) {
      return;
    }

    cancel();

    editor.model.change(writer => {
      const range = writer.createRangeIn(nextSibling);

      writer.setSelection(range);
    });
  }

  _defineSchema(editor) {
    const schema = editor.model.schema;
    const textDefinition = schema.getDefinition('$text');

    schema.register('stencilTemplatePreview', {
      allowIn: [...textDefinition.allowIn, 'tableCell'],
      allowAttributes: ['selector', ...stencilTemplateStyles.map(item => item.key)],
      isInline: true,
      isObject: true,
    });
  }

  _defineConverters(editor) {
    const schema = editor.model.schema;
    const conversion = editor.conversion;

    const { blocks, createBlock } = editor.config.get('stencil');
    const blockSelectorToDescriptors = {};

    blocks.forEach(({ selector, descriptors }) => {
      blockSelectorToDescriptors[selector] = descriptors;

      conversion.for('upcast').elementToElement({
        view: {
          name: selector,
          classes: 'stencil-template',
        },
        model: (viewElement, modelWriter) => {
          return modelWriter.createElement('stencilTemplatePreview', {
            selector,
            properties: viewElement.getAttribute('data-properties'),
            ...parseModelStyles(viewElement),
          });
        },
      });

      conversion.for('dataDowncast').elementToElement({
        model: 'stencilTemplatePreview',
        view: (modelItem, viewWriter) =>
          viewWriter.createContainerElement(selector, {
            class: 'stencil-template',
            style: getInlineStyles(modelItem),
          }),
      });

      schema.extend('stencilTemplatePreview', {
        allowAttributes: descriptors.map(d => d.name),
      });

      descriptors.forEach(({ name }) => {
        editor.conversion.attributeToAttribute({
          view: `data-${name}`,
          model: name,
        });
      });
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'stencilTemplatePreview',
      view: (modelElement, viewWriter) => {
        const selector = modelElement.getAttribute('selector');
        const properties = modelElement.getAttribute('properties');

        const section = viewWriter.createContainerElement('section', {
          class: 'stencil-template-preview',
          'data-selector': selector,
          'data-properties': properties,
          style: getInlineStyles(modelElement),
        });

        const templateWrapper = viewWriter.createUIElement(
          'div',
          {
            class: 'stencil-template-wrapper',
          },
          function(domDocument) {
            const domElement = this.toDomElement(domDocument);

            // This the place where Angular renders the actual block hosted
            // by a UIElement in the view. You are using a function (renderer) passed as
            // editor.config.stencil#createBock.
            const block = blocks.find(b => String(b.properties) === properties);

            createBlock(block, domElement);

            return domElement;
          }
        );

        viewWriter.insert(viewWriter.createPositionAt(section, 0), templateWrapper);

        return toStencilWidget(section, viewWriter);
      },
    });

    editor.conversion.for('downcast').add(dispatcher => {
      dispatcher.on('attribute', (evt, data, conversionApi) => {
        if (data.item.name !== 'stencilTemplatePreview') {
          return;
        }

        const viewWriter = conversionApi.writer;
        const viewElement = conversionApi.mapper.toViewElement(data.item);

        if (data.attributeNewValue) {
          viewWriter.setAttribute('style', getInlineStyles(data.item), viewElement);
        }
      });
    });
  }

  _defineCommands(editor) {
    const blocks = editor.config.get('stencil').blocks;

    editor.commands.add('insertTemplateBlock', new InsertTemplateCommand(editor));
    editor.commands.add('currentTemplateBlock', new CurrentTemplateBlockCommand(editor, blocks));
  }

  static get requires() {
    return [];
  }
}
