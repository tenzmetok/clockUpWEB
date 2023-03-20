import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { UPDATE_PACKAGE } from '../graphMutation';
import { PACKAGE } from '../graphQueries';

const EditPackageDetails = (props) => {
  const [title, setTitle] = useState('');
  const handleChange = (e) => {
    setTitle(e.target.value);
  };
  const { data } = useQuery(PACKAGE, {
    variables: {
      id: parseInt(props.match.params.id, 10),
    },
  });
  const [updatePackage] = useMutation(UPDATE_PACKAGE);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePackage(
      {
        variables: {
          input: {
            id: parseInt(props.match.params.id, 10),
            title,
          },
        },
      },
      props.history.push('/packages'),
    );
    window.location.reload();
  };

  return (
    <div>
      <h3>Edit Package Details</h3>
      <lable>Package Name</lable>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={data && data.package && data.package.title}
          id="title"
          onChange={handleChange}
        />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditPackageDetails;
