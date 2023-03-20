import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_PACKAGE } from '../graphMutation';

const AddNewPackage = (props) => {
  const [title, setTitle] = useState('');
  const handleChange = (e) => {
    setTitle(e.target.value);
  };

  const [addPackage] = useMutation(CREATE_PACKAGE);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPackage(
      {
        variables: {
          input: { title },
        },
      },
      props.history.push('/packages'),
    );
    window.location.reload();
  };

  return (
    <div>
      <h3>Create New Package</h3>
      <lable>Package Title</lable>
      <br />
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Package Title" id="title" onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddNewPackage;
