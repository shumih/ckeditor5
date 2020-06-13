import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';
import TemplateResizeCommand from './commands/templateresizecommand';

import '../theme/templateresize.css';

/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TemplateResize extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [WidgetResize];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'TemplateResize';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const command = new TemplateResizeCommand(editor);
    const { blocks } = editor.config.get('stencil');

    this._registerSchema();
    this._registerConverters(blocks);

    editor.commands.add('templateResize', command);

    editor.editing.downcastDispatcher.on(
      'insert:stencilTemplatePreview',
      (evt, data, conversionApi) => {
        const widget = conversionApi.mapper.toViewElement(data.item);

        const resizer = editor.plugins.get(WidgetResize).attachTo({
          unit: 'px',

          modelElement: data.item,
          viewElement: widget,
          editor,

          getHandleHost(domWidgetElement) {
            return domWidgetElement.querySelector('.stencil-template-wrapper');
          },
          getResizeHost(domWidgetElement) {
            return domWidgetElement;
          },

          isCentered() {
            return false;
          },

          onCommit(newValue) {
            editor.execute('templateResize', { width: newValue });
          },
        });

        resizer.on('updateSize', () => {
          if (!widget.hasClass('template_resized')) {
            editor.editing.view.change(writer => {
              writer.addClass('template_resized', widget);
            });
          }
        });

        resizer.bind('isEnabled').to(command);
      },
      { priority: 'low' }
    );
  }

  /**
   * @private
   */
  _registerSchema() {
    this.editor.model.schema.extend('stencilTemplatePreview', {
      allowAttributes: 'minWidth',
    });
  }

  /**
   * Registers image resize converters.
   *
   * @private
   */
  _registerConverters(blocks) {
    const editor = this.editor;

    // Dedicated converter to propagate image's attribute to the img tag.
    editor.conversion.for('downcast').add(dispatcher =>
      dispatcher.on('attribute:width:stencilTemplatePreview', (evt, data, conversionApi) => {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const figure = conversionApi.mapper.toViewElement(data.item);

        if (data.attributeNewValue !== null) {
          viewWriter.setStyle('min-width', data.attributeNewValue, figure);
          viewWriter.addClass('template_resized', figure);
        } else {
          viewWriter.removeStyle('min-width', figure);
          viewWriter.removeClass('template_resized', figure);
        }
      })
    );

    blocks.forEach(({ selector }) => {
      editor.conversion.for('upcast').attributeToAttribute({
        view: {
          name: selector,
          styles: {
            width: /.+/,
          },
        },
        model: {
          key: 'minWidth',
          value: viewElement => viewElement.getStyle('min-width'),
        },
      });
    });
  }
}

/**
 * The available options are `'px'` or `'%'`.
 *
 * Determines the size unit applied to the resized image.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				image: {
 *					resizeUnit: 'px'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *
 * This option is used by the {@link module:image/imageresize~ImageResize} feature.
 *
 * @default '%'
 * @member {String} module:image/image~ImageConfig#resizeUnit
 */
