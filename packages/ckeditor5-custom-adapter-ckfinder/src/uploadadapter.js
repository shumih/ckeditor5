/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { get } from 'lodash-es';

/**
 * A plugin that write selected image inline.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinderCustomUploadAdapter extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [FileRepository];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'CKFinderCustomUploadAdapter';
  }

  /**
   * @inheritDoc
   */
  init() {
    const { videoUploadHandler } = this.editor.config.get('file');

    // Register CKFinderAdapter
    this.editor.plugins.get(FileRepository).createUploadAdapter = loader => ({
      upload: async () => {
        const file = await loader.file;

        if (file.type.startsWith('video')) {
          const path = await videoUploadHandler(file, ({ total, loaded }) => {
            loader.uploadTotal = total;
            loader.uploaded = loaded;
          });

          if (path) {
            return path;
          }
        }

        if (file.type.startsWith('image')) {
          const uploadFileFn = get(this.editor.config.get('image'), 'upload.uploadFileFn');

          return typeof uploadFileFn === 'function'
            ? uploadFileFn(file).then(href => ({
                default: href,
              }))
            : this._fileAsBase64(file);
        }
      },
      abort: () => {},
    });
  }

  _fileAsBase64(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.addEventListener('loadend', function(e) {
        const result = e.target.result;
        const source = `data:${file.type};base64, ${result.substr(result.indexOf(',') + 1)}`;

        resolve({
          default: source,
        });
      });
      reader.addEventListener('error', reject);

      reader.readAsDataURL(file.slice());
    });
  }
}
