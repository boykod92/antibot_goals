# AntiBot Goals Script
Скрипт для фильтрации ботов и мисскликов в Яндекс.Метрике. Отправляет события для составной цели `real_user_composite`.

## Установка
1. Подключите Яндекс.Метрику на сайт.
2. Добавьте скрипт:
   ```html
   <script src="https://antibot_goals.vercel.app/widget.js?id=YOUR_METRIKA_ID"></script>
3. Создайте составную цель - real_user_composite: check_user_agent_passed, check_screen_res_passed, check_time_on_page_passed, check_scroll_passed, check_cookies_passed.
   
## Что делает? 
Запускается через 15 секунд после загрузки страницы (даёт время на взаимодействие).
Вычисляет timeOnPage (время на странице).
Получает ID счётчика (counterId).
Инициализирует счётчик пройденных проверок (passedCount = 0).
Проверяет наличие ym (функции Метрики) — если нет, выводит ошибку в консоль.
Запускает 5 проверок последовательно:

1. User-Agent: Если не бот (!isBotUserAgent()), отправляет событие check_user_agent_passed, логирует PASSED/FAILED (если debug), увеличивает passedCount.
2. Разрешение экрана: Если ширина >300 и высота >300, отправляет check_screen_res_passed с параметром { res: screenRes }, логирует, увеличивает passedCount.
3. Время на странице: Если >5 сек, отправляет check_time_on_page_passed с { time: ... }, логирует, увеличивает passedCount.
4. Скролл: Вычисляет высоту страницы (pageHeight) и окна (windowHeight). Если расстояние скролла >10 px или страница короткая (pageHeight <= windowHeight), отправляет check_scroll_passed с { distance: ... }, логирует с деталями высоты, увеличивает passedCount.
5. localStorage: Вызывает checkStorage, и если прошла, отправляет check_storage_passed, логирует PASSED/FAILED, увеличивает passedCount.


После всех проверок логирует итог: All checks completed. Passed: X/5, Events sent for counter ID: Y (если debug).
