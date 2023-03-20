import React from 'react';
import { shallow } from 'enzyme';
import ResetPassword from './index';

describe('Forgot Password component', () => {
  it('Should render without crashing', () => {
    shallow(<ResetPassword />);
  });
});
