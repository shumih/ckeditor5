/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor.create(document.querySelector('#snippet-basic-styles'), {
  toolbar: {
    items: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
      'code',
      '|',
      'removeFormat',
      '|',
      'undo',
      'redo',
    ],
    viewportTopOffset: window.getViewportTopOffsetConfig(),
  },
  cloudServices: CS_CONFIG,
})
  .then(editor => {
    window.editor = editor;
  })
  .catch(err => {
    console.error(err);
  });
