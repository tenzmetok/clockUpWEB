/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Select from 'react-select';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Dropdown from 'react-bootstrap/Dropdown';
import { FiMoreVertical, FiEdit, FiTrash } from 'react-icons/fi';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import Button from '../../../../components/Button';
// import Checkbox from '../../../../components/Checkbox';
import useConfirmPopup from '../../../../components/AlertBox/useConfirmPopup';
import AppContext from '../../../../context/AppContext';
import { ADD_TASK, UPDATE_TASK, REMOVE_TASK } from './graphMutations';
import {
  GET_PROJECT_MEMBER_BY_PROJECT_ID,
  GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID,
} from '../Access/graphQueries';
import { GET_FILTER_TASK, TASK } from './graphQueries';
import { GET_WORKSPACE_MEMBERS } from '../../../Team/Components/Members/graphQueries';
import { PROJECT_BY_ID } from '../../graphQueries';
import Input from '../../../../components/Input';
import TextError from '../../../../components/TextError';
import ToolTipForContent from '../../../../components/ToolTipForContent';
import ToolTipForComponent from '../../../../components/ToolTipForComponent';
import { OPTIONS, MEMBER_STATUS } from '../../../../utils/commonConstants';
import { hasAccess } from '../../../../utils/index';
import toEllipsis from '../../../../utils/toEllipsis';
import teampronity from '../../../../images/teampronity-icon.svg';
import * as S from './Tasks-styled';

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const Task = ({ client, componentProps }) => {
  const history = useHistory();
  const tabChange = history?.location?.state?.projectkey;
  const match = componentProps.computedMatch.params;
  const projectId = match.id;
  const { authUser } = useContext(AppContext);
  const [show, setShow] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectMembersList, setProjectMembersList] = useState([]);
  const [workspaceMembersList, setWorkspaceMembersList] = useState([]);
  const [visibilityStatus, setVisibilityStatus] = useState('');
  const { isConfirmPopup } = useConfirmPopup();
  const [errorMessageShow, setErrorMessageShow] = useState(false);
  const [editErrorMessageShow, setEditErrorMessageShow] = useState(false);
  const [task, setTask] = useState({ id: '', task_name: '', project_id: '' });
  const [filterValue, setFilterValue] = useState({
    archive_status: undefined,
    query: '',
    sortKey: 'task_name',
    sortValue: true,
  });
  const fetchTaskList = async () => {
    const taskQueryVariables = {
      project_id: projectId,
      query: filterValue.query,
      limit: 10,
      offset: 0,
    };

    if (typeof filterValue.archive_status === 'boolean') {
      taskQueryVariables.archive_status = filterValue.archive_status;
    }
    const sortBy = [{ id: filterValue.sortKey, desc: filterValue.sortValue }];
    if (sortBy && sortBy.length) {
      const sortObject = sortBy[0];
      taskQueryVariables.sortKey = sortObject.id;
      taskQueryVariables.sortValue = sortObject.desc ? 'ASC' : 'DESC';
    }
    try {
      const { data: taskData } = await client.query({
        query: GET_FILTER_TASK,
        variables: taskQueryVariables,
      });
      const tasks = (taskData && taskData.getFilteredTasks && taskData.getFilteredTasks.task) || [];
      setProjectTasks(tasks);
    } catch (error) {
      console.log(error);
    }
    setShowLoader(false);
  };
  const getProjectData = async () => {
    try {
      const { data: projectDataResponse } = await client.query({
        query: PROJECT_BY_ID,
        variables: {
          id: projectId,
        },
      });
      const projectVisibility = projectDataResponse?.getProjectById?.visiblity_status;
      setVisibilityStatus(projectVisibility);
    } catch (error) {
      toast.error(error);
    }
  };

  const getProjectMemberGroups = async (projectMemberList) => {
    try {
      const { data } = await client.query({
        query: GET_PROJECT_MEMBER_GROUP_BY_PROJECT_ID,
        variables: { id: projectId },
      });
      const memberGroup = data?.getProjectMemberGroupByProjectId?.projectGroup || [];
      const groupMembers = memberGroup?.map((Member) => Member?.UserGroupMember);
      const concatAssignees = [
        { email: 'Anyone', user_id: null },
        ...projectMemberList,
        ...groupMembers,
      ];
      const flatAssignees = [...concatAssignees.flat(1)];
      const uniqueAssignee = Object.values(
        flatAssignees.reduce((acc, cur) => Object.assign(acc, { [cur.user_id]: cur }), {}),
      );
      const projectMembersOptions = uniqueAssignee
        ?.sort((a, b) => (a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1))
        .map((projectMembersInfo) => ({
          value: projectMembersInfo.user_id,
          label: toEllipsis(projectMembersInfo.email),
        }));
      setProjectMembersList(projectMembersOptions);
      fetchTaskList();
    } catch (error) {
      console.log(error);
    }
  };
  const getProjectMembers = async () => {
    try {
      const { data: projectMembers } = await client.query({
        query: GET_PROJECT_MEMBER_BY_PROJECT_ID,
        variables: { id: projectId },
      });
      const members =
        (projectMembers &&
          projectMembers.getProjectMemberByProjectId &&
          projectMembers.getProjectMemberByProjectId.workspaceProjectMembers) ||
        [];
      const projectMemberList = members.map((projectMember) => {
        return {
          email: projectMember?.WorkspaceMember?.email
            ? projectMember?.WorkspaceMember?.email
            : projectMember?.email,
          user_id: projectMember?.WorkspaceMember?.user_id
            ? projectMember?.WorkspaceMember?.user_id
            : projectMember?.user_id,
        };
      });
      getProjectMemberGroups(projectMemberList);
    } catch (error) {
      console.log(error);
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
      const workspaceMember = memberList?.getWorkSpaceMember?.Member || [];

      const filterWorkspaceMember = workspaceMember.filter(
        (member) => MEMBER_STATUS.accepted === member.status,
      );
      const workspaceMemberList = [{ email: 'Anyone', user_id: null }, ...filterWorkspaceMember];
      const workspaceMemberOptions = workspaceMemberList
        ?.sort((a, b) => (a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1))
        .map((projectMembersInfo) => ({
          value: projectMembersInfo.user_id,
          label: toEllipsis(projectMembersInfo.email),
        }));
      setWorkspaceMembersList(workspaceMemberOptions);
    } catch (error) {
      console.log(error);
    }
  };

  const onTaskAdd = async (values, { resetForm }) => {
    setErrorMessageShow(true);
    if (values.task_name) {
      const params = {
        input: {
          task_name: values.task_name.trim(),
          user_id: values.user_id,
          project_id: values.project_id,
        },
      };
      try {
        const {
          data: {
            addTask: { isAdded },
          },
        } = await client.mutate({
          mutation: ADD_TASK,
          variables: params,
        });
        if (isAdded) {
          toast.success('Task added successfully', { autoClose: 2000 });
          setFilterValue({
            ...filterValue,
            sortValue: false,
            sortKey: 'id',
          });
          fetchTaskList();
          resetForm();
          setErrorMessageShow(false);
        } else {
          toast.error('Task with the same name already exists', { autoClose: 2000 });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onUpdateTask = async (values) => {
    setEditErrorMessageShow(true);
    try {
      if (task.task_name === values.task_name.trim()) {
        setEditErrorMessageShow(false);
        toast.error('No changes made', { autoClose: 2000 });
        return;
      }
      const {
        data: {
          updateTask: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_TASK,
        variables: {
          input: {
            id: parseInt(values.TaskId, 10),
            task_name: values.task_name.trim(),
            project_id: values.project_id,
          },
        },
      });
      if (isUpdated) {
        toast.success('Task edited successfully', { autoClose: 2000 });
        setShow(!show);
        fetchTaskList();
        setEditErrorMessageShow(false);
      } else {
        toast.error('Task is already exists', { autoClose: 2000 });
        setEditErrorMessageShow(false);
      }
    } catch (error) {
      console.log('when error occur', error);
    }
  };

  const setModalValue = async (task_id, task_name, project_id) => {
    const requestData = {
      id: task_id,
      task_name: task_name.trim(),
      project_id,
    };
    setTask(requestData);
    setShow(!show);
    setEditErrorMessageShow(false);
    try {
      const { data: taskDetails } = await client.query({
        query: TASK,
        variables: { id: task_id },
      });

      setTask(taskDetails.task);
      fetchTaskList();
    } catch (error) {
      console.log(error);
    }
  };

  const modalToggle = () => {
    setShow(!show);
  };

  const modelInitialValues = {
    TaskId: task?.id,
    task_name: task?.task_name || '',
    project_id: projectId,
  };
  const onSelectOption = async (values, task_id) => {
    try {
      await client.mutate({
        mutation: UPDATE_TASK,
        variables: {
          input: {
            assignee_id: values.value,
            id: task_id,
          },
        },
      });
      setProjectTasks((pre) =>
        pre.map((projectTask) => {
          const clonetask = { ...projectTask };
          if (clonetask.id === task_id) {
            clonetask.assignee_id = values.value;
          }
          return clonetask;
        }),
      );
      toast.success('Assignee updated successfully', { autoClose: 2000 });
    } catch (error) {
      toast.error(error);
    }
  };

  const handelArchive = async (id, archive_status) => {
    try {
      await client.mutate({
        mutation: UPDATE_TASK,
        variables: {
          input: {
            id: parseInt(id, 10),
            archive_status: !archive_status,
          },
        },
      });
      if (archive_status) {
        toast.success('Task activated', { autoClose: 2000 });
      } else {
        toast.success('Task done', { autoClose: 2000 });
      }
      fetchTaskList();
    } catch (error) {
      toast.error(error);
    }
  };

  const deleteTask = async (task_id, task_name) => {
    const confirmed = await isConfirmPopup({
      title: 'Delete Task',
      message: `Are you sure you want to delete task "${task_name}" ?`,
    });
    if (confirmed)
      try {
        await client.mutate({
          mutation: REMOVE_TASK,
          variables: {
            id: task_id,
          },
        });
        fetchTaskList();
        toast.success('Deleted successfully', { autoClose: 2000 });
      } catch (error) {
        toast.error(error);
      }
  };

  const editValidationSchema = () => {
    return Yup.object({
      task_name: Yup.string()
        .min(2, 'Task name is too short')
        .max(100, 'Task name cannot be longer than 100 characters')
        .required('Task name is required'),
    });
  };

  const initialValues = {
    task_name: '',
    user_id: authUser.id,
    project_id: projectId,
    name: '',
  };

  const inputTaskValidationSchema = Yup.object().shape({
    task_name: Yup.string()
      .min(2, 'Task name is too short')
      .max(100, 'Task name cannot be longer than 100 characters')
      .required('Task name is required'),
  });
  useEffect(() => {
    getProjectMembers();
    getProjectData();
    getWorkspaceMembers();
  }, [projectId, tabChange]);
  useEffect(() => {
    fetchTaskList();
  }, [filterValue]);

  return (
    <S.TabWrapper>
      <Row>
        <Col md={5} className="pl-0">
          <S.Formgroup>
            <S.FlexBox>
              <Col md="4" className="pl-0">
                <Select
                  className="form-control border-0 p-0"
                  onChange={(selectedOption) => {
                    setFilterValue({
                      ...filterValue,
                      archive_status:
                        selectedOption.value === '' ? undefined : selectedOption.value === 'true',
                    });
                  }}
                  placeholder="Show All"
                  options={OPTIONS.filterValue}
                />
              </Col>
              <Col md="8" className="pl-0">
                <Input
                  className="form-control "
                  name="name"
                  id="name"
                  type="text"
                  placeholder="Search by name"
                  onChange={(e) => {
                    setFilterValue({ ...filterValue, query: e.target.value });
                  }}
                />
              </Col>
            </S.FlexBox>
          </S.Formgroup>
        </Col>
        <Formik
          initialValues={initialValues}
          validationSchema={inputTaskValidationSchema}
          validateOnChange={errorMessageShow}
          validateOnBlur={errorMessageShow}
          onSubmit={onTaskAdd}
        >
          {({ values, setFieldValue, errors }) => (
            <Col md={5} className="ml-auto pr-0">
              <Form>
                {Object.keys(errors).length > 0 && setErrorMessageShow(true)}
                <S.Formgroup>
                  <S.FlexBox>
                    <Col>
                      <Field
                        className="col-md-12 form-control"
                        name="task_name"
                        id="task_name"
                        type="text"
                        placeholder="Add new Task"
                        value={values.task_name}
                        onChange={(event) => {
                          setFieldValue('task_name', event.target.value.replace(/ +/g, ' '));
                        }}
                      />
                      <ErrorMessage name="task_name" component={TextError} />
                    </Col>
                    <Col className="cunm_btn">
                      <Button theme="primary" size="lg" width="fix" type="submit">
                        Add
                      </Button>
                    </Col>
                  </S.FlexBox>
                </S.Formgroup>
              </Form>
            </Col>
          )}
        </Formik>
      </Row>
      <Row>
        <Col md={12} className="p-0">
          <Card className="mt-3">
            <Card.Body className="projectabs">
              <table className="table mb-0">
                <thead className="bg-primary">
                  <tr>
                    {/* <th className="checkbox_th">
                      <Checkbox />
                    </th> */}
                    <th>Name</th>
                    <th className="custom_assignee_width">Assignee</th>
                    <th className="action_td border-left-0">&nbsp;</th>
                    <th className="action_td border-left-0">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {showLoader && (
                    <S.Logo>
                      <img src={teampronity} alt="teampronity" />
                    </S.Logo>
                  )}
                  {projectTasks?.length > 0 &&
                    projectTasks?.map((tasks) => {
                      return (
                        <tr>
                          {/* <td>
                            <Checkbox />
                          </td> */}
                          <td
                            style={{
                              textDecoration: tasks.archive_status ? 'line-through' : '',
                            }}
                          >
                            <ToolTipForContent>{tasks?.task_name}</ToolTipForContent>
                          </td>
                          <td className="custom_assignee_width">
                            <Select
                              className="form-control border-0 p-0"
                              placeholder="Anyone"
                              hideSelectedOptions={false}
                              value={projectMembersList.find(
                                (m) => tasks?.assignee_id === m?.value,
                              )}
                              isSearchable
                              options={
                                visibilityStatus === 'Public'
                                  ? workspaceMembersList
                                  : projectMembersList
                              }
                              onChange={(event) => {
                                onSelectOption(event, tasks.id);
                              }}
                            />
                          </td>

                          {hasAccess(authUser, projectId) ? (
                            <td className="action_td">
                              <ToolTipForComponent tooltipText="Edit">
                                <FiEdit
                                  onClick={() => {
                                    setModalValue(tasks.id, tasks.task_name, tasks.project_id);
                                  }}
                                  className="text-primary"
                                />
                              </ToolTipForComponent>
                            </td>
                          ) : (
                            <td />
                          )}
                          <td className="action_td">
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                                <FiMoreVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {!tasks.archive_status ? (
                                  <Dropdown.Item
                                    href="#/action-1"
                                    onClick={() => {
                                      handelArchive(tasks.id, tasks.archive_status);
                                    }}
                                  >
                                    Mark As Done
                                  </Dropdown.Item>
                                ) : (
                                  <div>
                                    <Dropdown.Item
                                      href="#/action-1"
                                      onClick={() => {
                                        handelArchive(tasks.id, tasks.archive_status);
                                      }}
                                    >
                                      Mark As Active
                                    </Dropdown.Item>
                                    {hasAccess(authUser, projectId) && (
                                      <Dropdown.Item
                                        href="#/action-1"
                                        onClick={() => {
                                          deleteTask(tasks.id, tasks.task_name);
                                        }}
                                      >
                                        <FiTrash className="text-danger" />
                                        &nbsp; Delete
                                      </Dropdown.Item>
                                    )}
                                  </div>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  {!showLoader && projectTasks?.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <p className="noRecord">No data found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Modal show={show} onHide={modalToggle} centered size="lg">
                <Formik
                  initialValues={modelInitialValues}
                  enableReinitialize
                  validationSchema={editValidationSchema}
                  validateOnChange={editErrorMessageShow}
                  validateOnBlur={editErrorMessageShow}
                  onSubmit={onUpdateTask}
                >
                  {({ values, setFieldValue, errors }) => (
                    <Form>
                      <Modal.Header closeButton>
                        <Modal.Title>Edit Task</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {Object.keys(errors).length > 0 && setEditErrorMessageShow(true)}
                        <Row className="pt-3 pb-3">
                          <Col md="12" className="p-relative align-items-center">
                            <Field
                              className="form-control"
                              type="text"
                              id="name"
                              name="task_name"
                              placeholder="Edit task name"
                              value={values.task_name}
                              onChange={(event) => {
                                setFieldValue('task_name', event.target.value.replace(/ +/g, ' '));
                              }}
                            />
                            <Field
                              className="form-control"
                              type="hidden"
                              name="TaskId"
                              value={values.TaskId}
                            />
                            <ErrorMessage name="task_name" component={TextError} />
                          </Col>
                        </Row>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button size="lg" width="fix" onClick={modalToggle}>
                          Cancel
                        </Button>
                        <Button theme="primary" size="lg" width="fix" type="submit">
                          Save
                        </Button>
                      </Modal.Footer>
                    </Form>
                  )}
                </Formik>
              </Modal>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </S.TabWrapper>
  );
};

Task.propTypes = propTypes;
export default withApollo(Task);
