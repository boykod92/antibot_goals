# AntiBot Goals Script
Скрипт для фильтрации ботов и мисскликов в Яндекс.Метрике. 
## Установка
1. Подключите Яндекс.Метрику на сайт.
2. Добавьте скрипт:
   ```html
   <script src="https://antibot_goals.vercel.app/widget.js?id=YOUR_METRIKA_ID"></script>

3. Список событий

check_user_agent_passed

Что проверяет: Проверяет строку User-Agent на наличие признаков ботов (ключевые слова: "bot", "headless", "spider", "crawler", "phantom", "slurp", "googlebot", "headlesschrome") или подозрительных комбинаций (мобильный User-Agent с разрешением <100000 пикселей, navigator.webdriver).
Когда отправляется: Если User-Agent не похож на бота.
Лог в консоли (если debug = true): Check User-Agent: PASSED (User-Agent: ...) или FAILED.


check_screen_res_passed

Что проверяет: Проверяет разрешение экрана (screen.width > 300 && screen.height > 300). Это отсекает устройства с аномально маленькими экранами (например, старые эмуляторы или боты).
Когда отправляется: Если ширина и высота экрана больше 300 пикселей. Также передаёт параметр { res: screen.width * screen.height }.
Лог: Check Screen Resolution: PASSED (Resolution: ...) или FAILED.


check_time_on_page_passed

Что проверяет: Проверяет время нахождения на странице (timeOnPage > 5 секунд).
Когда отправляется: Если пользователь провёл на странице более 5 секунд. Передаёт параметр { time: Math.round(timeOnPage) }.
Лог: Check Time on Page: PASSED (Time: X sec) или FAILED.


check_scroll_passed

Что проверяет: Проверяет расстояние скролла (scrollDistance > 10 пикселей) или короткую страницу (pageHeight <= windowHeight). Это учитывает случаи, когда страница не требует скролла (например, лендинги).
Когда отправляется: Если пользователь прокрутил >10 пикселей или страница короче высоты окна. Передаёт { distance: scrollDistance }.
Лог: Check Scroll: PASSED (Distance: X px, Page height: Y px, Window height: Z px) или FAILED.


check_canvas_passed

Что проверяет: Проверяет возможность рендеринга HTML5 Canvas (рисует невидимый элемент с текстом и цветами, получает toDataURL()). Отсекает headless-браузеры (Selenium, Puppeteer), которые не рендерят графику или возвращают пустой Canvas.
Когда отправляется: Если Canvas рендерится корректно (dataURL.length > 1000 && dataURL !== 'data:,').
Лог: Check Canvas: PASSED (Final check) или FAILED (DataURL length: X, Valid: false).


all_checks_passed
если все 5 проверок (check_user_agent_passed, check_screen_res_passed, check_time_on_page_passed, check_scroll_passed, check_canvas_passed) успешно пройдены, то есть passedCount === 5. Это усилит контроль качества трафика, так как событие будет сигнализировать о "100% реальном пользователе", что идеально для Яндекс.Директа (например, для стратегии "Оплата за конверсии"). all_checks_passed, будет отправляться после всех проверок, если passedCount === 5.
   
