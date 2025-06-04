# lefthook.yml
source_dir: lefthook

pre-commit:
  parallel: true  # Параллельное выполнение независимых задач
  piped: true     # Передавать только изменённые файлы между командами
  
  commands:
    # 1. Форматирование изменённых файлов в src/
    format:
      tags: frontend format
      description: "Format changed files in src/"
      files: git diff --name-only --diff-filter=ACMRT HEAD "src/"
      glob: "*.{js,jsx,ts,tsx,scss,css,json,md}"
      run: prettier --write {files}

    # 2. Линтинг JavaScript/TypeScript
    lint-js:
      tags: frontend lint
      description: "Lint changed JS/TS files in src/"
      files: git diff --name-only --diff-filter=ACMRT HEAD "src/"
      glob: "*.{js,jsx,ts,tsx}"
      run: eslint --fix --max-warnings=0 {files}

    # 3. Линтинг CSS/SCSS
    lint-css:
      tags: frontend lint
      description: "Lint changed SCSS files in src/"
      files: git diff --name-only --diff-filter=ACMRT HEAD "src/"
      glob: "*.{scss,css}"
      run: stylelint --fix {files}

    # 4. Проверка типов TypeScript (только для ts-файлов)
    type-check:
      tags: frontend types
      description: "Type check changed TS files"
      files: git diff --name-only --diff-filter=ACMRT HEAD "src/"
      glob: "*.{ts,tsx}"
      run: tsc --noEmit --pretty {files}

commit-msg:
  commands:
    # Проверка соответствия Conventional Commits
    check-commit-msg:
      tags: git convention
      run: commitlint --edit

scripts:
  # Проверка названия ветки
  "check-branch":
    runner: node
    tags: git branch
    script: "./scripts/check-branch.js"

  # Защита основных веток
  "protected-branch":
    runner: node
    tags: git protection
    script: "./scripts/protected-branch.js"