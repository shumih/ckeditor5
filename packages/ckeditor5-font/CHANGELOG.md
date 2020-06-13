Changelog
=========

## [11.1.1](https://github.com/ckeditor/ckeditor5-font/compare/v11.1.0...v11.1.1) (2019-06-05)

### Other changes

* Updated translations. ([cca7b24](https://github.com/ckeditor/ckeditor5-font/commit/cca7b24)) 


## [11.1.0](https://github.com/ckeditor/ckeditor5-font/compare/v11.0.0...v11.1.0) (2019-04-10)

### Features

* Introduced font color and font background color features. Closes [ckeditor/ckeditor5#1457](https://github.com/ckeditor/ckeditor5/issues/1457). ([c456b2a](https://github.com/ckeditor/ckeditor5-font/commit/c456b2a))
* Marked font size and font family as a formatting attribute using the `AttributeProperties#isFormatting` property. Closes [ckeditor/ckeditor5#1664](https://github.com/ckeditor/ckeditor5/issues/1664). ([d9f0a51](https://github.com/ckeditor/ckeditor5-font/commit/d9f0a51))

### Other changes

* Optimized icons. ([47ca23f](https://github.com/ckeditor/ckeditor5-font/commit/47ca23f))
* Updated translations. ([6f3332f](https://github.com/ckeditor/ckeditor5-font/commit/6f3332f)) ([f756b70](https://github.com/ckeditor/ckeditor5-font/commit/f756b70))


## [11.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.4...v11.0.0) (2019-02-28)

### Other changes

* Updated translations. ([1c5bf6d](https://github.com/ckeditor/ckeditor5-font/commit/1c5bf6d)) ([2aca096](https://github.com/ckeditor/ckeditor5-font/commit/2aca096)) ([394952f](https://github.com/ckeditor/ckeditor5-font/commit/394952f))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.3...v10.0.4) (2018-12-05)

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([e253314](https://github.com/ckeditor/ckeditor5-font/commit/e253314))


## [10.0.3](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.2...v10.0.3) (2018-10-08)

### Other changes

* Updated translations. ([92d00ee](https://github.com/ckeditor/ckeditor5-font/commit/92d00ee))


## [10.0.2](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.1...v10.0.2) (2018-07-18)

### Other changes

* Updated translations. ([63122d1](https://github.com/ckeditor/ckeditor5-font/commit/63122d1))


## [10.0.1](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.0...v10.0.1) (2018-06-21)

### Bug fixes

* Ensured that font size's and font family's markup is always "outside" markup of other typical inline features, especially those changing background color. Thanks to that, the entire area of styled text will be correctly colored. Closes [ckeditor/ckeditor5-highlight#17](https://github.com/ckeditor/ckeditor5-highlight/issues/17). ([3b8b6dc](https://github.com/ckeditor/ckeditor5-font/commit/3b8b6dc))

### Other changes

* Updated translations.


## [10.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([99a4f33](https://github.com/ckeditor/ckeditor5-font/commit/99a4f33))
* Updated translations. ([b36205c](https://github.com/ckeditor/ckeditor5-font/commit/b36205c))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Other changes

* Updated translations. ([e750c16](https://github.com/ckeditor/ckeditor5-font/commit/e750c16))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Aligned `ElementDefinition` usage to the changes in the engine. See [ckeditor/ckeditor5#742](https://github.com/ckeditor/ckeditor5/issues/742). ([5705b42](https://github.com/ckeditor/ckeditor5-font/commit/5705b42))

### BREAKING CHANGES

* In the custom format of the font size configuration the `view.style`, `view.class` and `view.attribute` properties are now called `view.styles`, `view.classes` and `view.attributes`.


## 1.0.0-beta.1 (2018-03-15)

### Features

* The initial font feature implementation. Closes [#2](https://github.com/ckeditor/ckeditor5-font/issues/2). Closes [#3](https://github.com/ckeditor/ckeditor5-font/issues/3). Closes [#4](https://github.com/ckeditor/ckeditor5-font/issues/4). ([a527fe7](https://github.com/ckeditor/ckeditor5-font/commit/a527fe7))
