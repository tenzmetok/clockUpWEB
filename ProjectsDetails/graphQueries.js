import gql from 'graphql-tag';

const PROJECT_BY_ID = gql`
  query($id: ID!) {
    getProjectById(id: $id) {
      name
      color
      client_id
      active_status
      visiblity_status
      created_at
      updated_at
      bill_rate
      owner_id
      billing_status
      estimation_type
      estimate_time
      notes
      client {
        id
        name
      }
    }
  }
`;

const GET_CLIENTS_BY_WORKSPACE = gql`
  query($workspace_id: ID!) {
    getClientsByWorkspaceId(workspace_id: $workspace_id) {
      id
      name
    }
  }
`;

export { PROJECT_BY_ID, GET_CLIENTS_BY_WORKSPACE };
