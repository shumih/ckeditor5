/**
 * @module video/videoupload/videouploadprogress
 */

/* globals setTimeout */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import uploadingPlaceholder from '../../theme/icons/image_placeholder.svg';
import env from '@ckeditor/ckeditor5-utils/src/env';

import '../../theme/videouploadprogress.css';
import '../../theme/videouploadicon.css';
import '../../theme/videouploadloader.css';

/**
 * The video upload progress plugin.
 * It shows a placeholder when the video is read from the disk and a progress bar while the video is uploading.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadProgress extends Plugin {
  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);

    /**
     * The video placeholder that is displayed before real video data can be accessed.
     *
     * @protected
     * @member {String} #placeholder
     */
    this.placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(uploadingPlaceholder);
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    // Upload status change - update video's view according to that status.
    editor.editing.downcastDispatcher.on('attribute:uploadStatus:video', (...args) => this.uploadStatusChange(...args));
  }

  /**
   * This method is called each time the video `uploadStatus` attribute is changed.
   *
   * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
   * @param {Object} data Additional information about the change.
   * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
   */
  async uploadStatusChange(evt, data, conversionApi) {
    const editor = this.editor;
    const modelVideo = data.item;
    const uploadId = modelVideo.getAttribute('uploadId');

    if (!conversionApi.consumable.consume(data.item, evt.name)) {
      return;
    }

    const fileRepository = editor.plugins.get(FileRepository);
    const status = uploadId ? data.attributeNewValue : null;
    const placeholder = this.placeholder;
    const viewFigure = editor.editing.mapper.toViewElement(modelVideo);
    const viewWriter = conversionApi.writer;

    if (status == 'reading') {
      // Start "appearing" effect and show placeholder with infinite progress bar on the top
      // while video is read from disk.
      _startAppearEffect(viewFigure, viewWriter);
      _showPlaceholder(placeholder, viewFigure, viewWriter);

      return;
    }

    // Show progress bar on the top of the video when video is uploading.
    if (status == 'uploading') {
      const loader = fileRepository.loaders.get(uploadId);

      // Start appear effect if needed - see https://github.com/ckeditor/ckeditor5-video/issues/191.
      _startAppearEffect(viewFigure, viewWriter);

      if (!loader) {
        // There is no loader associated with uploadId - this means that video came from external changes.
        // In such cases we still want to show the placeholder until video is fully uploaded.
        // Show placeholder if needed - see https://github.com/ckeditor/ckeditor5-video/issues/191.
        _showPlaceholder(placeholder, viewFigure, viewWriter);
      } else {
        // Hide placeholder and initialize progress bar showing upload progress.
        _hidePlaceholder(viewFigure, viewWriter);
        _showProgressBar(viewFigure, viewWriter, loader, editor.editing.view);
        _displayLocalVideo(viewFigure, viewWriter, loader);
      }

      return;
    }

    // Because in Edge there is no way to show fancy animation of completeIcon we need to skip it.
    if (status == 'complete' && fileRepository.loaders.get(uploadId) && !env.isEdge) {
      _showCompleteIcon(viewFigure, viewWriter, editor.editing.view);
    }

    // Clean up.
    _hideProgressBar(viewFigure, viewWriter);
    _hidePlaceholder(viewFigure, viewWriter);
    _stopAppearEffect(viewFigure, viewWriter);
  }
}

// Adds ck-appear class to the video figure if one is not already applied.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function _startAppearEffect(viewFigure, writer) {
  if (!viewFigure.hasClass('ck-appear')) {
    writer.addClass('ck-appear', viewFigure);
  }
}

// Removes ck-appear class to the video figure if one is not already removed.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function _stopAppearEffect(viewFigure, writer) {
  writer.removeClass('ck-appear', viewFigure);
}

