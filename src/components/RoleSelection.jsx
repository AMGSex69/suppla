import React from 'react';
import './RoleSelection.css';

const RoleSelection = ({ onRoleSelect }) => {
	return (
		<div className="role-selection">
			<div className="role-selection-content">
				<h2>Выберите вашу роль</h2>
				<p>Чтобы лучше понять ваши потребности, выберите подходящий вариант</p>

				<div className="role-options">
					<div className="role-card" onClick={() => onRoleSelect('supplier')}>
						<div className="role-icon">
							<i className="fas fa-industry"></i>
						</div>
						<div className="role-content">
							<h3>Я поставщик</h3>
							<p>Предлагаю товары или услуги для бизнеса</p>
							<ul>
								<li>Хочу найти новых клиентов</li>
								<li>Расширить географию продаж</li>
								<li>Увеличить объемы поставок</li>
							</ul>
						</div>
						<div className="role-arrow">
							<i className="fas fa-arrow-right"></i>
						</div>
					</div>

					<div className="role-card" onClick={() => onRoleSelect('buyer')}>
						<div className="role-icon">
							<i className="fas fa-shopping-cart"></i>
						</div>
						<div className="role-content">
							<h3>Я покупатель</h3>
							<p>Ищу надежных поставщиков для бизнеса</p>
							<ul>
								<li>Нужны качественные товары</li>
								<li>Хочу лучшие цены</li>
								<li>Ищу проверенных партнеров</li>
							</ul>
						</div>
						<div className="role-arrow">
							<i className="fas fa-arrow-right"></i>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RoleSelection;
