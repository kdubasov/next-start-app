/**
 * Заметки по кастомным правилам:
 * - font-size с нечётными px (11, 13, 15, 17...) отклоняется, чтобы держать
 *   типографическую шкалу на чётных шагах.
 * - flex-grow / flex-basis на детях не приветствуются — предпочитай
 *   grid-template на родителе.
 */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-css-modules'],
  ignoreFiles: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'public/**'],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'no-descending-specificity': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'media-feature-range-notation': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'selector-not-notation': null,
    'value-keyword-case': null,
    'comment-whitespace-inside': null,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['details-content'],
      },
    ],

    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignoreProperties: ['background-clip', 'mask-image', 'mask', 'mask-size'],
        ignore: ['consecutive-duplicates-with-different-syntaxes'],
      },
    ],

    // `!important` маскирует конфликт специфичности — поднимай селектор
    // (`.parent > .child`). Warning, а не error.
    'declaration-no-important': [true, { severity: 'warning' }],

    'no-duplicate-selectors': [true, { severity: 'warning' }],
    'block-no-empty': [true, { severity: 'warning' }],
    'declaration-property-value-no-unknown': [true, { severity: 'warning' }],
    'declaration-property-value-keyword-no-deprecated': [true, { severity: 'warning' }],

    'declaration-property-value-disallowed-list': [
      {
        '/^font-size$/': ['/^\\d*[13579]px$/'],
      },
      {
        message: (prop, value) =>
          `Avoid odd "${prop}: ${value}". Use even px steps (12, 14, 16, ...).`,
        severity: 'warning',
      },
    ],

    // `flex-shrink: 0` — load-bearing идиома для иконок/аватаров/таймстампов
    // в flex-рядах и намеренно разрешена. `flex-grow` / `flex-basis` обычно
    // сигналят о раскладке, которую лучше выразить через grid-template
    // на контейнере.
    'property-disallowed-list': [
      ['flex-grow', 'flex-basis'],
      {
        message: (prop) => `Avoid "${prop}" on children — prefer grid-template on the container.`,
        severity: 'warning',
      },
    ],
  },
};
