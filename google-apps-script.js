/**
 * Google Apps Script для интеграции Suppla с Google Sheets
 * 
 * Инструкции по настройке:
 * 1. Откройте script.google.com
 * 2. Создайте новый проект
 * 3. Скопируйте этот код
 * 4. Настройте триггеры
 * 5. Опубликуйте как веб-приложение
 */

// Настройки
const SPREADSHEET_ID = '18t5XsOhbCp3E5XaKpKuwkv2d60_-n_Fes-6OJy50vzk'; // ID вашей Google Sheets таблицы
const SHEET_NAME = 'Заявки Suppla';
const NOTIFICATION_EMAIL = 'egordolgih@mail.ru'; // Замените на свой email
const FORM_URL = 'https://suppla-9b7n80zcw-dolgihegor2323-gmailcoms-projects.vercel.app';

/**
 * Обработка POST запросов от формы
 */
function doPost(e) {
	try {
		console.log('📨 Получен POST запрос:', e);
		console.log('📊 Тип запроса:', typeof e);
		console.log('📊 Параметры запроса:', e.parameter);
		console.log('📊 Headers:', e.headers);

		// Получаем данные из POST запроса
		let data;

		if (e.postData && e.postData.contents) {
			console.log('📋 Содержимое POST запроса:', e.postData.contents);
			console.log('📋 Тип содержимого:', typeof e.postData.contents);
			console.log('📋 Длина содержимого:', e.postData.contents.length);
			data = JSON.parse(e.postData.contents);
		} else {
			throw new Error('Не удалось получить данные из запроса');
		}

		console.log('🔍 Обработанные данные:', data);
		console.log('🔍 Тип data:', typeof data);
		console.log('🔍 Ключи data:', Object.keys(data));

		// Валидация данных
		if (!data.name || !data.phone || !data.email || !data.businessType) {
			return ContentService
				.createTextOutput(JSON.stringify({
					success: false,
					error: 'Все поля обязательны для заполнения'
				}))
				.setMimeType(ContentService.MimeType.JSON);
		}

		// Валидация email
		if (!isValidEmail(data.email)) {
			return ContentService
				.createTextOutput(JSON.stringify({
					success: false,
					error: 'Неверный формат email'
				}))
				.setMimeType(ContentService.MimeType.JSON);
		}

		// Сохраняем в Google Sheets
		console.log('💾 Сохраняем данные в Google Sheets...');
		const result = saveToSheet(data);
		console.log('✅ Данные сохранены в Google Sheets:', result);

		// Отправляем уведомление на email
		console.log('📧 Отправляем уведомление на email...');
		sendNotification(data, result.submissionId, result.spreadsheetId);
		console.log('✅ Уведомление отправлено');

		// Возвращаем успешный ответ
		return ContentService
			.createTextOutput(JSON.stringify({
				success: true,
				message: 'Заявка успешно отправлена',
				id: result.submissionId
			}))
			.setMimeType(ContentService.MimeType.JSON);

	} catch (error) {
		console.error('Ошибка обработки заявки:', error);

		return ContentService
			.createTextOutput(JSON.stringify({
				success: false,
				error: 'Внутренняя ошибка сервера'
			}))
			.setMimeType(ContentService.MimeType.JSON);
	}
}

/**
 * Сохранение данных в Google Sheets
 */
function saveToSheet(data) {
	try {
		// Получаем или создаем таблицу
		const result = getOrCreateSheet();
		const sheet = result.sheet;
		const spreadsheet = result.spreadsheet;

		// Генерируем ID заявки
		const submissionId = Date.now().toString();
		const timestamp = new Date().toLocaleString('ru-RU');

		// Логируем данные для отладки
		console.log('📞 Исходный номер телефона:', data.phone);
		console.log('📞 Тип номера телефона:', typeof data.phone);
		console.log('📞 Длина номера:', data.phone ? data.phone.length : 0);

		// Подготавливаем данные для записи
		const rowData = [
			submissionId,
			data.name,
			"'" + data.phone, // Добавляем апостроф для корректного отображения номера
			data.email,
			getBusinessTypeLabel(data.businessType),
			timestamp,
			'Новая'
		];

		// Добавляем строку в таблицу
		sheet.appendRow(rowData);

		console.log('Заявка сохранена:', submissionId);
		return {
			submissionId: submissionId,
			spreadsheetId: spreadsheet.getId()
		};

	} catch (error) {
		console.error('Ошибка сохранения в Sheets:', error);
		throw error;
	}
}

/**
 * Получение или создание таблицы
 */
