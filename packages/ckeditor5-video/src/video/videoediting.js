/**
 * @module image/image/imageediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoLoadObserver from './videoloadobserver';

import { viewFigureToModel, modelToViewAttributeConverter } from './converters';

import { toVideoWidget } from './utils';

import VideoInsertCommand from './videoinsertcommand';

/**
 * The video engine plugin.
 *
 * It registers:
 *
 * * `<video>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * `'videoInsert'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoEditing';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const schema = editor.model.schema;
    const t = editor.t;
    const conversion = editor.conversion;

    // See https://github.com/ckeditor/ckeditor5-video/issues/142.
    editor.editing.view.addObserver(VideoLoadObserver);

    // Configure schema.
    schema.register('video', {
      isObject: true,
      isBlock: true,
      allowWhere: '$block',
      allowAttributes: ['alt', 'src', 'controls'],
    });

    conversion
      .for('dataDowncast')
      .elementToElement({
        model: 'video',
        view: (modelElement, viewWriter) => createVideoViewElement(viewWriter),
      })
      .add(modelToViewAttributeConverter('src'));

    conversion.for('editingDowncast').elementToElement({
      model: 'video',
      view: (modelElement, viewWriter) =>
        toVideoWidget(
          createVideoViewElement(viewWriter, modelElement.getAttribute('src')),
          viewWriter,
          t('image widget')
        ),
    });

    conversion
      .for('downcast')
      .add(modelToViewAttributeConverter('alt'))
      .add(modelToViewAttributeConverter('controls'));

    conversion
      .for('upcast')
      .elementToElement({
        view: {
          name: 'video',
          attributes: {
            src: true,
          },
        },
        model: (viewVideo, modelWriter) =>
          modelWriter.createElement('video', { src: viewVideo.getAttribute('src'), control: '' }),
      })
      .attributeToAttribute({
        view: {
          name: 'video',
          key: 'alt',
        },
        model: 'alt',
      })
      .add(viewFigureToModel());

    // Register videoUpload command.
    editor.commands.add('videoInsert', new VideoInsertCommand(editor));
  }
}

// Creates a view element representing the video.
//
//		<figure class="video">Your browser doesn't support HTML5 video tag<video></video></figure>
//
// Note that `alt` and `src` attributes are converted separately, so they are not included.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @returns {module:engine/view/containerelement~ContainerElement}
export function createVideoViewElement(writer, src) {
  const videoElement = writer.createContainerElement('video', { controls: '', src });
  const figure = writer.createContainerElement('figure', { class: 'video' });

  writer.insert(writer.createPositionAt(figure, 0), videoElement);

  return figure;
}
