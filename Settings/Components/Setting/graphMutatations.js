/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag';

const UPDATE_WORKSPACE = gql`
  mutation updateWorkSpace($input: updateWorkSpaceInput!) {
    updateWorkSpace(input: $input) {
      isUpdated
    }
  }
`;

const GET_WORKSPACE_PIC_SIGNED_URL = gql`
  mutation getWorkSpacePicUploadLink($input: getWorkSpacePicUploadLinkInput!) {
    getWorkSpacePicUploadLink(input: $input) {
      signedRequest
      url
    }
  }
`;
export { UPDATE_WORKSPACE, GET_WORKSPACE_PIC_SIGNED_URL };
