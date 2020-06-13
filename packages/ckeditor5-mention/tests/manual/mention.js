/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Mention from '../../src/mention';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class InlineWidget extends Plugin {
  constructor(editor) {
    super(editor);

    editor.model.schema.register('placeholder', {
      allowWhere: '$text',
      isObject: true,
      isInline: true,
      allowAttributes: ['type'],
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: 'placeholder',
      view: (modelItem, viewWriter) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        return toWidget(widgetElement, viewWriter);
      },
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: 'placeholder',
      view: createPlaceholderView,
    });

    editor.conversion.for('upcast').elementToElement({
      view: 'placeholder',
      model: (viewElement, modelWriter) => {
        let type = 'general';

        if (viewElement.childCount) {
          const text = viewElement.getChild(0);

          if (text.is('text')) {
            type = text.data.slice(1, -1);
          }
        }

        return modelWriter.createElement('placeholder', { type });
      },
    });

    editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(editor.model, viewElement => viewElement.name == 'placeholder')
    );

    this._createToolbarButton();

    function createPlaceholderView(modelItem, viewWriter) {
      const widgetElement = viewWriter.createContainerElement('placeholder');
      const viewText = viewWriter.createText('{' + modelItem.getAttribute('type') + '}');

      viewWriter.insert(viewWriter.createPositionAt(widgetElement, 0), viewText);

      return widgetElement;
    }
  }

  _createToolbarButton() {
    const editor = this.editor;
    const t = editor.t;

    editor.ui.componentFactory.add('placeholder', locale => {
      const buttonView = new ButtonView(locale);

      buttonView.set({
        label: t('Insert placeholder'),
        tooltip: true,
        withText: true,
      });

      this.listenTo(buttonView, 'execute', () => {
        const model = editor.model;

        model.change(writer => {
          const placeholder = writer.createElement('placeholder', { type: 'placeholder' });

          model.insertContent(placeholder);

          writer.setSelection(placeholder, 'on');
        });
      });

      return buttonView;
    });
  }
}

ClassicEditor.create(global.document.querySelector('#editor'), {
  plugins: [ArticlePluginSet, Underline, Font, Mention, InlineWidget],
  toolbar: [
    'heading',
    '|',
    'bulletedList',
    'numberedList',
    'blockQuote',
    '|',
    'bold',
    'italic',
    'underline',
    'link',
    '|',
    'fontFamily',
    'fontSize',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'insertTable',
    'placeholder',
    '|',
    'undo',
    'redo',
  ],
  image: {
    toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative'],
  },
  mention: {
    feeds: [
      {
        marker: '@',
        feed: ['@Barney', '@Lily', '@Marshall', '@Robin', '@Ted'],
      },
      {
        marker: '#',
        feed: [
          '#a01',
          '#a02',
          '#a03',
          '#a04',
          '#a05',
          '#a06',
          '#a07',
          '#a08',
          '#a09',
          '#a10',
          '#a11',
          '#a12',
          '#a13',
          '#a14',
          '#a15',
          '#a16',
          '#a17',
          '#a18',
          '#a19',
          '#a20',
        ],
      },
    ],
  },
})
  .then(editor => {
    window.editor = editor;
  })
  .catch(err => {
    console.error(err.stack);
  });
