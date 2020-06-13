import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import StencilEditing from './stencilediting';
import StencilUI from './stencilui';
import TemplateResize from './templateresize';

export default class Stencil extends Plugin {
  static get requires() {
    return [StencilEditing, StencilUI, TemplateResize];
  }

  static get pluginName() {
    return 'AngularStencil';
  }
}
