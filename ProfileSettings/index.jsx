import React, { useState, useContext } from 'react';
import { Row, Col, Card, Tab, Modal } from 'react-bootstrap';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import { Formik, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import Header from '../../components/Header';
import TextError from '../../components/TextError';
import AppContext from '../../context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GET_USER_PIC_SIGNED_URL, UPDATE_USER } from './graphMutatations';
import { MAX_FILE_SIZE, SUPPORTED_IMAGE_FORMATS } from '../../utils/commonConstants';
import bytesToSize from '../../utils/bytesToSize';
import UserDefaultLogo from '../../images/user.png';

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
const TabWrapper = styled.div`
  width: 100%;
  padding: 15px 15px;
  p {
    font-size: 14px;
  }
`;
const Formgroup = styled.div`
  margin-bottom: 35px;
`;
const UserLogo = styled.div`
  display: flex;
  align-items: center;
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

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const ProfileSettings = ({ client }) => {
  const [showPasswordModel, setShowPasswordModel] = useState(false);
  const handleClosePasswordModel = () => setShowPasswordModel(false);
  const handleShowPasswordModel = () => setShowPasswordModel(true);
  const { authUser, dispatch } = useContext(AppContext);

  const initialValues = {
    first_name: `${authUser.first_name}`,
    last_name: `${authUser.last_name}`,
    email: `${authUser.email}`,
    userLogo: authUser.user_logo,
  };
  const passwordModalInitialValues = {
    oldPassword: '',
    password: '',
    retypedPassword: '',
  };

  const handleChangeProfilePic = async (event, setFieldValue) => {
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

    try {
      const { data } = await client.mutate({
        mutation: GET_USER_PIC_SIGNED_URL,
        variables: {
          input: {
            fileName: `user-logos/${selectedProfileImage?.name?.toLowerCase()}`,
            fileType: selectedProfileImage.type,
          },
        },
      });

      const { signedRequest, url } = data.getUserPicUploadLink;

      const options = {
        headers: {
          'Content-Type': selectedProfileImage.type,
        },
      };
      axios
        .put(signedRequest, selectedProfileImage, options)
        .then((result) => {
          setFieldValue('userLogo', url);
          console.log('Response from s3', result);
        })
        .catch((error) => {
          toast.error(error, { autoClose: 2000 });
        });
    } catch (error) {
      toast.error(error.Message, { autoClose: 2000 });
    }
  };

  const handleUpdateChanges = async (values, type) => {
    const params = {
      id: authUser.id,
    };
    if (type === 'profile') {
      params.user_logo = values.userLogo;
      params.first_name = values.first_name;
      params.last_name = values.last_name;
      try {
        const {
          data: {
            updateUser: { isUserUpdated },
          },
        } = await client.mutate({
          mutation: UPDATE_USER,
          variables: {
            input: params,
          },
        });
        if (isUserUpdated) {
          toast.success('User profile updated successfully');
          dispatch({
            type: 'USER_PROFILE',
            payload: {
              ...authUser,
              first_name: values.first_name,
              last_name: values.last_name,
              user_logo: values.userLogo,
            },
          });
        }
      } catch (error) {
        const errorMessage = error.message;
        toast.error(errorMessage);
      }
    }

    if (type === 'password') {
      params.oldPassword = values.oldPassword;
      params.password = values.retypedPassword;
      try {
        const {
          data: {
            updateUser: { isUserUpdated },
          },
        } = await client.mutate({
          mutation: UPDATE_USER,
          variables: {
            input: params,
          },
        });
        if (isUserUpdated) {
          toast.success('Password updated successfully', { autoClose: 2000 });
          handleClosePasswordModel();
        } else {
          toast.error('Incorrect old password', { autoClose: 2000 });
        }
      } catch (error) {
        const errorMessage = error.message;
        toast.error(errorMessage);
      }
    }
  };

  const regxUpperCase = /^.*((?=.*[A-Z]){1}).*$/;
  const regxLowerCase = /^.*((?=.*[a-z]){1}).*$/;
  const regxMinCharacter = /^.*(?=.{8,}).*$/;
  const regxNumeric = /^.*[0-9].*$/;

  const passwordModelValidationSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Required'),
    password: Yup.string()
      .matches(regxUpperCase, 'Please enter minimum 1 uppercase character')
      .matches(regxLowerCase, 'Please enter minimum 1 lowercase character')
      .matches(regxMinCharacter, 'Please enter minimum 8 character')
      .matches(regxNumeric, 'Please enter minimum 1 numeric character')
      .required('Password is required'),
    retypedPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Does not match with password')
      .required('Required'),
  });

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .matches(/^[a-zA-Z]*$/, 'Please enter valid first name')
      .required('Required'),
    last_name: Yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .matches(/^[a-zA-Z]*$/, 'Please enter valid last name')
      .required('Required'),
  });

  return (
    <MainWrapper>
      <Header />
      <Pagewrapper className="pagewprage">
        <Row className="m-0">
          <Col md="12 mt-4">
            <Row className="align-items-center">
              <Col md="6">
                <h4>Profile settings</h4>
              </Col>
            </Row>
          </Col>
          <Col md="12">
            <Card className="mt-3">
              <Card.Body className="p-0 projectabs">
                <Tab.Container id="left-tabs-example" defaultActiveKey="settings">
                  <TabWrapper>
                    <Formik
                      enableReinitialize
                      initialValues={initialValues}
                      onSubmit={(values) => handleUpdateChanges(values, 'profile')}
                      validationSchema={validationSchema}
                    >
                      {({ values, handleSubmit, setFieldValue }) => (
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6} className="pl-4">
                              <h5>Profile photo</h5>
                              <p>Formats: png, jpg, jpeg Max size: 5 MB.</p>
                              <UserLogo>
                                <UploadedImg>
                                  <img
                                    src={values.userLogo || UserDefaultLogo}
                                    alt="Teampronity User Profile setting logo"
                                  />
                                </UploadedImg>
                                <label className="btn btn-primary ml-3" htmlFor="uploadButton">
                                  <Field
                                    id="uploadButton"
                                    name="user_logo_file"
                                    className="d-none"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                      handleChangeProfilePic(event, setFieldValue);
                                    }}
                                  />
                                  <span>{values.userLogo ? 'Change Image' : 'Upload Image'}</span>
                                </label>
                                {values?.userLogo && (
                                  <label className=" ml-3" htmlFor="removeButton">
                                    <Button
                                      className="d-none"
                                      theme="secondary"
                                      name="company_logo_remove"
                                      type="button"
                                      onClick={() => {
                                        setFieldValue('userLogo', '');
                                      }}
                                    >
                                      Remove Image
                                    </Button>
                                  </label>
                                )}
                              </UserLogo>

                              <hr style={{ width: '200%' }} />

                              <Formgroup>
                                <h5 className="mt-4">Personal info</h5>
                                <p>
                                  Your log-in credentials and the name that is displayed in reports.
                                </p>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '1rem',
                                  }}
                                >
                                  <Form.Group
                                    className="p-relative mb-3 w-50"
                                    controlId="formBasicEmail"
                                  >
                                    <Form.Label>First Name</Form.Label>
                                    <Field
                                      className="form-control"
                                      type="text"
                                      name="first_name"
                                      placeholder="Enter first name"
                                      value={values.first_name}
                                      onChange={(event) => {
                                        setFieldValue(
                                          'first_name',
                                          event.target.value.replace(/ +/g, ' '),
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="first_name" component={TextError} />
                                  </Form.Group>
                                  <Form.Group
                                    className="p-relative mb-3 w-50"
                                    controlId="formBasicEmail"
                                  >
                                    <Form.Label>Last Name</Form.Label>
                                    <Field
                                      className="form-control"
                                      type="text"
                                      name="last_name"
                                      placeholder="Enter last name"
                                      value={values.last_name}
                                      onChange={(event) => {
                                        setFieldValue(
                                          'last_name',
                                          event.target.value.replace(/ +/g, ' '),
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="last_name" component={TextError} />
                                  </Form.Group>
                                  <Form.Group
                                    className="mb-3 w-50 h-20 mt-4 "
                                    style={{
                                      position: 'relative',
                                    }}
                                    controlId="formBasicEmail"
                                  >
                                    <Button
                                      className="mb-3 mt-4"
                                      theme="secondary"
                                      onClick={handleShowPasswordModel}
                                    >
                                      Set Password
                                    </Button>
                                  </Form.Group>
                                </div>
                              </Formgroup>
                            </Col>
                            <Col md={12} className="pl-4">
                              <Button theme="primary" type="submit">
                                Save Changes
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      )}
                    </Formik>

                    <Modal show={showPasswordModel} onHide={handleClosePasswordModel} centered>
                      <Formik
                        initialValues={passwordModalInitialValues}
                        enableReinitialize
                        validationSchema={passwordModelValidationSchema}
                        onSubmit={(values) => handleUpdateChanges(values, 'password')}
                      >
                        {({ values, setFieldValue, handleSubmit }) => (
                          <Form onSubmit={handleSubmit}>
                            <Modal.Header closeButton>
                              <Modal.Title>Set password</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Form.Group className="p-relative mb-3 " controlId="formBasicEmail">
                                <Form.Label className="form-control-spacing">
                                  Old Password
                                </Form.Label>
                                <Field
                                  className="form-control"
                                  name="oldPassword"
                                  placeholder="Old password"
                                  type="password"
                                  value={values.oldPassword}
                                  onChange={(event) => {
                                    setFieldValue(
                                      'oldPassword',
                                      event.target.value.replace(/ +/g, ' '),
                                    );
                                  }}
                                />
                                <ErrorMessage name="oldPassword" component={TextError} />
                              </Form.Group>
                              <Form.Group className="p-relative mb-3 " controlId="formBasicEmail">
                                <Form.Label className="form-control-spacing">
                                  New Password
                                </Form.Label>
                                <Field
                                  className="form-control"
                                  name="password"
                                  type="password"
                                  placeholder="New password"
                                  value={values.password}
                                  onChange={(event) => {
                                    setFieldValue(
                                      'password',
                                      event.target.value.replace(/ +/g, ' '),
                                    );
                                  }}
                                />
                                <ErrorMessage name="password" component={TextError} />
                              </Form.Group>
                              <Form.Group className="p-relative mb-3" controlId="formBasicEmail">
                                <Form.Label className="form-control-spacing">
                                  Confirm password
                                </Form.Label>
                                <Field
                                  className="form-control"
                                  name="retypedPassword"
                                  placeholder="Confirm password"
                                  type="password"
                                  value={values.retypedPassword}
                                  onChange={(event) => {
                                    setFieldValue(
                                      'retypedPassword',
                                      event.target.value.replace(/ +/g, ' '),
                                    );
                                  }}
                                />
                                <ErrorMessage name="retypedPassword" component={TextError} />
                              </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                              <Button onClick={handleClosePasswordModel}>Cancel</Button>
                              <Button theme="primary" size="lg" width="fix" type="submit">
                                Save
                              </Button>
                            </Modal.Footer>
                          </Form>
                        )}
                      </Formik>
                    </Modal>
                  </TabWrapper>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Pagewrapper>
    </MainWrapper>
  );
};

ProfileSettings.propTypes = propTypes;
export default withApollo(ProfileSettings);
