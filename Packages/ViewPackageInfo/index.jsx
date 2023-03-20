import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { PACKAGE } from '../graphQueries';

const ViewPackageInfo = (props) => {
  const handleBack = () => {
    props.history.push('/packages');
  };
  const { data } = useQuery(PACKAGE, {
    variables: {
      id: parseInt(props.match.params.id, 10),
    },
  });
  return (
    <div>
      <h3>Package Details</h3>
      {data && data.package && (
        <div>
          <div>
            ID:
            {data.package.id}
          </div>
          <div>
            Title:
            {data.package.title}
          </div>
        </div>
      )}
      <br />
      <button type="button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
};

export default ViewPackageInfo;
