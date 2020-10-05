/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/***
 * All @ckeditor deps should located in root node_modules
 * Otherwise duplicate error
 */

/*** BEFORE BUILD
 *
 *  go to "node_modules/core-js/modules/_microtask.js"
 *  and remove all cases in condition except last
 *
 *	notify = function () {
    	// strange IE + webpack dev server bug - use .call(global)
    	macrotask.call(global, flush);
 	};
 *
 *
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Video from 'ckeditor5-video/src/video';
import VideoCaption from 'ckeditor5-video/src/videocaption';
import VideoStyle from 'ckeditor5-video/src/videostyle';
import VideoToolbar from 'ckeditor5-video/src/videotoolbar';
import VideoUpload from 'ckeditor5-video/src/videoupload';
import CKFinderCustomUploadAdapter from 'ckeditor5-custom-adapter-ckfinder/src/uploadadapter';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '../../ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import Aligment from '@ckeditor/ckeditor5-alignment/src/alignment';
import AngularStencil from '../../ckeditor5-angular-stencil/src/stencil';
import AngularStencilToolbar from '../../ckeditor5-angular-stencil/src/stenciltoolbar';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import MaxWidth from '../../ckeditor5-max-width/src/maxwidth';
import LineHeight from '@ckeditor/ckeditor5-font/src/lineheight';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
  Highlight,
  Essentials,
  Link,
  LineHeight,
  CKFinder,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  Video,
  VideoCaption,
  VideoStyle,
  VideoToolbar,
  VideoUpload,
  CKFinderCustomUploadAdapter,
  MediaEmbed,
  Autoformat,
  Bold,
  Italic,
  BlockQuote,
  Underline,
  List,
  Paragraph,
  PasteFromOffice,
  FontSize,
  FontColor,
  FontBackgroundColor,
  FontFamily,
  Aligment,
  Table,
  TableToolbar,
  AngularStencil,
  AngularStencilToolbar,
  MaxWidth,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: 'ru',
};
