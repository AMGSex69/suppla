import React, { useState } from 'react';
import './ContactForm.css';
import RoleSelection from './RoleSelection';
import MultiSelect from './MultiSelect';
import { submitForm, isGoogleScriptReady } from '../config/google';

const ContactForm = () => {
	const [selectedRole, setSelectedRole] = useState(null);
	const [formData, setFormData] = useState({
		role: '',
		name: '',
		phone: '',
		email: '',
		businessType: [],
		companyName: '',
		comment: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [notification, setNotification] = useState(null);

	const handleRoleSelect = (role) => {
		setSelectedRole(role);
		setFormData(prev => ({
			...prev,
			role: role,
			businessType: [], // Сбрасываем тип бизнеса при смене роли
			comment: ''
		}));
	};

	const handleBackToRoleSelection = () => {
		setSelectedRole(null);
		setFormData({
			role: '',
			name: '',
			phone: '',
			email: '',
			businessType: [],
			companyName: '',
			comment: ''
		});
	};

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
		const { role, name, phone, email, businessType } = formData;

		if (!role || !name || !phone || !email || !businessType || businessType.length === 0) {
			showNotification('Пожалуйста, заполните все обязательные поля', 'error');
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
			// Логируем данные перед отправкой для отладки
			console.log('🚀 Отправляем данные формы:', formData);
			console.log('🔍 Роль:', formData.role);
			console.log('🔍 Компания:', formData.companyName);
			console.log('🔍 Комментарий:', formData.comment);

			// Отправляем данные через конфигурированную функцию
			await submitForm(formData);

			// Показываем успешное уведомление
			showNotification('Спасибо! Мы тестируем сервис. Как только сервис будет запущен, с вами свяжутся.', 'success');

			// Очищаем форму
			setFormData({
				role: selectedRole,
				name: '',
				phone: '',
				email: '',
				businessType: [],
				companyName: '',
				comment: ''
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

	// Функции для получения опций в зависимости от роли
	const getBusinessTypeOptions = () => {
		if (selectedRole === 'supplier') {
			return [
				{ value: 'construction', label: 'Строительные материалы' },
				{ value: 'manufacturing', label: 'Производство и промышленность' },
				{ value: 'food', label: 'Продукты питания' },
				{ value: 'agriculture', label: 'Сельское хозяйство' },
				{ value: 'textiles', label: 'Текстиль и одежда' },
				{ value: 'electronics', label: 'Электроника и IT' },
				{ value: 'automotive', label: 'Автомобильная промышленность' },
				{ value: 'chemicals', label: 'Химическая промышленность' },
				{ value: 'medical', label: 'Медицинское оборудование' },
				{ value: 'furniture', label: 'Мебель и интерьер' },
				{ value: 'packaging', label: 'Упаковка и тара' },
				{ value: 'energy', label: 'Энергетика' },
				{ value: 'logistics', label: 'Логистика и транспорт' },
				{ value: 'services', label: 'Услуги' },
				{ value: 'other', label: 'Другое' }
			];
		} else {
			return [
				{ value: 'construction', label: 'Строительные материалы' },
				{ value: 'manufacturing', label: 'Промышленное оборудование' },
				{ value: 'food', label: 'Продукты питания' },
				{ value: 'agriculture', label: 'Сельскохозяйственная продукция' },
				{ value: 'textiles', label: 'Текстиль и одежда' },
				{ value: 'electronics', label: 'Электроника и IT товары' },
				{ value: 'automotive', label: 'Автозапчасти и комплектующие' },
				{ value: 'chemicals', label: 'Химические товары' },
				{ value: 'medical', label: 'Медицинские товары' },
				{ value: 'furniture', label: 'Мебель и интерьер' },
				{ value: 'office', label: 'Офисные товары' },
				{ value: 'packaging', label: 'Упаковочные материалы' },
				{ value: 'energy', label: 'Энергетические товары' },
				{ value: 'raw_materials', label: 'Сырье и материалы' },
				{ value: 'other', label: 'Другое' }
			];
		}
	};

	const getCommentPlaceholder = () => {
		if (selectedRole === 'supplier') {
			return 'Что самое сложное в поиске новых клиентов для вашего бизнеса?';
		} else {
			return 'С какими главными трудностями вы сталкиваетесь при поиске новых поставщиков?';
		}
	};

	const getRoleTitle = () => {
		if (selectedRole === 'supplier') {
			return 'Регистрация поставщика';
		} else {
			return 'Регистрация покупателя';
		}
	};

	return (
		<section className="contact-section" id="contact">
			<div className="container">
				{!selectedRole ? (
					<RoleSelection onRoleSelect={handleRoleSelect} />
				) : (
					<div className="contact-content">
						<div className="contact-info">
							<div className="back-button" onClick={handleBackToRoleSelection}>
								<i className="fas fa-arrow-left"></i>
								<span>Назад к выбору роли</span>
							</div>
							<h2>{getRoleTitle()}</h2>
							<p>Заполните форму и мы свяжемся с вами в ближайшее время</p>
							<div className="benefits">
								<div className="benefit">
									<i className="fas fa-clock"></i>
									<span>Ответ в течение 30 минут</span>
								</div>
								<div className="benefit">
									<i className="fas fa-shield-alt"></i>
									<span>Проверенные партнеры</span>
								</div>
								<div className="benefit">
									<i className="fas fa-percent"></i>
									<span>Выгодные условия</span>
								</div>
							</div>
						</div>
						<div className="contact-form">
							<form onSubmit={handleSubmit}>
								<div className="form-group">
									<input
										type="text"
										name="name"
										placeholder="Ваше имя *"
										value={formData.name}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-group">
									<input
										type="tel"
										name="phone"
										placeholder="Телефон *"
										value={formData.phone}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-group">
									<input
										type="email"
										name="email"
										placeholder="Email *"
										value={formData.email}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-group">
									<MultiSelect
										name="businessType"
										value={formData.businessType}
										onChange={handleChange}
										options={getBusinessTypeOptions()}
										placeholder={selectedRole === 'supplier' ? 'Выберите виды бизнеса *' : 'Выберите виды продукции *'}
									/>
								</div>
								<div className="form-group">
									<input
										type="text"
										name="companyName"
										placeholder="Наименование компании"
										value={formData.companyName}
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<textarea
										name="comment"
										placeholder={getCommentPlaceholder()}
										value={formData.comment}
										onChange={handleChange}
										rows="4"
									/>
								</div>
								<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
									{isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
								</button>
							</form>
						</div>
					</div>
				)}
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