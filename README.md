# AntiBot Goals Script
Скрипт для фильтрации ботов и мисскликов в Яндекс.Метрике. Отправляет события для составной цели `real_user_composite`.

## Установка
1. Подключите Яндекс.Метрику на сайт.
2. Добавьте скрипт:
   ```html
   <script src="https://antibot_goals.vercel.app/widget.js?id=YOUR_METRIKA_ID"></script>
3. Создайте составную цель - real_user_composite: check_user_agent_passed, check_screen_res_passed, check_time_on_page_passed, check_scroll_passed, check_cookies_passed.
