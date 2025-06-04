source_dir: lefthook  # Исправлено написание

pre-commit:
  parallel: true
  piped: false
  
  commands:
    # 1. Форматирование файлов
    format:
      tags: frontend format
      description: "Code formatting"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx,scss,css,json,md}"
      run: |
        if ! prettier --write {files} 2>format-errors.log; then
          echo "❌ Prettier errors detected. See errors in:"
          echo "file://$(pwd)/format-errors.log"
          echo "Run: npm run format to fix"
          exit 1
        fi
        git add {files}

    # 2. Проверка TypeScript
    type-check:
      tags: frontend types
      description: "Type checking"
      glob: "src/**/*.{ts,tsx}"
      run: |
        if ! tsc --noEmit --pretty 2>ts-errors.log; then
          echo "❌ TypeScript errors detected. See errors in:"
          echo "file://$(pwd)/ts-errors.log"
          echo "Run: npm run type-check for details"
          exit 1
        fi

    # 3. Линтинг JavaScript/TypeScript
    lint-js:
      tags: frontend lint
      description: "JS/TS linting"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx}"
      run: |
        if ! eslint --format=compact --fix {files} 2>eslint-errors.log; then
          echo "❌ ESLint errors detected. See errors in:"
          echo "file://$(pwd)/eslint-errors.log"
          echo "Problem files:"
          grep "^.*\.[jt]sx?" eslint-errors.log | uniq
          exit 1
        fi
        git add {files}

    # 4. Линтинг CSS
    lint-css:
      tags: frontend lint
      description: "CSS linting"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{scss,css}"
      run: |
        if ! stylelint --fix {files} 2>stylelint-errors.log; then
          echo "❌ Stylelint errors detected. See errors in:"
          echo "file://$(pwd)/stylelint-errors.log"
          echo "Problem files:"
          grep "^src/.*\.scss" stylelint-errors.log | uniq
          exit 1
        fi
        git add {files}

commit-msg:
  commands:
    check-commit-msg:
      run: commitlint --edit