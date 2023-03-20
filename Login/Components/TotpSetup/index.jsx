import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import QRCode from 'qrcode.react';
import s from './TotpSetup.module.scss';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

const propTypes = {
  code: PropTypes.string,
  // onCodeBlur: PropTypes.func.isRequired,
  onCodeChange: PropTypes.func.isRequired,
  codeError: PropTypes.string,
  onVerifyTotpToken: PropTypes.func.isRequired,
};

const defaultProps = {
  code: '',
  codeError: '',
};

const TotpSetup = ({
  user,
  code,
  // onCodeBlur,
  onCodeChange,
  codeError,
  onVerifyTotpToken,
}) => {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    async function generateQRCode() {
      try {
        const codeString = await Auth.setupTOTP(user);
        console.log('codeString', codeString);
        const generatedQrCode = `otpauth://totp/AWSCognito:${
          user.challengeParam ? user.challengeParam.userAttributes.email : user.attributes.email
        }?secret=${codeString}&issuer=Hs`;
        console.log('generatedQrCode', generatedQrCode);
        setQrCode(generatedQrCode);
      } catch (e) {
        console.log('generateQRCode', e);
      }
    }
    generateQRCode();
  }, [user]);

  return (
    <div className={s.root}>
      <div>
        <QRCode value={qrCode} />
      </div>
      <form onSubmit={onVerifyTotpToken} className={s.formContainer}>
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

TotpSetup.defaultProps = defaultProps;
TotpSetup.propTypes = propTypes;
export default TotpSetup;
