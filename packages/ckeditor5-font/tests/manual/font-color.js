/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '../../src/fontcolor';
import FontBackgroundColor from '../../src/fontbackgroundcolor';

ClassicEditor.create(document.querySelector('#editor'), {
  plugins: [ArticlePluginSet, FontColor, FontBackgroundColor],
  toolbar: [
    'heading',
    '|',
    'fontColor',
    'fontBackgroundColor',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote',
    'undo',
    'redo',
  ],
})
  .then(editor => {
    window.editor = editor;
  })
  .catch(err => {
    console.error(err.stack);
  });
