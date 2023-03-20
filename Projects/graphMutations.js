import gql from 'graphql-tag';

const ADD_PROJECT = gql`
  mutation addProject($input: addProjectInput!) {
    addProject(input: $input) {
      isAdded
    }
  }
`;

const REMOVE_PROJECT = gql`
  mutation removeProject($id: ID!) {
    removeProject(id: $id) {
      isDeleted
    }
  }
`;
export { ADD_PROJECT, REMOVE_PROJECT };
