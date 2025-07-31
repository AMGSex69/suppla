import React, { useState } from 'react';
import './ContactForm.css';
import { submitForm, isGoogleScriptReady } from '../config/google';

const ContactForm = () => {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		businessType: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [notification, setNotification] = useState(null);

	const handleChange = (e) => {
		let { name, value } = e.target;

		// Format phone number
		if (name === 'phone') {
			value = formatPhoneNumber(value);
		}

		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const formatPhoneNumber = (value) => {
		let cleaned = value.replace(/\D/g, '');
		if (cleaned.startsWith('8')) {
			cleaned = '7' + cleaned.slice(1);
		}
		if (cleaned.startsWith('7')) {
			cleaned = '+7' + cleaned.slice(1);
		}

		if (cleaned.length >= 2) {
			cleaned = cleaned.replace(/^(\+7)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/,
				function (match, p1, p2, p3, p4, p5) {
					let result = p1;
					if (p2) result += ' (' + p2;
					if (p3) result += ') ' + p3;
					if (p4) result += '-' + p4;
					if (p5) result += '-' + p5;
					return result;
				});
		}

		return cleaned;
	};

	const validateForm = () => {
		const { name, phone, email, businessType } = formData;

		if (!name || !phone || !email || !businessType) {
			showNotification('Пожалуйста, заполните все поля', 'error');
			return false;
		}

		if (!isValidEmail(email)) {
			showNotification('Пожалуйста, введите корректный email', 'error');
			return false;
		}

		if (!isValidPhone(phone)) {
			showNotification('Пожалуйста, введите корректный телефон', 'error');
			return false;
		}

		return true;
	};

	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const isValidPhone = (phone) => {
		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
		return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
	};

	const showNotification = (message, type) => {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 5000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Отправляем данные через конфигурированную функцию
			await submitForm(formData);

			// Показываем успешное уведомление
			showNotification('Спасибо! Мы тестируем сервис. Как только сервис будет запущен, с вами свяжутся.', 'success');

			// Очищаем форму
			setFormData({
				name: '',
				phone: '',
				email: '',
				businessType: ''
			});

		} catch (error) {
			console.error('Ошибка отправки заявки:', error);

			// Показываем разные сообщения в зависимости от ошибки
			if (error.message.includes('Google Apps Script не настроен')) {
				showNotification('Система временно недоступна. Попробуйте позже или свяжитесь с нами напрямую.', 'error');
			} else {
				showNotification('Ошибка при отправке заявки. Попробуйте позже.', 'error');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="contact-section" id="contact">
			<div className="container">
				<div className="contact-content">
					<div className="contact-info">
						<h2>Готовы начать?</h2>
						<p>Оставьте заявку и мы подберем для вас лучших поставщиков</p>
						<div className="benefits">
							<div className="benefit">
								<i className="fas fa-clock"></i>
								<span>Ответ в течение 30 минут</span>
							</div>
							<div className="benefit">
								<i className="fas fa-shield-alt"></i>
								<span>Проверенные поставщики</span>
							</div>
							<div className="benefit">
								<i className="fas fa-percent"></i>
								<span>Экономия до 30%</span>
							</div>
						</div>
					</div>
					<div className="contact-form">
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<input
									type="text"
									name="name"
									placeholder="Ваше имя"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<input
									type="tel"
									name="phone"
									placeholder="Телефон"
									value={formData.phone}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<input
									type="email"
									name="email"
									placeholder="Email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<select
									name="businessType"
									value={formData.businessType}
									onChange={handleChange}
									required
								>
									<option value="">Вид бизнеса</option>
									<option value="construction">Строительство</option>
									<option value="manufacturing">Производство</option>
									<option value="retail">Розничная торговля</option>
									<option value="food">Общепит</option>
									<option value="other">Другое</option>
								</select>
							</div>
							<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
								{isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
							</button>
						</form>
					</div>
				</div>
			</div>

			{notification && (
				<div className={`notification notification-${notification.type}`}>
					<div className="notification-content">
						<i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
						<span>{notification.message}</span>
						<button className="notification-close" onClick={() => setNotification(null)}>
							<i className="fas fa-times"></i>
						</button>
					</div>
				</div>
			)}
		</section>
	);
};

export default ContactForm; 