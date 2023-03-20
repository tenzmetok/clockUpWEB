/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import styled from 'styled-components';
import { FiFilter } from 'react-icons/fi';
import { Formik, Form, Field } from 'formik';
import Header from '../../components/Header';
// import Input from '../../components/Input';
import Detailed from './Components/Detailed';
import Summary from './Components/Summary';
import Weekly from './Components/Weekly';
// import Shared from './Components/Shared';
import { OPTIONS } from '../../utils/commonConstants';
import { GET_CLIENTS_BY_WORKSPACE, GET_FILTERED_PROJECTS } from './graphQueries';
import AppContext from '../../context/AppContext';
import toEllipsis from '../../utils/toEllipsis';
import DateRangeFilter from '../../components/DateRangeFilter';
import { toDateFormat } from '../../utils/DateAndTime/index';

const MainWrapper = styled.div`
  width: 100%;
`;
const Pagewrapper = styled.div`
  width: 100%;
  padding-left: 230px;
  padding-top: 75px;
  height: 100vh;
  overflow: auto;
  transition: all 0.4s ease 0s;
  background: #f3f3f3;
`;
const Filters = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;
const FilterItem = styled.div`
  height: 100%;
  padding: 10px 0px;
  width: 100%;
  input {
    border-radius: 4px;
    border-color: rgb(204, 204, 204);
  }
`;

const Filtertitle = styled.div`
  font-size: 18px;
  span {
    margin-left: 10px;
  }
`;

const DateRangeFilterWrapper = styled.div`
  position: absolute;
  z-index: 1;
  left: -160px;
  right: 20;
  border: 1px solid #ddd;
  border-radius: 5px;
  top: 50px;
`;

const ReportTab = styled.div`
  display: flex;
  align-items: center;
  .nav {
    background-color: #fff;
    overflow: hidden;
    margin-left: 15px;
    a {
      padding: 6px 20px;
      color: #000;
      border-right: 1px solid #ddd;
      border-bottom: 2px solid #fff;
      &:hover {
        text-decoration: none;
      }
      &:last-child {
        border-right: none;
      }
    }
    a.active {
      border-right: none;
      color: #0c67fb;
      border-right: 1px solid #ddd;
      border-bottom: 2px solid #0c67fb;
    }
  }
`;

