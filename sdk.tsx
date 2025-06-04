source_dir: lefthook

pre-commit:
  parallel: true
  commands:
    format:
      tags: frontend format
      glob: "*.{js,jsx,ts,tsx,scss,css,json}"
      run: npm run format {staged_files}

    lint-js:
      tags: frontend lint
      glob: "*.{js,jsx,ts,tsx}"
      run: npm run lint:js {staged_files}

    lint-css:
      tags: frontend lint
      glob: "*.scss"
      run: npm run lint:css {staged_files}

    eslint-fix:
      tags: frontend fix
      files: git diff --name-only --diff-filter=d HEAD
      glob: "*.{js,jsx,ts,tsx}"
      run: eslint --fix {files}

    stylelint-fix:
      tags: frontend fix
      files: git diff --name-only --diff-filter=d HEAD
      glob: "*.scss"
      run: stylelint --fix {files}

commit-msg:
  commands:
    check-conventional-commit:
      tags: git conventional
      run: commitlint --edit

scripts:
  "check-branch.js":
    tags: git conventional
    runner: node

  "protected-branch.js":
    tags: git consistent
    runner: node