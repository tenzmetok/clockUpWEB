import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import jwt_decode from 'jwt-decode';
import { withApollo } from '@apollo/react-hoc';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import useConfirmPopup from '../../components/AlertBox/useConfirmPopup';
import TextError from '../../components/TextError';
import REGISTER_USER from './graphMutation';
import PasswordValidation from '../../components/PasswordValidation';

const Formgroup = styled.div`
  margin-bottom: 25px;
  text-align: ${(props) => (props.center ? 'center' : 'left')};
  padding-top: ${(props) => (props.spacetop ? '15px' : '0px')};
`;
const Mutetext = styled.span`
  color: #555;
  margin-right: 5px;
`;
const Loginbg = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-image: url(/login_bg-2.jpg);
  overflow: auto;
`;
const Signupwraper = styled.div`
  background-color: #fff;
  padding: 30px 35px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  width: 800px;
`;
const Passvalidation = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
`;

const regxUpperCase = /^.*((?=.*[A-Z]){1}).*$/;
const regxLowerCase = /^.*((?=.*[a-z]){1}).*$/;
const regxMinCharacter = /^.*(?=.{8,}).*$/;
const regxNumberic = /^.*[0-9].*$/;

const validationSchema = Yup.object({
  firstname: Yup.string()
    .min(2, 'Too short')
    .max(50, 'Too long')
    .matches(/^[a-zA-Z]*$/, 'Please enter valid first name')
    .required('Required'),
  lastname: Yup.string()
    .min(2, 'Too short')
    .max(50, 'Too long')
    .matches(/^[a-zA-Z]*$/, 'Please enter valid last name')
    .required('*Required!'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .matches(regxUpperCase, 'Please enter minimum 1 uppercase character')
    .matches(regxLowerCase, 'Please enter minimum 1 lowercase character')
    .matches(regxMinCharacter, 'Please enter 8 character')
    .matches(regxNumberic, 'Please enter numberic character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Does not match with password')
    .required('Password confirmation is required'),
});

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const SignUp = ({ client }) => {
  const params = useParams();
  const { isConfirmPopup } = useConfirmPopup();
  const [errorMessageShow, setErrorMessageShow] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isLowerCase, setIsLowerCase] = useState(false);
  const [isCharacter, setIsCharacter] = useState(false);
  const [isNumberic, setNumberic] = useState(false);

  const acceptInvitationToken = params?.token || '';
  const decoded = params.token ? jwt_decode(params.token) : {};
  const initialValues = {
    firstname: '',
    lastname: '',
    email: decoded?.email || '',
    password: '',
    confirmPassword: '',
  };
  function onChangeField(value) {
    setIsUpperCase(regxUpperCase.test(value));
    setIsLowerCase(regxLowerCase.test(value));
    setIsCharacter(regxMinCharacter.test(value));
    setNumberic(regxNumberic.test(value));
  }
  const onSubmitData = async (values, { resetForm }) => {
    setErrorMessageShow(true);
    const variables = {
      input: {
        first_name: values.firstname,
        last_name: values.lastname,
        email: values.email,
        password: values.confirmPassword,
        token: acceptInvitationToken,
      },
    };

    try {
      const {
        data: {
          registerUser: { isUserRegistered },
        },
      } = await client.mutate({
        mutation: REGISTER_USER,
        variables,
      });
      if (isUserRegistered) {
        toast.success('User registered successfully', { autoClose: 2000 });
        await isConfirmPopup({
          title: 'Please verify your account through email',
          message: `A verification link has been sent to your email account`,
          theme: `primary`,
          isCancelDisabled: true,
        });
        setErrorMessageShow(false);
      } else {
        toast.error('User already exists', { autoClose: 2000 });
      }
    } catch (error) {
      console.log(error);
      toast.error('Server not started or internal server error', { autoClose: 2000 });
      resetForm();
    }
  };

  if (decoded.exp !== undefined && Date.now() >= decoded.exp * 1000) {
    return (
      <>
        <Loginbg>
          <Signupwraper>
            <h1>Your inivitation link has expired</h1>
            <p>Please contact to the person you are invited by...</p>
          </Signupwraper>
        </Loginbg>
      </>
    );
  }

  return (
    <Loginbg>
      <Signupwraper>
        <Row className="align-items-center">
          <Col lg="5">
            <Formgroup center>
              <div className="mb-5">
                <img src="/logo.svg" alt="login" height="80px" />
              </div>
              <img src="/welcome.png" alt="welcome" />
            </Formgroup>
          </Col>
          <Col lg="7">
            <Formgroup center>
              <h2>Let&lsquo;s Get Started !</h2>
              <p>Create an account to ClockUp to get all features</p>
            </Formgroup>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnChange={errorMessageShow}
              validateOnBlur={errorMessageShow}
              onSubmit={onSubmitData}
            >
              {({ values, setFieldValue, isSubmitting, errors }) => (
                <Form>
                  {Object.keys(errors).length > 0 && setErrorMessageShow(true)}
                  <Row>
                    <Col md={6}>
                      <Formgroup>
                        <Field
                          className="col-md-12 form-control"
                          type="text"
                          id="firstname"
                          name="firstname"
                          placeholder="Firstname"
                          value={values.firstname}
                          onChange={(event) => {
                            setFieldValue('firstname', event.target.value.replace(/ +/g, ' '));
                          }}
                        />

                        <ErrorMessage name="firstname" component={TextError} />
                      </Formgroup>
                    </Col>
                    <Col md={6}>
                      <Formgroup>
                        <Field
                          className="col-md-12 form-control"
                          type="text"
                          id="lastname"
                          name="lastname"
                          placeholder="Lastname"
                          value={values.lastname}
                          onChange={(event) => {
                            setFieldValue('lastname', event.target.value.replace(/ +/g, ' '));
                          }}
                        />
                        <ErrorMessage name="lastname" component={TextError} />
                      </Formgroup>
                    </Col>
                  </Row>

                  <Formgroup>
                    {acceptInvitationToken ? (
                      <Field
                        className="col-md-12 form-control "
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={values.email}
                        readOnly
                      />
                    ) : (
                      <Field
                        className="col-md-12 form-control "
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={values.email}
                        onChange={(event) => {
                          setFieldValue('email', event.target.value.replace(/ +/g, ' '));
                        }}
                      />
                    )}
                    <ErrorMessage name="email" component={TextError} />
                  </Formgroup>
                  <Row>
                    <Col md={6}>
                      <Formgroup>
                        <Field
                          className="col-md-12 form-control "
                          type="password"
                          id="password"
                          name="password"
                          placeholder="Password"
                          values={values.password}
                          onChange={(event) => {
                            onChangeField(event.target.value);
                            setFieldValue('password', event.target.value.replace(/ +/g, ' '));
                          }}
                        />
                        <ErrorMessage name="password" component={TextError} />
                      </Formgroup>
                    </Col>
                    <Col md={6}>
                      <Formgroup>
                        <Field
                          className="col-md-12 form-control "
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          values={values.password}
                          onChange={(event) => {
                            setFieldValue(
                              'confirmPassword',
                              event.target.value.replace(/ +/g, ' '),
                            );
                          }}
                        />
                        <ErrorMessage name="confirmPassword" component={TextError} />
                      </Formgroup>
                    </Col>
                  </Row>
                  <Formgroup>
                    <Passvalidation>
                      <PasswordValidation
                        isValidate={isUpperCase}
                        discription="Min. 1 UpperCase Character"
                        alt=""
                      />
                      <PasswordValidation
                        isValidate={isLowerCase}
                        discription="Min. 1 LowerCase Character"
                        alt=""
                      />
                      <PasswordValidation
                        isValidate={isNumberic}
                        discription="Min. 1 Number Character"
                        alt=""
                      />
                      <PasswordValidation
                        isValidate={isCharacter}
                        discription="Min. 8 Character"
                        alt=""
                      />
                    </Passvalidation>
                  </Formgroup>

                  <Formgroup>
                    <Button
                      theme="primary"
                      size="lg"
                      width="full"
                      type="submit"
                      // disabled={!isValid}
                      isLoading={isSubmitting}
                    >
                      {acceptInvitationToken
                        ? `Create Account & Accept Invitation`
                        : `Create Account`}
                    </Button>
                  </Formgroup>
                  <Formgroup center>
                    <div className="links">
                      <Mutetext>Already have account?</Mutetext>
                      <Link to="/">Login</Link>
                    </div>
                  </Formgroup>
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Signupwraper>
    </Loginbg>
  );
};
SignUp.propTypes = propTypes;

export default withApollo(SignUp);
