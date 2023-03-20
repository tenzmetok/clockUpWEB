import gql from 'graphql-tag';

const REGISTER_USER = gql`
  mutation registerUser($input: registerUserInput!) {
    registerUser(input: $input) {
      isUserRegistered
    }
  }
`;
export default REGISTER_USER;
