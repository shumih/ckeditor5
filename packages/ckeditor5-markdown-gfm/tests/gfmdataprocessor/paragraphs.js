/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor as test } from '../../tests/_utils/utils';

describe('GFMDataProcessor', () => {
  describe('paragraphs', () => {
    it('single line', () => {
      test(
        'single line paragraph',

        '<p>single line paragraph</p>'
      );
    });

    it('multiline', () => {
      test(
        'first\n' + 'second\n' + 'third',

        // GitHub is rendering as:
        // <p>first<br>
        // second<br>
        // third</p>
        '<p>first<br></br>second<br></br>third</p>'
      );
    });

    it('with header after #1', () => {
      test(
        'single line\n' + '# header',

        // GitHub is rendering as:
        // <p>single line</p>
        //
        // <h1>header</h1>
        '<p>single line</p><h1>header</h1>',

        // To-markdown always put 2 empty lines after paragraph.
        'single line\n\n' + '# header'
      );
    });

    it('with header after #2', () => {
      test(
        'single line\n' + 'header\n' + '===',

        // GitHub is rendering as:
        // <p>single line</p>
        //
        // <h1>header</h1>
        '<p>single line</p><h1>header</h1>',

        // To-markdown always put 2 empty lines after paragraph and normalize header to #.
        'single line\n' + '\n' + '# header'
      );
    });

    it('with blockquote after', () => {
      test(
        'single line' + '\n> quote',

        // GitHub is rendereing as:
        // <p>single line</p>
        //
        // <blockquote>
        // <p>quote</p>
        // </blockquote>
        '<p>single line</p><blockquote><p>quote</p></blockquote>',

        // To-markdown always put 2 empty lines after paragraph.
        'single line\n' + '\n' + '> quote'
      );
    });

    it('with list after', () => {
      test(
        'single line\n' + '* item',

        // GitHub is rendering as:
        // <p>single line</p>
        //
        // <ul>
        // <li>item</li>
        // </ul>
        '<p>single line</p><ul><li>item</li></ul>',

        // To-markdown always put 2 empty lines after paragraph.
        'single line\n' + '\n' + '*   item'
      );
    });

    it('with div element after', () => {
      test(
        'single line\n' + '<div>div element</div>',

        // GitHub is rendering as:
        // <p>single line</p>
        //
        // <div>div element</div>
        '<p>single line</p><div>div element</div>',

        // To-markdown always put 2 empty lines after paragraph.
        'single line\n' + '\n' + '<div>div element</div>'
      );
    });
  });
});
