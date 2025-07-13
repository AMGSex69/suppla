// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) {
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	});
});

// Header background on scroll
window.addEventListener('scroll', function () {
	const header = document.querySelector('.header');
	if (window.scrollY > 50) {
		header.style.background = 'rgba(255, 255, 255, 0.95)';
		header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
	} else {
		header.style.background = 'rgba(255, 255, 255, 0.9)';
		header.style.boxShadow = 'none';
	}
});

// Form handling
document.querySelector('form').addEventListener('submit', function (e) {
	e.preventDefault();

	const formData = new FormData(this);
	const data = Object.fromEntries(formData);

	// Get form values
	const name = document.getElementById('name').value;
	const phone = document.getElementById('phone').value;
	const email = document.getElementById('email').value;
	const businessType = document.getElementById('business-type').value;

	// Basic validation
	if (!name || !phone || !email || !businessType) {
		showNotification('Пожалуйста, заполните все поля', 'error');
		return;
	}

	// Email validation
	if (!isValidEmail(email)) {
		showNotification('Пожалуйста, введите корректный email', 'error');
		return;
	}

	// Phone validation
	if (!isValidPhone(phone)) {
		showNotification('Пожалуйста, введите корректный телефон', 'error');
		return;
	}

	// Show loading state
	const submitBtn = this.querySelector('button[type="submit"]');
	const originalText = submitBtn.textContent;
	submitBtn.textContent = 'Отправляем...';
	submitBtn.disabled = true;

	// Simulate API call
	setTimeout(() => {
		showNotification('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
		this.reset();

		// Reset button
		submitBtn.textContent = originalText;
		submitBtn.disabled = false;
	}, 1500);
});

// Email validation
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
	const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
	return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Notification system
function showNotification(message, type = 'info') {
	// Remove existing notifications
	const existingNotifications = document.querySelectorAll('.notification');
	existingNotifications.forEach(notif => notif.remove());

	// Create notification element
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

	// Add notification styles
	const style = document.createElement('style');
	style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--primary-color);
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification-success {
            border-left-color: #10B981;
        }
        
        .notification-error {
            border-left-color: #EF4444;
        }
        
        .notification-content {
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-content i:first-child {
            font-size: 1.2rem;
            color: var(--primary-color);
        }
        
        .notification-success .notification-content i:first-child {
            color: #10B981;
        }
        
        .notification-error .notification-content i:first-child {
            color: #EF4444;
        }
        
        .notification-content span {
            flex: 1;
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 1rem;
            padding: 0.25rem;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .notification-close:hover {
            background: var(--background-secondary);
            color: var(--text-primary);
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;

	if (!document.querySelector('#notification-styles')) {
		style.id = 'notification-styles';
		document.head.appendChild(style);
	}

	// Add to page
	document.body.appendChild(notification);

	// Auto remove after 5 seconds
	setTimeout(() => {
		if (notification.parentNode) {
			notification.style.animation = 'slideOutRight 0.3s ease-out';
			setTimeout(() => notification.remove(), 300);
		}
	}, 5000);
}

// Phone input formatting
document.getElementById('phone').addEventListener('input', function (e) {
	let value = e.target.value.replace(/\D/g, '');
	if (value.startsWith('8')) {
		value = '7' + value.slice(1);
	}
	if (value.startsWith('7')) {
		value = '+7' + value.slice(1);
	}

	// Format: +7 (XXX) XXX-XX-XX
	if (value.length >= 2) {
		value = value.replace(/^(\+7)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/, function (match, p1, p2, p3, p4, p5) {
			let result = p1;
			if (p2) result += ' (' + p2;
			if (p3) result += ') ' + p3;
			if (p4) result += '-' + p4;
			if (p5) result += '-' + p5;
			return result;
		});
	}

	e.target.value = value;
});

// CTA button click handler
document.querySelector('.hero .btn-primary').addEventListener('click', function (e) {
	e.preventDefault();
	const contactSection = document.querySelector('#contact');
	contactSection.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});
});

// Intersection Observer for animations
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('animate');
		}
	});
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.step, .benefit, .supplier-card').forEach(el => {
	observer.observe(el);
});

// Add animation classes
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .step, .benefit, .supplier-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    .step.animate, .benefit.animate, .supplier-card.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(animationStyles);

// Add loading animation to mockup
function animateMockup() {
	const supplierCards = document.querySelectorAll('.supplier-card');
	supplierCards.forEach((card, index) => {
		setTimeout(() => {
			card.style.animation = 'fadeInUp 0.6s ease-out both';
		}, index * 200);
	});
}

// Start mockup animation when page loads
window.addEventListener('load', () => {
	setTimeout(animateMockup, 1000);
});

// Add parallax effect to hero background
window.addEventListener('scroll', () => {
	const scrolled = window.pageYOffset;
	const heroBackground = document.querySelector('.hero-bg');
	if (heroBackground) {
		heroBackground.style.transform = `translateY(${scrolled * 0.1}px)`;
	}
});

// Add hover effects to navigation
document.querySelectorAll('.nav a').forEach(link => {
	link.addEventListener('mouseenter', function () {
		this.style.transform = 'translateY(-2px)';
	});

	link.addEventListener('mouseleave', function () {
		this.style.transform = 'translateY(0)';
	});
});

console.log('Suppla B2B Platform loaded successfully!'); 