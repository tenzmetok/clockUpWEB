import gql from 'graphql-tag';

const GET_FILTER_TASK = gql`
  query(
    $limit: Int
    $offset: Int
    $sortKey: String
    $sortValue: String
    $archive_status: Boolean
    $query: String
    $project_id: ID
  ) {
    getFilteredTasks(
      where: {
        limit: $limit
        offset: $offset
        project_id: $project_id
        archive_status: $archive_status
        query: $query
      }
      sortTask: { key: $sortKey, value: $sortValue }
    ) {
      task {
        id
        task_name
        project_id
        archive_status
        assignee_id
      }
      count
    }
  }
`;

const TASK = gql`
  query task($id: ID!) {
    task(id: $id) {
      id
      task_name
    }
  }
`;

// eslint-disable-next-line import/prefer-default-export
export { GET_FILTER_TASK, TASK };
