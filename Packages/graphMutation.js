import gql from 'graphql-tag';

export const CREATE_PACKAGE = gql`
  mutation addPackage($input: addPackageInput!) {
    addPackage(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_PACKAGE = gql`
  mutation updatePackage($input: updatePackageInput!) {
    updatePackage(input: $input) {
      id
      title
    }
  }
`;

export const REMOVE_PACKAGE = gql`
  mutation removePackage($id: Int!) {
    removePackage(id: $id) {
      id
    }
  }
`;

export default { CREATE_PACKAGE, UPDATE_PACKAGE, REMOVE_PACKAGE };
