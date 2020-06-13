import { FONT_BACKGROUND_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils';

export function setFontBackgroundConversions(editor) {
  editor.conversion.for('upcast').elementToAttribute({
    view: {
      name: 'span',
      styles: {
        'background-color': /[\s\S]+/,
      },
    },
    model: {
      name: '$text',
      key: FONT_BACKGROUND_COLOR,
      value: renderUpcastAttribute('background-color'),
    },
  });

  editor.conversion.for('downcast').attributeToElement({
    model: {
      name: '$text',
      key: FONT_BACKGROUND_COLOR,
    },
    view: renderDowncastElement('background-color'),
  });
}
