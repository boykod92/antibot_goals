// Переключатель для отладки
const debug = true; // Установите false для продакшена, чтобы убрать логи

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
let scrollDetected = false; // Флаг для отслеживания событий скролла

// Функция проверки User-Agent на бота
function isBotUserAgent() {
  return /bot|headless|spider|crawler|phantom|slurp|googlebot/i.test(userAgent) ||
         /headlesschrome/i.test(userAgent) ||
         userAgent.indexOf('mobile') > -1 && screenRes < 100000 ||
         navigator.webdriver === true;
}

// Проверка Canvas fingerprint
function checkCanvas(callback) {
  if (debug) console.log('Check Canvas: Starting fingerprint generation');
  
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    if (debug) console.log('Check Canvas: FAILED (No context)');
    callback(false);
    return;
  }
  
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('🦊 Hello, world!', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('🦊 Hello, world!', 4, 17);
  
  const dataURL = canvas.toDataURL();
  const isValid = dataURL.length > 1000 && dataURL !== 'data:,';
  
  if (debug) console.log('Check Canvas: DataURL length:', dataURL.length, ', Valid:', isValid);
  callback(isValid);
}

// Отслеживание скролла на window
window.addEventListener('scroll', function() {
  const currentScrollY = window.scrollY || 0;
  const delta = Math.abs(currentScrollY - lastScrollY);
  scrollDistance += delta;
  lastScrollY = currentScrollY;
  scrollDetected = true;
  if (debug) console.log('Window Scroll: Position =', currentScrollY, 'px, Delta =', delta, 'px');
});

// Отслеживание скролла внутри контейнеров
function trackContainerScroll() {
  const scrollableElements = document.querySelectorAll('[style*="overflow"], [style*="scroll"], [style*="auto"]');
  scrollableElements.forEach(el => {
    el.addEventListener('scroll', function() {
      const delta = Math.abs(el.scrollTop - (el.dataset.lastScrollTop || 0));
      scrollDistance += delta;
      el.dataset.lastScrollTop = el.scrollTop;
      scrollDetected = true;
      if (debug) console.log('Container Scroll: Element =', el.tagName, ', ScrollTop =', el.scrollTop, 'px, Delta =', delta, 'px');
    });
  });
}

// Отслеживание touchmove для мобильных
window.addEventListener('touchmove', function() {
  const currentScrollY = window.scrollY || 0;
  const delta = Math.abs(currentScrollY - lastScrollY);
  scrollDistance += delta;
  lastScrollY = currentScrollY;
  scrollDetected = true;
  if (debug) console.log('Touchmove: Position =', currentScrollY, 'px, Delta =', delta, 'px');
});

// Инициализация контейнерного скролла
trackContainerScroll();

// Проверка параметров через 20 секунд
setTimeout(function() {
  const timeOnPage = (Date.now() - startTime) / 1000;
  const counterId = getMetrikaCounterId();
  let passedCount = 0;

  if (typeof ym !== 'undefined') {
    // 1. Проверка User-Agent
    if (!isBotUserAgent()) {
      ym(counterId, 'reachGoal', 'check_user_agent_passed');
      if (debug) console.log('Check User-Agent: PASSED (User-Agent:', userAgent, ')');
      passedCount++;
    } else {
      if (debug) console.log('Check User-Agent: FAILED (User-Agent:', userAgent, ')');
    }

    // 2. Проверка разрешения экрана
    if (screen.width > 300 && screen.height > 300) {
      ym(counterId, 'reachGoal', 'check_screen_res_passed', { res: screenRes });
      if (debug) console.log('Check Screen Resolution: PASSED (Resolution:', screenRes, ')');
      passedCount++;
    } else {
      if (debug) console.log('Check Screen Resolution: FAILED (Resolution:', screenRes, ')');
    }

    // 3. Проверка времени на странице
    if (timeOnPage > 5) {
      ym(counterId, 'reachGoal', 'check_time_on_page_passed', { time: Math.round(timeOnPage) });
      if (debug) console.log('Check Time on Page: PASSED (Time:', Math.round(timeOnPage), 'sec)');
      passedCount++;
    } else {
      if (debug) console.log('Check Time on Page: FAILED (Time:', Math.round(timeOnPage), 'sec)');
    }

    // 4. Проверка скролла
    const pageHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    if (scrollDistance > 10 || pageHeight <= windowHeight) {
      ym(counterId, 'reachGoal', 'check_scroll_passed', { distance: scrollDistance });
      if (debug) console.log('Check Scroll: PASSED (Distance:', scrollDistance, 'px, Page height:', pageHeight, 'px, Window height:', windowHeight, 'px, Scroll detected:', scrollDetected, ')');
      passedCount++;
    } else {
      if (debug) console.log('Check Scroll: FAILED (Distance:', scrollDistance, 'px, Page height:', pageHeight, 'px, Window height:', windowHeight, 'px, Scroll detected:', scrollDetected, ')');
    }

    // 5. Проверка Canvas
    checkCanvas(function(isValid) {
      if (isValid) {
        ym(counterId, 'reachGoal', 'check_canvas_passed');
        if (debug) console.log('Check Canvas: PASSED (Final check)');
        passedCount++;
      } else {
        if (debug) console.log('Check Canvas: FAILED (Final check)');
      }
      
      // Финальный лог и отправка события all_checks_passed
      if (debug) console.log('All checks completed. Passed:', passedCount + '/5', ', Events sent for counter ID:', counterId);
      
      if (passedCount === 5) {
        ym(counterId, 'reachGoal', 'all_checks_passed');
        if (debug) console.log('All 5 checks passed: Sending all_checks_passed event');
      }
    });
  } else {
    console.error('Yandex Metrika not loaded. No events sent.');
  }
}, 20000);
