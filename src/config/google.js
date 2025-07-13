/**
 * Конфигурация для Google Apps Script
 * 
 * После настройки Google Apps Script:
 * 1. Скопируйте URL веб-приложения
 * 2. Замените YOUR_SCRIPT_ID на актуальный ID
 * 3. Пересоберите проект
 */

// Замените YOUR_SCRIPT_ID на ваш реальный ID из Google Apps Script
const GOOGLE_SCRIPT_ID = 'AKfycby0G2s5JeER4C5Z1g1WfguXBsXOfrRfgm3RFslTxTW_3YvJ7KtII7cnSj1dBKhoXOMN';

// Полный URL для отправки данных
export const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/AKfycby0G2s5JeER4C5Z1g1WfguXBsXOfrRfgm3RFslTxTW_3YvJ7KtII7cnSj1dBKhoXOMN/exec`;

// Настройки приложения
export const CONFIG = {
	// Таймаут для запроса (в миллисекундах)
	REQUEST_TIMEOUT: 10000,

	// Включить детальное логирование
	DEBUG: process.env.NODE_ENV === 'development'
};

// Проверка готовности Google Apps Script
export const isGoogleScriptReady = () => {
	return GOOGLE_SCRIPT_ID !== 'YOUR_SCRIPT_ID' && GOOGLE_SCRIPT_ID.length > 0;
};

// Функция для отправки данных в Google Sheets
export const submitToGoogleSheets = async (formData) => {
	if (!isGoogleScriptReady()) {
		throw new Error('Google Apps Script не настроен. Проверьте GOOGLE_SCRIPT_ID в src/config/google.js');
	}

	if (CONFIG.DEBUG) {
		console.log('📤 Отправка данных в Google Sheets:', formData);
		console.log('📞 Номер телефона:', formData.phone);
		console.log('📞 Тип номера:', typeof formData.phone);
		console.log('📞 Длина номера:', formData.phone ? formData.phone.length : 0);
		console.log('📞 JSON данные:', JSON.stringify(formData));
		console.log('📍 URL:', GOOGLE_SCRIPT_URL);
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

	try {
		const response = await fetch(GOOGLE_SCRIPT_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
			},
			body: JSON.stringify(formData),
			mode: 'no-cors', // Обязательно для Google Apps Script
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (CONFIG.DEBUG) {
			console.log('✅ Данные успешно отправлены в Google Sheets');
		}

		// При mode: 'no-cors' мы не можем проверить response.ok
		// Поэтому считаем запрос успешным, если не было ошибок
		return {
			success: true,
			message: 'Заявка успешно отправлена в Google Sheets'
		};

	} catch (error) {
		clearTimeout(timeoutId);

		if (error.name === 'AbortError') {
			throw new Error('Превышен таймаут запроса. Попробуйте еще раз.');
		}

		if (CONFIG.DEBUG) {
			console.error('❌ Ошибка отправки в Google Sheets:', error);
		}

		throw error;
	}
};

// Основная функция для отправки данных формы
export const submitForm = async (formData) => {
	try {
		if (CONFIG.DEBUG) {
			console.log('🚀 Начинается отправка формы:', formData);
		}

		// Отправляем данные в Google Sheets
		const result = await submitToGoogleSheets(formData);

		if (CONFIG.DEBUG) {
			console.log('🎉 Форма успешно отправлена:', result);
		}

		return result;

	} catch (error) {
		if (CONFIG.DEBUG) {
			console.error('💥 Ошибка отправки формы:', error);
		}

		// Перебрасываем ошибку с более понятным сообщением
		if (error.message.includes('Google Apps Script не настроен')) {
			throw new Error('Форма временно недоступна. Свяжитесь с нами напрямую.');
		}

		throw error;
	}
}; 