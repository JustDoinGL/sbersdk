{
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "indentation": 2,
    "custom-media-pattern": null,
    "custom-property-pattern": null,
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "string-quotes": "double",
    "font-family-name-quotes": "always-where-recommended"
  },
  "overrides": [
    {
      "files": ["**/*.scss"],
      "customSyntax": "postcss-scss"
    }
  ]
}