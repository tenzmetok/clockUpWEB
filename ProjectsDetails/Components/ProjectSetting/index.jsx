import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col, Button } from 'react-bootstrap';
import Select from 'react-select';
import { find } from 'lodash';
import Form from 'react-bootstrap/Form';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import InputGroup from 'react-bootstrap/InputGroup';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { PROJECT_BY_ID, GET_CLIENTS_BY_WORKSPACE } from '../../graphQueries';
import UPDATE_PROJECT from '../../graphMutations';
import TextError from '../../../../components/TextError';
import AppContext from '../../../../context/AppContext';
import { BILLING_STATUS, ESTIMATION_TYPE } from '../../../../utils/commonConstants';
import toEllipsis from '../../../../utils/toEllipsis';
import { isManager } from '../../../../utils';

const TabWrapper = styled.div`
  width: 100%;
  padding: 15px 15px;
`;
const FlexBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
`;
const RadioGroup = styled.div`
  margin-right: 15px;
  min-width: 100px;
  label {
    margin-left: 7px;
  }
`;
const Formgroup = styled.div`
  margin-bottom: 35px;
`;
const Switchbox = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-top: 6px;
  }
`;

const ColorPickerField = styled(Field)`
  padding: 5px !important;
  min-height: 40px;
`;

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const ProjectSetting = ({ client, componentProps, getProjectDetails }) => {
  const match = componentProps.computedMatch.params;
  const { id } = match;
  const [projectData, setProjectData] = useState({});
  const [clientData, setClientData] = useState([]);
  const { authUser } = useContext(AppContext);

  const clientOptions = clientData
    ?.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
    .map((clientInfo) => ({
      key: clientInfo.id,
      value: clientInfo.id,
      label: toEllipsis(clientInfo.name),
    }));

  const getSelectedClientOption = (selectedClientId) => {
    return find(clientOptions, { value: selectedClientId }) || null;
  };

  const initialValues = {
    Project_name: projectData.name || '',
    Client: getSelectedClientOption(projectData.client_id) || '',
    color: projectData.color || '',
    Billing_status: projectData.billing_status || '',
    Bill_rate: projectData.bill_rate || 0.0,
    Estimation_type: projectData.estimation_type || '',
    Estimate_time: projectData.estimate_time || '',
  };

  const validationSchema = Yup.object().shape({
    Project_name: Yup.string()
      .min(2, 'Project name is too short')
      .max(50, 'Project name cannot be longer than 50 characters')
      .required('Project name is required')
      .matches(/^[^0-9]/, 'Please enter atleast one character')
      .required('*Project name is required'),
    Bill_rate: Yup.string().matches(
      /^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/,
      'Please enter a proper value',
    ),
    Estimate_time: Yup.string()
      .matches(/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/, 'Please enter Proper value')
      .matches(
        /^[0-9]*(\.[0-9]{0,2})?$/,
        'Please enter a number which accepts only two decimal value',
      ),
  });

  const getProjectData = async () => {
    try {
      const { data: projectDataResponse } = await client.query({
        query: PROJECT_BY_ID,
        variables: {
          id,
        },
      });

      const projects = (projectDataResponse && projectDataResponse.getProjectById) || '';

      setProjectData(projects);

      const { data } = await client.query({
        query: GET_CLIENTS_BY_WORKSPACE,
        variables: {
          workspace_id: authUser.current_workspace || authUser?.Workspaces?.[0]?.id,
        },
      });

      const clients = (data && data.getClientsByWorkspaceId) || [];
      setClientData(clients);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getProjectData();
  }, []);

  return (
    <TabWrapper>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, actions) => {
          const variables = {
            input: {
              id,
              name: values.Project_name,
              client_id: values.Client.value,
              workspace_id: authUser.current_workspace,
              color: values.color,
              billing_status: values.Billing_status,
              bill_rate: parseFloat(values.Bill_rate) || 0.0,
              estimation_type: values.Estimation_type,
              estimate_time: values.Estimate_time.replace(/^0+/, '') || '0.0',
            },
          };

          try {
            const {
              data: {
                updateProject: { isUpdated },
              },
            } = await client.mutate({
              mutation: UPDATE_PROJECT,
              variables,
            });
            if (isUpdated) {
              getProjectDetails(isUpdated);
              actions.setFieldValue('Bill_rate', parseFloat(values.Bill_rate) || 0.0);

              if (values.Estimation_type === ESTIMATION_TYPE.taskBased) {
                actions.setFieldValue('Estimate_time', '0');
              }
              if (values.Estimation_type === ESTIMATION_TYPE.manual) {
                if (!values.Estimate_time) actions.setFieldValue('Estimate_time', '0.0');
                if (values.Estimate_time.length > 1)
                  actions.setFieldValue('Estimate_time', values.Estimate_time.replace(/^0+/, ''));
              }
              toast.success('Setting updated successfully', { autoClose: 2000 });
            } else {
              toast.error(`Client with the same project ${values.Project_name} already exists`, {
                autoClose: 2000,
              });
            }
          } catch (error) {
            toast.error(error);
          }
        }}
      >
        {({ values, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="pl-0">
                <Formgroup>
                  <h5>Project name</h5>
                  <Field
                    type="text"
                    id="Project_name"
                    name="Project_name"
                    className="form-control"
                    placeholder="Edit project name"
                    onChange={(event) => {
                      setFieldValue('Project_name', event.target.value.replace(/ +/g, ' '));
                    }}
                    onBlur={handleBlur}
                    value={values.Project_name}
                  />
                  <ErrorMessage name="Project_name" component={TextError} />
                </Formgroup>
                <Formgroup>
                  <h5 className="mt-4">Client</h5>
                  <p className="mb-2">Used for grouping similar projects together.</p>
                  <Select
                    className="form-control border-0 p-0"
                    name="Client"
                    id="Client"
                    value={values.Client}
                    onChange={(selectedClient) => {
                      setFieldValue('Client', selectedClient);
                    }}
                    placeholder="Client"
                    options={clientOptions}
                  />
                </Formgroup>
                <Formgroup>
                  <h5 className="mt-4">Color</h5>
                  <p className="mb-2">Use color to visually differentiate projects.</p>
                  <ColorPickerField
                    className="col-md-1 "
                    type="color"
                    id="color"
                    name="color"
                    onChange={handleChange}
                    value={values.color}
                  />
                </Formgroup>
              </Col>
              <Col md={6}>
                <Formgroup>
                  <h5>Billable by default</h5>
                  <p className="mb-2">
                    All new entries on this project will be initially set as billable.
                  </p>
                  {values.Billing_status === BILLING_STATUS.billable ? (
                    <>
                      <Switchbox>
                        <Form.Check
                          type="switch"
                          id="Billing_status"
                          name="Billing_status"
                          onBlur={handleBlur}
                          value={values.Billing_status}
                          checked={values.Billing_status}
                          onChange={() => {
                            setFieldValue('Billing_status', BILLING_STATUS.nonBillable);
                          }}
                        />
                      </Switchbox>
                    </>
                  ) : (
                    <>
                      <Switchbox>
                        <Form.Check
                          type="switch"
                          id="Billing_status"
                          name="Billing_status"
                          onBlur={handleBlur}
                          value={values.Billing_status}
                          onChange={() => {
                            setFieldValue('Billing_status', BILLING_STATUS.billable);
                          }}
                        />
                      </Switchbox>
                    </>
                  )}
                </Formgroup>
                {isManager(authUser) ? (
                  <Formgroup />
                ) : (
                  <Formgroup>
                    <h5>Project billable rate</h5>
                    <p className="mb-2">
                      Billable rate used for calculating billable amount for this project.
                    </p>
                    <InputGroup className="mb-2 mr-sm-2 w-50 input-group-sm">
                      <Field
                        type="text"
                        id="Bill_rate"
                        name="Bill_rate"
                        className="form-control"
                        placeholder="rate"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.Bill_rate}
                      />
                    </InputGroup>
                    <ErrorMessage name="Bill_rate" component={TextError} />
                  </Formgroup>
                )}
                <Formgroup>
                  <h5>Estimate</h5>
                  <p className="mb-2">How you wish to track overall project progress.</p>
                  <FlexBox>
                    <RadioGroup>
                      <Field
                        type="radio"
                        name="Estimation_type"
                        id="Estimation_type_task"
                        value="Task-based"
                        defaultChecked={values.Estimation_type === 'Task-based'}
                      />
                      <label htmlFor="Estimation_type_task">Task based</label>
                    </RadioGroup>
                  </FlexBox>
                  <FlexBox>
                    <RadioGroup>
                      <Field
                        type="radio"
                        name="Estimation_type"
                        id="Estimation_type_manual"
                        value="Manual"
                        defaultChecked={values.Estimation_type === 'Manual'}
                      />
                      <label htmlFor="Estimation_type_manual">Manual estimation</label>
                      {values.Estimation_type === ESTIMATION_TYPE.manual && (
                        <>
                          <InputGroup className="mb-2 mr-sm-2 w-50 input-group-sm">
                            <Field
                              type="text"
                              className="form-control"
                              placeholder="hours"
                              id="Estimate_time"
                              name="Estimate_time"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.Estimate_time}
                            />
                            <InputGroup.Prepend>
                              <label htmlFor="Hours" className="mt-1 ml-2">
                                Hours
                              </label>
                            </InputGroup.Prepend>
                          </InputGroup>
                          <ErrorMessage name="Estimate_time" component={TextError} />
                        </>
                      )}
                    </RadioGroup>
                  </FlexBox>
                </Formgroup>
              </Col>
              <Col md={12} className="p-0">
                <Button variant="primary" type="submit">
                  Update
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </TabWrapper>
  );
};

ProjectSetting.propTypes = propTypes;
export default withApollo(ProjectSetting);
