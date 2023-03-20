import React from 'react';
import { shallow } from 'enzyme';
import ProjectSetting from './index';

describe('SignUp component', () => {
  it('Should render without crashing', () => {
    shallow(<ProjectSetting />);
  });
});
