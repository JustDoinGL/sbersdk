source_dir: lefthook  # Указываем директорию для скриптов

pre-commit:
  parallel: true  # Параллельное выполнение команд
  piped: false    # Для максимальной скорости
  
  commands:
    # 1. Форматирование только измененных файлов
    format:
      tags: frontend format
      description: "Format changed files"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx,scss,css,json,md}"
      run: |
        prettier --write {files}
        git add -u  # Автоматически добавляем изменения
        
    # 2. Линтинг JS/TS (параллельно с CSS)
    lint-js:
      tags: frontend lint
      description: "Lint JS/TS files"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{js,jsx,ts,tsx}"
      run: eslint --cache --fix {files} && git add {files}
      
    # 3. Линтинг CSS (параллельно с JS)
    lint-css:
      tags: frontend lint
      description: "Lint CSS/SCSS files"
      files: git diff --name-only --diff-filter=ACMR HEAD "src/"
      glob: "*.{scss,css}"
      run: stylelint --cache --fix {files} && git add {files}

commit-msg:
  commands:
    # Проверка сообщения коммита
    check-commit-msg:
      run: commitlint --edit