import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SetMaxWidthTemplateBlockCommand from './commands/setmaxwidthtemplateblockcommand';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import fullscreenIcon from '../theme/fullscreen.svg';
import frameIcon from '../theme/frameicon.svg';

export default class MaxWidth extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'MaxWidth';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    editor.commands.add('setMaxWidth', new SetMaxWidthTemplateBlockCommand(editor));

    editor.model.schema.extend('paragraph', {
      allowAttributes: 'max-width-template-block',
    });

    editor.model.schema.extend('stencilTemplatePreview', {
      allowAttributes: 'max-width',
    });

    this._initWrapperConverters();
    this._initBlockConverters();

    editor.ui.componentFactory.add('maxWidth', () => {
      const command = editor.commands.get('setMaxWidth');
      const buttonView = new ButtonView();

      buttonView.set({
        icon: frameIcon,
        label: 'Занимать всю доступную ширину',
        tooltip: true,
      });

      // Bind button model to command.
      buttonView.bind('isOn', 'isEnabled').to(command, 'isActive', 'isEnabled');
      buttonView.bind('icon').to(command, 'isStencilTemplateSelected', value => (value ? fullscreenIcon : frameIcon));

      // Execute command.
      this.listenTo(buttonView, 'execute', () => editor.execute('setMaxWidth', !command.isActive));

      return buttonView;
    });
  }

  _initWrapperConverters() {
    this.editor.conversion.for('downcast').add(dispatcher =>
      dispatcher.on('attribute:max-width-template-block:paragraph', (evt, data, conversionApi) => {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const p = conversionApi.mapper.toViewElement(data.item);

        if (data.attributeNewValue !== null) {
          viewWriter.addClass('ck-max-width-template-block-wrapper', p);
        } else {
          viewWriter.removeClass('ck-max-width-template-block-wrapper', p);
        }
      })
    );

    this.editor.conversion.for('upcast').attributeToAttribute({
      view: {
        name: 'p',
        key: 'class',
        value: 'ck-max-width-template-block-wrapper',
      },
      model: {
        key: 'max-width-template-block',
        value: true,
      },
    });
  }

  _initBlockConverters() {
    const { blocks } = this.editor.config.get('stencil');

    this.editor.conversion.for('downcast').add(dispatcher =>
      dispatcher.on('attribute:max-width:stencilTemplatePreview', (evt, data, conversionApi) => {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const section = conversionApi.mapper.toViewElement(data.item);

        if (data.attributeNewValue !== null) {
          viewWriter.addClass('ck-max-width', section);
        } else {
          viewWriter.removeClass('ck-max-width', section);
        }
      })
    );

    blocks.forEach(({ selector }) => {
      this.editor.conversion.for('upcast').attributeToAttribute({
        view: {
          name: selector,
          key: 'class',
          value: 'ck-max-width',
        },
        model: {
          key: 'max-width',
          value: true,
        },
      });
    });
  }
}
