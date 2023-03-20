/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useHistory } from 'react-router-dom';
import { FiFilter, FiSearch, FiClock, FiMoreVertical, FiTrash } from 'react-icons/fi';
import { FaCircle } from 'react-icons/fa';
import { Formik, Form, Field } from 'formik';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import Header from '../../components/Header';
import useConfirmPopup from '../../components/AlertBox/useConfirmPopup';
import { GET_CLIENTS_BY_WORKSPACE, GET_FILTERED_PROJECTS } from './graphQueries';
import { ADD_PROJECT, REMOVE_PROJECT } from './graphMutations';
import AppContext from '../../context/AppContext';
import UPDATE_PROJECT from '../ProjectsDetails/graphMutations';
import { VISIBILITY_STATUS, OPTIONS } from '../../utils/commonConstants';
import { GET_WORKSPACE_BY_ID } from '../Settings/Components/Setting/graphQueries';
// import TextError from '../../components/TextError';
import SortDown from '../../images/sort-alpha-down.svg';
import SortUp from '../../images/sort-alpha-up-alt.svg';
import ToolTipForContent from '../../components/ToolTipForContent';
import { PROJECTS } from '../../constants/routes';
import toEllipsis from '../../utils/toEllipsis';
import teampronity from '../../images/teampronity-icon.svg';
import * as S from './Projects-styled';
import { isManager, isOwnerOrAdmin } from '../../utils';

