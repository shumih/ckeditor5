import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';

export default class StencilUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = this.editor.t;

    // editor.editing.view.addObserver(ClickObserver);

    editor.ui.componentFactory.add(`stencilBlockLabel`, locale => {
      const command = editor.commands.get('currentTemplateBlock');
      const labelView = new LabelView(locale);

      labelView.bind('text').to(command, 'blockLabel');

      return labelView;
    });
  }
}
