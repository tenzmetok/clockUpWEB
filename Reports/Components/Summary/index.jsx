/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect } from 'react';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Row, Col, Card, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import ToolTipForContent from '../../../../components/ToolTipForContent';
import GET_SUMMARY_REPORT from './graphQueries';
import { GET_WORKSPACE_BY_ID } from '../../../Settings/Components/Setting/graphQueries';
import AppContext from '../../../../context/AppContext';
import WorkspaceDefaultLogo from '../../../../images/workspace.png';
import * as S from './Summary-styled';
import { toDateFormat, itemPerPage } from '../../../../utils/commonConstants';
import chart from './chart';

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const Summary = ({ client, filterValues }) => {
  const { authUser } = useContext(AppContext);
  const [summaryReport, setSummaryReport] = useState([]);
  const [workspaceImage, setWorkspaceImage] = useState('');
  const [latestProjectDetail, setLatestProjectDetail] = useState({});
  const [isBillable, setBillable] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalData, setTotalData] = useState(0);

  const getWorkSpaceDataById = async () => {
    try {
      const variables = {
        id: authUser?.current_workspace || authUser?.Workspaces?.[0]?.id,
      };
      const { data: workspace } = await client.query({
        query: GET_WORKSPACE_BY_ID,
        variables,
      });
      setWorkspaceImage(workspace?.workSpaceById?.company_logo);
    } catch (error) {
      console.log(error);
    }
  };
  const getSummaryReport = async (limit, offset) => {
    const { client_id, visiblity_status, project_id, startDate, endDate } = filterValues;

    try {
      const { data: summaryReportdata } = await client.query({
        query: GET_SUMMARY_REPORT,
        variables: {
          limit,
          offset,
          workspace_id: authUser?.current_workspace,
          client_id,
          project_id,
          visiblity_status,
          startDate,
          endDate,
        },
      });
      const summaryReportData = summaryReportdata?.getSummaryReport || [];
      if (summaryReportData) {
        setTotalData(summaryReportData.count);
        setPageCount(Math.ceil(summaryReportData.count / itemPerPage));
        setSummaryReport(summaryReportData.summaryReportData);
        setLatestProjectDetail(summaryReportData.latestProjectDetails);
        setBillable(summaryReportData.latestProjectDetails?.is_billable);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelPageClick = (data) => {
    const skip = itemPerPage * data.selected;
    getSummaryReport(itemPerPage, skip);
  };

  const setStartAndEndTime = (start_time, end_time) => {
    return `${moment(start_time, 'x').format('hh:mm A')} - ${moment(end_time, 'x').format(
      'hh:mm A',
    )}`;
  };

  useEffect(() => {
    getWorkSpaceDataById();
  }, [authUser, filterValues]);
  useEffect(() => {
    getSummaryReport(itemPerPage, 0);
  }, [filterValues, authUser]);

  return (
    <S.ReportWrapper>
      <Card className="mt-3">
        <Card.Body>
          {latestProjectDetail ? (
            <>
              {chart(isBillable)}
              <Row className="m-0">
                <S.UploadedImg>
                  <img
                    src={workspaceImage || WorkspaceDefaultLogo}
                    alt="Teampronity Workspace Setting logo"
                  />
                </S.UploadedImg>
                <S.workspaceName>
                  <span>
                    <p>Workpace Name</p>
                    <h1>{latestProjectDetail.workspace_name}</h1>
                  </span>
                </S.workspaceName>
                <S.projectName>
                  <span>
                    <p>Project Name</p>
                    <h4>{latestProjectDetail.project_name}</h4>
                  </span>
                </S.projectName>
              </Row>
              <br />
              <Row className="m-0">
                <Col md={4}>
                  <h3>Total Hours</h3>
                  <p>{latestProjectDetail.latestTotalTime}</p>
                </Col>
                <Col md={4}>
                  <S.chart>
                    <div id="chart-container" style={{ height: '100%', left: '-151px' }} />
                  </S.chart>
                </Col>
                <Col md={4}>
                  <h3>Total Amount</h3>
                  <p>{latestProjectDetail.latestAmount}</p>
                </Col>
              </Row>
            </>
          ) : (
            <></>
          )}

          <br />
          <Row>
            <Col md={12} className="p-0">
              <Table>
                <thead className="bg-primary">
                  <tr>
                    <th>Activity Name</th>
                    <th>Hours</th>
                    <th>Billable Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryReport?.length > 0 ? (
                    summaryReport.map((val) => {
                      return (
                        <tr key={val.id}>
                          <td>
                            <S.ProjectInfo>
                              <ToolTipForContent>
                                <span className="mr-3">
                                  {val?.discription ||
                                    val?.task?.task_name ||
                                    val?.subtasktag?.tag_name ||
                                    'Anonymous task'}
                                </span>
                              </ToolTipForContent>
                            </S.ProjectInfo>
                          </td>
                          <td>
                            <ToolTipForContent>
                              {setStartAndEndTime(val.start_time, val.end_time)}
                            </ToolTipForContent>
                            <small className="text-muted d-block">
                              {toDateFormat(val.subtask_date)}
                            </small>
                          </td>
                          <td>
                            <ToolTipForContent>{`$ ${val.amount}`}</ToolTipForContent>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <S.NoRecord>No record found</S.NoRecord>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
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
    </S.ReportWrapper>
  );
};

Summary.propTypes = propTypes;
export default withApollo(Summary);
