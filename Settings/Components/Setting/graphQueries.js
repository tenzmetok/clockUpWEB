import gql from 'graphql-tag';

const GET_WORKSPACE_BY_ID = gql`
  query($id: ID!) {
    workSpaceById(id: $id) {
      id
      owner_id
      workspace_name
      company_logo
      timetracker_status
      billing_status
      visibility_status
      bill_rate
      bill_rate_view_status
      currency
      group_project_label
      create_project_status
      create_client_status
      create_task_status
      task_filter
      create_tag_status
      time_format
      favorite_status
    }
  }
`;
const GET_WORKSPACE_MEMBERS = gql`
  query($id: ID!) {
    workSpaceById(id: $id) {
      owner_id
      Member {
        id
        first_name
        last_name
        email
      }
    }
  }
`;

export { GET_WORKSPACE_BY_ID, GET_WORKSPACE_MEMBERS };
