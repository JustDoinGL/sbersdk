{
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "selector-pseudo-element-no-unknown": [
      true,
      {
        "ignorePseudoElements": ["/^--my-/", "input-placeholder"]
      }
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": ["global"]
      }
    ],
    "no-duplicate-selectors": null,
    "no-descending-specificity": null,
    "selector-class-pattern": null
  }
}