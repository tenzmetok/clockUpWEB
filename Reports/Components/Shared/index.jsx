import React from 'react';
import styled from 'styled-components';
import { Row, Col, Card } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';

const ReportWrapper = styled.div`
  width: 100%;
`;
const TagsChip = styled.div`
  padding: 5px;
  font-size: 13px;
  text-align: center;
  display: inline-block;
`;

const Shared = () => {
  return (
    <ReportWrapper>
      <Card className="mt-3">
        <Card.Body>
          <Row>
            <Col md={12}>
              <h3>My reports</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="p-0">
              <table className="table mb-0">
                <thead className="bg-primary">
                  <tr>
                    <th>Name</th>
                    <th>Label</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td width="400">Test Share</td>
                    <td>
                      <TagsChip className="bg-primary">Public</TagsChip>
                    </td>
                    <td>
                      <InputGroup className="input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="url"
                          value="www.halfsqaure.com/tes/sasd"
                        />
                        <InputGroup.Prepend>
                          <InputGroup.Text>Copy</InputGroup.Text>
                        </InputGroup.Prepend>
                      </InputGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </ReportWrapper>
  );
};

export default Shared;
