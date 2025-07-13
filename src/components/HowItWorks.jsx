import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
	const steps = [
		{
			icon: 'fas fa-file-alt',
			title: 'Заявка',
			description: 'Оставляете заявку — что ищете и в каком объеме'
		},
		{
			icon: 'fas fa-search',
			title: 'Подбор поставщика',
			description: 'Получаете варианты — цены напрямую от поставщиков'
		},
		{
			icon: 'fas fa-truck',
			title: 'Доставка',
			description: 'Заключаете сделку — безопасно и быстро'
		}
	];

	return (
		<section className="how-it-works" id="how-it-works">
			<div className="container">
				<h2 className="section-title">Как это работает</h2>
				<div className="steps">
					{steps.map((step, index) => (
						<React.Fragment key={index}>
							<div className="step">
								<div className="step-icon">
									<i className={step.icon}></i>
								</div>
								<div className="step-content">
									<h3>{step.title}</h3>
									<p>{step.description}</p>
								</div>
							</div>
							{index < steps.length - 1 && (
								<div className="step-arrow">
									<i className="fas fa-arrow-right"></i>
								</div>
							)}
						</React.Fragment>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks; 