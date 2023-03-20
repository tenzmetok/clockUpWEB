import React from 'react';
import PropTypes from 'prop-types';
import s from './NewPassword.module.scss';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

const propTypes = {
  onNewPasswordInput: PropTypes.func.isRequired,
  onConfirmPasswordInput: PropTypes.func.isRequired,
  newPasswordValue: PropTypes.string,
  confirmNewPassword: PropTypes.string,
  newPasswordError: PropTypes.string,
  confirmNewPasswordError: PropTypes.string,
  onPasswordChange: PropTypes.func.isRequired,
  onNewPasswordBlur: PropTypes.func.isRequired,
  onConfirmPasswordBlur: PropTypes.func.isRequired,
};

const defaultProps = {
  newPasswordValue: '',
  confirmNewPassword: '',
  newPasswordError: '',
  confirmNewPasswordError: '',
};

const NewPassword = ({
  newPasswordValue,
  confirmNewPassword,
  onConfirmPasswordInput,
  onNewPasswordInput,
  newPasswordError,
  confirmNewPasswordError,
  onPasswordChange,
  onNewPasswordBlur,
  onConfirmPasswordBlur,
}) => (
  <>
    <form onSubmit={onPasswordChange} className={s.formContainer}>
      <Input
        label="Password"
        name="newPassword"
        type="password"
        placeholder="Enter New password"
        value={newPasswordValue}
        onBlur={onNewPasswordBlur}
        onChange={onNewPasswordInput}
        errorText={newPasswordError}
        isError={newPasswordError.length > 0}
        required
      />
      <Input
        label="Re-enter Password"
        name="confirmNewPassword"
        type="password"
        placeholder="Enter New password"
        value={confirmNewPassword}
        onBlur={onConfirmPasswordBlur}
        onChange={onConfirmPasswordInput}
        errorText={confirmNewPasswordError}
        isError={confirmNewPasswordError.length > 0}
        required
      />
      <Button className={s.btn} color="success" size="lg" type="submit">
        Change Password
      </Button>
    </form>
  </>
);

NewPassword.defaultProps = defaultProps;
NewPassword.propTypes = propTypes;
export default NewPassword;
