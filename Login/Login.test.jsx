import React from 'react';
import { shallow, mount } from 'enzyme';
import { Auth } from 'aws-amplify';
import { act } from '@testing-library/react';
// import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import Login from './index';
// import NewPassword from './Components/NewPassword';

describe('Login component', () => {
  beforeEach(() => {
    // Auth.signIn = jest.fn().mockImplementation(() => ({
    //   userName: 'test@123',
    //   password: 'test@1223',
    //   preferredMFA: 'NOMFA',
    // }));
    // Auth.signIn = jest.fn().mockImplementation(() => ({ userSub: 'test' }));
    // Auth.signIn = () => {
    //   return {
    //     preferredMFA: 'NOMFA',
    //     newPassword: 'Test1234',
    //     confirmNewPassword: 'Test1234',
    //   };
    // };
    // Auth.confirmSignUp = jest.fn();
    // Auth.signIn = jest.fn();
    // Auth.currentUserInfo = jest.fn().mockImplementation(() => ({
    //   attributes: {
    //     sub: 'free',
    //     address: JSON.stringify({ country: 'United States' }),
    //     email_verified: true,
    //   },
    // }));
    // Auth.resendSignUp = jest.fn();
    // Auth.signIn = jest.fn().mockImplementation(() => ({ challengeName: 'NEW_PASSWORD_REQUIRED' }));
  });
  const history = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  it('renders without crashing', () => {
    shallow(<Login history={history} />);
  });

  it('should call handleInputChange with no value', async () => {
    const event = { target: { value: '' } };
    const wrapper = mount(<Login history={history} />);
    // console.log('wrapper', wrapper.debug());
    const input = wrapper.find('input[type="email"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('');
  });
  it('should call handleInputChange invalid email', async () => {
    const event = { target: { value: 'abc' } };
    const wrapper = mount(<Login history={history} />);
    const input = wrapper.find('input[type="email"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('abc');
  });

  it('should call handleInputChange with in valid email', async () => {
    const event = { target: { value: 'abc@123.com' } };
    const wrapper = mount(<Login history={history} />);
    const input = wrapper.find('input[type="email"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('abc@123.com');
  });

  it('should call handlePasswordChange with blank value', async () => {
    const event = { target: { value: '' } };
    const wrapper = mount(<Login history={history} />);
    const input = wrapper.find('input[type="password"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('');
  });

  it('should call handlePasswordChange with invalid value', async () => {
    const event = { target: { value: 'Ab' } };
    const wrapper = mount(<Login history={history} />);
    const input = wrapper.find('input[type="password"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('Ab');
  });

  it('should call handlePasswordChange', async () => {
    const event = { target: { value: 'Abc@12345' } };
    const wrapper = mount(<Login history={history} />);
    const input = wrapper.find('input[type="password"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('Abc@12345');
  });

  it('should call handleNewPasswordChange', async () => {
    const event = { target: { value: 'Abc@12345' } };
    const wrapper = mount(<Login history={history} />);
    // console.log('wrapper', wrapper.debug());
    const input = wrapper.find('input[type="password"]');
    input.simulate('change', event);
    expect(input.instance().value).toEqual('Abc@12345');
  });

  it('should call handleOnSubmit with no preferredMFA set', async () => {
    let wrapper;
    await act(async () => {
      Auth.signIn = jest.fn().mockImplementation(() => ({
        userName: 'test@123',
        password: 'test@1223',
        preferredMFA: 'NOMFA',
      }));
      wrapper = mount(<Login history={history} />);
      const button = wrapper.find('button');
      button.simulate('submit');
      await wait();
      expect(Auth.signIn).toHaveBeenCalled();
    });
  });

  it('should call handleOnSubmit with authStatus=NEW_PASSWORD_REQUIRED', async () => {
    let wrapper;
    await act(async () => {
      Auth.signIn = jest.fn().mockImplementation(() => ({
        userName: 'test@123',
        password: 'test@1223',
        challengeName: 'NEW_PASSWORD_REQUIRED',
      }));
      wrapper = mount(<Login history={history} />);
      const button = wrapper.find('button');
      button.simulate('submit');
      await wait();
      wrapper.update();
      expect(Auth.signIn).toHaveBeenCalled();
      // console.log('NEW_PASSWORD_REQUIRED', wrapper.debug());
    });
  });
  // it('should call handleNewPasswordChange', async () => {
  //   const wrapper = mount(<Login history={history} />);
  //   console.log('wrapper', wrapper.debug());
  //   const input = wrapper.find('input[type="password"]');
  //   input.simulate('change', event);
  //   expect(input.instance().value).toEqual('Abc@12345');
  // });

  describe('Change Password Form component', () => {
    let wrapper;
    beforeEach(async () => {
      await act(async () => {
        Auth.signIn = jest.fn().mockImplementation(() => ({
          userName: 'test@123',
          password: 'test@1223',
          challengeName: 'NEW_PASSWORD_REQUIRED',
        }));
        wrapper = mount(<Login history={history} />);
        const button = wrapper.find('button');
        button.simulate('submit');
        await wait();
        wrapper.update();
        await wait(0);
      });
    });
    it('shold handleNewPasswordChange', () => {
      const event = { target: { value: '' } };
      const input = wrapper.find('input[name="newPassword"]');
      input.simulate('change', event);
      expect(input.instance().value).toEqual('');
    });

    it('shold handleNewPasswordBlur with blank value', () => {
      const input = wrapper.find('input[name="newPassword"]');
      const event = { target: { value: '' } };
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur', event);
      expect(input.instance().value).toEqual('');
    });
    it('shold handleNewPasswordBlur with invalid password', () => {
      const input = wrapper.find('input[name="newPassword"]');
      const event = { target: { value: 'Test' } };
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur');
      expect(input.instance().value).toEqual('Test');
    });
    it('shold handleNewPasswordBlur with valid password', () => {
      const input = wrapper.find('input[name="newPassword"]');
      const event = { target: { value: 'Test@1234' } };
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur');
      expect(input.instance().value).toEqual('Test@1234');
    });
    it('shold handleConfirmPasswordChange', () => {
      const event = { target: { value: '' } };
      const input = wrapper.find('input[name="confirmNewPassword"]');
      input.simulate('change', event);
      expect(input.instance().value).toEqual('');
    });

    it('shold handleConfirmPasswordChange with blank value', () => {
      const event = { target: { value: '' } };
      const input = wrapper.find('input[name="confirmNewPassword"]');
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur', event);
      expect(input.instance().value).toEqual('');
    });
    it('shold handleConfirmPasswordChange wiht invalid value', () => {
      const event = { target: { value: 'Test' } };
      const input = wrapper.find('input[name="confirmNewPassword"]');
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur', event);
      expect(input.instance().value).toEqual('Test');
    });
    it('shold handleConfirmPasswordChange wiht invalid value', () => {
      const event = { target: { value: 'Test@1234' } };
      const input = wrapper.find('input[name="confirmNewPassword"]');
      input.simulate('change', event);
      wrapper.update();
      input.simulate('blur', event);
      expect(input.instance().value).toEqual('Test@1234');
    });
    it('should call handleOnPasswordSubmit', async () => {
      await act(async () => {
        Auth.completeNewPassword = jest.fn().mockImplementation(() => ({}));
        const button = wrapper.find('button');
        button.simulate('submit');
        await wait();
        expect(Auth.completeNewPassword).toHaveBeenCalled();
      });
    });
  });

  describe('Mfa Selection component', () => {
    let wrapper;
    beforeEach(async () => {
      await act(async () => {
        Auth.signIn = jest.fn().mockImplementation(() => ({
          userName: 'test@123',
          password: 'test@1223',
          challengeName: 'NEW_PASSWORD_REQUIRED',
        }));
        wrapper = mount(<Login history={history} />);
        const button = wrapper.find('button');
        button.simulate('submit');
        await wait();
        wrapper.update();
        await wait(0);
        Auth.completeNewPassword = jest.fn().mockImplementation(() => ({}));
        const button1 = wrapper.find('button');
        button1.simulate('submit');
        await wait();
        expect(Auth.completeNewPassword).toHaveBeenCalled();
        wrapper.update();
        await wait(0);
      });
    });
    it('should render Mfa selection component and handle handleMfaChange method with value SMS', async () => {
      await act(async () => {
        // console.log('Mfa Selection', wrapper.debug());
        const radioInput = wrapper.find('input[type="radio"]').at(0);
        // radioInput.simulate('change', { target: { value:'SMS'} );
        radioInput.simulate('change', {
          target: {
            value: 'SMS',
          },
        });
        await wait();
        wrapper.update();
        // console.log('shouldrender', wrapper.debug());
      });
    });
    it('should handle handlePhoneNumberChange', async () => {
      await act(async () => {
        const radioInput = wrapper.find('input[type="radio"]').at(0);
        radioInput.simulate('change', {
          target: {
            value: 'SMS',
          },
        });
        await wait();
        wrapper.update();
        const input = wrapper.find('input[type="text"]');
        input.simulate('change', {
          target: {
            value: '+919898858674',
          },
        });
        expect(input.instance().value).toEqual('+919898858674');
        await wait();
        wrapper.update();
        Auth.updateUserAttributes = jest.fn().mockImplementation(() => ({}));
        Auth.verifyUserAttribute = jest.fn().mockImplementation(() => ({}));
        const button = wrapper.find('button');
        console.log('button', button);
        button.simulate('click');
        expect(Auth.updateUserAttributes).toHaveBeenCalled();
        // expect(Auth.verifyUserAttribute).toHaveBeenCalled();
        await wait();
        wrapper.update();
        console.log('handlePhoneNumberChange', wrapper.debug());

        const inputCode = wrapper.find('input[name="code"]');
        // console.log('input input Change', input.debug());
        inputCode.simulate('change', {
          target: {
            value: '123456',
          },
        });
        await wait();
        wrapper.update();
        expect(inputCode.instance().value).toEqual('123456');
        Auth.verifyUserAttributeSubmit = jest.fn().mockImplementation(() => ({}));
        Auth.setPreferredMFA = jest.fn().mockImplementation(() => ({}));
        Auth.enableSMS = jest.fn().mockImplementation(() => ({}));
        const submitButton = wrapper.find('button[type="submit"]');
        submitButton.simulate('submit');
        // await wait();
        // expect(Auth.verifyUserAttributeSubmit).toHaveBeenCalled();
      });
    });
    it('should render Mfa selection component and handle handleMfaChange method with value QRCODE', async () => {
      await act(async () => {
        // console.log('Mfa Selection', wrapper.debug());
        const radioInput = wrapper.find('input[type="radio"]').at(1);
        radioInput.simulate('change', {
          target: {
            value: 'QRCODE',
          },
        });
        await wait();
        wrapper.update();
        console.log('QRCODE Selection', wrapper.debug());
        const inputCode = wrapper.find('input[name="code"]');
        // console.log('input input Change', input.debug());
        inputCode.simulate('change', {
          target: {
            value: '123456',
          },
        });
        await wait();
        wrapper.update();
        expect(inputCode.instance().value).toEqual('123456');
        Auth.verifyTotpToken = jest.fn().mockImplementation(() => ({}));
        Auth.setPreferredMFA = jest.fn().mockImplementation(() => ({}));
        const submitButton = wrapper.find('button[type="submit"]');
        submitButton.simulate('submit');
      });
    });
  });

  describe('render ConfirmSignIn  component', () => {
    let wrapper;
    beforeEach(async () => {
      await act(async () => {
        Auth.signIn = jest.fn().mockImplementation(() => ({
          userName: 'test@123',
          password: 'test@1223',
          challengeName: 'SOFTWARE_TOKEN_MFA',
        }));
        wrapper = mount(<Login history={history} />);
        const button = wrapper.find('button');
        button.simulate('submit');
        await wait();
        wrapper.update();
        await wait(0);
        wrapper.update();
      });
    });
    it('handle code Change', async () => {
      await act(async () => {
        // console.log('shouldrender', wrapper.debug());
        const input = wrapper.find('input[type="text"]');
        // console.log('input input Change', input.debug());
        input.simulate('change', {
          target: {
            value: '123456',
          },
        });
        await wait();
        wrapper.update();
        expect(input.instance().value).toEqual('123456');
      });
    });

    it('handle ConfirmSignIn', async () => {
      await act(async () => {
        Auth.confirmSignIn = jest.fn().mockImplementation(() => ({}));
        const button = wrapper.find('button');
        button.simulate('submit');
        await wait();
        expect(Auth.completeNewPassword).toHaveBeenCalled();
      });
    });
  });
});
