import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import './App.css';

function App() {
	return (
		<div className="App">
			<Header />
			<Hero />
			<HowItWorks />
			<ContactForm />
			<Footer />
		</div>
	);
}

export default App; 