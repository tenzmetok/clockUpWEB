import gql from 'graphql-tag';

const UPDATE_PROJECT = gql`
  mutation updateProject($input: updateProjectInput!) {
    updateProject(input: $input) {
      isUpdated
    }
  }
`;
export default UPDATE_PROJECT;
