import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import {
  FONT_BACKGROUND_COLOR,
  FONT_COLOR,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  normalizeColorCode,
} from '@ckeditor/ckeditor5-font/src/utils';

export const STENCIL_BLOCK_PROPERTY = 'STENCIL_BLOCK_PROPERTY';
export const stencilTemplateStyles = [
  {
    key: 'underline',
    downcast: modelItem => (modelItem.hasAttribute('underline') ? `text-decoration:underline;` : null),
    upcast: viewItem => (viewItem.hasStyle('text-decoration') ? viewItem.getStyle('text-decoration') : null),
  },
  {
    key: 'italic',
    downcast: modelItem => (modelItem.hasAttribute('italic') ? `font-style:italic;` : null),
    upcast: viewItem => (viewItem.hasStyle('font-style') ? viewItem.getStyle('font-style') : null),
  },
  {
    key: 'bold',
    downcast: modelItem => (modelItem.hasAttribute('bold') ? `font-weight:bold` : null),
    upcast: viewItem => (viewItem.hasStyle('font-weight') ? viewItem.getStyle('font-weight') : null),
  },
  {
    key: 'minWidth',
    downcast: modelItem =>
      modelItem.hasAttribute('minWidth') ? `min-width:${modelItem.getAttribute('minWidth')}` : null,
    upcast: viewItem => (viewItem.hasStyle('min-width') ? viewItem.getStyle('min-width') : null),
  },
  {
    key: FONT_BACKGROUND_COLOR,
    downcast: modelItem =>
      modelItem.hasAttribute(FONT_BACKGROUND_COLOR)
        ? `background-color:${modelItem.getAttribute(FONT_BACKGROUND_COLOR)}`
        : null,
    upcast: viewItem => (viewItem.hasStyle('background-color') ? viewItem.getStyle('background-color') : null),
  },
  {
    key: FONT_SIZE,
    downcast: modelItem =>
      modelItem.hasAttribute(FONT_SIZE) ? `font-size:${modelItem.getAttribute(FONT_SIZE)}px` : null,
    upcast: viewItem => (viewItem.hasStyle('font-size') ? parseFloat(viewItem.getStyle('font-size')) : null),
  },
  {
    key: FONT_FAMILY,
    downcast: modelItem =>
      modelItem.hasAttribute(FONT_FAMILY) ? `font-family:${modelItem.getAttribute(FONT_FAMILY)}` : null,
    upcast: viewItem => (viewItem.hasStyle('font-family') ? viewItem.getStyle('font-family') : null),
  },
  {
    key: FONT_COLOR,
    downcast: modelItem => (modelItem.hasAttribute(FONT_COLOR) ? `color:${modelItem.getAttribute(FONT_COLOR)}` : null),
    upcast: viewItem => (viewItem.hasStyle('color') ? normalizeColorCode(viewItem.getStyle('color')) : null),
  },
  {
    key: LINE_HEIGHT,
    downcast: modelItem =>
      modelItem.hasAttribute(LINE_HEIGHT) ? `line-height:${modelItem.getAttribute(LINE_HEIGHT)}` : null,
    upcast: viewItem => (viewItem.hasStyle('line-height') ? viewItem.getStyle('line-height') : null),
  },
];

export function getInlineStyles(modelItem) {
  return stencilTemplateStyles
    .map(({ downcast }) => downcast(modelItem))
    .filter(Boolean)
    .join(';');
}

export function parseModelStyles(viewElement) {
  const toReturn = {};

  stencilTemplateStyles.forEach(({ upcast, key }) => {
    const value = upcast(viewElement);

    if (value != null) {
      toReturn[key] = value;
    }
  });

  return toReturn;
}

export function toStencilWidget(viewElement, writer, options) {
  writer.setCustomProperty(STENCIL_BLOCK_PROPERTY, true, viewElement);

  return toWidget(viewElement, writer, options);
}

export function isStencilWidget(viewElement) {
  return !!viewElement.getCustomProperty(STENCIL_BLOCK_PROPERTY) && isWidget(viewElement);
}

export function getStencilWidgetAncestor(selection) {
  const selectedEl = selection.getSelectedElement();

  if (selectedEl && selectedEl.getCustomProperty(STENCIL_BLOCK_PROPERTY)) {
    return selectedEl;
  }

  return null;
}

export function getSchemaId(properties) {
  return 'template-' + properties.join('-');
}

export function isStencilBlockName(name) {
  return /^app-\S+-block$/.test(name);
}

export function getNextStencilWidget(selectedWidgetElement) {
  let nextStencilWidget;
  let parent = selectedWidgetElement.parent;

  for (let index in selectedWidgetElement.getPath().reverse()) {
    if (!parent) {
      break;
    }

    for (let child in parent.getChildren()) {
      if (child.endOffset < index) {
        continue;
      }

      if (child.startOffset > index) {
      }
    }

    parent = parent.parent;
  }

  return nextStencilWidget;
}

export function getSelectedStencilWidget(selection) {
  const viewElement = selection.getSelectedElement();

  if (viewElement && isStencilWidget(viewElement)) {
    return viewElement;
  }

  return null;
}

export function parseStencilBlockAttributes(elementAttributes, descriptors) {
  const toReturn = {};

  descriptors.forEach(({ name, toJSON }) => {
    toReturn[name] = toJSON(elementAttributes[name]);
  });

  return toReturn;
}

export function stringifyStencilBlockAttributes(elementAttributes, descriptors) {
  const toReturn = {};

  descriptors.forEach(({ name, toString }) => {
    toReturn[name] = toString(elementAttributes[name]);
  });

  return toReturn;
}

export function mapObject(object, fns, defaultFn) {
  const toReturn = {};

  Object.entries(object).forEach(([key, value]) => {
    const fn = fns[key] || defaultFn;

    toReturn[key] = fn ? fn(value) : value;
  });

  return toReturn;
}

export function fromAttributesToObject(attributes) {
  const toReturn = {};

  for (let [key, value] of attributes) {
    toReturn[key] = value;
  }

  return toReturn;
}

export function getElementAttributesAsObject(el) {
  const toReturn = {};

  const names = el.getAttributeNames();

  for (let name of names) {
    toReturn[name] = el.getAttribute(name);
  }

  return toReturn;
}
