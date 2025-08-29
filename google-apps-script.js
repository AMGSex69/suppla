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
const FORM_URL = 'https://suppla-dk81zlczy-dolgihegor2323-gmailcoms-projects.vercel.app';

/**
 * Обработка POST запросов от формы
 */
function doPost(e) {
	try {
		console.log('📨 Получен POST запрос');

		// Безопасная проверка объекта e
		if (!e) {
			console.error('❌ Объект события не определен');
			throw new Error('Объект события не определен');
		}

		console.log('📊 Тип запроса:', typeof e);

		// Безопасная проверка параметров
		if (e.parameter) {
			console.log('📊 Параметры запроса:', e.parameter);
		}

		// Безопасная проверка заголовков
		if (e.headers) {
			console.log('📊 Headers:', e.headers);
		}

		// Получаем данные из POST запроса
		let data;

		if (e.postData && e.postData.contents) {
			console.log('📋 Содержимое POST запроса:', e.postData.contents);
			console.log('📋 Тип содержимого:', typeof e.postData.contents);
			console.log('📋 Длина содержимого:', e.postData.contents.length);

			try {
				data = JSON.parse(e.postData.contents);
			} catch (parseError) {
				console.error('❌ Ошибка парсинга JSON:', parseError);
				throw new Error('Некорректный формат данных JSON');
			}
		} else {
			console.error('❌ Нет данных POST запроса');
			console.log('📊 Структура e:', Object.keys(e || {}));
			console.log('📊 postData:', e.postData);
			throw new Error('Не удалось получить данные из запроса');
		}

		console.log('🔍 Обработанные данные:', data);
		console.log('🔍 Тип data:', typeof data);
		console.log('🔍 Ключи data:', Object.keys(data));
		console.log('🔍 businessType:', data.businessType);
		console.log('🔍 Тип businessType:', typeof data.businessType);
		console.log('🔍 Это массив?:', Array.isArray(data.businessType));

		// Валидация данных
		if (!data.role || !data.name || !data.phone || !data.email || !data.businessType) {
			return ContentService
				.createTextOutput(JSON.stringify({
					success: false,
					error: 'Все обязательные поля должны быть заполнены'
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
		console.error('❌ Ошибка обработки заявки:', error);
		console.error('❌ Стек ошибки:', error.stack);
		console.error('❌ Сообщение ошибки:', error.message);

		// Возвращаем более детальную информацию об ошибке для отладки
		const errorResponse = {
			success: false,
			error: 'Внутренняя ошибка сервера',
			details: error.message,
			timestamp: new Date().toISOString()
		};

		return ContentService
			.createTextOutput(JSON.stringify(errorResponse))
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
		const businessTypeText = Array.isArray(data.businessType)
			? getBusinessTypeLabel(data.businessType, data.role)
			: getBusinessTypeLabel(data.businessType, data.role);

		const rowData = [
			submissionId,
			getRoleLabel(data.role),
			data.name,
			"'" + data.phone, // Добавляем апостроф для корректного отображения номера
			data.email,
			businessTypeText,
			data.companyName || '',
			data.comment || '',
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

		// Проверяем, есть ли правильные заголовки
		const currentHeaders = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
		const expectedHeaders = [
			'ID',
			'Роль',
			'Имя',
			'Телефон',
			'Email',
			'Тип бизнеса/продукции',
			'Компания',
			'Комментарий',
			'Дата создания',
			'Статус'
		];

		// Если заголовков нет или они не соответствуют ожидаемым, создаем/обновляем их
		if (sheet.getLastRow() === 0 || currentHeaders.length !== expectedHeaders.length) {
			console.log('🔧 Создаем/обновляем заголовки таблицы...');

			// Если есть данные, но заголовки неправильные, вставляем строку сверху
			if (sheet.getLastRow() > 0 && currentHeaders.length !== expectedHeaders.length) {
				sheet.insertRowBefore(1);
			}

			sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);

			// Форматируем заголовки
			const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
			headerRange.setFontWeight('bold');
			headerRange.setBackground('#4285f4');
			headerRange.setFontColor('#ffffff');

			// Устанавливаем ширину колонок
			sheet.setColumnWidth(1, 120); // ID
			sheet.setColumnWidth(2, 120); // Роль
			sheet.setColumnWidth(3, 150); // Имя
			sheet.setColumnWidth(4, 150); // Телефон
			sheet.setColumnWidth(5, 200); // Email
			sheet.setColumnWidth(6, 180); // Тип бизнеса/продукции
			sheet.setColumnWidth(7, 200); // Компания
			sheet.setColumnWidth(8, 300); // Комментарий
			sheet.setColumnWidth(9, 150); // Дата
			sheet.setColumnWidth(10, 100); // Статус
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
• Роль: ${getRoleLabel(data.role)}
• Имя: ${data.name}
• Телефон: ${data.phone}
• Email: ${data.email}
• Тип бизнеса/продукции: ${getBusinessTypeLabel(data.businessType, data.role)}
• Компания: ${data.companyName || 'Не указана'}
• Комментарий: ${data.comment || 'Не указан'}
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
 * Получение человекочитаемого названия роли
 */
function getRoleLabel(role) {
	const labels = {
		'supplier': 'Поставщик',
		'buyer': 'Покупатель'
	};

	return labels[role] || role;
}

/**
 * Получение человекочитаемого названия типа бизнеса/продукции
 */
function getBusinessTypeLabel(businessType, role) {
	// Если businessType - массив, обрабатываем каждый элемент
	if (Array.isArray(businessType)) {
		return businessType.map(type => getBusinessTypeLabel(type, role)).join(', ');
	}

	if (role === 'supplier') {
		const supplierLabels = {
			'construction': 'Строительные материалы',
			'manufacturing': 'Производство и промышленность',
			'food': 'Продукты питания',
			'agriculture': 'Сельское хозяйство',
			'textiles': 'Текстиль и одежда',
			'electronics': 'Электроника и IT',
			'automotive': 'Автомобильная промышленность',
			'chemicals': 'Химическая промышленность',
			'medical': 'Медицинское оборудование',
			'furniture': 'Мебель и интерьер',
			'packaging': 'Упаковка и тара',
			'energy': 'Энергетика',
			'logistics': 'Логистика и транспорт',
			'services': 'Услуги',
			'other': 'Другое'
		};
		return supplierLabels[businessType] || businessType;
	} else {
		const buyerLabels = {
			'construction': 'Строительные материалы',
			'manufacturing': 'Промышленное оборудование',
			'food': 'Продукты питания',
			'agriculture': 'Сельскохозяйственная продукция',
			'textiles': 'Текстиль и одежда',
			'electronics': 'Электроника и IT товары',
			'automotive': 'Автозапчасти и комплектующие',
			'chemicals': 'Химические товары',
			'medical': 'Медицинские товары',
			'furniture': 'Мебель и интерьер',
			'office': 'Офисные товары',
			'packaging': 'Упаковочные материалы',
			'energy': 'Энергетические товары',
			'raw_materials': 'Сырье и материалы',
			'other': 'Другое'
		};
		return buyerLabels[businessType] || businessType;
	}
}

/**
 * Обработка GET запросов (для тестирования)
 */
function doGet(e) {
	try {
		console.log('📨 Получен GET запрос');
		console.log('📊 Параметры GET:', e ? e.parameter : 'не определены');

		return ContentService
			.createTextOutput(JSON.stringify({
				status: 'OK',
				message: 'Suppla Google Apps Script работает',
				timestamp: new Date().toISOString(),
				version: '2.0 - Updated for new form fields'
			}))
			.setMimeType(ContentService.MimeType.JSON);
	} catch (error) {
		console.error('❌ Ошибка GET запроса:', error);
		return ContentService
			.createTextOutput(JSON.stringify({
				status: 'ERROR',
				message: error.message,
				timestamp: new Date().toISOString()
			}))
			.setMimeType(ContentService.MimeType.JSON);
	}
}

/**
 * Функция для принудительного обновления заголовков таблицы
 */
function updateTableHeaders() {
	console.log('🔧 Принудительное обновление заголовков...');

	try {
		const result = getOrCreateSheet();
		const sheet = result.sheet;

		const expectedHeaders = [
			'ID',
			'Роль',
			'Имя',
			'Телефон',
			'Email',
			'Тип бизнеса/продукции',
			'Компания',
			'Комментарий',
			'Дата создания',
			'Статус'
		];

		// Получаем текущие заголовки
		const currentHeaders = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];

		console.log('📊 Текущие заголовки:', currentHeaders);
		console.log('📊 Ожидаемые заголовки:', expectedHeaders);

		// Если есть данные и заголовки неправильные, вставляем новую строку сверху
		if (sheet.getLastRow() > 0 && currentHeaders.length !== expectedHeaders.length) {
			console.log('🔧 Вставляем новую строку для заголовков...');
			sheet.insertRowBefore(1);
		}

		// Устанавливаем правильные заголовки
		sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);

		// Форматируем заголовки
		const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
		headerRange.setFontWeight('bold');
		headerRange.setBackground('#4285f4');
		headerRange.setFontColor('#ffffff');

		// Устанавливаем ширину колонок
		sheet.setColumnWidth(1, 120); // ID
		sheet.setColumnWidth(2, 120); // Роль
		sheet.setColumnWidth(3, 150); // Имя
		sheet.setColumnWidth(4, 150); // Телефон
		sheet.setColumnWidth(5, 200); // Email
		sheet.setColumnWidth(6, 180); // Тип бизнеса/продукции
		sheet.setColumnWidth(7, 200); // Компания
		sheet.setColumnWidth(8, 300); // Комментарий
		sheet.setColumnWidth(9, 150); // Дата
		sheet.setColumnWidth(10, 100); // Статус

		console.log('✅ Заголовки успешно обновлены!');
		console.log('📊 Ссылка на таблицу:', `https://docs.google.com/spreadsheets/d/${result.spreadsheet.getId()}`);

		return true;

	} catch (error) {
		console.error('❌ Ошибка обновления заголовков:', error);
		return false;
	}
}

/**
 * Простая функция для тестирования работоспособности
 */
function testBasic() {
	console.log('🧪 Начинаем базовый тест...');

	try {
		// Тестируем создание/получение таблицы
		const result = getOrCreateSheet();
		console.log('✅ Таблица успешно получена/создана');
		console.log('📊 ID таблицы:', result.spreadsheet.getId());
		console.log('📊 Название листа:', result.sheet.getName());

		// Тестируем функции обработки данных
		console.log('✅ Тест getRoleLabel:', getRoleLabel('supplier'));
		console.log('✅ Тест getBusinessTypeLabel:', getBusinessTypeLabel('construction', 'supplier'));

		console.log('🎉 Базовый тест завершен успешно!');
		return true;

	} catch (error) {
		console.error('❌ Ошибка базового теста:', error);
		return false;
	}
}

/**
 * Тестовая функция для проверки работы
 */
function testSubmission() {
	const testData = {
		role: 'supplier',
		name: 'Тест Тестович',
		phone: '+7 (999) 123-45-67',
		email: 'test@example.com',
		businessType: ['construction', 'manufacturing', 'services'],
		companyName: 'ООО "Тестовая компания"',
		comment: 'Самое сложное - найти клиентов, которые готовы работать на долгосрочной основе'
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
		role: 'buyer',
		name: 'Егор',
		phone: '+7 (916) 326-47-05',
		email: 'egordolgih@mail.ru',
		businessType: ['construction', 'manufacturing'],
		companyName: 'ООО "СтройПроект"',
		comment: 'Сложно найти поставщиков с адекватными ценами и качественными материалами'
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