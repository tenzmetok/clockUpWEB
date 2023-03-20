import gql from 'graphql-tag';

const CHECK_EMAIL_SEND_EMAIL = gql`
  query($email: String!) {
    EmailExist(email: $email) {
      isEmailexist
    }
  }
`;
export default CHECK_EMAIL_SEND_EMAIL;
