import gql from 'graphql-tag';

const ADD_TASK = gql`
  mutation addTask($input: addTaskInput!) {
    addTask(input: $input) {
      isAdded
    }
  }
`;

const REMOVE_TASK = gql`
  mutation removeTask($id: ID!) {
    removeTask(id: $id) {
      isRemoved
    }
  }
`;

const UPDATE_TASK = gql`
  mutation updateTask($input: updateTaskInput!) {
    updateTask(input: $input) {
      isUpdated
    }
  }
`;
// eslint-disable-next-line import/prefer-default-export
export { ADD_TASK, REMOVE_TASK, UPDATE_TASK };
