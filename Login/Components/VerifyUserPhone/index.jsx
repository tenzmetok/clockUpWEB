import React from 'react';
import PropTypes from 'prop-types';
import s from './VerifyUserPhone.module.scss';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

const propTypes = {
  phoneNumber: PropTypes.string,
  phoneError: PropTypes.string,
  showVerifyPhone: PropTypes.bool,
  code: PropTypes.string,
  onCodeChange: PropTypes.func.isRequired,
  codeError: PropTypes.string,
  onPhoneNumberBlur: PropTypes.func.isRequired,
  onPhoneNumberChange: PropTypes.func.isRequired,
  onUpdatePhoneNumber: PropTypes.func.isRequired,
  onVerifyUserAttribute: PropTypes.func.isRequired,
};

const defaultProps = {
  phoneNumber: '',
  phoneError: '',
  showVerifyPhone: false,
  code: '',
  codeError: '',
};
const VerifyUserPhone = ({
  phoneNumber,
  phoneError,
  showVerifyPhone,
  code,
  onCodeChange,
  codeError,
  onPhoneNumberBlur,
  onPhoneNumberChange,
  onUpdatePhoneNumber,
  onVerifyUserAttribute,
}) => {
  return (
    <div className={s.root}>
      <form onSubmit={onVerifyUserAttribute} className={s.formContainer}>
        <div>
          <Input
            name="phoneNumber"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onBlur={onPhoneNumberBlur}
            onChange={onPhoneNumberChange}
            errorText={phoneError}
            isError={phoneError.length > 0}
            required
          />
          <Button className={s.btn} color="success" size="lg" onClick={onUpdatePhoneNumber}>
            Update Phone Number
          </Button>
        </div>
        {showVerifyPhone && (
          <div>
            <Input
              name="code"
              placeholder="Enter Code"
              value={code}
              // onBlur={onCodeBlur}
              onChange={onCodeChange}
              errorText={codeError}
              isError={codeError.length > 0}
              required
            />
            <Button className={s.btn} color="success" size="lg" type="submit">
              Verify Code
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

VerifyUserPhone.defaultProps = defaultProps;
VerifyUserPhone.propTypes = propTypes;
export default VerifyUserPhone;
