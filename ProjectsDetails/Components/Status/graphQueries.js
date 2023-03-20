import gql from 'graphql-tag';

const GET_PROJECT_BY_MATRIX_ID = gql`
  query($id: ID!) {
    getProjectMatrixById(id: $id) {
      estimate_time
      bill_rate
      billing_status
      estimation_type
      workspace {
        bill_rate
        currency
      }
      subtask {
        is_billable
        total_time
        discription
        task_name
        assignee_name
        subtask_bill_rate
      }
    }
  }
`;

export default GET_PROJECT_BY_MATRIX_ID;
