import React from 'react';
import './Hero.css';

const Hero = () => {
	const scrollToContact = () => {
		const contactSection = document.getElementById('contact');
		if (contactSection) {
			const headerHeight = 80; // высота фиксированной шапки
			const elementPosition = contactSection.offsetTop - headerHeight;

			window.scrollTo({
				top: elementPosition,
				behavior: 'smooth'
			});
		}
	};

	return (
		<section className="hero">
			<div className="hero-bg">
				<div className="wave-1"></div>
				<div className="wave-2"></div>
				<div className="gradient-circle"></div>
			</div>
			<div className="container">
				<div className="hero-content">
					<div className="hero-text">
						<h2 className="hero-title">Находите проверенных поставщиков за 5 минут</h2>
						<p className="hero-subtitle">
							Прямые цены, надежные контрагенты, удобные платежи
						</p>
						<button className="btn btn-primary" onClick={scrollToContact}>
							Оставить заявку
						</button>
					</div>
					<div className="hero-image">
						<div className="mockup-container">
							<div className="mockup-screen">
								<div className="mockup-content">
									<div className="mockup-header">
										<div className="mockup-dots">
											<span></span>
											<span></span>
											<span></span>
										</div>
									</div>
									<div className="mockup-body">
										<div className="supplier-card">
											<div className="supplier-info">
												<div className="supplier-avatar"></div>
												<div className="supplier-details">
													<h4>ООО "СтройМатериалы"</h4>
													<p>Цемент М400 - 25 кг</p>
												</div>
											</div>
											<div className="supplier-price">₽320</div>
										</div>
										<div className="supplier-card">
											<div className="supplier-info">
												<div className="supplier-avatar"></div>
												<div className="supplier-details">
													<h4>ТД "Металлург"</h4>
													<p>Арматура А500С - 12мм</p>
												</div>
											</div>
											<div className="supplier-price">₽45,500</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero; 