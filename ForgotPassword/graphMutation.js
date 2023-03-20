import gql from 'graphql-tag';

const SEND_OTP = gql`
  mutation checkEmailAndSend($input: email) {
    checkEmailAndSendOTP(input: $input) {
      emailToken
    }
  }
`;
export default SEND_OTP;
