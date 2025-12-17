import React from 'react';
import styles from './Input.module.css';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = false,
  errorText,
  helpText,
  disabled = false,
  className = '',
  isRequired = false,
  ...props 
}) => {
  const inputClasses = [
    styles.input,
    error && styles.error,
    type === 'select' && styles.select,
    type === 'textarea' && styles.textarea,
    className
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          className={inputClasses}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {props.children}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          className={inputClasses}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        className={inputClasses}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    );
  };

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label}>
          {label}
          {(required || isRequired) && <span className={styles.required}>*</span>}
          {error && isRequired && (
            <span className={styles.requiredNote}>(Required)</span>
          )}
        </label>
      )}
      {renderInput()}
      {errorText && <span className={styles.errorText}>{errorText}</span>}
      {helpText && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};

export default Input;