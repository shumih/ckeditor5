/**
 * @module video/videoupload/videouploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import videoIcon from '../../theme/icons/videotoolbaricon.svg';
import { createVideoTypeRegExp } from './utils';

/**
 * The video upload button plugin.
 *
 * For a detailed overview, check the {@glink features/video-upload/video-upload Video upload feature} documentation.
 *
 * Adds the `'videoUpload'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadUI extends Plugin {
  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = editor.t;

    // Setup `videoUpload` button.
    editor.ui.componentFactory.add('videoUpload', locale => {
      const view = new FileDialogButtonView(locale);
      const command = editor.commands.get('videoUpload');
      const videoTypes = editor.config.get('video.upload.types');
      const videoTypesRegExp = createVideoTypeRegExp(videoTypes);

      view.set({
        acceptedType: videoTypes.map(type => `video/${type}`).join(','),
        allowMultipleFiles: true,
      });

      view.buttonView.set({
        label: t('Insert video'),
        icon: videoIcon,
        tooltip: true,
      });

      view.buttonView.bind('isEnabled').to(command);

      view.on('done', (evt, files) => {
        const videosToUpload = Array.from(files).filter(file => videoTypesRegExp.test(file.type));

        if (videosToUpload.length) {
          editor.execute('videoUpload', { file: videosToUpload });
        }
      });

      return view;
    });
  }
}
