import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import styled from 'styled-components';
// import { FiMoreVertical, FiStar } from 'react-icons/fi';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header';
import Task from './Components/Tasks';
import Access from './Components/Access';
import Status from './Components/Status';
import Note from './Components/Note';
import ProjectSetting from './Components/ProjectSetting';
import { PROJECT_BY_ID } from './graphQueries';
import { PROJECTS } from '../../constants/routes';
import Breadcrumb from '../../components/Breadcrumb';
import ToolTipForContent from '../../components/ToolTipForContent';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import { PROJECT_TABS } from '../../utils/commonConstants';
import { hasAccess } from '../../utils/index';
import AppContext from '../../context/AppContext';

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

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const ProjectsDetails = ({ client, componentProps }) => {
  const match = componentProps.computedMatch.params;
  const { id, tab } = match;
  const selectedTab = capitalizeFirstLetter(tab);
  const history = useHistory();
  const [projectData, setProjectData] = useState({});
  const [projectCrumb, setProjectCrumb] = useState([]);
  const { authUser } = useContext(AppContext);
  const getProjectData = async () => {
    try {
      const {
        data: { getProjectById: projectList },
      } = await client.query({
        query: PROJECT_BY_ID,
        variables: {
          id,
        },
      });

      setProjectData(projectList);
      setProjectCrumb([
        PROJECTS,
        <ToolTipForContent>{projectList.name}</ToolTipForContent>,
        PROJECT_TABS[selectedTab],
      ]);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getProjectData();
  }, []);

  useEffect(() => {
    setProjectCrumb([
      PROJECTS,
      <ToolTipForContent>{projectData.name}</ToolTipForContent>,
      capitalizeFirstLetter(tab),
    ]);
  }, [tab]);

  const getProjectDetails = (shouldFetchProjectDetails) => {
    if (shouldFetchProjectDetails) {
      getProjectData();
    }
  };

  return (
    <MainWrapper>
      <Header />
      <Pagewrapper className="pagewprage">
        <Row className="m-0">
          <Col md="12 mt-4">
            <Row className="align-items-center">
              <Col md="6">
                <Breadcrumb crumbs={projectCrumb} />
              </Col>
            </Row>
          </Col>
          <Col md="12">
            <Card className="mt-3">
              <Card.Body className="p-0 projectabs">
                <Tab.Container
                  id="left-tabs-example"
                  activeKey={selectedTab}
                  onSelect={(key) => {
                    setProjectCrumb([
                      PROJECTS,
                      <ToolTipForContent>{projectData.name}</ToolTipForContent>,
                      PROJECT_TABS[key],
                    ]);
                    history.push({
                      pathname: `/${PROJECTS}/${id}/${key}`,
                      state: { projectkey: key },
                    });
                  }}
                >
                  <Row>
                    <Col sm={12}>
                      <Nav variant="pills" className="flex-row m-0">
                        <Nav.Item>
                          <Nav.Link eventKey="Tasks">Tasks</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="Access">Access</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="Status">Status</Nav.Link>
                        </Nav.Item>
                        {hasAccess(authUser, id) && (
                          <>
                            <Nav.Item>
                              <Nav.Link eventKey="Note">Note</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="ProjectSettings">Project Settings</Nav.Link>
                            </Nav.Item>
                          </>
                        )}
                      </Nav>
                    </Col>
                    <Col sm={12}>
                      <Tab.Content>
                        <Tab.Pane eventKey="Tasks">
                          <Task componentProps={componentProps} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="Access">
                          <Access componentProps={componentProps} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="Status">
                          <Status componentProps={componentProps} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="Note">
                          <Note componentProps={componentProps} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="ProjectSettings">
                          <ProjectSetting
                            componentProps={componentProps}
                            getProjectDetails={getProjectDetails}
                          />
                        </Tab.Pane>
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Pagewrapper>
    </MainWrapper>
  );
};

ProjectsDetails.propTypes = propTypes;
export default withApollo(ProjectsDetails);
