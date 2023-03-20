import gql from 'graphql-tag';

const GET_USER_PIC_SIGNED_URL = gql`
  mutation getUserPicUploadLink($input: getUserPicUploadLinkInput!) {
    getUserPicUploadLink(input: $input) {
      signedRequest
      url
    }
  }
`;

const UPDATE_USER = gql`
  mutation updateUser($input: updateUserInput) {
    updateUser(input: $input) {
      isUserUpdated
    }
  }
`;

export { GET_USER_PIC_SIGNED_URL, UPDATE_USER };
