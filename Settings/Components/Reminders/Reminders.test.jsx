import React from 'react';
import { shallow } from 'enzyme';
import Reminders from './index';

describe('SignUp component', () => {
  it('Should render without crashing', () => {
    shallow(<Reminders />);
  });
});
