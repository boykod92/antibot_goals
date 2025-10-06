// Функция для извлечения ID счётчика Метрики
function getMetrikaCounterId() {
  const currentScript = document.currentScript;
  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src);
    const idFromUrl = url.searchParams.get('id');
    if (idFromUrl && /^\d+$/.test(idFromUrl)) {
      return idFromUrl;
    }
  }
  
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    const src = script.src;
    if (src && src.includes('yandex.ru/metrika')) {
      const match = src.match(/id=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  
  return '88094270'; // Fallback ID
}

// Инициализация переменных
let scrollDistance = 0;
let startTime = Date.now();
let userAgent = navigator.userAgent.toLowerCase();
let screenRes = screen.width * screen.height;
let lastScrollY = window.scrollY || 0;

// Функция проверки User-Agent на бота
function isBotUserAgent() {
  return /bot|headless|spider|crawler|phantom|slurp|googlebot/i.test(userAgent) ||
         /headlesschrome/i.test(userAgent) ||
         userAgent.indexOf('mobile') > -1 && screenRes < 100000 ||
         navigator.webdriver === true;
}

// Проверка куки: установка и асинхронная проверка
function checkCookies(callback) {
  const cookieName = 'bot_check_cookie';
  const cookieValue = 'test_value_' + Math.random().toString(36).substring(2);
  console.log('Check Cookies: Setting cookie', cookieName, '=', cookieValue);
  
  // Устанавливаем куки
  document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=3600`;
  
  // Проверяем через 1 секунду
  setTimeout(function() {
    const cookies = document.cookie.split('; ');
    const foundCookie = cookies.find(row => row.startsWith(`${cookieName}=`));
    const isValid = foundCookie && foundCookie.split('=')[1] === cookieValue;
    console.log('Check Cookies: Found cookie:', foundCookie || 'none', ', Valid:', isValid);
    callback(isValid);
  }, 1000); // 1 сек задержка для проверки
}

// Отслеживание скролла
window.addEventListener('scroll', function() {
  const currentScrollY = window.scrollY || 0;
  const delta = Math.abs(currentScrollY - lastScrollY);
  scrollDistance += delta;
  console.log('Scroll event: Position =', currentScrollY, 'px, Delta =', delta, 'px');
  lastScrollY = currentScrollY;
});

// Проверка параметров через 15 секунд
setTimeout(function() {
  const timeOnPage = (Date.now() - startTime) / 1000;
  const counterId = getMetrikaCounterId();
  let passedCount = 0;

  if (typeof ym !== 'undefined') {
    // 1. Проверка User-Agent
    if (!isBotUserAgent()) {
      ym(counterId, 'reachGoal', 'check_user_agent_passed');
      console.log('Check User-Agent: PASSED (User-Agent:', userAgent, ')');
      passedCount++;
    } else {
      console.log('Check User-Agent: FAILED (User-Agent:', userAgent, ')');
    }

    // 2. Проверка разрешения экрана
    if (screen.width > 300 && screen.height > 300) {
      ym(counterId, 'reachGoal', 'check_screen_res_passed', { res: screenRes });
      console.log('Check Screen Resolution: PASSED (Resolution:', screenRes, ')');
      passedCount++;
    } else {
      console.log('Check Screen Resolution: FAILED (Resolution:', screenRes, ')');
    }

    // 3. Проверка времени на странице
    if (timeOnPage > 5) {
      ym(counterId, 'reachGoal', 'check_time_on_page_passed', { time: Math.round(timeOnPage) });
      console.log('Check Time on Page: PASSED (Time:', Math.round(timeOnPage), 'sec)');
      passedCount++;
    } else {
      console.log('Check Time on Page: FAILED (Time:', Math.round(timeOnPage), 'sec)');
    }

    // 4. Проверка скролла
    const pageHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    if (scrollDistance > 50 || pageHeight <= windowHeight) {
      ym(counterId, 'reachGoal', 'check_scroll_passed', { distance: scrollDistance });
      console.log('Check Scroll: PASSED (Distance:', scrollDistance, 'px, Page height:', pageHeight, 'px, Window height:', windowHeight, 'px)');
      passedCount++;
    } else {
      console.log('Check Scroll: FAILED (Distance:', scrollDistance, 'px, Page height:', pageHeight, 'px, Window height:', windowHeight, 'px)');
    }

    // 5. Проверка куки (асинхронно)
    checkCookies(function(isValid) {
      if (isValid) {
        ym(counterId, 'reachGoal', 'check_cookies_passed');
        console.log('Check Cookies: PASSED (Final check)');
        passedCount++;
      } else {
        console.log('Check Cookies: FAILED (Final check)');
      }
      
      // Финальный лог после всех проверок
      console.log('All checks completed. Passed:', passedCount + '/5', ', Events sent for counter ID:', counterId);
    });
  } else {
    console.error('Yandex Metrika not loaded. No events sent.');
  }
}, 15000);
