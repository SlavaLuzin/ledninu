Инструкции для деплоя на Netlify

1. Поместите файлы проекта в репозиторий (deld.txt, index.html, admin.html, styles.css, app.js).
2. Добавьте netlify/functions/update-deld.js в папку functions (Netlify `functions`).
3. В Netlify Site settings -> Build & deploy -> Environment добавьте:
   - GITHUB_TOKEN — персональный token с правами записи в репозиторий (scope: repo)
   - GITHUB_REPO — owner/repo (например: user/my-ledninu)
   - GITHUB_BRANCH — (опционально) ветка, default main
4. Настройте сборку: для статического сайта build command можно оставить пустым; Netlify автоматически развернёт.
5. Панель администратора доступна по /admin.html. Она вызывает функцию /.netlify/functions/update-deld, которая обновит deld.txt в репозитории, что создаст новый коммит.

Безопасность: токен имеет доступ к репозиторию — храните его в переменных окружения Netlify.

