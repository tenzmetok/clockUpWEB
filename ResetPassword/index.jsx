import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Link, useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import UPDATE_PASSWORD from './graphMutation';
import Button from '../../components/Button';
import TextError from '../../components/TextError';

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
const Passvalidation = styled.ul`
  list-style: none;
  display: flex;
  padding: 0;
  margin: 0;
`;
const List = styled.li`
  flex: 0 0 0 auto;
  background-color: #d3eee9;
  padding: 5px 6px;
  margin-right: 13px;
  font-size: 13px;
`;
const List1 = styled.li`
  flex: 0 0 0 auto;
  background-color: #40b4a2;
  padding: 5px 6px;
  margin-right: 13px;
  font-size: 13px;
  color: #ffffff;
`;
const regxUpperCase = /^.*((?=.*[A-Z]){1}).*$/;
const regxLowerCase = /^.*((?=.*[a-z]){1}).*$/;
// const regxSpecial = /^.*((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1}).*/;
const regxMinCharacter = /^.*(?=.{8,}).*$/;
const regxNumberic = /^.*[0-9].*$/;

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const ResetPassword = ({ client }) => {
  const history = useHistory();
  const { token } = useParams();
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isLowerCase, setIsLowerCase] = useState(false);
  // const [isSpecialCase, setIsSpecialCase] = useState(false);
  const [isCharacter, setIsCharacter] = useState(false);
  const [isNumberic, setNumberic] = useState(false);

  const initialValues = {
    password: '',
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .matches(regxUpperCase, 'Please enter minimum 1 uppercase character')
      .matches(regxLowerCase, 'Please enter minimum 1 lowercase character')
      // .matches(regxSpecial, 'Please Enter Special Character')
      .matches(regxMinCharacter, 'Please enter minimum 8 character')
      .matches(regxNumberic, 'Please enter numberic character')
      .required('Password is required'),
  });
  const onSubmit = async (values) => {
    const emailToken = token.substring(1);
    const params = {
      input: {
        email: emailToken,
        password: values.password,
      },
    };

    try {
      const {
        data: {
          updatePassword: { updatePasswordDetails },
        },
      } = await client.mutate({
        mutation: UPDATE_PASSWORD,
        variables: params,
      });
      if (updatePasswordDetails === true) {
        history.push('/');
        toast.success('Password updated successfully.', { autoClose: 2000 });
      } else {
        toast.error('Your OTP is already used, Please generate new one', { autoClose: 2000 });
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong', { autoClose: 2000 });
    }
  };

  function onChangeField(value) {
    setIsUpperCase(regxUpperCase.test(value));
    setIsLowerCase(regxLowerCase.test(value));
    // setIsSpecialCase(regxSpecial.test(value));
    setIsCharacter(regxMinCharacter.test(value));
    setNumberic(regxNumberic.test(value));
  }

  return (
    <Loginbg>
      <Signupwraper>
        <Row className="align-items-center">
          <Col lg="12">
            <Formgroup center>
              <div className="mb-5">
                <img src="/logo.svg" alt="login" height="80px" />
              </div>
              <img src="/forgot-pass.png" alt="forgot password" />
              <h4 className="mt-4">Reset Your Password</h4>
              <p>Enter your OTP which we sent you on your Email Address</p>
            </Formgroup>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ handleChange }) => (
                <Form>
                  <Formgroup>
                    <Field
                      className="col-md-12 form-control"
                      type="text"
                      id="password"
                      name="password"
                      placeholder="Password"
                      onChange={(e) => {
                        onChangeField(e.target.value);
                        handleChange(e);
                      }}
                    />
                    <ErrorMessage name="password" component={TextError} />
                  </Formgroup>

                  <Formgroup>
                    <Passvalidation>
                      {isUpperCase ? (
                        <List1>Min. 1 UpperCase</List1>
                      ) : (
                        <List>Min. 1 UpperCase</List>
                      )}
                      {isLowerCase ? (
                        <List1>Min. 1 LowerCase</List1>
                      ) : (
                        <List>Min. 1 LowerCase</List>
                      )}
                      {/* {isSpecialCase ? (
                        <List1>Min. 1 Special Character</List1>
                      ) : (
                        <List>Min. 1 Special Character</List>
                      )} */}
                      {isNumberic ? (
                        <List1>Min. 1 Number Character</List1>
                      ) : (
                        <List>Min. 1 Number Character</List>
                      )}
                      {isCharacter ? (
                        <List1>Min. 8 Character</List1>
                      ) : (
                        <List>Min. 8 Character</List>
                      )}
                    </Passvalidation>
                  </Formgroup>
                  <Formgroup>
                    <Button theme="primary" size="lg" width="full" type="submit">
                      Save
                    </Button>
                  </Formgroup>
                </Form>
              )}
            </Formik>

            <Formgroup>
              <Link to="/forgotpassword" className="btn btn-default btn-block">
                Cancel
              </Link>
            </Formgroup>
          </Col>
        </Row>
      </Signupwraper>
    </Loginbg>
  );
};

ResetPassword.propTypes = propTypes;

export default withApollo(ResetPassword);