function getOrCreateSheet() {
	try {
		// Используем конкретный ID таблицы
		const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
		let sheet;

		// Пытаемся найти лист с нужным именем
		try {
			sheet = spreadsheet.getSheetByName(SHEET_NAME);
		} catch (e) {
			// Если лист не найден, создаем новый
			sheet = spreadsheet.insertSheet(SHEET_NAME);
		}

		// Если лист не найден, создаем новый
		if (!sheet) {
			sheet = spreadsheet.insertSheet(SHEET_NAME);
		}

		// Проверяем, есть ли заголовки
		if (sheet.getLastRow() === 0) {
			const headers = [
				'ID',
				'Имя',
				'Телефон',
				'Email',
				'Тип бизнеса',
				'Дата создания',
				'Статус'
			];

			sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

			// Форматируем заголовки
			const headerRange = sheet.getRange(1, 1, 1, headers.length);
			headerRange.setFontWeight('bold');
			headerRange.setBackground('#4285f4');
			headerRange.setFontColor('#ffffff');

			// Устанавливаем ширину колонок
			sheet.setColumnWidth(1, 120); // ID
			sheet.setColumnWidth(2, 150); // Имя
			sheet.setColumnWidth(3, 150); // Телефон
			sheet.setColumnWidth(4, 200); // Email
			sheet.setColumnWidth(5, 150); // Тип бизнеса
			sheet.setColumnWidth(6, 150); // Дата
			sheet.setColumnWidth(7, 100); // Статус
		}

		return {
			sheet: sheet,
			spreadsheet: spreadsheet
		};

	} catch (error) {
		console.error('Ошибка получения таблицы:', error);
		throw error;
	}
}

/**
 * Отправка email уведомления
 */
function sendNotification(data, submissionId, spreadsheetId) {
	try {
		const subject = `[Suppla] Новая заявка от ${data.name}`;

		const body = `
Получена новая заявка на сайте Suppla:

📋 ИНФОРМАЦИЯ О ЗАЯВКЕ:
• ID: ${submissionId}
• Имя: ${data.name}
• Телефон: ${data.phone}
• Email: ${data.email}
• Тип бизнеса: ${getBusinessTypeLabel(data.businessType)}
• Дата: ${new Date().toLocaleString('ru-RU')}

🔗 ДЕЙСТВИЯ:
• Посмотреть все заявки: https://docs.google.com/spreadsheets/d/${spreadsheetId}
• Перейти на сайт: ${FORM_URL}

---
Автоматическое уведомление от Suppla
    `;

		GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
		console.log('Уведомление отправлено на:', NOTIFICATION_EMAIL);

	} catch (error) {
		console.error('Ошибка отправки уведомления:', error);
	}
}

/**
 * Валидация email
 */
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Получение человекочитаемого названия типа бизнеса
 */
function getBusinessTypeLabel(businessType) {
	const labels = {
		'retail': 'Розничная торговля',
		'wholesale': 'Оптовая торговля',
		'manufacturing': 'Производство',
		'construction': 'Строительство',
		'services': 'Услуги',
		'other': 'Другое'
	};

	return labels[businessType] || businessType;
}

/**
 * Обработка GET запросов (для тестирования)
 */
function doGet(e) {
	return ContentService
		.createTextOutput(JSON.stringify({
			status: 'OK',
			message: 'Suppla Google Apps Script работает',
			timestamp: new Date().toISOString()
		}))
		.setMimeType(ContentService.MimeType.JSON);
}

/**
 * Тестовая функция для проверки работы
 */
function testSubmission() {
	const testData = {
		name: 'Тест Тестович',
		phone: '+7 (999) 123-45-67',
		email: 'test@example.com',
		businessType: 'retail'
	};

	const mockEvent = {
		postData: {
			contents: JSON.stringify(testData)
		}
	};

	const response = doPost(mockEvent);
	console.log('Тестовый ответ:', response.getContent());
}

/**
 * Тестовая функция с данными, как они приходят с сайта
 */
function testSubmissionFromSite() {
	const testData = {
		name: 'Егор',
		phone: '+7 (916) 326-47-05',
		email: 'egordolgih@mail.ru',
		businessType: 'construction'
	};

	console.log('🧪 Тестируем данные с сайта:');
	console.log('📞 Номер телефона:', testData.phone);
	console.log('📞 Тип номера:', typeof testData.phone);
	console.log('📞 Длина номера:', testData.phone.length);
	console.log('📞 JSON данные:', JSON.stringify(testData));

	const mockEvent = {
		postData: {
			contents: JSON.stringify(testData)
		}
	};

	const response = doPost(mockEvent);
	console.log('Тестовый ответ:', response.getContent());
}

/**
 * Получение статистики заявок
 */
function getStats() {
	try {
		const result = getOrCreateSheet();
		const sheet = result.sheet;
		const data = sheet.getDataRange().getValues();

		// Убираем заголовок
		const submissions = data.slice(1);

		const stats = {
			total: submissions.length,
			new: submissions.filter(row => row[6] === 'Новая').length,
			inProgress: submissions.filter(row => row[6] === 'В обработке').length,
			completed: submissions.filter(row => row[6] === 'Завершена').length
		};

		console.log('Статистика заявок:', stats);
		return stats;

	} catch (error) {
		console.error('Ошибка получения статистики:', error);
		return null;
	}
}

/**
 * Экспорт данных в CSV
 */
function exportToCSV() {
	try {
		const result = getOrCreateSheet();
		const sheet = result.sheet;
		const data = sheet.getDataRange().getValues();

		let csvContent = '';
		data.forEach(row => {
			csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
		});

		return csvContent;

	} catch (error) {
		console.error('Ошибка экспорта CSV:', error);
		return null;
	}
} 