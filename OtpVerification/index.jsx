import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withApollo } from '@apollo/react-hoc';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import VERIFY_OTP from './graphQueries';
import Button from '../../components/Button';
import TextError from '../../components/TextError';
import otpimg from '../../images/otp-verification.png';

const Formgroup = styled.div`
  margin-bottom: 20px;
  text-align: ${(props) => (props.center ? 'center' : 'left')};
  padding-top: ${(props) => (props.spacetop ? '15px' : '0px')};
  img {
    height: 120px;
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

const OtpVerification = ({ client }) => {
  const { token } = useParams();
  const history = useHistory();

  const initialValues = {
    number: '',
  };

  const validationSchema = Yup.object({
    number: Yup.string().required('OTP is required'),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      const emailToken = token.substring(1);
      const otp = parseInt(values.number, 10);
      const variables = {
        otp,
        emailToken,
      };

      const {
        data: {
          otpVerification: { isVerified },
        },
      } = await client?.query({
        query: VERIFY_OTP,
        variables,
      });
      if (isVerified === true) {
        toast.success('OTP verified.', { autoClose: 2000 });
        history.push(`/reset-password:${emailToken}`);
      } else {
        toast.error('Wrong OTP', { autoClose: 2000 });
      }
    } catch (error) {
      toast.error('Something went wrong', { autoClose: 2000 });
      resetForm();
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      <Form>
        <Loginbg>
          <Signupwraper>
            <Row className="align-items-center">
              <Col lg="12">
                <Formgroup center>
                  <h2 className="logotext mb-4">Teampronity</h2>
                  <img src={otpimg} alt="Forogotpass" />
                  <h4 className="mt-4">OTP Verification</h4>
                  <p>Enter your OTP which we sent you on your Email Address</p>
                </Formgroup>
                <Formgroup className="p-relative">
                  <Field
                    className="col-md-12 form-control"
                    type="text"
                    id="number"
                    name="number"
                    placeholder="Enter Your OTP"
                  />
                  <ErrorMessage name="number" component={TextError} />
                </Formgroup>
                <Formgroup>
                  <Button theme="primary" size="lg" width="full" type="submit">
                    Verify & Proceed
                  </Button>
                </Formgroup>
                <Formgroup>
                  <Link to="/forgotpassword" className="btn btn-default btn-block">
                    Cancel
                  </Link>
                </Formgroup>
              </Col>
            </Row>
          </Signupwraper>
        </Loginbg>
      </Form>
    </Formik>
  );
};

OtpVerification.propTypes = propTypes;

export default withApollo(OtpVerification);
