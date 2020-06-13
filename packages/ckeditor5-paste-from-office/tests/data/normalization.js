/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../src/pastefromoffice';

import { generateTests } from '../_utils/utils';

const browsers = ['chrome', 'firefox', 'safari', 'edge'];

const editorConfig = {
  plugins: [Clipboard, PasteFromOffice],
};

describe('Paste from Office', () => {
  generateTests({
    input: 'basic-styles',
    type: 'normalization',
    browsers,
    editorConfig,
  });

  generateTests({
    input: 'image',
    type: 'normalization',
    browsers,
    editorConfig,
  });

  generateTests({
    input: 'link',
    type: 'normalization',
    browsers,
    editorConfig,
  });

  generateTests({
    input: 'list',
    type: 'normalization',
    browsers,
    editorConfig,
  });

  generateTests({
    input: 'spacing',
    type: 'normalization',
    browsers,
    editorConfig,
  });
});
