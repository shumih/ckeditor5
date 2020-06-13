import { FONT_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils';

export function setFontColorConversions(editor) {
  editor.conversion.for('upcast').elementToAttribute({
    view: {
      name: 'span',
      styles: {
        color: /[\s\S]+/,
      },
    },
    model: {
      name: '$text',
      key: FONT_COLOR,
      value: renderUpcastAttribute('color'),
    },
  });

  editor.conversion.for('downcast').attributeToElement({
    model: {
      name: '$text',
      key: FONT_COLOR,
    },
    view: renderDowncastElement('color'),
  });
}
