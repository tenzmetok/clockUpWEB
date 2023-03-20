import styled from 'styled-components';

export const MainWrapper = styled.div`
  width: 100%;
`;
export const Flexbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
  margin-top: 20px;
  p {
    margin-right: 15px;
    margin-left: 3px;
    font-weight: bold;
  }
`;
export const RadioGroup = styled.div`
  margin-right: 10px;
  margin-bottom: 15px;

  label {
    margin-left: 10px;
  }
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
export const Filters = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;
export const FilterItem = styled.div`
  height: 100%;
  padding: 10px 0px;
  width: 12vw;
`;
export const Formgroup = styled.div`
  margin-bottom: 20px;
`;
export const Filtertitle = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  span {
    margin-left: 10px;
  }
`;
export const Searchbox = styled.div`
  flex: 0 0 auto;
  width: 12vw;
  position: relative;
  input {
    border: none;
    border-bottom: 1px solid #ddd;
    padding: 6px 15px 6px 35px;
    width: 100%;
    &:focus {
      outline: none;
    }
  }

  svg {
    position: absolute;
    left: 0px;
    left: 4px;
    bottom: 9px;
    font-size: 20px;
  }
`;
export const FlexBox = styled.div`
  display: flex;
  align-items: center;
  svg {
    font-size: 18px;
  }
  span {
    margin-left: 6px;
  }
`;

export const StyledErrorMessage = styled.div`
  color: #dc3545;
  position: absolute;
  font-size: 13px;
  font-weight: 400;
`;
export const Logo = styled.div`
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 150% !important;
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
