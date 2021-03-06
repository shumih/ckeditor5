/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Token from '@ckeditor/ckeditor-cloud-services-core/src/token/token';

export default class TokenMock extends Token {
  /**
   * Overrides request and set the next token
   *
   * @protected
   * @returns {Promise.<Token>}
   */
  _refreshToken() {
    this.set('value', TokenMock.initialToken);

    return Promise.resolve(this);
  }

  /**
   * Overrides interval
   *
   * @protected
   */
  _startRefreshing() {}
}
