import gql from 'graphql-tag';

const ADD_ALERT = gql`
  mutation addAlert($input: addAlertInput!) {
    addAlert(input: $input) {
      isAlertAdded
    }
  }
`;

const UPDATE_ALERT = gql`
  mutation updateAlert($input: updateAlertInput!) {
    updateAlert(input: $input) {
      isUpdated
    }
  }
`;

const REMOVE_ALERT = gql`
  mutation removeAlert($id: ID!) {
    removeAlert(id: $id) {
      isRemoved
    }
  }
`;

export { ADD_ALERT, REMOVE_ALERT, UPDATE_ALERT };
