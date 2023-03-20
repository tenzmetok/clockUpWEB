import React from 'react';
import { shallow } from 'enzyme';
import SignUp from './index';

describe('SignUp component', () => {
  it('Should render without crashing', () => {
    shallow(<SignUp />);
  });
});
