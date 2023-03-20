/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag';

const GET_FILTERED_PROJECTS = gql`
  query(
    $limit: Int
    $offset: Int
    $sortKey: String
    $sortValue: String
    $visiblity_status: String
    $billing_status: String
    $query: String
    $client_id: Int
    $workspace_id: ID
  ) {
    getFilteredProjects(
      where: {
        limit: $limit
        offset: $offset
        visiblity_status: $visiblity_status
        billing_status: $billing_status
        query: $query
        client_id: $client_id
        workspace_id: $workspace_id
      }
      order: { key: $sortKey, value: $sortValue }
    ) {
      projects {
        id
        name
        color
        visiblity_status
        created_at
        updated_at
        client_id
        active_status
        bill_rate
        billing_status
        highlighted
        client {
          name
        }
      }
    }
  }
`;

const GET_CLIENTS_BY_WORKSPACE = gql`
  query($workspace_id: ID!) {
    getClientsByWorkspaceId(workspace_id: $workspace_id) {
      id
      name
      archive_status
    }
  }
`;

export { GET_CLIENTS_BY_WORKSPACE, GET_FILTERED_PROJECTS };
