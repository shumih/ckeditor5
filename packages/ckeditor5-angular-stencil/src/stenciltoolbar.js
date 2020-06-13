import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getStencilWidgetAncestor } from './utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

export default class AngularStencilToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  static get pluginName() {
    return 'StencilToolbar';
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register('stencilBlockSettings', {
      items: ['stencilBlockLabel'],
      getRelatedElement: getStencilWidgetAncestor,
    });
  }
}
