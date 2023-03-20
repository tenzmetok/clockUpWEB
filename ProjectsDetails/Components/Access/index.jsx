import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Row, Col } from 'react-bootstrap';
import { FiMoreVertical } from 'react-icons/fi';
import Dropdown from 'react-bootstrap/Dropdown';
import { differenceBy, isEmpty } from 'lodash';
import useConfirmPopup from '../../../../components/AlertBox/useConfirmPopup';
import style from './Access.module.scss';
import AppContext from '../../../../context/AppContext';
import PlusCricle from '../../../../images/plus-circle.svg';
import ToolTipForContent from '../../../../components/ToolTipForContent';
import { ROLE, MEMBER_STATUS, VISIBILITY_STATUS } from '../../../../utils/commonConstants';
import { hasAccess } from '../../../../utils/index';
import {
  GET_PROJECT_MEMBER_BY_PROJECT_ID,
  GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID,
} from './graphQueries';
import GET_GROUPS_BY_WORKSPACE_ID from '../../../Team/Components/Groups/graphQueries';
import { PROJECT_BY_ID } from '../../graphQueries';
import { GET_WORKSPACE_MEMBERS } from '../../../Team/Components/Members/graphQueries';
import {
  REMOVE_PROJECT_MEMBER,
  ADD_PROJECT_MEMBER,
  UPDATE_PROJECT_MEMBER_ROLE,
  REMOVE_PROJECT_MEMBER_GROUP,
  ADD_PROJECT_MEMBER_GROUP,
} from './graphMutations';
import UPDATE_PROJECT from '../../graphMutations';

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const Access = ({ client, componentProps }) => {
  const match = componentProps.computedMatch.params;
  const projectId = match.id;
  const [projectMembersList, setprojectMembersList] = useState([]);
  const [projectMemberGroupList, setprojectMemberGroupList] = useState([]);
  const [groupNames, setGroupNames] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const { isConfirmPopup } = useConfirmPopup();
  const [workspaceMembersList, setWorkspaceMembersList] = useState([]);
  const [workspaceMembersGroupList, setWorkspaceMembersGroupList] = useState([]);
  const [ownerId, setOwnerId] = useState();
  const [visibilityStatus, setVisibilityStatus] = useState();
  const [isFilteredGroup, setIsFilteredGroup] = useState([]);
  const [isFilteredMember, setIsFilteredMember] = useState([]);
  const [projectOwner, setProjectOwner] = useState({});
  const { authUser } = useContext(AppContext);
  const [searchWord, setSearchWord] = useState('');

  const getProjectMemberGroups = async (project_id) => {
    try {
      const { data: projectMemberGroup } = await client.query({
        query: GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID,
        variables: { id: parseInt(project_id, 10) },
      });
      const memberGroup =
        (projectMemberGroup &&
          projectMemberGroup.getProjectMemberGroupByProjectId &&
          projectMemberGroup.getProjectMemberGroupByProjectId.projectGroup) ||
        [];
      setprojectMemberGroupList(memberGroup);
    } catch (error) {
      console.log(error);
    }
  };
  const getProjectMembers = async (project_id) => {
    try {
      const { data: projectMembers } = await client.query({
        query: GET_PROJECT_MEMBER_BY_PROJECT_ID,
        variables: { id: parseInt(project_id, 10) },
      });
      const members =
        (projectMembers &&
          projectMembers.getProjectMemberByProjectId &&
          projectMembers.getProjectMemberByProjectId.workspaceProjectMembers) ||
        [];
      const projectMemberRole =
        (projectMembers &&
          projectMembers.getProjectMemberByProjectId &&
          projectMembers.getProjectMemberByProjectId.projectMembers) ||
        [];
      const projectMemberList = members.map((projectMember) => {
        const id =
          (projectMember?.workspace_member_id && projectMember?.workspace_member_id) ||
          projectMember.id;
        const role = projectMemberRole.find((mRole) => mRole?.workspace_member_id === id);
        return {
          id,
          email: projectMember?.WorkspaceMember?.email
            ? projectMember?.WorkspaceMember?.email
            : projectMember?.email,
          first_name: projectMember?.WorkspaceMember?.first_name
            ? projectMember?.WorkspaceMember?.first_name
            : projectMember?.first_name,
          last_name: projectMember?.WorkspaceMember?.last_name
            ? projectMember?.WorkspaceMember?.last_name
            : projectMember?.last_name,
          role,
        };
      });
      setprojectMembersList(projectMemberList);
    } catch (error) {
      console.log(error);
    }
  };
  const getProjectData = async () => {
    try {
      const { data: projectDataResponse } = await client.query({
        query: PROJECT_BY_ID,
        variables: {
          id: projectId,
        },
      });
      const projectOwnerId = projectDataResponse?.getProjectById?.owner_id;
      const projectVisibilityStatus = projectDataResponse?.getProjectById?.visiblity_status;

      setVisibilityStatus(projectVisibilityStatus);
      setOwnerId(projectOwnerId);
      getProjectMembers(projectId);
      getProjectMemberGroups(projectId);
    } catch (error) {
      toast.error(error);
    }
  };
  const updateProjectVisibilityStatus = async (selectedVisibilityStatus) => {
    try {
      await client.mutate({
        mutation: UPDATE_PROJECT,
        variables: {
          input: {
            id: parseInt(projectId, 10),
            workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
            visiblity_status: selectedVisibilityStatus,
          },
        },
      });

      toast.success('Project visibility updated successfully', { autoClose: 2000 });
      getProjectData(projectId);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSelectProjectMemberGroup = (group) => {
    let updatedWorkspaceMemberGroupList = workspaceMembersGroupList;
    const isWorkspaceMembersGroupList = updatedWorkspaceMemberGroupList.find(
      (workspacegroup) => workspacegroup.group_id === group.id,
    );
    if (isWorkspaceMembersGroupList) {
      updatedWorkspaceMemberGroupList = workspaceMembersGroupList.filter(
        (workspacegroup) => workspacegroup.group_id !== group.id,
      );
      setWorkspaceMembersGroupList(updatedWorkspaceMemberGroupList);
    } else {
      setWorkspaceMembersGroupList([
        ...updatedWorkspaceMemberGroupList,
        {
          group_id: group?.id,
          project_id: projectId,
        },
      ]);
    }
  };
  const handleSelectProjectMember = (member) => {
    let updatedWorkspaceMemberList = workspaceMembersList;
    const isWorkspaceMemberExist = updatedWorkspaceMemberList.find(
      (workspaceMember) => workspaceMember.workspace_member_id === member.id,
    );
    if (isWorkspaceMemberExist) {
      updatedWorkspaceMemberList = workspaceMembersList.filter(
        (workspaceMember) => workspaceMember.workspace_member_id !== member.id,
      );
      setWorkspaceMembersList(updatedWorkspaceMemberList);
    } else {
      setWorkspaceMembersList([
        ...updatedWorkspaceMemberList,
        {
          workspace_member_id: member?.id,
          project_id: projectId,
        },
      ]);
    }
  };
  const handleUpdateProjectMemberRole = async (workspace_member_id, role) => {
    try {
      const {
        data: {
          updateProjectMemberRole: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_PROJECT_MEMBER_ROLE,
        variables: {
          input: {
            workspace_member_id,
            project_id: projectId,
            role,
          },
        },
      });
      if (isUpdated) {
        toast.success('Project access updated successfully', { autoClose: 2000 });
      }
      setWorkspaceMembersList([]);
      setSearchWord('');
      getProjectMembers(projectId);
    } catch (error) {
      toast.error(error);
    }
  };

  const getWorkspaceMembers = async () => {
    try {
      const params = {
        workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
      };
      const { data: memberList } = await client.query({
        query: GET_WORKSPACE_MEMBERS,
        variables: params,
      });
      const workSpaceMember = memberList?.getWorkSpaceMember?.Member || [];
      if (workSpaceMember.length) {
        const pOwner = workSpaceMember.find((Member) => Member.user_id === ownerId);
        const differenceofWorkspaceMember = differenceBy(workSpaceMember, projectMembersList, 'id');
        const filteredWorkspaceMembers = differenceofWorkspaceMember.filter(
          (projectWorkspaceMember) =>
            ownerId !== projectWorkspaceMember?.id &&
            MEMBER_STATUS.accepted === projectWorkspaceMember.status,
        );
        setProjectOwner(pOwner);
        setWorkspaceMembers(filteredWorkspaceMembers);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchGroupData = async () => {
    try {
      const params = {
        workspace_id: authUser?.current_workspace || authUser?.Workspaces?.[0]?.id,
      };
      const { data } = await client.query({
        query: GET_GROUPS_BY_WORKSPACE_ID,
        variables: params,
      });

      if (data) {
        const projectMemberGroup = data?.getGroupsByWorkspaceId;
        if (projectMemberGroup.length) {
          const filteredWorkspaceGroup = differenceBy(
            projectMemberGroup,
            projectMemberGroupList,
            'id',
          );
          setGroupNames(filteredWorkspaceGroup);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getRole = (data) => {
    if (projectOwner?.email === data?.email) return ROLE.Owner;
    if (data?.role?.projectMemberRole?.role === ROLE.Manager) return ROLE.Manager;
    return ROLE.Member;
  };
  const onProjectMemberGroupAdd = async () => {
    let projectMemberFlag = null;
    let projectGroupFlag = null;
    const projectMemberGroupPayload = {
      input: workspaceMembersGroupList,
    };
    const projectMemberPayload = {
      input: workspaceMembersList,
    };
    if (!isEmpty(workspaceMembersList)) {
      try {
        const {
          data: { addProjectMember },
        } = await client.mutate({
          mutation: ADD_PROJECT_MEMBER,
          variables: projectMemberPayload,
        });
        if (addProjectMember) {
          projectMemberFlag = true;

          setWorkspaceMembersList([]);
          setSearchWord('');
          getProjectMembers(projectId);
        }
      } catch (error) {
        projectMemberFlag = false;
        console.log(error);
      }
    }

    if (!isEmpty(workspaceMembersGroupList)) {
      try {
        const {
          data: { addProjectMemberGroup },
        } = await client.mutate({
          mutation: ADD_PROJECT_MEMBER_GROUP,
          variables: projectMemberGroupPayload,
        });
        if (addProjectMemberGroup) {
          projectGroupFlag = true;
          setWorkspaceMembersGroupList([]);
          setSearchWord('');
          getProjectMemberGroups(projectId);
        }
      } catch (error) {
        projectGroupFlag = false;
        console.log(error);
      }
    }
    if (projectMemberFlag && projectGroupFlag) {
      toast.success('Project access granted successfully', { autoClose: 2000 });
    } else if (projectMemberFlag) {
      toast.success('Project access granted successfully', { autoClose: 2000 });
    } else if (projectGroupFlag) {
      toast.success('Project access granted successfully', { autoClose: 2000 });
    }
  };
  const removeProjectMember = async (workspace_member_id, first_name, last_name) => {
    const confirmed = await isConfirmPopup({
      title: 'Are You Sure?',
      message: `Once removed, ${first_name} ${last_name}  will no longer have access to this project and won’t be able to track time for it any more.`,
    });
    if (confirmed)
      try {
        await client.mutate({
          mutation: REMOVE_PROJECT_MEMBER,
          variables: {
            input: { workspace_member_id, project_id: projectId },
          },
        });
        toast.success('Project access has been revoked', { autoClose: 2000 });
        getProjectMembers(projectId);
      } catch (error) {
        console.log(error);
      }
  };
  const handleProjectMemberGroupRemove = async (group_id, group_name) => {
    const confirmed = await isConfirmPopup({
      title: 'Are You Sure?',
      message: `Once removed, ${group_name}  will no longer have access to this project and won’t be able to track time for it any more.`,
    });
    if (confirmed)
      try {
        await client.mutate({
          mutation: REMOVE_PROJECT_MEMBER_GROUP,
          variables: {
            input: { group_id, project_id: projectId },
          },
        });
        toast.success('Project access has been revoked', { autoClose: 2000 });
        getProjectMemberGroups(projectId);
      } catch (error) {
        console.log(error);
      }
  };
  const handleFilterMember = (event) => {
    setSearchWord(event.target.value);
  };
  const memberEmails = (groupMembers) => {
    return groupMembers.map((groupMember) => groupMember.email).join(',');
  };

  useEffect(() => {
    getProjectData();
  }, [projectId, visibilityStatus]);

  useEffect(() => {
    fetchGroupData();
  }, [projectMemberGroupList]);

  useEffect(() => {
    getWorkspaceMembers();
  }, [projectMembersList]);
  useEffect(() => {
    const filterGroups = groupNames.filter((group) => {
      return group?.group_name?.toLowerCase().indexOf(searchWord?.toLowerCase()) !== -1;
    });
    setIsFilteredGroup(filterGroups);
  }, [searchWord]);
  useEffect(() => {
    const filterMembers = workspaceMembers.filter((member) => {
      return member?.email?.toLowerCase().indexOf(searchWord?.toLowerCase()) !== -1;
    });
    setIsFilteredMember(filterMembers);
  }, [searchWord]);

  return (
    <div className={style.tabWrapper}>
      <div className={style.addProject}>
        <Row>
          <Col md={12}>
            <h5>Visibility</h5>
          </Col>
          <Col md={12}>
            <div className={style.flexBox}>
              <div className={style.radioGroup}>
                <input
                  type="radio"
                  name="visibility"
                  id="Private"
                  value="Private"
                  disabled={!hasAccess(authUser, projectId)}
                  checked={visibilityStatus === VISIBILITY_STATUS.private}
                  onChange={(event) => {
                    updateProjectVisibilityStatus(event.target.value);
                  }}
                />
                <label htmlFor="Private">Private</label>
              </div>
              <div className={style.radioGroup}>
                <input
                  type="radio"
                  name="visibility"
                  id="Public"
                  value="Public"
                  disabled={!hasAccess(authUser, projectId)}
                  checked={visibilityStatus === VISIBILITY_STATUS.public}
                  onChange={(event) => {
                    updateProjectVisibilityStatus(event.target.value);
                  }}
                />
                <label htmlFor="Public">Public</label>
              </div>
            </div>
          </Col>
        </Row>
        <table>
          <tbody>
            <Dropdown
              autoClose="outside"
              onToggle={(e) => {
                if (!e) {
                  onProjectMemberGroupAdd();
                  setSearchWord('');
                  fetchGroupData();
                  getWorkspaceMembers();
                }
              }}
            >
              {hasAccess(authUser, projectId) && (
                <Dropdown.Toggle className={style.dropdownToggle}>
                  <img src={PlusCricle} alt="Add Members" className={style.img} />
                  <span className="ml-2">Add Members</span>
                </Dropdown.Toggle>
              )}

              <Dropdown.Menu className={`${style.dropdownMenu} ${style.scrollbar}`}>
                <div>
                  <li>
                    <input
                      className={style.textbox}
                      type="text"
                      value={searchWord}
                      placeholder="Find Members"
                      onChange={(e) => handleFilterMember(e)}
                    />
                  </li>
                </div>
                {groupNames.length === 0 && workspaceMembers.length === 0 ? (
                  <Dropdown.Header className={style.dropdownHeader}>
                    No members found
                  </Dropdown.Header>
                ) : (
                  <>
                    {groupNames.length > 0 && (
                      <Dropdown.Header className={style.dropdownHeader}>Groups</Dropdown.Header>
                    )}
                    {groupNames.length > 0 && searchWord && isFilteredGroup?.length === 0 ? (
                      <Dropdown.Header className={style.dropdownHeader}>
                        No groups found
                      </Dropdown.Header>
                    ) : (
                      groupNames
                        .filter((group) => {
                          return (
                            group?.group_name?.toLowerCase().indexOf(searchWord?.toLowerCase()) !==
                            -1
                          );
                        })
                        .map((group) => {
                          const checked = workspaceMembersGroupList.find(
                            (projectMemberGroup) => projectMemberGroup.group_id === group.id,
                          );

                          return (
                            <li>
                              <input
                                className={style.checkbox}
                                type="checkbox"
                                checked={!!checked}
                                id={group?.group_name}
                                name={group?.group_name}
                                value={group?.id}
                                onChange={() => handleSelectProjectMemberGroup(group)}
                              />
                              <label className={style.label} htmlFor={group?.group_name}>
                                <ToolTipForContent>{group?.group_name}</ToolTipForContent>
                              </label>
                            </li>
                          );
                        })
                    )}
                    {workspaceMembers.length > 0 && (
                      <Dropdown.Header className={style.dropdownHeader}>Members</Dropdown.Header>
                    )}
                    {workspaceMembers.length > 0 && searchWord && isFilteredMember.length === 0 ? (
                      <Dropdown.Header className={style.dropdownHeader}>
                        No members found
                      </Dropdown.Header>
                    ) : (
                      workspaceMembers
                        .filter((member) => {
                          return (
                            member?.email?.toLowerCase().indexOf(searchWord?.toLowerCase()) !== -1
                          );
                        })
                        .map((member) => {
                          const checked = workspaceMembersList.find(
                            (m) => m.workspace_member_id === member.id,
                          );
                          return (
                            <li>
                              <input
                                className={style.checkbox}
                                type="checkbox"
                                checked={!!checked}
                                id={member?.email}
                                name={member?.email}
                                // member={member?.id}
                                onChange={() => handleSelectProjectMember(member)}
                              />
                              <label className={style.label} htmlFor={member?.email}>
                                <ToolTipForContent>{member?.email}</ToolTipForContent>
                              </label>
                            </li>
                          );
                        })
                    )}
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </tbody>
        </table>
      </div>
      <Row>
        <Col md={12}>
          <table className="table mb-0">
            <thead className="bg-primary">
              <tr>
                <th className="col-5">Users</th>
                <th className="col-5">Email</th>
                <th className="col-2">Role</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {projectMembersList?.length > 0 ? (
                projectMembersList.map((projectMember) => {
                  return (
                    <tr>
                      <td>
                        <ToolTipForContent>{`${projectMember?.first_name} ${projectMember?.last_name}`}</ToolTipForContent>
                      </td>
                      <td>
                        <ToolTipForContent>{projectMember?.email}</ToolTipForContent>
                      </td>

                      <td>{getRole(projectMember)}</td>
                      {hasAccess(authUser, projectId) ? (
                        <td className="action_td">
                          <Dropdown>
                            <Dropdown.Toggle
                              id="dropdown-basic"
                              bsPrefix="p-0"
                              disabled={projectOwner?.email === projectMember?.email}
                            >
                              <FiMoreVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {projectMember?.role?.projectMemberRole?.role === ROLE.Manager ? (
                                <Dropdown.Item
                                  href="#/action-1"
                                  onClick={() => {
                                    handleUpdateProjectMemberRole(projectMember?.id, ROLE.Member);
                                  }}
                                >
                                  Revoke manager rights
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item
                                  href="#/action-1"
                                  onClick={() => {
                                    handleUpdateProjectMemberRole(projectMember?.id, ROLE.Manager);
                                  }}
                                >
                                  Give manager rights
                                </Dropdown.Item>
                              )}
                              <Dropdown.Item
                                href="#/action-1"
                                onClick={() => {
                                  removeProjectMember(
                                    projectMember?.id,
                                    projectMember?.first_name,
                                    projectMember?.last_name,
                                  );
                                }}
                              >
                                Remove
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      ) : (
                        <td />
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <p className="noRecord">No data found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Col>
      </Row>
      {projectMemberGroupList.length ? (
        <Row>
          <Col md={12}>
            <table className="table mb-0">
              <thead className="bg-primary">
                <tr>
                  <th className="col-5">Groups</th>
                  <th className="col-5">Group Members</th>
                  <th className="col-2">&nbsp;</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {projectMemberGroupList?.map((group) => {
                  return (
                    <tr>
                      <td>
                        <ToolTipForContent>{group?.group_name}</ToolTipForContent>
                      </td>
                      <td>
                        <ToolTipForContent>
                          {group?.UserGroupMember.length > 0
                            ? memberEmails(group?.UserGroupMember)
                            : 'No Members Found'}
                        </ToolTipForContent>
                      </td>
                      <td>&nbsp;</td>
                      {hasAccess(authUser, projectId) ? (
                        <td className="action_td">
                          <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                              <FiMoreVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                href="#/action-1"
                                onClick={() => {
                                  handleProjectMemberGroupRemove(group?.id, group?.group_name);
                                }}
                              >
                                Remove
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      ) : (
                        <td />
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Col>
        </Row>
      ) : null}
    </div>
  );
};

Access.propTypes = propTypes;
export default withApollo(Access);