export const ColorPickerField = styled(Field)`
  padding: 5px !important;
  min-height: 40px;
  margin-top: 10px;
`;
const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const Projects = ({ client }) => {
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [errorMessageShow, setErrorMessageShow] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [clientData, setClientData] = useState([]);
  const [projectData, setAllProjectsData] = useState();
  const [workSpaceData, setWorkSpaceData] = useState();
  const { isConfirmPopup } = useConfirmPopup();
  const [filterValue, setFilterValue] = useState({
    visiblity_status: '',
    billing_status: '',
    client_id: 0,
    sortKey: 'name',
    query: '',
    sortValue: true,
  });
  const { sortValue } = filterValue;
  const { authUser } = useContext(AppContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const filterInitialValues = {
    searchName: '',
    client_id: 0,
    visiblity_status: '',
    billing_status: '',
  };

  const addProjectInitialValues = {
    name: '',
    searchName: '',
    client_id: '',
    color: '#000000',
    visiblity_status: workSpaceData?.visibility_status || '',
    workspace_id: '',
  };

  const fetchAllClientData = async () => {
    try {
      const { data: clientsData } = await client.query({
        query: GET_CLIENTS_BY_WORKSPACE,
        variables: {
          workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
        },
      });
      const clients = (clientsData && clientsData.getClientsByWorkspaceId) || [];
      setClientData(clients);
    } catch (error) {
      console.log(error);
    }
  };
  const getWorkSpaceDataById = async () => {
    try {
      const variables = {
        id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
      };
      const { data: workspace } = await client.query({
        query: GET_WORKSPACE_BY_ID,
        variables,
      });
      const visibility_status = workspace && workspace.workSpaceById;
      setWorkSpaceData(visibility_status);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProjectsData = async (visiblity_status, billing_status, query, client_id) => {
    try {
      const projectParams = {
        limit: 10,
        offset: 0,
        workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
        visiblity_status: visiblity_status === '' ? visiblity_status : filterValue.visiblity_status,
        billing_status: billing_status === '' ? billing_status : filterValue.billing_status,
        query: query === '' ? query : filterValue.query,
        client_id: client_id === 0 ? client_id : Number(filterValue.client_id),
      };
      const sortBy = [{ id: filterValue.sortKey, order: filterValue.sortValue }];

      if (sortBy && sortBy.length) {
        const sortObject = sortBy[0];
        projectParams.sortKey = sortObject.id;
        projectParams.sortValue = sortObject.order ? 'ASC' : 'DESC';
      }

      const { data: projectsData } = await client.query({
        query: GET_FILTERED_PROJECTS,
        variables: projectParams,
      });

      const projects = (projectsData && projectsData.getFilteredProjects.projects) || [];
      setAllProjectsData(projects);
    } catch (error) {
      console.log(error);
    }
    setShowLoader(false);
  };

  const handleAddProject = async (values, { resetForm }) => {
    setErrorMessageShow(true);
    const params = {
      input: {
        name: values.name.trim(),
        color: values.color,
        client_id: parseInt(values.client_id.value, 10),
        workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
        visiblity_status: values.visiblity_status,
      },
    };

    try {
      const {
        data: {
          addProject: { isAdded },
        },
      } = await client.mutate({
        mutation: ADD_PROJECT,
        variables: params,
      });
      if (isAdded) {
        toast.success('Project added successfully', { autoClose: 2000 });
        setFilterValue({
          ...filterValue,
          sortKey: 'id',
          sortValue: false,
        });
        getAllProjectsData();
        handleClose();
        setErrorMessageShow(false);
      } else {
        toast.error('Project is already exists', { autoClose: 2000 });
        getAllProjectsData();
        addProjectInitialValues.name = values.name.trim();
        setErrorMessageShow(false);
      }
      resetForm();
    } catch (error) {
      const errorMessage = error.graphQLErrors[0].message;
      toast.error(errorMessage);
    }
  };

  const handleFilters = async () => {
    const filterProjectParams = {
      workspace_id: parseInt(authUser.current_workspace, 10) || authUser?.Workspaces?.[0]?.id,
      billing_status: filterValue.billing_status,
      visiblity_status: filterValue.visiblity_status,
      query: filterValue.query,
      client_id: Number(filterValue.client_id),
      limit: 10,
      offset: 0,
    };
    const sortBy = [{ id: 'name', desc: false }];
    if (sortBy && sortBy.length) {
      const sortObject = sortBy[0];
      filterProjectParams.sortKey = sortObject.id;
      filterProjectParams.sortValue = sortObject.desc ? 'DESC' : 'ASC';
    }

    try {
      const { data: filterProjectData } = await client.query({
        query: GET_FILTERED_PROJECTS,
        variables: filterProjectParams,
      });

      const projects = (filterProjectData && filterProjectData.getFilteredProjects.projects) || [];
      setAllProjectsData(projects);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearFilters = (resetForm) => {
    resetForm({
      values: {
        searchName: '',
        visiblity_status: '',
        billing_status: '',
        client_id: 0,
        query: '',
      },
    });
    setFilterValue({
      visiblity_status: '',
      billing_status: '',
      client_id: 0,
      sortKey: 'name',
      query: '',
      sortValue: true,
    });
    getAllProjectsData('', '', '', 0);
  };

  const handelDelete = async (id, name) => {
    const confirmed = await isConfirmPopup({
      title: 'Delete Project',
      message: `Are you sure you want to delete project "${name}" ?`,
    });
    if (confirmed) {
      try {
        const {
          data: {
            removeProject: { isDeleted },
          },
        } = await client.mutate({
          mutation: REMOVE_PROJECT,
          variables: {
            id,
          },
        });
        if (isDeleted) {
          fetchAllClientData();
          getAllProjectsData();
          toast.success('Project deleted successfully', { autoClose: 2000 });
        } else {
          toast.error('Project deletion unsuccessful', { autoClose: 2000 });
        }
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handelArchive = async (id, active_status) => {
    try {
      await client.mutate({
        mutation: UPDATE_PROJECT,
        variables: {
          input: {
            id: parseInt(id, 10),
            workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
            active_status: active_status === 'true' ? 'false' : 'true',
          },
        },
      });
      if (active_status === 'true') {
        toast.success('Project archived', { autoClose: 2000 });
      } else {
        toast.success('Project activated', { autoClose: 2000 });
      }
      fetchAllClientData();
      getAllProjectsData();
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getWorkSpaceDataById();
    fetchAllClientData();
  }, [filterValue, authUser]);
  useEffect(() => {
    getAllProjectsData();
  }, [sortValue, authUser]);

  const clientOptions = clientData
    ?.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
    .map((clientInfo) => ({
      value: clientInfo.id,
      label: toEllipsis(clientInfo.name),
    }));
  const publicProjectList = projectData?.filter((item) => item.visiblity_status === 'Public');
  const privateProjectListForMember = projectData?.filter((item) =>
    authUser?.memberIds?.find((data) => data === item.id),
  );
  const combinedProjectListForMember = publicProjectList?.concat(privateProjectListForMember);
  const filteredProjectListForMember = combinedProjectListForMember?.filter((item, index) => {
    return combinedProjectListForMember.indexOf(item) === index;
  });
  const privateProjectListForManager = projectData?.filter((item) =>
    authUser?.managerIds?.find((data) => data === item.id),
  );

  const combinedProjectListForManager = publicProjectList
    ?.concat(privateProjectListForManager)
    ?.concat(privateProjectListForMember);
  const filteredProjectListForManager = combinedProjectListForManager?.filter((item, index) => {
    return combinedProjectListForManager.indexOf(item) === index;
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Project name is too short')
      .max(50, 'Project name cannot be longer than 50 characters')
      .required('Project name is required'),

    client_id: Yup.object().required('Client is required'),
  });

  return (
    <S.MainWrapper>
      <Header />
      <S.Pagewrapper className="pagewprage">
        <Row className="m-0">
          <Col md="12 mt-4">
            <Row className="align-items-center">
              <Col md="6">
                <h4>Projects</h4>
              </Col>
              <Col md="6" className="d-flex justify-content-end">
                {isOwnerOrAdmin(authUser) && (
                  <Button theme="primary" size="sm" width="fix" type="submit" onClick={handleShow}>
                    Create New Project
                  </Button>
                )}
              </Col>
            </Row>
          </Col>
          <Formik initialValues={filterInitialValues} onSubmit={handleFilters}>
            {({ values, setFieldValue, resetForm }) => {
              return (
                <Form>
                  <Col md="12">
                    <Card className="mt-3">
                      <Card.Body className="p-0">
                        <S.Filters>
                          <Col>
                            <S.Filtertitle>
                              <FiFilter />
                              <span>FILTER</span>
                            </S.Filtertitle>
                          </Col>
                          <Col>
                            <S.FilterItem>
                              <Select
                                className="form-control border-0 p-0"
                                name="client_id"
                                id="client_id"
                                value={values.client_id}
                                onChange={(selectedClient) => {
                                  setFilterValue({
                                    ...filterValue,
                                    client_id: selectedClient.value,
                                  });
                                  setFieldValue('client_id', selectedClient);
                                }}
                                placeholder="Client"
                                options={clientOptions}
                                isSearchable
                              />
                            </S.FilterItem>
                          </Col>
                          <Col>
                            <S.FilterItem>
                              <Select
                                className="form-control border-0 p-0"
                                name="visiblity_status"
                                id="visiblity_status"
                                value={values.visiblity_status}
                                onChange={(selectedVisibilityStatus) => {
                                  setFilterValue({
                                    ...filterValue,
                                    visiblity_status: selectedVisibilityStatus.value,
                                  });
                                  setFieldValue('visiblity_status', selectedVisibilityStatus);
                                }}
                                placeholder="Access"
                                options={OPTIONS.access}
                              />
                            </S.FilterItem>
                          </Col>
                          <Col>
                            <S.FilterItem>
                              <Select
                                className="form-control border-0 p-0"
                                name="billing_status"
                                id="billing_status"
                                value={values.billing_status}
                                onChange={(selectedBillingStatus) => {
                                  setFilterValue({
                                    ...filterValue,
                                    billing_status: selectedBillingStatus.value,
                                  });
                                  setFieldValue('billing_status', selectedBillingStatus);
                                }}
                                placeholder="Billing"
                                options={OPTIONS.billing}
                              />
                            </S.FilterItem>
                          </Col>
                          <Col>
                            <S.Searchbox>
                              <FiSearch />

                              <Field
                                className="form-control"
                                type="text"
                                id="searchName"
                                name="searchName"
                                value={filterValue.query}
                                placeholder="Enter project name"
                                onChange={(e) => {
                                  setFilterValue({ ...filterValue, query: e.target.value });
                                }}
                              />
                            </S.Searchbox>
                          </Col>
                          <Col className="d-flex">
                            <Button theme="primary" size="sm" width="fix" type="submit">
                              Apply Filter
                            </Button>
                            <>&nbsp;</>
                            <>&nbsp;</>
                            <Button
                              size="sm"
                              width="fix"
                              onClick={() => handleClearFilters(resetForm)}
                            >
                              Clear Filter
                            </Button>
                          </Col>
                        </S.Filters>
                      </Card.Body>
                    </Card>
                  </Col>
                </Form>
              );
            }}
          </Formik>

          <Col md="12">
            <Card className="mt-3">
              <Card.Body className="p-0">
                <table className="table mb-0" role="grid">
                  <thead className="bg-primary">
                    <tr>
                      <th>
                        <div>
                          {`Name `}
                          <img
                            src={filterValue.sortValue ? SortDown : SortUp}
                            alt="Sort Project List by alphabetical order"
                            height="20px"
                            width="20px"
                            onMouseUpCapture={() => {
                              getAllProjectsData();
                              setFilterValue({
                                ...filterValue,
                                sortValue: !filterValue.sortValue,
                                sortKey: 'name',
                              });
                            }}
                          />
                        </div>
                      </th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Access</th>
                      {/* <th>&nbsp;</th> */}
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showLoader && (
                      <S.Logo>
                        <img src={teampronity} alt="teampronity" />
                      </S.Logo>
                    )}
                    {isOwnerOrAdmin(authUser)
                      ? projectData?.length > 0 &&
                        projectData?.map((projectInfo) => {
                          return (
                            <tr key={projectInfo.id} className="pointers">
                              <td
                                role="gridcell"
                                style={{
                                  textDecoration:
                                    projectInfo?.active_status === 'false' ? 'line-through' : '',
                                }}
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo.id}/tasks`);
                                }}
                              >
                                <FaCircle
                                  className="font11 mr-2"
                                  style={{ color: `${projectInfo.color}` }}
                                />
                                <ToolTipForContent>{projectInfo?.name}</ToolTipForContent>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo.id}/ProjectSettings`);
                                }}
                              >
                                <ToolTipForContent>{projectInfo?.client?.name}</ToolTipForContent>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/status`);
                                }}
                              >
                                <S.FlexBox>
                                  <FiClock />
                                  <span>2.50 h</span>
                                </S.FlexBox>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/access`);
                                }}
                              >
                                {projectInfo?.visiblity_status}
                              </td>
                              {/* <td className="action_td">
                            <FiStar
                              style={{
                                color: projectInfo.highlighted ? '#fcb029' : null,
                              }}
                            />
                          </td> */}
                              <td className="action_td">
                                <Dropdown>
                                  <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                                    <FiMoreVertical />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {projectInfo.active_status === 'true' ? (
                                      <Dropdown.Item
                                        href="#/action-1"
                                        onClick={() => {
                                          handelArchive(
                                            projectInfo.id,
                                            projectInfo.active_status,
                                            projectInfo.workspace_id,
                                          );
                                        }}
                                      >
                                        Mark As Archive
                                      </Dropdown.Item>
                                    ) : (
                                      <div>
                                        <Dropdown.Item
                                          href="#/action-1"
                                          onClick={() => {
                                            handelArchive(
                                              projectInfo.id,
                                              projectInfo.active_status,
                                              projectInfo.workspace_id,
                                            );
                                          }}
                                        >
                                          Mark As Active
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                          href="#/action-1"
                                          onClick={() => {
                                            handelDelete(projectInfo.id, projectInfo.name);
                                          }}
                                        >
                                          <FiTrash className="text-danger" />
                                          &nbsp; Delete
                                        </Dropdown.Item>
                                      </div>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })
                      : isManager(authUser)
                      ? filteredProjectListForManager?.length > 0 &&
                        filteredProjectListForManager.map((projectInfo) => {
                          return (
                            <tr key={projectInfo.id} className="pointers">
                              <td
                                role="gridcell"
                                style={{
                                  textDecoration:
                                    projectInfo?.active_status === 'false' ? 'line-through' : '',
                                }}
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo.id}/tasks`);
                                }}
                              >
                                <FaCircle
                                  className="font11 mr-2"
                                  style={{ color: `${projectInfo.color}` }}
                                />
                                <ToolTipForContent>{projectInfo?.name}</ToolTipForContent>
                              </td>
                              <td
                                role="gridcell"
                                onClick={(e) => {
                                  if (
                                    e.target &&
                                    authUser?.managerIds?.find((item) => item === projectInfo?.id)
                                  ) {
                                    history.push(`/${PROJECTS}/${projectInfo.id}/ProjectSettings`);
                                  }
                                }}
                              >
                                <ToolTipForContent>{projectInfo?.client?.name}</ToolTipForContent>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/status`);
                                }}
                              >
                                <S.FlexBox>
                                  <FiClock />
                                  <span>2.50 h</span>
                                </S.FlexBox>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/access`);
                                }}
                              >
                                {projectInfo?.visiblity_status}
                              </td>
                              {/* <td className="action_td">
                            <FiStar
                              style={{
                                color: projectInfo.highlighted ? '#fcb029' : null,
                              }}
                            />
                          </td> */}
                              <td className="action_td">
                                <Dropdown>
                                  <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                                    <FiMoreVertical />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {projectInfo.active_status === 'true' ? (
                                      <Dropdown.Item
                                        href="#/action-1"
                                        onClick={() => {
                                          handelArchive(
                                            projectInfo.id,
                                            projectInfo.active_status,
                                            projectInfo.workspace_id,
                                          );
                                        }}
                                      >
                                        Mark As Archive
                                      </Dropdown.Item>
                                    ) : (
                                      <div>
                                        <Dropdown.Item
                                          href="#/action-1"
                                          onClick={() => {
                                            handelArchive(
                                              projectInfo.id,
                                              projectInfo.active_status,
                                              projectInfo.workspace_id,
                                            );
                                          }}
                                        >
                                          Mark As Active
                                        </Dropdown.Item>
                                      </div>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })
                      : filteredProjectListForMember?.length > 0 &&
                        filteredProjectListForMember.map((projectInfo) => {
                          return (
                            <tr key={projectInfo.id} className="pointers">
                              <td
                                role="gridcell"
                                style={{
                                  textDecoration:
                                    projectInfo?.active_status === 'false' ? 'line-through' : '',
                                }}
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo.id}/tasks`);
                                }}
                              >
                                <FaCircle
                                  className="font11 mr-2"
                                  style={{ color: `${projectInfo.color}` }}
                                />
                                <ToolTipForContent>{projectInfo?.name}</ToolTipForContent>
                              </td>
                              <td role="gridcell">
                                <ToolTipForContent>{projectInfo?.client?.name}</ToolTipForContent>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/status`);
                                }}
                              >
                                <S.FlexBox>
                                  <FiClock />
                                  <span>2.50 h</span>
                                </S.FlexBox>
                              </td>
                              <td
                                role="gridcell"
                                onClick={() => {
                                  history.push(`/${PROJECTS}/${projectInfo?.id}/access`);
                                }}
                              >
                                {projectInfo?.visiblity_status}
                              </td>
                              {/* <td className="action_td">
                            <FiStar
                              style={{
                                color: projectInfo.highlighted ? '#fcb029' : null,
                              }}
                            />
                          </td> */}
                              <td className="action_td">
                                <Dropdown>
                                  <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                                    <FiMoreVertical />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {projectInfo.active_status === 'true' ? (
                                      <Dropdown.Item
                                        href="#/action-1"
                                        onClick={() => {
                                          handelArchive(
                                            projectInfo.id,
                                            projectInfo.active_status,
                                            projectInfo.workspace_id,
                                          );
                                        }}
                                      >
                                        Mark As Archive
                                      </Dropdown.Item>
                                    ) : (
                                      <div>
                                        <Dropdown.Item
                                          href="#/action-1"
                                          onClick={() => {
                                            handelArchive(
                                              projectInfo.id,
                                              projectInfo.active_status,
                                              projectInfo.workspace_id,
                                            );
                                          }}
                                        >
                                          Mark As Active
                                        </Dropdown.Item>
                                      </div>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })}
                    {!showLoader && projectData?.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          <p className="noRecord">No data found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </S.Pagewrapper>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Formik
          initialValues={addProjectInitialValues}
          validationSchema={validationSchema}
          validateOnChange={errorMessageShow}
          validateOnBlur={errorMessageShow}
          onSubmit={handleAddProject}
        >
          {({ handleChange, errors, values, touched, setFieldValue }) => (
            <Form>
              <Modal.Header closeButton>
                <Modal.Title>Create New Project</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {Object.keys(errors).length > 0 && setErrorMessageShow(true)}

                <Row className="pt-3">
                  <Col md="6">
                    <S.Formgroup>
                      <Field
                        className="col-md-12 form-control"
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter project name"
                        value={values.name}
                        onChange={(event) => {
                          setFieldValue('name', event.target.value.replace(/ +/g, ' '));
                        }}
                        onBlur={() => {}}
                      />
                      {errors.name && touched.name && (
                        <S.StyledErrorMessage>{errors.name}</S.StyledErrorMessage>
                      )}
                    </S.Formgroup>
                  </Col>
                  <Col md="6">
                    <S.Formgroup>
                      <Select
                        className="form-control border-0 p-0"
                        name="client_id"
                        id="client_id"
                        value={values.client_id}
                        onChange={(selectedClient) => {
                          setFieldValue('client_id', selectedClient);
                        }}
                        placeholder="Client"
                        options={clientOptions}
                      />
                      {errors.client_id && touched.client_id && (
                        <S.StyledErrorMessage>{errors.client_id}</S.StyledErrorMessage>
                      )}
                    </S.Formgroup>
                  </Col>
                  <Col md="6">
                    <S.Formgroup>
                      <Row className="pl-3 pr-3 p-relative">
                        <ColorPickerField
                          className="col-md-3 form-control color-height"
                          type="color"
                          id="color"
                          name="color"
                          placeholder=""
                          onChange={handleChange}
                        />
                        {errors.color && touched.color && (
                          <S.StyledErrorMessage>{errors.color}</S.StyledErrorMessage>
                        )}
                      </Row>
                    </S.Formgroup>
                  </Col>
                  <Col md="6">
                    <S.Formgroup>
                      <S.Flexbox>
                        <p>Visibility status:</p>
                        <S.RadioGroup>
                          <Field
                            type="radio"
                            name="visiblity_status"
                            id="Public"
                            value="Public"
                            defaultChecked={values.visiblity_status === VISIBILITY_STATUS.public}
                          />
                          <label htmlFor="Public">Public</label>
                        </S.RadioGroup>
                        <S.RadioGroup>
                          <Field
                            type="radio"
                            name="visiblity_status"
                            id="Private"
                            value="Private"
                            defaultChecked={values.visiblity_status === VISIBILITY_STATUS.private}
                          />
                          <label htmlFor="Private">Private</label>
                        </S.RadioGroup>
                        {errors.visiblity_status && touched.visiblity_status ? (
                          <div>{errors.visiblity_status}</div>
                        ) : null}
                      </S.Flexbox>
                    </S.Formgroup>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button size="lg" width="fix" onClick={handleClose}>
                  Cancel
                </Button>
                <Button theme="primary" size="lg" width="fix" type="submit">
                  Create
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </S.MainWrapper>
  );
};

Projects.propTypes = propTypes;
export default withApollo(Projects);
