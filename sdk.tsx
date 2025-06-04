source_dir: lefthook

pre-commit:
  parallel: true  # Оставляем ТОЛЬКО parallel (удаляем piped)
  commands:
    format:
      tags: frontend format
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx,scss,css,json,md}"
      run: prettier --write {files}

    lint-js:
      tags: frontend lint
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx}"
      run: eslint --fix {files}

    lint-css:
      tags: frontend lint
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{scss,css}"
      run: stylelint --fix {files}

commit-msg:
  commands:
    check-commit-msg:
      run: commitlint --edit