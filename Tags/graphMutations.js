import gql from 'graphql-tag';

const ADD_TAG = gql`
  mutation addTag($input: addTagInput!) {
    addTag(input: $input) {
      isTagAdded
    }
  }
`;

const UPDATE_TAG = gql`
  mutation updateTag($input: updateTagInput!) {
    updateTag(input: $input) {
      isUpdated
    }
  }
`;

const REMOVE_TAG = gql`
  mutation removeTag($id: ID!) {
    removeTag(id: $id) {
      isRemoved
    }
  }
`;

export { ADD_TAG, REMOVE_TAG, UPDATE_TAG };
