import styled from 'styled-components';

export const TabWrapper = styled.div`
  width: 100%;
  padding: 10px 15px;
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
