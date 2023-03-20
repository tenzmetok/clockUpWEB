import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import SignIn from './Components/SignIn';
import { isValidEmail, passwordPolicyCheck, allTrue } from '../../utils/index';

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const errorMessages = {
  emailRequired: 'This field is required',
  emailInvalid: 'Please enter a valid email',
  passwordRequired: 'This field is required',
  passwordInvalid: 'Please enter valid password',
  passwordNotMatch: 'Password and Re-enter Password Not matched',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = async (e) => {
    let emailErrorMessage = '';
    if (email.trim().length === 0) emailErrorMessage = errorMessages.emailRequired;
    if (!isValidEmail(email)) emailErrorMessage = errorMessages.emailInvalid;
    setEmailError(emailErrorMessage);
    setEmail(e.target.value);
  };

  const handlePasswordChange = async (e) => {
    const pass = e.target.value;
    let passwordErrorMessage = '';
    if (pass.trim().length === 0) passwordErrorMessage = errorMessages.passwordRequired;
    else if (!allTrue(passwordPolicyCheck(pass)))
      passwordErrorMessage = errorMessages.passwordInvalid;
    setPasswordError(passwordErrorMessage);
    setPassword(e.target.value);
  };

  return (
    <div className="loginwrapper">
      <SignIn
        emailValue={email}
        passwordValue={password}
        onEmailInput={handleEmailChange}
        onPasswordInput={handlePasswordChange}
        emailError={emailError}
        passwordError={passwordError}
      />
    </div>
  );
};

Login.propTypes = propTypes;
export default withApollo(Login);
