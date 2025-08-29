import React, { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

const MultiSelect = ({ options, value, onChange, placeholder, name }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedItems, setSelectedItems] = useState(value || []);
	const dropdownRef = useRef(null);

	// Синхронизируем внутреннее состояние с внешним value
	useEffect(() => {
		setSelectedItems(value || []);
	}, [value]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleToggleOption = (optionValue) => {
		let newSelectedItems;
		if (selectedItems.includes(optionValue)) {
			newSelectedItems = selectedItems.filter(item => item !== optionValue);
		} else {
			newSelectedItems = [...selectedItems, optionValue];
		}

		setSelectedItems(newSelectedItems);
		onChange({
			target: {
				name: name,
				value: newSelectedItems
			}
		});
	};

	const handleRemoveItem = (optionValue, e) => {
		e.stopPropagation();
		const newSelectedItems = selectedItems.filter(item => item !== optionValue);
		setSelectedItems(newSelectedItems);
		onChange({
			target: {
				name: name,
				value: newSelectedItems
			}
		});
	};

	const getSelectedLabels = () => {
		return selectedItems.map(value => {
			const option = options.find(opt => opt.value === value);
			return option ? option.label : value;
		});
	};

	const getDisplayText = () => {
		if (selectedItems.length === 0) {
			return placeholder;
		}
		if (selectedItems.length === 1) {
			return getSelectedLabels()[0];
		}
		return `Выбрано: ${selectedItems.length}`;
	};

	return (
		<div className="multi-select" ref={dropdownRef}>
			<div
				className={`multi-select-control ${isOpen ? 'open' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="multi-select-value">
					{getDisplayText()}
				</div>
				<div className="multi-select-arrow">
					<i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
				</div>
			</div>

			{selectedItems.length > 0 && (
				<div className="multi-select-tags">
					{getSelectedLabels().map((label, index) => (
						<span key={selectedItems[index]} className="multi-select-tag">
							{label}
							<button
								type="button"
								className="multi-select-tag-remove"
								onClick={(e) => handleRemoveItem(selectedItems[index], e)}
							>
								<i className="fas fa-times"></i>
							</button>
						</span>
					))}
				</div>
			)}

			{isOpen && (
				<div className="multi-select-dropdown">
					{options.map((option) => (
						<div
							key={option.value}
							className={`multi-select-option ${selectedItems.includes(option.value) ? 'selected' : ''}`}
							onClick={() => handleToggleOption(option.value)}
						>
							<div className="multi-select-checkbox">
								{selectedItems.includes(option.value) && (
									<i className="fas fa-check"></i>
								)}
							</div>
							<span>{option.label}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MultiSelect;
