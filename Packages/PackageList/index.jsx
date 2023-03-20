/* eslint-disable react/button-has-type */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import s from './PackageList.module.scss';
import { PACKAGES } from '../graphQueries';
import { REMOVE_PACKAGE } from '../graphMutation';

const PackageList = (props) => {
  const { data } = useQuery(PACKAGES);
  const [deleteTodo] = useMutation(REMOVE_PACKAGE);
  const handleDelete = async (id) => {
    console.log('delete', id);
    await deleteTodo({ variables: { id: parseInt(id, 10) } });
    window.location.reload();
  };
  const handleView = async (id) => {
    props.history.push(`/package/${id}/info`);
  };
  return (
    <div className={s.root}>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.packages &&
            data.packages.map((item) => {
              return (
                <tr key={Math.random()}>
                  <td>{item.title}</td>
                  <Link to={`/package/${item.id}`}>Edit</Link>
                  <button onClick={() => handleView(item.id)}>View</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </tr>
              );
            })}
        </tbody>
      </table>
      <Link to="/package/new">Add New Package</Link>
    </div>
  );
};

export default PackageList;
