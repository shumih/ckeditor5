/**
 * @module video/videostyle/utils
 */

/* globals console */

import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Default video styles provided by the plugin that can be referred in the
 * {@link module:video/video~VideoConfig#styles} configuration.
 *
 * Among them, 2 default semantic content styles are available:
 *
 * * `full` is a full–width video without any CSS class,
 * * `side` is a side video styled with the `video-style-side` CSS class.
 *
 * There are also 3 styles focused on formatting:
 *
 * * `alignLeft` aligns the video to the left using the `video-style-align-left` class,
 * * `alignCenter` centers the video using the `video-style-align-center` class,
 * * `alignRight` aligns the video to the right using the `video-style-align-right` class,
 *
 * @member {Object.<String,Object>}
 */
const defaultStyles = {
  // This option is equal to the situation when no style is applied.
  full: {
    name: 'full',
    title: 'Full size video',
    icon: fullWidthIcon,
    isDefault: true,
  },

  // This represents a side video.
  side: {
    name: 'side',
    title: 'Side video',
    icon: rightIcon,
    className: 'video-style-side',
  },

  // This style represents an video aligned to the left.
  alignLeft: {
    name: 'alignLeft',
    title: 'Left aligned video',
    icon: leftIcon,
    className: 'video-style-align-left',
  },

  // This style represents a centered video.
  alignCenter: {
    name: 'alignCenter',
    title: 'Centered video',
    icon: centerIcon,
    className: 'video-style-align-center',
  },

  // This style represents an video aligned to the right.
  alignRight: {
    name: 'alignRight',
    title: 'Right aligned video',
    icon: rightIcon,
    className: 'video-style-align-right',
  },
};

/**
 * Default video style icons provided by the plugin that can be referred in the
 * {@link module:video/video~VideoConfig#styles} configuration.
 *
 * There are 4 icons available: `'full'`, `'left'`, `'center'` and `'right'`.
 *
 * @member {Object.<String, String>}
 */
const defaultIcons = {
  full: fullWidthIcon,
  left: leftIcon,
  right: rightIcon,
  center: centerIcon,
};

/**
 * Returns a {@link module:video/video~VideoConfig#styles} array with items normalized in the
 * {@link module:video/videostyle/videostyleediting~VideoStyleFormat} format and a complete `icon` markup for each style.
 *
 * @returns {Array.<module:video/videostyle/videostyleediting~VideoStyleFormat>}
 */
export function normalizeVideoStyles(configuredStyles = []) {
  return configuredStyles.map(_normalizeStyle);
}

// Normalizes an video style provided in the {@link module:video/video~VideoConfig#styles}
// and returns it in a {@link module:video/videostyle/videostyleediting~VideoStyleFormat}.
//
// @param {Object} style
// @returns {@link module:video/videostyle/videostyleediting~VideoStyleFormat}
function _normalizeStyle(style) {
  // Just the name of the style has been passed.
  if (typeof style == 'string') {
    const styleName = style;

    // If it's one of the defaults, just use it.
    if (defaultStyles[styleName]) {
      // Clone the style to avoid overriding defaults.
      style = Object.assign({}, defaultStyles[styleName]);
    }
    // If it's just a name but none of the defaults, warn because probably it's a mistake.
    else {
      console.warn(attachLinkToDocumentation('video-style-not-found: There is no such video style of given name.'), {
        name: styleName,
      });

      // Normalize the style anyway to prevent errors.
      style = {
        name: styleName,
      };
    }
  }
  // If an object style has been passed and if the name matches one of the defaults,
  // extend it with defaults – the user wants to customize a default style.
  // Note: Don't override the user–defined style object, clone it instead.
  else if (defaultStyles[style.name]) {
    const defaultStyle = defaultStyles[style.name];
    const extendedStyle = Object.assign({}, style);

    for (const prop in defaultStyle) {
      if (!style.hasOwnProperty(prop)) {
        extendedStyle[prop] = defaultStyle[prop];
      }
    }

    style = extendedStyle;
  }

  // If an icon is defined as a string and correspond with a name
  // in default icons, use the default icon provided by the plugin.
  if (typeof style.icon == 'string' && defaultIcons[style.icon]) {
    style.icon = defaultIcons[style.icon];
  }

  return style;
}
