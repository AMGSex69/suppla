import React from 'react';
import './Footer.css';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-content">
					<div className="footer-left">
						<h3>Suppla</h3>
						<p>Оптовые поставки для бизнеса — быстро и выгодно</p>
					</div>
					<div className="footer-right">
						<div className="footer-links">
							<a href="#">О компании</a>
							<a href="#">Условия использования</a>
							<a href="#">Политика конфиденциальности</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer; 