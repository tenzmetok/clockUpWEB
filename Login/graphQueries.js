import gql from 'graphql-tag';

const USER_LOGIN = gql`
  query($email: String!, $password: String!) {
    Login(email: $email, password: $password) {
      ok
      token
      user {
        id
        first_name
        last_name
        current_workspace
        email
        isAuthenticated
        role
        memberIds
        managerIds
        workspaceMemberId
        user_logo
        Workspaces {
          id
          workspace_name
          owner_id
        }
      }
    }
  }
`;

export default USER_LOGIN;
