# STANCE CRIME — Sprite Lab v20

Откройте index.html или GitHub Pages. Scene Preview использует общую библиотеку, фоновые изображения остаются внутри scene-preview/sprites.

## Добавление ресурсов
Создайте отдельную папку sprites/characters/ID или sprites/vehicles/ID. Имена файлов персонажа: man-front, man, man-side, man-three-quarter-back, man-back (достаточно одного). Для статической сцены автомобиля нужен side; для поездки нужны rear, left, leftmini, right, rightmini. PNG и WebP поддерживаются, WebP имеет приоритет. Другие ракурсы доступны в галерее.

После изменения запустите `python3 tools/build_catalog.py` из корня и сохраните sprites/catalog.js в Git. HTML сцен менять не нужно. Workflow также пересобирает каталог на push в main, если GitHub Actions разрешено записывать в репозиторий. Для GitHub Pages, публикуемых из ветки, коммит через GITHUB_TOKEN может не вызвать новую публикацию; при необходимости пересоберите каталог локально и загрузите вместе со спрайтами или запустите публикацию вручную. Для локального открытия готовый каталог уже включен.

Архив не содержит LICENSE: оставьте существующий файл репозитория. Сцена восстановлена из v19, общие спрайты — из v18. Прежняя потерянная библиотека целиком не восстановлена.


## Тестирование нового автомобиля m412-01

- [Библиотека спрайтов](https://eznzz.github.io/pixelgame-sprite-lab/sprites/) — проверка всех загруженных ракурсов.
- [Scene Preview — статическая сцена](https://eznzz.github.io/pixelgame-sprite-lab/scene-preview/scene-preview-static.html) — выбор m412-01 в настройках сцены.
- [Scene Preview — поездка](https://eznzz.github.io/pixelgame-sprite-lab/scene-preview/scene-preview-drive.html) — m412-01 выбран по умолчанию; переключение на другие автомобили доступно в поле «Автомобиль для теста».

Для обновления GitHub Pages при необходимости выполните жёсткое обновление страницы или откройте ссылку в приватном окне.
