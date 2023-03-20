import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Formik, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import { find } from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';
import Select from 'react-select';
import WorkspaceDefaultLogo from '../../../../images/workspace.png';
import AppContext from '../../../../context/AppContext';
import CURRENCY_OPTIONS from './currency';
import Button from '../../../../components/Button';
import TextError from '../../../ProjectsDetails/Components/ProjectSetting/TextError';
import { UPDATE_WORKSPACE, GET_WORKSPACE_PIC_SIGNED_URL } from './graphMutatations';
import client from '../../../../utils/apollo-client';
import { GET_WORKSPACE_BY_ID } from './graphQueries';
import {
  TIME_FORMAT,
  GROUP_PROJECT,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
} from '../../../../utils/commonConstants';
import bytesToSize from '../../../../utils/bytesToSize';

const TabWrapper = styled.div`
  width: 100%;
  padding: 15px 15px;
  p {
    font-size: 14px;
  }
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
const CompanyLogo = styled.div`
  display: flex;
  align-items: center;
`;
const Switchbox = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-top: 6px;
  }
`;
const UploadedImg = styled.div`
  flex: 0 0 auto;
  width: 100px;
  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Setting = () => {
  const { authUser, dispatch } = useContext(AppContext);
  const [workSpaceData, setWorkSpaceData] = useState({});

  const getCurrencyOptionFromValue = (currencyValue) => {
    const response = find(CURRENCY_OPTIONS, { value: currencyValue });
    return response || null;
  };

  const getGroupProjectOptionFromValue = (projectValue) => {
    const response = find(GROUP_PROJECT, { value: projectValue });
    return response || null;
  };

  const getTimeFormatOptionFromValue = (timeValue) => {
    const response = find(TIME_FORMAT, { value: timeValue });
    return response || null;
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

      setWorkSpaceData(workspace?.workSpaceById);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getWorkSpaceDataById();
  }, [authUser]);

  const initialValues = {
    workspace_name: workSpaceData?.workspace_name || '',
    bill_rate: workSpaceData?.bill_rate || 0,
    currency: getCurrencyOptionFromValue(workSpaceData.currency) || '',
    group_project_label: getGroupProjectOptionFromValue(workSpaceData.group_project_label) || '',
    time_format: getTimeFormatOptionFromValue(workSpaceData.time_format) || '',
    billing_status: workSpaceData?.billing_status || '',
    visibility_status: workSpaceData?.visibility_status || '',
    bill_rate_view_status: workSpaceData?.bill_rate_view_status || '',
    timetracker_status: workSpaceData?.timetracker_status,
    task_filter: workSpaceData?.task_filter,
    favorite_status: workSpaceData?.favorite_status,
    create_project_status: workSpaceData?.create_project_status || '',
    create_task_status: workSpaceData?.create_task_status || '',
    create_tag_status: workSpaceData?.create_tag_status || '',
    company_logo: workSpaceData?.company_logo,
  };

  const changeWorkSpaceLogo = async (event, setFieldValue) => {
    const [selectedProfileImage] = event.target.files;

    if (!SUPPORTED_IMAGE_FORMATS.includes(selectedProfileImage.type)) {
      toast.error('Please select valid image file', { autoClose: 2000 });
      return;
    }

    if (selectedProfileImage.size > MAX_FILE_SIZE) {
      toast.error(`File size cannot be greater than ${bytesToSize(MAX_FILE_SIZE)}`, {
        autoClose: 2000,
      });
      return;
    }
    const params = {
      input: {
        fileName: `workspace-logos/${selectedProfileImage?.name?.toLowerCase()}`,
        fileType: selectedProfileImage.type,
      },
    };

    try {
      const data = await client.mutate({
        mutation: GET_WORKSPACE_PIC_SIGNED_URL,
        variables: params,
      });

      const { signedRequest, url } = data.data.getWorkSpacePicUploadLink;

      const options = {
        headers: {
          'Content-Type': selectedProfileImage.type,
        },
      };
      axios
        .put(signedRequest, selectedProfileImage, options)
        .then((result) => {
          setFieldValue('company_logo', url);
          console.log('Response from s3', result);
        })
        .catch((error) => {
          toast.error(error);
        });
    } catch (error) {
      const errorMessage = error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <TabWrapper>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Yup.object().shape({
            workspace_name: Yup.string()
              .required('Workspace name is required')
              .trim()
              .matches(/[A-Za-z_.]+/, 'Please enter valid workspace name'),
            timetracker_status: Yup.bool().required('TimeSheet is required'),
            bill_rate: Yup.string()
              .required('Bill rate is required')
              .matches(/^[0-9.]+$/, 'Please enter valid billable rate'),
            billing_status: Yup.string().required('Billing status is required'),

            visibility_status: Yup.string().required('Visibility status is required'),
            bill_rate_view_status: Yup.string().required('Required'),
            create_project_status: Yup.string().required('Required'),
            create_tag_status: Yup.string().required('Required'),
            create_task_status: Yup.string().required('Required'),
            favorite_status: Yup.bool().required('Project favourite is required'),
            task_filter: Yup.bool().required('Task filter is required'),
          })}
          onSubmit={async (values, actions) => {
            const params = {
              input: {
                id: Number(workSpaceData.id),
                owner_id: Number(authUser.id),
                workspace_name: values.workspace_name,
                bill_rate: parseFloat(values.bill_rate) || 0.0,
                currency: values.currency.value,
                group_project_label: values.group_project_label.value,
                time_format: values.time_format.value,
                billing_status: values.billing_status,
                visibility_status: values.visibility_status,
                bill_rate_view_status: values.bill_rate_view_status,
                timetracker_status: values.timetracker_status,
                task_filter: values.task_filter,
                favorite_status: values.favorite_status,
                create_project_status: values.create_project_status,
                create_client_status: values.create_project_status,
                create_task_status: values.create_task_status,
                create_tag_status: values.create_tag_status,
                company_logo: values.company_logo,
              },
            };

            try {
              const {
                data: {
                  updateWorkSpace: { isUpdated },
                },
              } = await client.mutate({
                mutation: UPDATE_WORKSPACE,
                variables: params,
              });

              if (isUpdated) {
                toast.success('Settings saved successfully');
                actions.setFieldValue('bill_rate', parseFloat(values.bill_rate) || 0.0);
                getWorkSpaceDataById();

                const newWorkspaces = authUser.Workspaces.map((workspace) => {
                  const workSpaceList = { ...workspace };
                  if (
                    workspace.id === authUser.current_workspace ||
                    workspace.id === authUser?.Workspaces?.[0]?.id
                  ) {
                    workSpaceList.workspace_name = values.workspace_name;
                  }
                  return workSpaceList;
                });

                dispatch({
                  type: 'USER_PROFILE',
                  payload: {
                    ...authUser,
                    workspace_name: values.workspace_name,
                    Workspaces: newWorkspaces,
                  },
                });
              } else toast.error('Workspace name already exists', { autoClose: 2000 });
            } catch (error) {
              const errorMessage = error.message;
              toast.error(errorMessage);
            }
          }}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6} className="pl-0">
                  <h5>Company Logo</h5>
                  <p>
                    Company logo will appear in shared reports and branded PDF exports. Formats:
                    png, jpg, jpeg Max size: 5 MB.
                  </p>
                  <CompanyLogo>
                    <UploadedImg>
                      <img
                        src={values.company_logo || WorkspaceDefaultLogo}
                        alt="Teampronity Workspace Setting logo"
                      />
                    </UploadedImg>
                    <label className="btn btn-primary ml-3" htmlFor="uploadButton">
                      <Field
                        id="uploadButton"
                        className="d-none"
                        name="company_logo_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          changeWorkSpaceLogo(e, setFieldValue);
                        }}
                      />
                      <span>{values.company_logo ? 'Change Image' : 'Upload Image'}</span>
                    </label>
                    {values?.company_logo && (
                      <label className=" ml-3" htmlFor="removeButton">
                        <Button
                          className="d-none"
                          theme="secondary"
                          name="company_logo_remove"
                          type="button"
                          onClick={() => {
                            setFieldValue('company_logo', '');
                          }}
                        >
                          Remove Image
                        </Button>
                      </label>
                    )}
                  </CompanyLogo>
                  <Formgroup>
                    <h5 className="mt-4">Workspace name</h5>
                    <div style={{ width: '380px' }}>
                      <Field
                        type="text"
                        id="workspace_name"
                        name="workspace_name"
                        className="form-control"
                        placeholder="Workspace"
                        value={values.workspace_name.replace(/ +/g, ' ')}
                      />
                    </div>
                    {values.workspace_name && (
                      <ErrorMessage name="workspace_name" component={TextError} />
                    )}
                  </Formgroup>
                  <Formgroup>
                    <h5 className="mt-4">Timesheet</h5>
                    <p className="mb-2">
                      Enter time on tasks and projects using a weekly timesheet view. While
                      activated, project is a required field for the whole workspace.
                    </p>
                    <Form.Check
                      type="switch"
                      name="timetracker_status"
                      id="timetracker_status"
                      onChange={() => {
                        setFieldValue('timetracker_status', !values.timetracker_status);
                      }}
                      checked={values.timetracker_status}
                    />
                    {errors.timetracker_status && touched.timetracker_status ? (
                      <div>{errors.timetracker_status}</div>
                    ) : null}
                  </Formgroup>
                  <Formgroup>
                    <h5 className="mt-4">Workspace billable rate</h5>
                    <p className="mb-2">
                      Default value of each billable hour when there’s no user or project hourly
                      rate.
                    </p>
                    <InputGroup className="mb-2 mr-sm-2 w-50 input-group-sm">
                      <div style={{ width: '380px' }}>
                        <Field
                          type="text"
                          id="bill_rate"
                          name="bill_rate"
                          className="form-control"
                          placeholder="Bill Rate"
                          value={values.bill_rate}
                        />
                      </div>
                    </InputGroup>
                    <ErrorMessage name="bill_rate" component={TextError} />
                  </Formgroup>
                  <Formgroup>
                    <h5 className="mt-4">Currency</h5>
                    <p className="mb-2">
                      The currency in which the billable and cost amounts will be displayed in
                      reports.
                    </p>
                    <div style={{ width: '380px' }}>
                      <Select
                        options={CURRENCY_OPTIONS}
                        value={values.currency}
                        onChange={(e) => {
                          setFieldValue('currency', e);
                        }}
                      />
                    </div>
                    {errors.currency && touched.currency ? <div>{errors.currency}</div> : null}
                  </Formgroup>
                  <Formgroup>
                    <h5 className="mt-4">Group projects by</h5>
                    <p className="mb-2">
                      If you don’t have clients or departments, you can change the label to
                      something else.
                    </p>
                    <div style={{ width: '380px' }}>
                      <Select
                        options={GROUP_PROJECT}
                        value={values.group_project_label}
                        onChange={(e) => {
                          setFieldValue('group_project_label', e);
                        }}
                      />
                    </div>
                    {errors.group_project_label && touched.group_project_label ? (
                      <div>{errors.group_project_label}</div>
                    ) : null}
                  </Formgroup>
                  <Formgroup>
                    <h5 className="mt-4">Duration format</h5>
                    <p className="mb-2">Display time in clock format (with or without seconds).</p>
                    <div style={{ width: '380px' }}>
                      <Select
                        options={TIME_FORMAT}
                        value={values.time_format}
                        onChange={(e) => {
                          setFieldValue('time_format', e);
                        }}
                      />
                    </div>
                    {errors.time_format && touched.time_format ? (
                      <div>{errors.time_format}</div>
                    ) : null}
                  </Formgroup>
                </Col>
                <Col md={6}>
                  <Formgroup>
                    <h5>New projects are by default</h5>
                    <p className="mb-2">
                      When you create a project, make it public so its available to all users, and
                      billable so its time entries are set as billable.
                    </p>
                    <FlexBox>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="billing_status"
                          id="billing_status"
                          value="Billable"
                          defaultChecked={values.billing_status === 'Billable'}
                        />
                        <label htmlFor="Billable">Billable</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="billing_status"
                          id="billing_status"
                          value="Non-billable"
                          defaultChecked={values.billing_status === 'Non-billable'}
                        />
                        <label htmlFor="Nonbillable">Non-billable</label>
                      </RadioGroup>
                      {errors.billing_status && touched.billing_status ? (
                        <div>{errors.billing_status}</div>
                      ) : null}
                    </FlexBox>
                    <FlexBox>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="visibility_status"
                          id="Public"
                          value="Public"
                          defaultChecked={values.visibility_status === 'Public'}
                        />
                        <label htmlFor="Public">Public</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="visibility_status"
                          id="Private"
                          value="Private"
                          defaultChecked={values.visibility_status === 'Private'}
                        />
                        <label htmlFor="Private">Private</label>
                      </RadioGroup>
                      {errors.visibility_status && touched.visibility_status ? (
                        <div>{errors.visibility_status}</div>
                      ) : null}
                    </FlexBox>
                  </Formgroup>
                  <Formgroup>
                    <h5>Who can see billable rates and amounts</h5>
                    <p className="mb-2">
                      Hide billable rates and amounts from regular users so only admins can see
                      them.
                    </p>
                    <FlexBox>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="bill_rate_view_status"
                          id="Admins"
                          value="Admins"
                          defaultChecked={values.bill_rate_view_status === 'Admins'}
                        />
                        <label htmlFor="admin">Admins</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="bill_rate_view_status"
                          id="Everyone"
                          value="Everyone"
                          defaultChecked={values.bill_rate_view_status === 'Everyone'}
                        />
                        <label htmlFor="everyone">Everyone</label>
                      </RadioGroup>
                      {errors.bill_rate_view_status && touched.bill_rate_view_status ? (
                        <div>{errors.bill_rate_view_status}</div>
                      ) : null}
                    </FlexBox>
                  </Formgroup>
                  <Formgroup>
                    <h5>Who can create projects and clients</h5>
                    <p className="mb-2">
                      Control how much freedom your team has when categorizing their tracked time.
                    </p>
                    <FlexBox>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="create_project_status"
                          id="Admin"
                          value="Admins"
                          defaultChecked={values.create_project_status === 'Admins'}
                        />
                        <label htmlFor="admin0">Admins</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="create_project_status"
                          id="Everyone"
                          value="Everyone"
                          defaultChecked={values.create_project_status === 'Everyone'}
                        />
                        <label htmlFor="everyone0">Everyone</label>
                      </RadioGroup>
                      {errors.create_project_status && touched.create_project_status ? (
                        <div>{errors.create_project_status}</div>
                      ) : null}
                    </FlexBox>
                  </Formgroup>
                  <Formgroup>
                    <h5>Who can create tags</h5>
                    <p className="mb-2">
                      Let people organize their time with their own tags, or limit their choice to
                      the preset list.
                    </p>
                    <FlexBox>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="create_tag_status"
                          id="Admins"
                          value="Admins"
                          defaultChecked={values.create_tag_status === 'Admins'}
                        />
                        <label htmlFor="admin1">Admins</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="create_tag_status"
                          id="Everyone"
                          value="Everyone"
                          defaultChecked={values.create_tag_status === 'Everyone'}
                        />
                        <label htmlFor="everyone1">Everyone</label>
                      </RadioGroup>
                      {errors.create_tag_status && touched.create_tag_status ? (
                        <div>{errors.create_tag_status}</div>
                      ) : null}
                    </FlexBox>
                  </Formgroup>
                  <Formgroup>
                    <h5>Who can create tasks</h5>
                    <p className="mb-2">
                      Allow everyone to create and update tasks on their projects, so time is better
                      categorized.
                    </p>
                    <FlexBox>
                      <RadioGroup>
                        <Field type="radio" name="create_task_status" id="Admins" value="Admins" />
                        <label htmlFor="admin2">Admins</label>
                      </RadioGroup>
                      <RadioGroup>
                        <Field
                          type="radio"
                          name="create_task_status"
                          id="Everyone"
                          value="Everyone"
                        />
                        <label htmlFor="everyone2">Everyone</label>
                      </RadioGroup>
                      {errors.create_task_status && touched.create_task_status ? (
                        <div>{errors.create_task_status}</div>
                      ) : null}
                    </FlexBox>
                  </Formgroup>
                  <Formgroup>
                    <h5>Project favorites</h5>
                    <p className="mb-2">
                      Let people mark their most used projects as favorite so they appear at the top
                      of their project list when tracking time.
                    </p>
                    <Switchbox>
                      <Form.Check
                        type="switch"
                        id="favorite_status"
                        name="favorite_status"
                        onChange={() => {
                          setFieldValue('favorite_status', !values.favorite_status);
                        }}
                        checked={values.favorite_status}
                      />
                      <span>Activate project favorites</span>
                    </Switchbox>
                    {errors.favorite_status && touched.favorite_status ? (
                      <div>{errors.favorite_status}</div>
                    ) : null}
                  </Formgroup>
                  <Formgroup>
                    <h5>Task filter</h5>
                    <p className="mb-2">
                      Quickly find the right task in project picker by using the task@project
                      syntax.
                    </p>
                    <Switchbox>
                      <Form.Check
                        type="switch"
                        id="task_filter"
                        name="task_filter"
                        onChange={() => {
                          setFieldValue('task_filter', !values.task_filter);
                        }}
                        checked={values.task_filter}
                      />
                      <span>Activate task filter</span>
                    </Switchbox>
                    {errors.task_filter && touched.task_filter ? (
                      <div>{errors.task_filter}</div>
                    ) : null}
                  </Formgroup>
                </Col>
                <Col md={12} className="p-0">
                  <Button theme="primary" type="submit">
                    Update
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </TabWrapper>
    </>
  );
};

export default Setting;
