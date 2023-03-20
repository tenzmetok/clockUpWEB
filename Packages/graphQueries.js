import gql from 'graphql-tag';

export const PACKAGES = gql`
  query {
    packages {
      id
      title
    }
  }
`;

export const PACKAGE = gql`
  query package($id: ID!) {
    package(id: $id) {
      id
      title
    }
  }
`;

export default { PACKAGES, PACKAGE };
