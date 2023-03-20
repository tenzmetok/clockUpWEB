import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col, Button } from 'react-bootstrap';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, ContentState, EditorState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { toast } from 'react-toastify';
import UPDATE_PROJECT from '../../graphMutations';
import { PROJECT_BY_ID } from '../../graphQueries';
import AppContext from '../../../../context/AppContext';

const TabWrapper = styled.div`
  width: 100%;
  padding: 15px 0px;
`;
const propTypes = {
  client: PropTypes.shape({
    query: PropTypes.func.isRequired,
    mutate: PropTypes.func.isRequired,
  }).isRequired,
};

const Note = ({ client, componentProps }) => {
  const match = componentProps.computedMatch.params;
  const { id } = match;
  const { authUser } = useContext(AppContext);
  const [editorState, setEditorState] = useState();

  const getNotes = async () => {
    try {
      const { data: notes } = await client.query({
        query: PROJECT_BY_ID,
        variables: {
          id,
        },
      });
      const note = (notes && notes.getProjectById && notes.getProjectById.notes) || '';

      setEditorState(
        EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(note))),
      );
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  const initialValues = {
    note: editorState,
  };

  const onSaveHandler = async () => {
    const data = convertToRaw(editorState.getCurrentContent());
    const note = stateToHTML(convertFromRaw(JSON.parse(JSON.stringify(data))));
    const variables = {
      input: {
        id,
        workspace_id: authUser.current_workspace,
        notes: note,
      },
    };

    try {
      await client.mutate({
        mutation: UPDATE_PROJECT,
        variables,
      });
      toast.success('Note saved successfully', { autoClose: 2000 });
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <TabWrapper>
      <Formik initialValues={initialValues} onSubmit={onSaveHandler}>
        {({ values, handleSubmit }) => {
          return (
            <Row>
              <form onSubmit={handleSubmit}>
                <Col md={12}>
                  <Editor
                    name="note"
                    placeholder="Add note"
                    value={values.note}
                    editorState={editorState}
                    wrapperClassName="text-box"
                    editorClassName="border border-dark p-3"
                    onEditorStateChange={(e) => {
                      setEditorState(e);
                    }}
                  />
                </Col>
                <Col md={12} style={{ marginTop: '20px' }}>
                  <Button type="submit">Save</Button>
                </Col>
              </form>
            </Row>
          );
        }}
      </Formik>
    </TabWrapper>
  );
};

Note.propTypes = propTypes;
export default withApollo(Note);
