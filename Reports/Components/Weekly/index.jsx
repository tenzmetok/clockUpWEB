import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-bootstrap/Modal';
import { Row, Col, Button, Card } from 'react-bootstrap';
// import { FiPrinter, FiShare2 } from 'react-icons/fi';
import { FaCircle } from 'react-icons/fa';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const ReportWrapper = styled.div`
  width: 100%;
`;
const FlexBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
`;
const DetailsAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;
// const Printreport = styled.div`
//   width: 60px;
//   text-align: center;
// `;
// const ShareReport = styled.div`
//   width: 45px;
//   text-align: left;
// `;
const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
`;
const ProjectName = styled.div`
  color: ${(props) => (props.orangecolor ? ' #e58e00' : '#000')};
  white-space: nowrap;
  small {
    color: #666;
  }
`;

const Weekly = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  return (
    <ReportWrapper>
      <Card className="mt-3">
        <Card.Body>
          <Row>
            <Col md={6}>
              <FlexBox>
                <small className="text-muted">Total:</small>
                <strong className="ml-2">20:48:30</strong>
                <small className="text-muted ml-3">Billable:</small>
                <strong className="ml-2">20:48:30</strong>
                <small className="text-muted ml-3">879.88 USD</small>
              </FlexBox>
            </Col>
            <Col md={6}>
              <DetailsAction className="detailsaction">
                <DropdownButton id="dropdown-item-button" title="Export">
                  <Dropdown.Item as="button">Save as PDF</Dropdown.Item>
                  <Dropdown.Item as="button">Save as CSV</Dropdown.Item>
                  <Dropdown.Item as="button">Save as Excel</Dropdown.Item>
                </DropdownButton>
                {/* <Printreport>
                  <FiPrinter />
                </Printreport>
                <ShareReport>
                  <FiShare2 />
                </ShareReport> */}
                <DropdownButton id="dropdown-item-button" title="Show Amount">
                  <Dropdown.Item as="button">Show Amount</Dropdown.Item>
                  <Dropdown.Item as="button">Show Cost</Dropdown.Item>
                  <Dropdown.Item as="button">Show Profit</Dropdown.Item>
                  <Dropdown.Item as="button">Hide Amount</Dropdown.Item>
                </DropdownButton>
              </DetailsAction>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="p-0">
              <table className="table mb-0">
                <thead className="bg-primary">
                  <tr>
                    <th>Project</th>
                    <th>Mo, Nov 15</th>
                    <th>Tue, Nov 16</th>
                    <th>Weds, Nov 17</th>
                    <th>Thus, Nov 18</th>
                    <th>Fri, Nov 19</th>
                    <th>Sat, Nov 20</th>
                    <th>Sun, Nov 21</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <ProjectInfo>
                        <ProjectName orangecolor>
                          <FaCircle className="font11 mr-2" />
                          Teampronity Portal
                          <small className="ml-2">- John Due</small>
                        </ProjectName>
                      </ProjectInfo>
                    </td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>
                      <strong>10:22:06</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ProjectInfo>
                        <ProjectName orangecolor>
                          <FaCircle className="font11 mr-2" />
                          Teampronity Portal
                          <small className="ml-2">- John Due</small>
                        </ProjectName>
                      </ProjectInfo>
                    </td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>00:22:06</td>
                    <td>
                      <strong>10:22:06</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="pt-3">
            <Col md="12">
              <input
                name="projectname"
                type="text"
                className="form-control"
                placeholder="Add new members by email address"
                required
              />
              <small>Add up to 5 members at once by separating emails with a comma</small>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </ReportWrapper>
  );
};

export default Weekly;
