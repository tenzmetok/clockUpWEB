import gql from 'graphql-tag';

const GET_LATEST_DETAILS_REPORT = gql`
  query(
    $workspace_id: ID!
    $limit: Int
    $offset: Int
    $client_id: Int
    $project_id: Int
    $visiblity_status: String
    $startDate: String
    $endDate: String
  ) {
    getDetailsReport(
      where: {
        limit: $limit
        offset: $offset
        workspace_id: $workspace_id
        client_id: $client_id
        project_id: $project_id
        visiblity_status: $visiblity_status
        startDate: $startDate
        endDate: $endDate
      }
    ) {
      subtaskData {
        id
        discription
        start_time
        end_time
        total_time
        subtask_date
        amount
        project {
          name
        }
        client {
          name
        }
        user {
          first_name
          last_name
        }
        subtasktag {
          tag_name
        }
      }
      count
    }
  }
`;

export default GET_LATEST_DETAILS_REPORT;
