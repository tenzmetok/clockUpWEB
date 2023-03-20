import gql from 'graphql-tag';

const UPDATE_PASSWORD = gql`
  mutation updatePassword($input: resetPassword) {
    updatePassword(input: $input) {
      updatePasswordDetails
    }
  }
`;
export default UPDATE_PASSWORD;
