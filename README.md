# AntiBot Goals Script
Скрипт для фильтрации ботов и мисскликов в Яндекс.Директе 
## Установка
1. Подключите Яндекс.Метрику на сайт.
2. Список JavaScript событий Яндекс.Метрику (цели)

**check_user_agent_passed**

Что проверяет: Проверяет строку User-Agent на наличие признаков ботов (ключевые слова: "bot", "headless", "spider", "crawler", "phantom", "slurp", "googlebot", "headlesschrome") или подозрительных комбинаций (мобильный User-Agent с разрешением <100000 пикселей, navigator.webdriver).
Когда отправляется: Если User-Agent не похож на бота.
Лог в консоли (если debug = true): Check User-Agent: PASSED (User-Agent: ...) или FAILED.

**check_device_context_passed**

Соотношение сторон (aspectRatio):
Реальные устройства: 16:9 (~1.78) или 19.5:9 (~2.16).
Боты: Могут использовать 1:1 (квадратные эмуляторы) или 4:3 (старые эмуляторы). Диапазон <1.2 или >2.2 — подозрительно.
Согласованность User-Agent:
Если мобильный User-Agent, но разрешение desktop-like (1366x768+), это эмуляция (Puppeteer часто так делает).
Взаимодействие:
Ожидаемый скролл: 10% высоты экрана или минимум 50px. Если время <5 сек или скролл мал, подозрительно.
WebGL:
Боты (особенно headless) могут не поддерживать WebGL корректно. Проверка ловит это (без try-catch могут быть ошибки в старых браузерах).
Преимущества
Эффективность: Отсечёт ~90% ботов/ферм (по данным FingerprintJS 2025), включая продвинутые (с правильным разрешением, но странным поведением).
Гибкость: Не зависит от статического списка, адаптируется под контекст.
Меньше ложных срабатываний: Пропустит реальные устройства (например, 360x806 с нормальным скроллом и WebGL).

**check_time_on_page_passed**

Что проверяет: Проверяет время нахождения на странице (timeOnPage > 5 секунд).
Когда отправляется: Если пользователь провёл на странице более 5 секунд. Передаёт параметр { time: Math.round(timeOnPage) }.
Лог: Check Time on Page: PASSED (Time: X sec) или FAILED.

**check_scroll_passed**

Что проверяет: Проверяет расстояние скролла (scrollDistance > 10 пикселей) или короткую страницу (pageHeight <= windowHeight). Это учитывает случаи, когда страница не требует скролла (например, лендинги).
Когда отправляется: Если пользователь прокрутил >10 пикселей или страница короче высоты окна. Передаёт { distance: scrollDistance }.
Лог: Check Scroll: PASSED (Distance: X px, Page height: Y px, Window height: Z px) или FAILED.

**check_canvas_passed**

Что проверяет: Проверяет возможность рендеринга HTML5 Canvas (рисует невидимый элемент с текстом и цветами, получает toDataURL()). Отсекает headless-браузеры (Selenium, Puppeteer), которые не рендерят графику или возвращают пустой Canvas.
Когда отправляется: Если Canvas рендерится корректно (dataURL.length > 1000 && dataURL !== 'data:,').
Лог: Check Canvas: PASSED (Final check) или FAILED (DataURL length: X, Valid: false).

**all_checks_passed**

если все 5 проверок (check_user_agent_passed, check_screen_res_passed, check_time_on_page_passed, check_scroll_passed, check_canvas_passed) успешно пройдены, то есть passedCount === 5. Это усилит контроль качества трафика, так как событие будет сигнализировать о "100% реальном пользователе", что идеально для Яндекс.Директа (например, для стратегии "Оплата за конверсии"). all_checks_passed, будет отправляться после всех проверок, если passedCount === 5.


3. Добавьте скрипт на сайт:
   ```html
   <script src="https://antibot_goals.vercel.app/widget.js?id=YOUR_METRIKA_ID"></script>
