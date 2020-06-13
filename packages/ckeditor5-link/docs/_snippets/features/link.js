/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor, CS_CONFIG */

ClassicEditor.create(document.querySelector('#snippet-link'), {
  cloudServices: CS_CONFIG,
  toolbar: {
    items: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
    viewportTopOffset: window.getViewportTopOffsetConfig(),
  },
})
  .then(editor => {
    window.editor = editor;
  })
  .catch(err => {
    console.error(err.stack);
  });
