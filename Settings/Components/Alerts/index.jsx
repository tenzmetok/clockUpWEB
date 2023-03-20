import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FiTrash } from 'react-icons/fi';
import Select from 'react-select';
import { withApollo } from '@apollo/react-hoc';
import { toast } from 'react-toastify';
import { Formik, Form, ErrorMessage } from 'formik';
import PropTypes from 'prop-types';
import SortDown from '../../../../images/sort-alpha-down.svg';
import SortUp from '../../../../images/sort-alpha-up-alt.svg';
import useConfirmPopup from '../../../../components/AlertBox/useConfirmPopup';
import { ADD_ALERT, REMOVE_ALERT, UPDATE_ALERT } from '../../graphMutation';
import { GET_ALL_ALERTS } from '../../graphQueries';
import AppContext from '../../../../context/AppContext';
import s from './Alert.module.scss';
import teampronity from '../../../../images/teampronity-icon.svg';
import * as S from './Alerts-styled';

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const Alerts = ({ client }) => {
  const { authUser } = useContext(AppContext);
  const [isDisabled, setIsDisabled] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [alertList, setAlertList] = useState([]);
  const { isConfirmPopup } = useConfirmPopup();
  const [filterValue, setFilterValue] = useState({
    query: '',
    sortKey: 'id',
    sortValue: false,
  });

  const fetchAlertList = async () => {
    const alertQueryVariables = {
      workspace_id: authUser.current_workspace,
      limit: 10,
      offset: 0,
    };

    const sortBy = [{ id: filterValue.sortKey, desc: filterValue.sortValue }];
    if (sortBy && sortBy.length) {
      const sortObject = sortBy[0];
      alertQueryVariables.sortKey = sortObject.id;
      alertQueryVariables.sortValue = sortObject.desc ? 'DESC' : 'ASC';
    }
    try {
      const { data } = await client.query({
        query: GET_ALL_ALERTS,
        variables: alertQueryVariables,
      });

      const getAllAlerts = (data && data.getAllAlerts && data.getAllAlerts.getAllAlerts) || [];

      setAlertList(getAllAlerts);
    } catch (error) {
      console.log(error);
    }
    setShowLoader(false);
  };
  const options1 = [
    { value: 'Project', label: 'Project' },
    { value: 'Task', label: 'Task' },
  ];
  const option2 = [
    { value: '50%', label: '50%' },
    { value: '75%', label: '75%' },
    { value: '100%', label: '100%' },
  ];
  const options3 = [
    { value: 'Workspace admin', label: 'Workspace admin' },
    { value: 'Project manager', label: 'Project manager' },
    { value: 'Project members', label: 'Project members' },
  ];

  useEffect(() => {
    fetchAlertList();
  }, [filterValue, authUser]);

  const initialValuesOnAdd = {
    alert_name: 'Project',
    name: 'Workspace admin',
    details: '50%',
  };
  const initialValuesOnUpdate = {
    alert_name: '',
    name: '',
    details: '',
  };
  const handleFocus = () => {
    setIsDisabled(false);
  };
  const addAlertHandler = async (values, { resetForm }) => {
    try {
      const {
        data: {
          addAlert: { isAlertAdded },
        },
      } = await client.mutate({
        mutation: ADD_ALERT,
        variables: {
          input: {
            alert_name: values.alert_name,
            name: values.name,
            details: values.details,
            workspace_id: authUser.current_workspace,
          },
        },
      });
      if (isAlertAdded) {
        setFilterValue({
          ...filterValue,
          sortKey: 'id',
          sortValue: true,
        });
        toast.success('Alert has been created', { autoClose: 2000 });
        fetchAlertList();
        setIsDisabled(true);
        resetForm();
      } else {
        toast.error('Alert already exists', { autoClose: 2000 });
        fetchAlertList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateAlertDetails = async (id, values, item) => {
    try {
      if (values === item.details || values === '') {
        toast.error('No changes made', { autoClose: 2000 });
        return;
      }
      const {
        data: {
          updateAlert: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_ALERT,
        variables: {
          input: {
            id: parseInt(id, 10),
            alert_name: item.alert_name,
            name: item.name,
            details: values,
            workspace_id: authUser.current_workspace,
          },
        },
      });

      if (isUpdated) {
        toast.success('Alert has been updated', { autoClose: 2000 });
      } else {
        toast.error('Alert already exists', { autoClose: 2000 });
      }
      fetchAlertList();
    } catch (error) {
      toast.error(error.message, { autoClose: 2000 });
      console.log(error);
    }
  };

  const updateAlertName = async (id, values, item) => {
    try {
      if (values === item.name || values.name === '') {
        toast.error('No changes made', { autoClose: 2000 });
        return;
      }
      const {
        data: {
          updateAlert: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_ALERT,
        variables: {
          input: {
            id: parseInt(id, 10),
            alert_name: item.alert_name,
            name: values,
            details: item.details,
            workspace_id: authUser.current_workspace,
          },
        },
      });

      if (isUpdated) {
        toast.success('Alert edited successfully', { autoClose: 2000 });
      } else {
        toast.error('Alert already exists', { autoClose: 2000 });
      }
      fetchAlertList();
    } catch (error) {
      toast.error(error.message, { autoClose: 2000 });
      console.log(error);
    }
  };

  const updateAlertOption = async (id, values, item) => {
    try {
      if (values === item.alert_name || values.alert_name === '') {
        toast.error('No changes made', { autoClose: 2000 });
        return;
      }
      if (values.alert_name === ' ') {
        toast.error('Alert already exists', { autoClose: 2000 });
      }
      const {
        data: {
          updateAlert: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_ALERT,
        variables: {
          input: {
            id: parseInt(id, 10),
            alert_name: values,
            name: item.name,
            details: item.details,
            workspace_id: authUser.current_workspace,
          },
        },
      });

      if (isUpdated) {
        toast.success('Alert edited successfully', { autoClose: 2000 });
      } else {
        toast.error('Alert already exists', { autoClose: 2000 });
      }
      fetchAlertList();
    } catch (error) {
      toast.error(error.message, { autoClose: 2000 });
      console.log(error);
    }
  };

  const deleteAlertHandler = async (id) => {
    const confirmed = await isConfirmPopup({
      title: 'Delete Alert',
      message: `Are you sure you want to delete this Alert ?`,
    });
    if (confirmed) {
      try {
        const {
          data: {
            removeAlert: { isRemoved },
          },
        } = await client.mutate({
          mutation: REMOVE_ALERT,
          variables: { id: parseInt(id, 10) },
        });
        if (isRemoved) toast.success('Alert successfully deleted', { autoClose: 2000 });
        fetchAlertList();
      } catch (error) {
        toast.error('Something went wrong', { autoClose: 2000 });
      }
    }
  };
  return (
    <S.TabWrapper>
      <Row className="align-items-center">
        <Col md={4} className="pl-0" />
        <Col md={10} className="d-flex ml-auto pr-0">
          <Formik enableReinitialize initialValues={initialValuesOnAdd} onSubmit={addAlertHandler}>
            {({ values, setFieldValue }) => (
              <Col md={10} className="ml-auto pr-0">
                <Form>
                  <S.Formgroup>
                    <S.FlexBox>
                      If
                      <Col className={s.column}>
                        <Select
                          className={s.selectDropdown}
                          id="alert_name"
                          name="alert_name"
                          placeholder={values.alert_name}
                          onFocus={handleFocus}
                          value={values.alert_name}
                          onChange={(event) => {
                            setFieldValue('alert_name', event.value);
                          }}
                          options={options1}
                        />
                      </Col>
                      reaches
                      <Col className={s.column}>
                        <Select
                          className={s.selectDropdown}
                          id="details"
                          name="details"
                          placeholder={values.details}
                          onFocus={handleFocus}
                          value={values.details}
                          onChange={(event) => {
                            setFieldValue('details', event.value);
                          }}
                          options={option2}
                        />
                      </Col>
                      of estimate, alert
                      <Col className={s.column}>
                        <Select
                          className={s.selectDropdown}
                          id="name"
                          name="name"
                          onFocus={handleFocus}
                          placeholder={values.name}
                          value={values.name}
                          onChange={(event) => {
                            setFieldValue('name', event.value);
                          }}
                          options={options3}
                        />
                        <ErrorMessage name="name" />
                      </Col>
                      <Col className="cunm_btn">
                        <Button
                          theme="primary"
                          size="sm"
                          width="fix"
                          type="submit"
                          disabled={isDisabled}
                        >
                          Add
                        </Button>
                      </Col>
                    </S.FlexBox>
                  </S.Formgroup>
                </Form>
              </Col>
            )}
          </Formik>
        </Col>
      </Row>
      <Row>
        <Col md={12} className="p-0">
          <table className="table mb-0">
            <thead className="bg-primary">
              <tr>
                <th>
                  Alert
                  <img
                    src={filterValue.sortValue ? SortUp : SortDown}
                    alt="Sort Label List by alphabetical order"
                    height="20px"
                    width="20px"
                    onMouseUpCapture={() => {
                      setFilterValue({
                        ...filterValue,
                        sortValue: !filterValue.sortValue,
                        sortKey: 'id',
                      });
                    }}
                  />
                </th>
                <th>&nbsp;</th>
                <th>&nbsp;</th>
              </tr>
            </thead>

            <tbody>
              {showLoader && (
                <S.Logo>
                  <img src={teampronity} alt="teampronity" />
                </S.Logo>
              )}
              {alertList?.length > 0 &&
                alertList.map((alertItem) => (
                  <tr key={`${alertItem.id}`}>
                    <Formik enableReinitialize initialValues={initialValuesOnUpdate}>
                      {({ values, setFieldValue }) => (
                        <td className={s.tableData}>
                          <Row className={s.details} style={{ paddingLeft: '10px' }}>
                            If
                            <Col className={s.column}>
                              <Select
                                type="submit"
                                className={s.selectDropdownTd}
                                id="alert_name"
                                name="alert_name"
                                placeholder={alertItem.alert_name}
                                value={values.alert_name}
                                onFocus={handleFocus}
                                onChange={(event) => {
                                  setFieldValue('alert_name', event.value);
                                  updateAlertOption(alertItem.id, event.value, alertItem);
                                }}
                                options={options1}
                              />
                            </Col>
                            reaches
                            <Col className={s.column}>
                              <Select
                                type="submit"
                                className={s.selectDropdownTd}
                                id="details"
                                name="details"
                                placeholder={alertItem.details}
                                value={alertItem.details}
                                onFocus={handleFocus}
                                onChange={(event) => {
                                  setFieldValue('details', event.value);
                                  updateAlertDetails(alertItem.id, event.value, alertItem);
                                }}
                                options={option2}
                              />
                            </Col>
                            of estimate, alert
                            <Col className={s.column}>
                              <Select
                                type="submit"
                                className={s.selectDropdownTd}
                                id="name"
                                name="name"
                                value={alertItem.name}
                                placeholder={alertItem.name}
                                onFocus={handleFocus}
                                onChange={(event) => {
                                  setFieldValue('name', event.value);
                                  updateAlertName(alertItem.id, event.value, alertItem);
                                }}
                                options={options3}
                              />
                            </Col>
                          </Row>
                        </td>
                      )}
                    </Formik>
                    <td />
                    <td className="action_td">
                      <FiTrash
                        className="text-danger"
                        onClick={() => {
                          deleteAlertHandler(alertItem.id, alertItem);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              {!showLoader && alertList?.length === 0 && (
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
    </S.TabWrapper>
  );
};
Alerts.propTypes = propTypes;
export default withApollo(Alerts);
