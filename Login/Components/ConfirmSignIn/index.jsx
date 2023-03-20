import React from 'react';
import PropTypes from 'prop-types';
import s from './ConfirmSignIn.module.scss';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

const propTypes = {
  code: PropTypes.string,
  // onCodeBlur: PropTypes.func.isRequired,
  onCodeChange: PropTypes.func.isRequired,
  codeError: PropTypes.string,
  onConfirmSignIn: PropTypes.func.isRequired,
};

const defaultProps = {
  code: '',
  codeError: '',
};

const ConfirmSignIn = ({
  code,
  // onCodeBlur,
  onCodeChange,
  codeError,
  onConfirmSignIn,
}) => {
  return (
    <div className={s.root}>
      <form onSubmit={onConfirmSignIn} className={s.formContainer}>
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
      </form>
    </div>
  );
};

ConfirmSignIn.defaultProps = defaultProps;
ConfirmSignIn.propTypes = propTypes;
export default ConfirmSignIn;
