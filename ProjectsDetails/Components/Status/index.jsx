import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { groupBy } from 'lodash';
import GET_PROJECT_MATRIX_BY_ID from './graphQueries';
import { ESTIMATION_TYPE } from '../../../../utils/commonConstants';
import { toHours, totalAmounts } from './commonFunction';
import { addTime, formatTime } from '../../../../utils/DateAndTime';
import { circularChart } from '../../../../utils/circularChart';
import AppContext from '../../../../context/AppContext';
import { isOwnerOrAdmin } from '../../../../utils';

const TabWrapper = styled.div`
  width: 100%;
  padding: 15px 0px;
`;
const Statusblock = styled.div`
  strong {
    color: #000;
  }
`;

const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const Status = ({ client, componentProps }) => {
  const match = componentProps.computedMatch.params;
  const [projectStatus, setProjectStatus] = useState();
  const [billable, setBillable] = useState();
  const [nonBillable, setNonBillable] = useState();
  const [tracked, setTracked] = useState();
  const [remaining, setRemaining] = useState();
  const [amount, setAmount] = useState();
  const { authUser } = useContext(AppContext);
  const [statusData, setStatusData] = useState([]);
  const { id } = match;

  const initialValues = {
    time: projectStatus?.estimate_time,
    setting_bill: projectStatus?.bill_rate || '',
    status: projectStatus?.billing_status || '',
    type: projectStatus?.estimation_type || '',
    curr: projectStatus?.workspace?.currency || '',
    bill: projectStatus?.workspace?.bill_rate || '',
  };

  const taskNameList = (subtask) => {
    const unique = groupBy(subtask, 'task_name');
    const tmpSubTaskArr = [];
    let totalAmount = 0;
    Object.keys(unique).forEach((prev) => {
      let total = '00:00:00';
      let billableTime = '00:00:00';
      let billableAmount = 0;
      const { assignee_name } = unique[prev][0];
      unique[prev].map((data) => {
        if (data.is_billable) {
          billableTime = addTime(billableTime, data.total_time);
          billableTime = formatTime(billableTime);
        }
        billableAmount += totalAmounts(data.total_time, data.subtask_bill_rate);
        total = addTime(total, data.total_time);
        total = formatTime(total);
        return total;
      });
      const tmpTaskDetails = {
        taskName: prev,
        totalTime: total,
        billableTime,
        assignee_name,
        billableAmount,
      };
      totalAmount += tmpTaskDetails.billableAmount;
      tmpSubTaskArr.push(tmpTaskDetails);
    });
    setAmount(totalAmount.toFixed(2));
    setStatusData(tmpSubTaskArr);
  };

  const calculateTime = (value) => {
    let totalTime = '00:00:00';
    const countTime = addTime(totalTime, value);
    totalTime = formatTime(countTime);
    return totalTime;
  };

  const timeTrackerCalculation = (subtask, estimateTime, estimationType) => {
    let totalBillableHours = '00:00:00';
    let totalNonBillableHours = '00:00:00';
    let totalTrackeTime;
    subtask.forEach((task) => {
      if (task.is_billable) {
        const addedSubtaskBillTime = addTime(totalBillableHours, task.total_time);
        totalBillableHours = formatTime(addedSubtaskBillTime);
        setBillable(`${totalBillableHours}`);
      } else {
        const addedSubtaskNonbillTime = addTime(totalNonBillableHours, task.total_time);
        totalNonBillableHours = formatTime(addedSubtaskNonbillTime);
        setNonBillable(`${totalNonBillableHours}`);
      }
    });
    totalTrackeTime = addTime(totalNonBillableHours, totalBillableHours);
    totalTrackeTime = formatTime(totalTrackeTime);
    setTracked(totalTrackeTime);
    const remainigTime = estimateTime - toHours(totalTrackeTime);
    setRemaining(remainigTime.toFixed(2));
    if (estimationType === ESTIMATION_TYPE.taskBased) {
      circularChart(toHours(totalBillableHours), toHours(totalNonBillableHours));
    } else {
      circularChart(
        toHours(totalBillableHours),
        toHours(totalNonBillableHours),
        remainigTime.toFixed(2),
      );
    }
  };

  const getProjectStatus = async () => {
    try {
      const { data: projectStatusResponse } = await client.query({
        query: GET_PROJECT_MATRIX_BY_ID,
        variables: {
          id,
        },
      });
      const projects =
        (projectStatusResponse && projectStatusResponse.getProjectMatrixById) || null;
      setProjectStatus(projects);
      if (projects && projects?.subtask && projects?.subtask.length) {
        timeTrackerCalculation(projects.subtask, projects.estimate_time, projects.estimation_type);
      }

      calculateTime(projects.subtask);
      taskNameList(projects.subtask);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (match.tab === 'Status') getProjectStatus();
  }, [match]);

  return (
    <TabWrapper>
      <Row className="mb-4">
        <Col md={5}>
          <Row>
            <Col md={6}>
              <Statusblock>
                <strong>
                  {toHours(billable)}
                  &nbsp;h
                </strong>
                <p>BILLABLE</p>
              </Statusblock>
            </Col>
            <Col md={6}>
              <Statusblock>
                <strong>
                  {toHours(nonBillable)}
                  &nbsp;h
                </strong>
                <p>NON-BILLABLE</p>
              </Statusblock>
            </Col>
            <Col md={6}>
              <Statusblock>
                <strong>
                  {toHours(tracked)}
                  &nbsp;h
                </strong>
                <p>TRACKED</p>
              </Statusblock>
            </Col>
            <Col md={6}>
              <Statusblock>
                <strong>
                  {amount}
                  &nbsp;
                  {initialValues.curr}
                </strong>
                <p>AMOUNT</p>
              </Statusblock>
            </Col>

            <Col md={6}>
              <Statusblock
                style={{
                  display: initialValues.type === ESTIMATION_TYPE.taskBased ? 'none' : '',
                }}
              >
                <strong>
                  {initialValues.time}
                  &nbsp;h
                </strong>
                <p>ESTIMATE</p>
              </Statusblock>
            </Col>
            <Col md={6}>
              {isOwnerOrAdmin(authUser) && (
                <Statusblock
                  style={{
                    display: initialValues.type === ESTIMATION_TYPE.taskBased ? 'none' : '',
                  }}
                >
                  <strong>
                    {remaining}
                    &nbsp;h
                  </strong>
                  <p>REMAINING</p>
                </Statusblock>
              )}
            </Col>
          </Row>
        </Col>
        <Col md={7}>
          <div
            id="chart-container"
            style={{ position: 'relative', height: '50vh', overflow: 'hidden' }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <table className="table mb-0">
            <thead className="bg-primary">
              <tr>
                <th>Name</th>
                <th>Assignees</th>
                <th>Tracked(h)</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {statusData?.map((val) => {
                return (
                  <tr>
                    <td>{val.taskName}</td>
                    <td>{val.assignee_name}</td>
                    <td>
                      {val.totalTime}
                      &nbsp;h
                    </td>
                    <td className="text-right">
                      {val.billableAmount.toFixed(2)}
                      &nbsp;
                      {initialValues.curr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Col>
      </Row>
    </TabWrapper>
  );
};

Status.propTypes = propTypes;
export default withApollo(Status);