// Shows placeholder together with infinite progress bar on given video figure.
//
// @param {String} Data-uri with a svg placeholder.
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function _showPlaceholder(placeholder, viewFigure, writer) {
  if (!viewFigure.hasClass('ck-video-upload-placeholder')) {
    writer.addClass('ck-video-upload-placeholder', viewFigure);
  }

  const viewImg = viewFigure.getChild(0);

  if (viewImg.getAttribute('src') !== placeholder) {
    writer.setAttribute('src', placeholder, viewImg);
  }

  if (!_getUIElement(viewFigure, 'placeholder')) {
    writer.insert(writer.createPositionAfter(viewImg), _createPlaceholder(writer));
  }
}

// Removes placeholder together with infinite progress bar on given video figure.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function _hidePlaceholder(viewFigure, writer) {
  if (viewFigure.hasClass('ck-video-upload-placeholder')) {
    writer.removeClass('ck-video-upload-placeholder', viewFigure);
  }

  _removeUIElement(viewFigure, writer, 'placeholder');
}

// Shows progress bar displaying upload progress.
// Attaches it to the file loader to update when upload percentace is changed.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:upload/filerepository~FileLoader} loader
// @param {module:engine/view/view~View} view
function _showProgressBar(viewFigure, writer, loader, view) {
  const progressBar = _createProgressBar(writer);
  writer.insert(writer.createPositionAt(viewFigure, 'end'), progressBar);

  // Update progress bar width when uploadedPercent is changed.
  loader.on('change:uploadedPercent', (evt, name, value) => {
    view.change(writer => {
      writer.setStyle('width', value + '%', progressBar);
    });
  });
}

// Hides upload progress bar.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function _hideProgressBar(viewFigure, writer) {
  _removeUIElement(viewFigure, writer, 'progressBar');
}

// Shows complete icon and hides after a certain amount of time.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/view~View} view
function _showCompleteIcon(viewFigure, writer, view) {
  const completeIcon = writer.createUIElement('div', { class: 'ck-video-upload-complete-icon' });

  writer.insert(writer.createPositionAt(viewFigure, 'end'), completeIcon);

  setTimeout(() => {
    view.change(writer => writer.remove(writer.createRangeOn(completeIcon)));
  }, 3000);
}

// Create progress bar element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @returns {module:engine/view/uielement~UIElement}
function _createProgressBar(writer) {
  const progressBar = writer.createUIElement('div', { class: 'ck-progress-bar' });

  writer.setCustomProperty('progressBar', true, progressBar);

  return progressBar;
}

// Create placeholder element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @returns {module:engine/view/uielement~UIElement}
function _createPlaceholder(writer) {
  const placeholder = writer.createUIElement('div', { class: 'ck-upload-placeholder-loader' });

  writer.setCustomProperty('placeholder', true, placeholder);

  return placeholder;
}

// Returns {@link module:engine/view/uielement~UIElement} of given unique property from video figure element.
// Returns `undefined` if element is not found.
//
// @private
// @param {module:engine/view/element~Element} videoFigure
// @param {String} uniqueProperty
// @returns {module:engine/view/uielement~UIElement|undefined}
function _getUIElement(videoFigure, uniqueProperty) {
  for (const child of videoFigure.getChildren()) {
    if (child.getCustomProperty(uniqueProperty)) {
      return child;
    }
  }
}

// Removes {@link module:engine/view/uielement~UIElement} of given unique property from video figure element.
//
// @private
// @param {module:engine/view/element~Element} videoFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {String} uniqueProperty
function _removeUIElement(viewFigure, writer, uniqueProperty) {
  const element = _getUIElement(viewFigure, uniqueProperty);

  if (element) {
    writer.remove(writer.createRangeOn(element));
  }
}

// Displays local data from file loader.
//
// @param {module:engine/view/element~Element} videoFigure
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:upload/filerepository~FileLoader} loader
async function _displayLocalVideo(viewFigure, writer, loader) {
  const file = await loader._filePromiseWrapper.promise;
  const url = URL.createObjectURL(file);

  const video = viewFigure.getChild(0);

  writer.setAttribute('src', url, video);
}
