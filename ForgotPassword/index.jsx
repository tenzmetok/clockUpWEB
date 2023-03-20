import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import TextError from '../SignUp/TextError';
import useConfirmPopup from '../../components/AlertBox/useConfirmPopup';
import CHECK_EMAIL_SEND_EMAIL from './graphQueries';
import { SIGNUP } from '../../constants/routes';
import success from '../../images/success.svg';

const Formgroup = styled.div`
  margin-bottom: 20px;
  text-align: ${(props) => (props.center ? 'center' : 'left')};
  padding-top: ${(props) => (props.spacetop ? '15px' : '0px')};
  img {
    height: 70px;
    width: auto;
  }
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

const ForgotPassword = ({ client }) => {
  const history = useHistory();
  const { isConfirmPopup } = useConfirmPopup();

  const initialValues = {
    email: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
  });

  const onSubmit = async (values, { resetForm }) => {
    const variables = {
      email: values.email,
    };

    try {
      const data = await client.query({
        query: CHECK_EMAIL_SEND_EMAIL,
        variables,
      });
      if (data?.data?.EmailExist?.isEmailexist) {
        toast.success(
          'We have sent a reset password verification link to your email, Kindly check it.',
          { autoClose: 2000 },
        );
        await isConfirmPopup({
          title: <img src={success} alt="login" height="70px" />,
          message: `We have sent a reset password verification link to your email, Kindly check it.`,
          theme: `primary`,
          isCancelDisabled: true,
          setPosition: true,
        });
      } else {
        history.push(`/${SIGNUP}`);
        toast.error(
          'Sorry, Email that you have entered is not associated with any user account of ClockUp.',
          { autoClose: 2000 },
        );
      }
      resetForm();
    } catch (error) {
      toast.error('Something went Wrong!', { autoClose: 2000 });
    }
  };

  return (
    <Loginbg>
      <Signupwraper>
        <Row className="align-items-center">
          <Col lg="12">
            <Formgroup center>
              <div className="mb-5">
                <img src="/logo.svg" alt="login" height="70px" />
              </div>
              <img src="/forgot-pass.png" alt="forgot password" />
              <h4 className="mt-4">Forgot your password ?</h4>
              <p>Enter your e-mail, We will send you a reset password link.</p>
            </Formgroup>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Formgroup className="p-relative">
                    <Field
                      className="col-md-12 form-control"
                      type="text"
                      id="email"
                      name="email"
                      placeholder="Email"
                    />
                    <ErrorMessage name="email" component={TextError} />
                  </Formgroup>
                  <Formgroup>
                    <Button
                      theme="primary"
                      size="lg"
                      width="full"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Send me a link
                    </Button>
                  </Formgroup>
                  <Formgroup>
                    <Link
                      to="/"
                      className="btn btn-default btn-block"
                      style={isSubmitting ? { pointerEvents: 'none', color: 'grey' } : null}
                    >
                      Cancel
                    </Link>
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
ForgotPassword.propTypes = propTypes;

export default withApollo(ForgotPassword);
