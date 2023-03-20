import React, { useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../../../components/Button';
import TextError from '../../../../components/TextError';
import USER_LOGIN from '../../graphQueries';
import AppContext from '../../../../context/AppContext';
// import MainLogo from '../../../../images/logo.png';
import { FORGOTPASSWORD, SIGNUP, DASHBOARD, VERIFYWORKSPACE } from '../../../../constants/routes';

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
`;
const Signupwraper = styled.div`
  background-color: #fff;
  padding: 30px 35px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  width: 500px;
`;

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const SignIn = ({ client }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);

  const initialValues = {
    email: '',
    password: '',
  };

  const onSubmit = async (values) => {
    const variables = {
      email: values.email,
      password: values.password,
    };
    try {
      const { data, errors } = await client.query({
        query: USER_LOGIN,
        variables,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      const loginUser = data?.Login || {};

      if (loginUser && loginUser.ok && loginUser.token) {
        localStorage.setItem('auth-token', loginUser.token);
        dispatch({ type: 'USER_PROFILE', payload: loginUser.user });

        if (loginUser.user.Workspaces.length > 0) {
          history.push(`/${DASHBOARD}`);
          toast.success('Login successfully', { autoClose: 2000 });
        } else {
          history.push(`/${VERIFYWORKSPACE}`);
        }
      } else {
        toast.error('Email or Password is incorrect...', { autoClose: 2000 });
      }
    } catch ({ message }) {
      toast.error(message, { autoClose: 2000 });
    }
  };

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  return (
    <Loginbg>
      <Signupwraper>
        <Row className="align-items-center">
          <Col lg="12">
            <Formgroup center>
              <div className="mb-5">
                <img src="/logo.svg" alt="login" height="70px" />
              </div>
              <img src="/login-vector.png" alt="login" />
            </Formgroup>
            <Formik
              initialValues={initialValues}
              validationSchema={loginValidationSchema}
              onSubmit={onSubmit}
            >
              {({ values, setFieldValue, isValid, isSubmitting }) => (
                <Form>
                  <Formgroup className="p-relative ">
                    <Field
                      className="col-md-12 form-control"
                      type="text"
                      id="email"
                      name="email"
                      placeholder="Email"
                      value={values.email}
                      onChange={(event) => {
                        setFieldValue('email', event.target.value.replace(/ +/g, ' '));
                      }}
                    />
                    {values.email && <ErrorMessage name="email" component={TextError} />}
                  </Formgroup>
                  <Formgroup className="p-relative ">
                    <Field
                      className="col-md-12 form-control"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={(event) => {
                        setFieldValue('password', event.target.value.replace(/ +/g, ' '));
                      }}
                    />
                    {values.password && <ErrorMessage name="password" component={TextError} />}
                  </Formgroup>
                  <Formgroup>
                    <Button
                      type="submit"
                      theme="primary"
                      size="lg"
                      width="full"
                      disabled={!isValid || isSubmitting}
                    >
                      Login
                    </Button>
                  </Formgroup>
                </Form>
              )}
            </Formik>
            <Formgroup center>
              <Link to={`/${FORGOTPASSWORD}`} className="links">
                Forgot Password ?
              </Link>
              <div className="links">
                <Mutetext>New Here?</Mutetext>
                <Link to={`/${SIGNUP}`}>Create an Account</Link>
              </div>
            </Formgroup>
          </Col>
        </Row>
      </Signupwraper>
    </Loginbg>
  );
};

SignIn.propTypes = propTypes;
export default withApollo(SignIn);
