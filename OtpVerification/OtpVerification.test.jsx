import React from 'react';
import { shallow } from 'enzyme';
import ForgotPassword from './index';

describe('Forgot Password component', () => {
  it('Should render without crashing', () => {
    shallow(<ForgotPassword />);
  });
});
