/**
 * @module video/video/utils
 */

import { findOptimalInsertionPosition, isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Converts a given {@link module:engine/view/element~Element} to an video widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the video widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the video `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toVideoWidget(viewElement, writer, label) {
  writer.setCustomProperty('video', true, viewElement);

  return toWidget(viewElement, writer, { label: labelCreator });

  function labelCreator() {
    const imgElement = viewElement.getChild(0);
    const altText = imgElement.getAttribute('alt');

    return altText ? `${altText} ${label}` : label;
  }
}

/**
 * Checks if a given view element is an video widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isVideoWidget(viewElement) {
  return !!viewElement.getCustomProperty('video') && isWidget(viewElement);
}

/**
 * Returns an video widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedVideoWidget(selection) {
  const viewElement = selection.getSelectedElement();

  if (viewElement && isVideoWidget(viewElement)) {
    return viewElement;
  }

  return null;
}

/**
 * Checks if the provided model element is an `video`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isVideo(modelElement) {
  return !!modelElement && modelElement.is('video');
}

/**
 * Handles inserting single file. This method unifies video insertion using {@link module:widget/utils~findOptimalInsertionPosition} method.
 *
 *		model.change( writer => {
 *			insertVideo( writer, model, { src: 'path/to/video.mp4' } );
 *		} );
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {module:engine/model/model~Model} model
 * @param {Object} [attributes={}] Attributes of inserted video
 */
export function insertVideo(writer, model, attributes = {}) {
  const videoElement = writer.createElement('video', attributes);

  const insertAtSelection = findOptimalInsertionPosition(model.document.selection, model);

  model.insertContent(videoElement, insertAtSelection);

  // Inserting an video might've failed due to schema regulations.
  if (videoElement.parent) {
    writer.setSelection(videoElement, 'on');
  }
}

/**
 * Checks if video can be inserted at current model selection.
 *
 * @param {module:engine/model/model~Model} model
 * @returns {Boolean}
 */
export function isVideoAllowed(model) {
  const schema = model.schema;
  const selection = model.document.selection;

  return (
    isVideoAllowedInParent(selection, schema, model) &&
    !checkSelectionOnObject(selection, schema) &&
    isInOtherVideo(selection)
  );
}

// Checks if video is allowed by schema in optimal insertion parent.
//
// @returns {Boolean}
function isVideoAllowedInParent(selection, schema, model) {
  const parent = getInsertVideoParent(selection, model);

  return schema.checkChild(parent, 'video');
}

// Check if selection is on object.
//
// @returns {Boolean}
function checkSelectionOnObject(selection, schema) {
  const selectedElement = selection.getSelectedElement();

  return selectedElement && schema.isObject(selectedElement);
}

// Checks if selection is placed in other video (ie. in caption).
function isInOtherVideo(selection) {
  return [...selection.focus.getAncestors()].every(ancestor => !ancestor.is('video'));
}

// Returns a node that will be used to insert video with `model.insertContent` to check if video can be placed there.
function getInsertVideoParent(selection, model) {
  const insertAt = findOptimalInsertionPosition(selection, model);

  const parent = insertAt.parent;

  if (parent.isEmpty && !parent.is('$root')) {
    return parent.parent;
  }

  return parent;
}
