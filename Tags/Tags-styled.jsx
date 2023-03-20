import styled from 'styled-components';

export const MainWrapper = styled.div`
  width: 100%;
`;
export const Pagewrapper = styled.div`
  width: 100%;
  padding-left: 230px;
  padding-top: 75px;
  height: 100vh;
  overflow: auto;
  transition: all 0.4s ease 0s;
  background: #f3f3f3;
`;
export const Formgroup = styled.div`
  margin-bottom: 20px;
`;
export const FlexBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
export const Logo = styled.div`
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 80% !important;
  margin-top: 50px !important;
  width: 40px !important;
  height: 40px !important;
  img {
    display: block;
    position: absolute;
    animation: spin 1s linear infinite;
    -webkit-animation: spin 1s linear infinite;
  }
`;
