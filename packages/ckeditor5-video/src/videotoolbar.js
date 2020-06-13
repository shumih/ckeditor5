/**
 * @module video/videotoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedVideoWidget } from './video/utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

/**
 * The video toolbar plugin. It creates and manages the video toolbar (the toolbar displayed when an video is selected).
 *
 * For a detailed overview, check the {@glink features/video#video-contextual-toolbar video contextual toolbar} documentation.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:video/video~VideoConfig#toolbar `video.toolbar` configuration option}.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoToolbar extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [WidgetToolbarRepository];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'VideoToolbar';
  }

  /**
   * @inheritDoc
   */
  afterInit() {
    const editor = this.editor;
    const t = editor.t;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register('video', {
      ariaLabel: t('Video toolbar'),
      items: editor.config.get('video.toolbar') || [],
      getRelatedElement: getSelectedVideoWidget,
    });
  }
}

/**
 * Items to be placed in the video toolbar.
 * This option is used by the {@link module:video/videotoolbar~VideoToolbar} feature.
 *
 * Assuming that you use the following features:
 *
 * * {@link module:video/videostyle~VideoStyle} (with a default configuration),
 * * {@link module:video/videotextalternative~VideoTextAlternative},
 *
 * three toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
 * `'videoStyle:full'`, `'videoStyle:side'`, and `'videoTextAlternative'` so you can configure the toolbar like this:
 *
 *		const videoConfig = {
 *			toolbar: [ 'videoStyle:full', 'videoStyle:side', '|', 'videoTextAlternative' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:video/video~VideoConfig#toolbar
 */
