import gql from 'graphql-tag';

const GET_CLIENTS_BY_WORKSPACE = gql`
  query($workspace_id: ID!) {
    getClientsByWorkspaceId(workspace_id: $workspace_id) {
      id
      name
    }
  }
`;

const GET_FILTERED_PROJECTS = gql`
  query($workspace_id: ID) {
    getFilteredProjects(where: { workspace_id: $workspace_id }) {
      projects {
        id
        name
      }
    }
  }
`;

export { GET_CLIENTS_BY_WORKSPACE, GET_FILTERED_PROJECTS };
