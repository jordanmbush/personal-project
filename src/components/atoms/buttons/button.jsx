import React from 'react';
import PropTypes from 'prop-types';
import './button.css';

const Button = ({ children, onClick, className }) => (
  <button type="button" onClick={onClick} className={`basic-btn ${className}`}>
    {children}
  </button>
);

export default Button;

Button.propTypes = {
  children: PropTypes.oneOfType(PropTypes.string, PropTypes.array).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  className: '',
};
