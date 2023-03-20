import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import Modal from 'react-bootstrap/Modal';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import ToolTipForContent from '../../../../components/ToolTipForContent';
import GET_LATEST_DETAILS_REPORT from './graphQueries';
import AppContext from '../../../../context/AppContext';
import { toTimeFormat, toDateFormat } from '../../../../utils/DateAndTime/index';

const ReportWrapper = styled.div`
  width: 100%;
`;

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
const TagsChip = styled.div`
  padding: 5px;
  font-size: 13px;
  text-align: center;
  width: 225px;
`;

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const Detailed = ({ client, filterValues }) => {
  const [show, setShow] = useState(false);
  const { authUser } = useContext(AppContext);
  const [detailsReport, setDetailsReport] = useState([]);
  const handleClose = () => setShow(false);
  const [pageCount, setPageCount] = useState(0);
  const itemPerPage = 10;
  const [totalData, setTotalData] = useState(0);
  const [tagName, setTagName] = useState([]);

  const getDetailsReport = async (limit, offset) => {
    const { client_id, visiblity_status, project_id, startDate, endDate } = filterValues;

    try {
      const { data: detailsReportdata } = await client.query({
        query: GET_LATEST_DETAILS_REPORT,
        variables: {
          limit,
          offset,
          workspace_id: authUser.current_workspace,
          client_id,
          project_id,
          visiblity_status,
          startDate,
          endDate,
        },
      });
      const detailsReportData = detailsReportdata?.getDetailsReport || [];
      setTotalData(detailsReportData?.count);
      setPageCount(Math.ceil(detailsReportData?.count / itemPerPage));
      setDetailsReport(detailsReportData?.subtaskData);
      setTagName([]);
      const tagnameArr = detailsReportData?.subtaskData?.map((val) => {
        const tmpTagName = val?.subtasktag?.map((data) => {
          return data.tag_name;
        });
        return tmpTagName.join(',');
      });
      if (tagnameArr) {
        setTagName(tagnameArr);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelPageClick = (data) => {
    const skip = itemPerPage * data.selected;
    getDetailsReport(itemPerPage, skip);
  };

  useEffect(() => {
    getDetailsReport(itemPerPage, 0);
  }, []);

  useEffect(() => {
    getDetailsReport(itemPerPage, 0);
  }, [filterValues, authUser]);

  return (
    <ReportWrapper>
      <Card className="mt-3">
        <Card.Body>
          <Row>
            <Col md={12} className="p-0">
              <table className="table mb-0">
                <thead className="bg-primary">
                  <tr>
                    <th>Time Entry</th>
                    <th>&nbsp;</th>
                    <th>Amount</th>
                    <th>User</th>
                    <th>Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsReport?.length > 0 ? (
                    detailsReport.map((val, index) => {
                      return (
                        <tr key={val.id}>
                          <td>
                            <ProjectInfo>
                              <span className="mr-3">{val?.discription || 'Anonymous task'}</span>
                              <ProjectName orangecolor>
                                <FaCircle className="font11 mr-2" />
                                {val?.project.name}
                                <small className="ml-2">{`- ${val?.client.name}`}</small>
                              </ProjectName>
                            </ProjectInfo>
                          </td>
                          <td>
                            <TagsChip className="bg-primary">
                              <ToolTipForContent>{tagName[index] || 'No tag'}</ToolTipForContent>
                            </TagsChip>
                          </td>
                          <td>{`$ ${val?.amount}`}</td>
                          <td>
                            <span className="mr-3">
                              {`${val?.user?.first_name} ${val?.user?.last_name}`}
                            </span>
                          </td>
                          <td>
                            {`${toTimeFormat(val?.start_time)} - ${toTimeFormat(val?.end_time)}`}
                            <small className="text-muted d-block">
                              {toDateFormat(val?.subtask_date)}
                            </small>
                          </td>
                          <td className="durationinput">
                            <input type="text" className="vieweditinput" value={val?.total_time} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <p className="noRecord">No data found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Col>
          </Row>
          {totalData > itemPerPage && (
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              breakLabel="..."
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={handelPageClick}
              containerClassName="pagination justify-content-center mt-3"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              activeClassName="active"
            />
          )}
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

Detailed.propTypes = propTypes;
export default withApollo(Detailed);
