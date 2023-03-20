import gql from 'graphql-tag';

const GET_SUMMARY_REPORT = gql`
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
    getSummaryReport(
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
      summaryReportData {
        id
        discription
        start_time
        end_time
        total_time
        subtask_date
        amount
        subtasktag {
          tag_name
        }
        task {
          task_name
        }
      }
      count
      latestProjectDetails {
        project_name
        workspace_name
        latestTotalTime
        latestAmount
        is_billable
      }
    }
  }
`;

export default GET_SUMMARY_REPORT;
