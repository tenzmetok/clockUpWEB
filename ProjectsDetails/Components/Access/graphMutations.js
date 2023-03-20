import gql from 'graphql-tag';

const ADD_PROJECT_MEMBER = gql`
  mutation addProjectMember($input: [addProjectMemberInput]) {
    addProjectMember(input: $input) {
      projectMember {
        id
        workspace_member_id
        project_id
      }
    }
  }
`;

const REMOVE_PROJECT_MEMBER = gql`
  mutation removeProjectMember($input: removeProjectMemberInput) {
    removeProjectMember(input: $input) {
      isRemoved
    }
  }
`;
const UPDATE_PROJECT_MEMBER_ROLE = gql`
  mutation updateProjectMemberRole($input: updateProjectMemberRoleInput) {
    updateProjectMemberRole(input: $input) {
      isUpdated
    }
  }
`;
const ADD_PROJECT_MEMBER_GROUP = gql`
  mutation addProjectMemberGroup($input: [addProjectMemberGroupInput]) {
    addProjectMemberGroup(input: $input) {
      projectMemberGroup {
        id

        group_id
        project_id
      }
    }
  }
`;
const REMOVE_PROJECT_MEMBER_GROUP = gql`
  mutation removeProjectMemberGroup($input: removeProjectMemberGroupInput) {
    removeProjectMemberGroup(input: $input) {
      isRemoved
    }
  }
`;
export {
  ADD_PROJECT_MEMBER,
  REMOVE_PROJECT_MEMBER,
  UPDATE_PROJECT_MEMBER_ROLE,
  ADD_PROJECT_MEMBER_GROUP,
  REMOVE_PROJECT_MEMBER_GROUP,
};
