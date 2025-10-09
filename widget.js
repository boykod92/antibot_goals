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
  return '88094270'; // Fallback ID
}

// Проверка "Цветовая игра"
function checkColorPerception(callback) {
  if (debug) console.log('Check Color Perception: Starting test');
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    if (debug) console.log('Check Color Perception: FAILED (No context)');
    callback(false);
    return;
  }
  
  // Случайный цвет
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, 200, 100);
  
  // Извлечение отрендеренного цвета
  const imageData = ctx.getImageData(100, 50, 1, 1).data;
  const renderedR = imageData[0];
  const renderedG = imageData[1];
  const renderedB = imageData[2];
  
  // Сравнение (допуск 5%)
  const diffR = Math.abs(r - renderedR) / 255;
  const diffG = Math.abs(g - renderedG) / 255;
  const diffB = Math.abs(b - renderedB) / 255;
  const isValid = diffR < 0.05 && diffG < 0.05 && diffB < 0.05;
  
  if (debug) console.log('Check Color Perception: Original RGB:', r, g, b, 'Rendered RGB:', renderedR, renderedG, renderedB, 'Valid:', isValid);
  callback(isValid);
}

// Проверка "Случайный шум"
function checkRandomNoise(callback) {
  if (debug) console.log('Check Random Noise: Starting test');
  const samples = [];
  for (let i = 0; i < 5; i++) {
    samples.push(Math.random());
  }
  if (debug) console.log('Check Random Noise: Samples:', samples);

  // Вычисление среднего и стандартного отклонения
  const mean = samples.reduce((a, b) => a + b) / samples.length;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  const isValid = stdDev > 0.2; // Минимальное отклонение для случайности

  if (debug) console.log('Check Random Noise: StdDev:', stdDev, 'Valid:', isValid);
  callback(isValid);
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  if (debug) console.log('DOM fully loaded, starting checks');

  // Проверка параметров через 7 секунд
  setTimeout(function() {
    const counterId = getMetrikaCounterId();
    let passedCount = 0;

    if (typeof ym !== 'undefined') {
      // 1. Проверка "Цветовая игра"
      checkColorPerception(function(isValid) {
        if (isValid) {
          ym(counterId, 'reachGoal', 'check_color_perception_passed');
          if (debug) console.log('Check Color Perception: PASSED');
          passedCount++;
        } else {
          if (debug) console.log('Check Color Perception: FAILED');
        }

        // 2. Проверка "Случайный шум"
        checkRandomNoise(function(isValid) {
          if (isValid) {
            ym(counterId, 'reachGoal', 'check_random_noise_passed');
            if (debug) console.log('Check Random Noise: PASSED');
            passedCount++;
          } else {
            if (debug) console.log('Check Random Noise: FAILED');
          }

          // Финальный лог и отправка событий
          if (debug) console.log('All checks completed. Passed:', passedCount + '/2', ', Events sent for counter ID:', counterId);
          
          if (passedCount === 2) {
            ym(counterId, 'reachGoal', 'all_checks_passed');
            ym(counterId, 'reachGoal', 'both_checks_passed');
            if (debug) console.log('All 2 checks passed: Sending all_checks_passed and both_checks_passed events');
          }
        });
      });
    } else {
      console.error('Yandex Metrika not loaded. No events sent.');
    }
  }, 7000);
});
