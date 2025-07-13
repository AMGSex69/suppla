# 🚀 Полная инструкция по настройке Suppla с Google Forms

## 🎯 Что мы настраиваем:

✅ **Google Sheets** - для хранения заявок  
✅ **Email уведомления** - о новых заявках  
✅ **Vercel deployment** - работает без проблем  
✅ **Красивая форма** - остается на сайте  

---

## 📋 Шаг 1: Настройка Google Apps Script

### 1.0 Подготовка Google Sheets
**Вариант А:** Используйте существующую таблицу
1. Откройте вашу Google Sheets таблицу
2. Скопируйте ID из URL: `https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit`
3. ID = `1ABC123xyz456` (это нужно будет в шаге 1.3)

**Вариант Б:** Создайте новую таблицу
1. Откройте https://sheets.google.com
2. Создайте новую таблицу
3. Скопируйте ID из URL

### 1.1 Создание проекта
1. Откройте https://script.google.com
2. Нажмите "Создать проект"
3. Назовите проект "Suppla Form Handler"

### 1.2 Добавление кода
1. Удалите весь код по умолчанию
2. Скопируйте код из файла `google-apps-script.js`
3. Вставьте в редактор
4. Сохраните (Ctrl+S)

### 1.3 Настройка конфигурации
Измените эти строки в коде:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ID ВАШЕЙ GOOGLE SHEETS ТАБЛИЦЫ
const NOTIFICATION_EMAIL = 'egordolgih@mail.ru'; // ВАШ EMAIL
const FORM_URL = 'https://your-suppla-site.vercel.app'; // URL ВАШЕГО САЙТА
```

**Как получить SPREADSHEET_ID:**
1. Откройте вашу Google Sheets таблицу
2. Скопируйте ID из URL: `https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit`
3. ID = `1ABC123xyz456`

**Важно:** Код будет использовать именно эту таблицу для всех заявок. Если лист "Заявки Suppla" не существует, он будет создан автоматически.

### 1.4 Права доступа
1. Нажмите "Выполнить" для функции `testSubmission`
2. Разрешите доступ к Google Sheets и Gmail
3. Подтвердите все запросы

### 1.5 Публикация
1. Нажмите "Развернуть" → "Новое развертывание"
2. Выберите тип "Веб-приложение"
3. Выполнить как: "Меня"
4. Доступ: "Все"
5. Нажмите "Развернуть"

### 1.6 Копирование URL
Скопируйте URL вида:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

---

## 🔧 Шаг 2: Настройка React приложения

### 2.1 Обновление конфигурации
Откройте файл `src/config/google.js` и замените:
```javascript
const GOOGLE_SCRIPT_ID = 'YOUR_SCRIPT_ID';
```

На ваш реальный ID из URL Google Apps Script:
```javascript
const GOOGLE_SCRIPT_ID = 'AKfycbz...'; // ID из URL
```

### 2.2 Пересборка проекта
```bash
npm run build
```

---

## 🧪 Шаг 3: Тестирование

### 3.1 Тест Google Apps Script
1. **Важно:** Убедитесь что заменили `YOUR_SPREADSHEET_ID` на реальный ID таблицы
2. В Google Apps Script выберите функцию `testSubmission`
3. Нажмите "Выполнить"
4. Проверьте создание листа "Заявки Suppla" в вашей таблице
5. Проверьте приход тестового email

### 3.2 Тест веб-формы
1. Запустите локальный сервер: `npm start`
2. Откройте http://localhost:3001
3. Заполните форму и отправьте
4. Проверьте Google Sheets и email

---

## 📊 Шаг 4: Проверка Google Sheets

### 4.1 Структура таблицы
Таблица "Заявки Suppla" должна иметь колонки:
- ID | Имя | Телефон | Email | Тип бизнеса | Дата создания | Статус

### 4.2 Работа с данными
- **Просмотр:** Откройте таблицу в Google Sheets
- **Экспорт:** Файл → Скачать → CSV
- **Статус:** Измените статус заявки в колонке "Статус"

---

## 🌐 Шаг 5: Деплой на Vercel

### 5.1 Подготовка
```bash
# Убедитесь что Google Apps Script настроен
npm run build

# Проверьте что нет ошибок
npm test
```

### 5.2 Деплой
```bash
# Если не установлен Vercel CLI
npm install -g vercel

# Деплой
vercel --prod
```

### 5.3 Настройка домена
1. В Vercel dashboard перейдите в настройки проекта
2. Добавьте кастомный домен (опционально)
3. Обновите `FORM_URL` в Google Apps Script

---

## 📧 Шаг 6: Настройка уведомлений

### 6.1 Email уведомления
При каждой новой заявке на `egordolgih@mail.ru` придет письмо:
```
[Suppla] Новая заявка от Имя

📋 ИНФОРМАЦИЯ О ЗАЯВКЕ:
• ID: 1234567890
• Имя: Имя клиента
• Телефон: +7 (xxx) xxx-xx-xx
• Email: client@example.com
• Тип бизнеса: Строительство
• Дата: 13.07.2025, 15:30:00
```

### 6.2 Дополнительные уведомления
Можете добавить еще email'ы в функцию `sendNotification`:
```javascript
const emails = ['egordolgih@mail.ru', 'manager@suppla.com'];
emails.forEach(email => {
  GmailApp.sendEmail(email, subject, body);
});
```

---

## 🔥 Результат

### ✅ Что работает:
- **Красивая форма** на сайте
- **Автосохранение** в Google Sheets
- **Email уведомления** при новых заявках
- **Работает на Vercel** без серверной части
- **Экспорт в Excel** одним кликом
- **Статистика** и аналитика

### 📱 Доступ к данным:
- **Google Sheets:** https://docs.google.com/spreadsheets/d/ВАШ_ID_ТАБЛИЦЫ
- **Сайт:** https://your-suppla-site.vercel.app
- **Email:** автоматические уведомления с рабочими ссылками

---

## 🆘 Решение проблем

### Форма не отправляется
1. Проверьте `GOOGLE_SCRIPT_ID` в `src/config/google.js`
2. Убедитесь что Google Apps Script опубликован
3. Проверьте права доступа в Google Apps Script

### Не приходят уведомления
1. Проверьте email в `NOTIFICATION_EMAIL`
2. Проверьте права доступа к Gmail
3. Посмотрите папку "Спам"

### Не создается таблица
1. **Важно:** Убедитесь что заменили `YOUR_SPREADSHEET_ID` на реальный ID таблицы
2. Проверьте права доступа к Google Sheets
3. Выполните `testSubmission` в Google Apps Script
4. Проверьте вашу Google Sheets таблицу

---

## 🎯 Готово!

Теперь у вас есть полноценная система сбора заявок:
- 💾 **Надежное хранение** в Google Sheets
- 📧 **Мгновенные уведомления** на email
- 🚀 **Работает на Vercel** без проблем
- 📊 **Удобная аналитика** в Google Sheets
- 💰 **Бесплатно** навсегда

**Ваш сайт готов к работе!** 🎉 