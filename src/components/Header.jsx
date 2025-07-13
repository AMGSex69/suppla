import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 50;
			setScrolled(isScrolled);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			const headerHeight = 80; // высота фиксированной шапки
			const elementPosition = element.offsetTop - headerHeight;

			window.scrollTo({
				top: elementPosition,
				behavior: 'smooth'
			});
		}
	};

	return (
		<header className={`header ${scrolled ? 'scrolled' : ''}`}>
			<div className="container">
				<div className="header-content">
					<div className="logo">
						<div className="logo-main">
							<div className="logo-text">
								<div className="logo-title">
									<h1>Suppla</h1>
									<div className="logo-dots">
										<div className="logo-dot"></div>
										<div className="logo-dot"></div>
										<div className="logo-dot"></div>
									</div>
								</div>
								<p className="tagline">Оптовые поставки для бизнеса — быстро и выгодно</p>
							</div>
						</div>
					</div>
					<nav className="nav">
						<a href="#how-it-works" onClick={(e) => {
							e.preventDefault();
							scrollToSection('how-it-works');
						}}>
							Как это работает
						</a>
						<a href="#contact" onClick={(e) => {
							e.preventDefault();
							scrollToSection('contact');
						}}>
							Контакты
						</a>
						<button className="btn btn-outline">Войти</button>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Header; 