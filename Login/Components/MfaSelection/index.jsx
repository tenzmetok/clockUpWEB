import React from 'react';
import PropTypes from 'prop-types';
import s from './MfaSelection.module.scss';

const propTypes = {
  onMfaChange: PropTypes.func.isRequired,
};

const MfaSelection = ({ onMfaChange }) => {
  return (
    <div className={s.root}>
      <div>
        <input type="radio" name="mfa_type" value="SMS" onChange={onMfaChange} />
        SMS
        <input type="radio" name="mfa_type" value="QRCODE" onChange={onMfaChange} />
        Qr Code
      </div>
    </div>
  );
};

// MfaSelection.defaultProps = defaultProps;
MfaSelection.propTypes = propTypes;
export default MfaSelection;
