import gql from 'graphql-tag';

const GET_PROJECT_MEMBER_BY_PROJECT_ID = gql`
  query($id: ID!) {
    getProjectMemberByProjectId(id: $id) {
      id
      projectMembers {
        workspace_member_id
        projectMemberRole {
          role
          project_member_id
        }
      }
      workspaceProjectMembers {
        id
        user_id
        email
        WorkspaceMember {
          id
          email
          first_name
          last_name
        }
      }
    }
  }
`;
const GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID = gql`
  query($id: ID!) {
    getProjectMemberGroupByProjectId(id: $id) {
      id
      projectGroup {
        group_name
        id
        UserGroupMember {
          email
          id
          user_id
        }
      }
    }
  }
`;

export { GET_PROJECT_MEMBER_BY_PROJECT_ID, GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID };
