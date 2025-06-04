source_dir: lefthook  # Исправлено написание

pre-commit:
  parallel: true
  piped: false
  
  commands:
    # 1. Проверка типов TypeScript (строгая проверка)
    type-check:
      tags: typescript
      description: "Strict TypeScript type checking"
      glob: "src/**/*.{ts,tsx}"
      run: |
        tsc --noEmit --strict --pretty
        if [ $? -ne 0 ]; then
          echo "❌ Critical TypeScript errors found!"
          exit 1
        fi

    # 2. Проверка синтаксиса JavaScript/TypeScript
    syntax-check:
      tags: frontend
      description: "JavaScript/TypeScript syntax validation"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx}"
      run: |
        eslint --max-warnings=0 --rule 'no-debugger: error' --rule 'no-console: error' {files}
        if [ $? -ne 0 ]; then
          echo "❌ Critical JavaScript/TypeScript syntax errors found!"
          exit 1
        fi

    # 3. Форматирование кода
    format:
      tags: frontend format
      description: "Code formatting"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx,scss,css,json,md}"
      run: |
        prettier --write {files}
        git add {files}

    # 4. Линтинг CSS (параллельно с другими проверками)
    lint-css:
      tags: frontend lint
      description: "CSS/SCSS validation"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{scss,css}"
      run: stylelint --fix {files} && git add {files}

commit-msg:
  commands:
    check-commit-msg:
      run: commitlint --edit  # Проверка сообщения коммита