import gql from 'graphql-tag';

const VERIFY_OTP = gql`
  query($otp: Int!, $emailToken: String!) {
    otpVerification(otp: $otp, emailToken: $emailToken) {
      isVerified
    }
  }
`;
export default VERIFY_OTP;