const filterInitialValues = {
  client_id: 0,
  visiblity_status: '',
  time: '',
  project_id: 0,
  startDate: '',
  endDate: '',
};

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const Reports = ({ client }) => {
  const { authUser } = useContext(AppContext);
  const [reportTabs, setReportTabs] = useState(1);
  const [clientData, setClientData] = useState([]);
  const [filterData, setFilterData] = useState({});
  const [projectName, setProjectName] = useState([]);
  const [openDateRange, setOpenDateRange] = useState(false);
  const refCalender = useRef(null);

  const fetchAllProjectData = async () => {
    try {
      const projectParams = {
        workspace_id: authUser.current_workspace,
      };
      const { data: projectsData } = await client.query({
        query: GET_FILTERED_PROJECTS,
        variables: projectParams,
      });

      const projects = projectsData?.getFilteredProjects?.projects || [];
      setProjectName(projects);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllClientData = async () => {
    try {
      const { data: clientsData } = await client.query({
        query: GET_CLIENTS_BY_WORKSPACE,
        variables: {
          workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
        },
      });
      const clients = clientsData?.getClientsByWorkspaceId || [];
      setClientData(clients);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearFilters = (resetForm) => {
    resetForm({
      values: {
        client_id: 0,
        visiblity_status: '',
        time: '',
        project_id: 0,
        startDate: '',
        endDate: '',
      },
    });
    setFilterData(filterInitialValues);
  };

  const handleClickOutside = (e) => {
    if (refCalender.current && !refCalender.current.contains(e.target)) {
      setOpenDateRange(false);
    }
  };

  useEffect(() => {
    fetchAllClientData();
    fetchAllProjectData();
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [authUser]);

  const clientOptions = clientData
    ?.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
    .map((clientInfo) => ({
      value: clientInfo.id,
      label: toEllipsis(clientInfo.name),
    }));

  const projectOptions = projectName
    ?.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
    .map((project) => ({
      value: project.id,
      label: toEllipsis(project.name),
    }));

  return (
    <MainWrapper>
      <Header />
      <Pagewrapper className="pagewprage">
        <Row className="m-0">
          <Col md="12 mt-4">
            <Row className="align-items-center">
              <Col md="6">
                <ReportTab className="reporttabs">
                  <h4 className="m-0">Reports</h4>
                  <Nav defaultActiveKey="/reports">
                    <Link
                      className={reportTabs === 1 ? 'active' : ''}
                      onClick={() => setReportTabs(1)}
                    >
                      <span>Detailed</span>
                    </Link>
                    <Link
                      className={reportTabs === 2 ? 'active' : ''}
                      onClick={() => setReportTabs(2)}
                    >
                      <span>Summary</span>
                    </Link>
                    <Link
                      className={reportTabs === 3 ? 'active' : ''}
                      onClick={() => setReportTabs(3)}
                    >
                      <span>Weekly</span>
                    </Link>
                    {/* <Link
                      className={reportTabs === 4 ? 'active' : ''}
                      onClick={() => setReportTabs(4)}
                    >
                      <span>Shared</span>
                    </Link> */}
                  </Nav>
                </ReportTab>
              </Col>
              {/* <Col md="6" className="d-flex justify-content-end">
                <Input type="text" className="form-control" />
              </Col> */}
            </Row>
          </Col>
          <Formik
            initialValues={filterInitialValues}
            onSubmit={(values) => {
              setFilterData({
                client_id: parseInt(values?.client_id?.value, 10),
                visiblity_status: values?.visiblity_status?.value,
                time: values?.time.value,
                project_id: parseInt(values?.project_id?.value, 10),
                startDate: values?.startDate,
                endDate: values?.endDate,
              });
            }}
          >
            {({ values, setFieldValue, resetForm }) => {
              return (
                <Form>
                  <Col md="12">
                    <Card className="mt-3">
                      <Card.Body className="p-0">
                        <Filters>
                          <Col>
                            <Filtertitle>
                              <FiFilter />
                              <span>FILTER</span>
                            </Filtertitle>
                          </Col>
                          <Col>
                            <FilterItem borderleft>
                              <Select
                                className="form-control border-0 p-0"
                                name="client_id"
                                id="client_id"
                                value={values?.client_id}
                                onChange={(selectedOption) => {
                                  setFieldValue('client_id', selectedOption);
                                }}
                                placeholder="Client"
                                options={clientOptions}
                              />
                            </FilterItem>
                          </Col>
                          <Col>
                            <FilterItem>
                              <Select
                                className="form-control border-0 p-0"
                                name="visiblity_status"
                                id="visiblity_status"
                                value={values?.visiblity_status}
                                onChange={(selectedOption) => {
                                  setFieldValue('visiblity_status', selectedOption);
                                }}
                                placeholder="Access"
                                options={OPTIONS.access}
                              />
                            </FilterItem>
                          </Col>
                          <Col>
                            <FilterItem>
                              <Select
                                className="form-control border-0 p-0"
                                name="project_id"
                                id="project_id"
                                value={values?.project_id}
                                onChange={(selectedOption) => {
                                  setFieldValue('project_id', selectedOption);
                                }}
                                placeholder="Project"
                                options={projectOptions}
                              />
                            </FilterItem>
                          </Col>
                          <Col>
                            <FilterItem>
                              <Field
                                className="form-control"
                                name="time"
                                type="text"
                                placeholder="Date"
                                autocomplete="off"
                                value={
                                  values?.startDate && `${values?.startDate} to ${values?.endDate}`
                                }
                                onClick={() => {
                                  if (openDateRange) {
                                    setOpenDateRange(false);
                                  } else {
                                    setOpenDateRange(true);
                                  }
                                }}
                              />
                            </FilterItem>
                            {openDateRange && (
                              <DateRangeFilterWrapper ref={refCalender}>
                                <DateRangeFilter
                                  onChange={(ranges) => {
                                    setFieldValue('startDate', toDateFormat(ranges.startDate));
                                    setFieldValue('endDate', toDateFormat(ranges.endDate));
                                  }}
                                />
                              </DateRangeFilterWrapper>
                            )}
                          </Col>
                          <Col className="d-flex">
                            <Button
                              type="submit"
                              theme="outline-primary"
                              size="sm"
                              className="mr-2"
                            >
                              Apply Filter
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleClearFilters(resetForm)}
                            >
                              Clear Filters
                            </Button>
                          </Col>
                        </Filters>
                      </Card.Body>
                    </Card>
                  </Col>
                </Form>
              );
            }}
          </Formik>
          <Col md="12">
            {reportTabs === 1 && <Detailed filterValues={filterData} />}
            {reportTabs === 2 && <Summary filterValues={filterData} />}
            {reportTabs === 3 && <Weekly />}
            {/* {reportTabs === 4 && <Shared />} */}
          </Col>
        </Row>
      </Pagewrapper>
    </MainWrapper>
  );
};

Reports.propTypes = propTypes;
export default withApollo(Reports);
