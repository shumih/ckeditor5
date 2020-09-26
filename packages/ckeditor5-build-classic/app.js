import './src/style.css';
import config from './src/ckeditor-config';
import ClassicEditor from './src/ckeditor';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

ClassicEditor.create(document.querySelector('#editor'), config)
  .then(editor => {
    window.editor = editor;
    CKEditorInspector.attach(editor);
  })
  .catch(error => {
    console.error(error.stack);
  });
