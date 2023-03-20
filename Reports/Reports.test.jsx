import React from 'react';
import { shallow } from 'enzyme';
import TimeTracker from './index';

describe('SignUp component', () => {
  it('Should render without crashing', () => {
    shallow(<TimeTracker />);
  });
});
