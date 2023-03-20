/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import { FiEdit, FiMoreVertical, FiTrash } from 'react-icons/fi';
import Dropdown from 'react-bootstrap/Dropdown';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import Header from '../../components/Header';
import TextError from '../../components/TextError';
import SortDown from '../../images/sort-alpha-down.svg';
import SortUp from '../../images/sort-alpha-up-alt.svg';
import Input from '../../components/Input';
import useConfirmPopup from '../../components/AlertBox/useConfirmPopup';
import { ADD_TAG, REMOVE_TAG, UPDATE_TAG } from './graphMutations';
import { TAGS } from './graphQueries';
import AppContext from '../../context/AppContext';
import { OPTIONS, STATUS } from '../../utils/commonConstants';
import ToolTipForContent from '../../components/ToolTipForContent';
import ToolTipForComponent from '../../components/ToolTipForComponent';
import teampronity from '../../images/teampronity-icon.svg';
import * as S from './Tags-styled';

const propTypes = {
  client: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
  }).isRequired,
};

const Tags = ({ client }) => {
  const { authUser } = useContext(AppContext);
  const [show, showUpdateModal] = useState(false);
  const [errorMessageShow, setErrorMessageShow] = useState(false);
  const [editErrorMessageShow, setEditErrorMessageShow] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [tagList, setTagList] = useState([]);
  const [tag, setTag] = useState({ id: '', tag_name: '' });
  const { isConfirmPopup } = useConfirmPopup();
  const [filterValue, setFilterValue] = useState({
    archive_status: undefined,
    query: '',
    sortKey: 'tag_name',
    sortValue: false,
  });

  const fetchTagList = async () => {
    const tagQueryVariables = {
      workspace_id: authUser.current_workspace,
      query: filterValue.query,
      limit: 10,
      offset: 0,
    };

    if (typeof filterValue.archive_status === 'boolean') {
      tagQueryVariables.archive_status = filterValue.archive_status;
    }

    const sortBy = [{ id: filterValue.sortKey, order: filterValue.sortValue }];
    if (sortBy && sortBy.length) {
      const sortObject = sortBy[0];
      tagQueryVariables.sortKey = sortObject.id;
      tagQueryVariables.sortValue = sortObject.order ? 'DESC' : 'ASC';
    }
    try {
      const { data } = await client.query({
        query: TAGS,
        variables: tagQueryVariables,
      });
      const tags = (data && data.tags && data.tags.tags) || [];
      setTagList(tags);
    } catch (error) {
      console.log(error);
    }
    setShowLoader(false);
  };

  useEffect(() => {
    fetchTagList();
  }, [filterValue, authUser]);

  const initialValues = {
    name: '',
  };

  const addTagValidationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Label name is too short')
      .max(50, 'Label name cannot be longer than 50 characters')
      .matches(/^[^0-9]/, 'Label name should not start with number')
      .required('Please provide label name'),
  });

  const editTagValidationSchema = Yup.object().shape({
    tagname: Yup.string()
      .min(2, 'Label name is too short')
      .max(50, 'Label name cannot be longer than 50 characters')
      .matches(/^[^0-9]/, 'Label name should not start with number')
      .required('Please provide label name'),
  });

  const addTagHandler = async (values, { resetForm }) => {
    setErrorMessageShow(true);
    try {
      const {
        data: {
          addTag: { isTagAdded },
        },
      } = await client.mutate({
        mutation: ADD_TAG,
        variables: {
          input: {
            tag_name: values.name.trim(),
            workspace_id: authUser.current_workspace,
          },
        },
      });
      if (isTagAdded) {
        toast.success('Label added successfully', { autoClose: 2000 });
        setFilterValue({
          ...filterValue,
          sortKey: 'id',
          sortValue: true,
        });
        fetchTagList();
        resetForm();
        setErrorMessageShow(false);
      } else {
        toast.error('Label already exists', { autoClose: 2000 });
        fetchTagList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateTagHandler = async (values) => {
    setEditErrorMessageShow(true);
    try {
      if (tag.tag_name === values.tagname.trim()) {
        toast.error('No change made', { autoClose: 2000 });
        setEditErrorMessageShow(false);
        return;
      }
      const {
        data: {
          updateTag: { isUpdated },
        },
      } = await client.mutate({
        mutation: UPDATE_TAG,
        variables: {
          input: {
            id: parseInt(values.TagId, 10),
            tag_name: values.tagname.trim(),
            workspace_id: authUser.current_workspace,
          },
        },
      });

      if (isUpdated) {
        toast.success('Label edited successfully', { autoClose: 2000 });
        showUpdateModal(!show);
        setEditErrorMessageShow(false);
      } else {
        toast.error('Label already exists', { autoClose: 2000 });
        setEditErrorMessageShow(false);
      }
      fetchTagList();
    } catch (error) {
      toast.error(error.message, { autoClose: 2000 });
      showUpdateModal(!show);
      console.log(error);
    }
  };

  const deleteTagHandler = async (id, tag_name) => {
    const confirmed = await isConfirmPopup({
      title: 'Delete Label',
      message: `Are you sure you want to delete label ${tag_name} ?`,
    });
    if (confirmed) {
      try {
        const {
          data: {
            removeTag: { isRemoved },
          },
        } = await client.mutate({
          mutation: REMOVE_TAG,
          variables: { id: parseInt(id, 10) },
        });
        if (isRemoved) toast.success('Label deleted successfully', { autoClose: 2000 });
        fetchTagList();
      } catch (error) {
        toast.error('Something went wrong', { autoClose: 2000 });
      }
    }
  };

  const archiveTagHandler = async (id, archive_status) => {
    try {
      await client.mutate({
        mutation: UPDATE_TAG,
        variables: {
          input: {
            id: parseInt(id, 10),
            archive_status: !archive_status,
            workspace_id: authUser.current_workspace,
          },
        },
      });
      if (archive_status) {
        toast.success('Label activated', { autoClose: 2000 });
      } else {
        toast.success('Label archived', { autoClose: 2000 });
      }
      fetchTagList();
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

  const setModalValue = async (id, tag_name) => {
    setEditErrorMessageShow(false);
    showUpdateModal(!show);
    setTag({
      id,
      tag_name,
    });
  };

  const modalToggle = () => {
    showUpdateModal(!show);
  };

  const mInitialValues = {
    TagId: tag?.id,
    tagname: tag?.tag_name || '',
  };

  return (
    <S.MainWrapper>
      <Header />
      <S.Pagewrapper className="pagewprage">
        <Row className="m-0">
          <Col md="12 mt-4">
            <Row className="align-items-center">
              <Col md="6">
                <h4>Labels</h4>
              </Col>
            </Row>
          </Col>
          <Col md="12">
            <Card className="mt-3">
              <Card.Body className="projectabs">
                <Row className="m-0">
                  <Col md="12">
                    <Row className="align-items-center">
                      <Col md={5} className="pl-0">
                        <S.Formgroup>
                          <S.FlexBox>
                            <Col md="4" className="pl-0">
                              <Select
                                className="form-control border-0 p-0"
                                onChange={(selectedOption) => {
                                  setFilterValue({
                                    ...filterValue,
                                    archive_status:
                                      selectedOption.value === ''
                                        ? undefined
                                        : selectedOption.value === 'true',
                                  });
                                }}
                                placeholder="Show All"
                                options={OPTIONS.filterValue}
                              />
                            </Col>
                            <Col md="8">
                              <Input
                                name="tagname"
                                type="text"
                                placeholder="Search by name"
                                required
                                onChange={(e) => {
                                  setFilterValue({ ...filterValue, query: e.target.value });
                                }}
                              />
                            </Col>
                          </S.FlexBox>
                        </S.Formgroup>
                      </Col>
                      <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={addTagValidationSchema}
                        validateOnChange={errorMessageShow}
                        validateOnBlur={errorMessageShow}
                        onSubmit={addTagHandler}
                      >
                        {({ values, setFieldValue, errors }) => {
                          return (
                            <Col md={5} className="ml-auto pr-0">
                              {Object.keys(errors).length > 0 && setErrorMessageShow(true)}
                              <Form>
                                <S.Formgroup>
                                  <S.FlexBox>
                                    <Col className="p-relative">
                                      <Field
                                        className="col-md-12 form-control"
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Add new label"
                                        value={values.name}
                                        onChange={(event) => {
                                          setFieldValue(
                                            'name',
                                            event.target.value.replace(/ +/g, ' '),
                                          );
                                        }}
                                      />
                                      <ErrorMessage name="name" component={TextError} />
                                    </Col>
                                    <Col className="cunm_btn">
                                      <Button theme="primary" size="lg" width="fix" type="submit">
                                        Add
                                      </Button>
                                    </Col>
                                  </S.FlexBox>
                                </S.Formgroup>
                              </Form>
                            </Col>
                          );
                        }}
                      </Formik>
                    </Row>
                    <Row>
                      <Col md={12} className="p-0">
                        <table className="table mb-0">
                          <thead className="bg-primary">
                            <tr>
                              <th>
                                <div>
                                  {`Name `}
                                  <img
                                    src={filterValue.sortValue ? SortUp : SortDown}
                                    alt="Sort Label List by alphabetical order"
                                    height="20px"
                                    width="20px"
                                    onMouseUpCapture={() => {
                                      setFilterValue({
                                        ...filterValue,
                                        sortValue: !filterValue.sortValue,
                                        sortKey: 'tag_name',
                                      });
                                    }}
                                  />
                                </div>
                              </th>
                              <th className="custom_status_width">Status</th>
                              <th className="action_td border-left-0">&nbsp;</th>
                              <th className="action_td border-left-0">&nbsp;</th>
                            </tr>
                          </thead>
                          <tbody>
                            {showLoader && (
                              <S.Logo>
                                <img src={teampronity} alt="teampronity" />
                              </S.Logo>
                            )}
                            {tagList?.length > 0 &&
                              tagList?.map((item) => (
                                <tr key={`${item.id}`}>
                                  <td
                                    style={{
                                      textDecoration: item.archive_status ? 'line-through' : '',
                                    }}
                                  >
                                    <ToolTipForContent>{item.tag_name}</ToolTipForContent>
                                  </td>

                                  <td className="custom_status_width">
                                    {item.archive_status ? STATUS.archived : STATUS.active}
                                  </td>
                                  <td className="action_td">
                                    <ToolTipForComponent tooltipText="Edit">
                                      <FiEdit
                                        onClick={() => setModalValue(item.id, item.tag_name)}
                                        className="text-primary"
                                      />
                                    </ToolTipForComponent>
                                  </td>
                                  <td className="action_td">
                                    <Dropdown>
                                      <Dropdown.Toggle id="dropdown-basic" bsPrefix="p-0">
                                        <FiMoreVertical />
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        {item.archive_status === false ? (
                                          <Dropdown.Item
                                            href="#/action-1"
                                            onClick={() => {
                                              archiveTagHandler(item.id, item.archive_status);
                                            }}
                                          >
                                            Mark As Archive
                                          </Dropdown.Item>
                                        ) : (
                                          <div>
                                            <Dropdown.Item
                                              href="#/action-1"
                                              onClick={() => {
                                                archiveTagHandler(item.id, item.archive_status);
                                              }}
                                            >
                                              Mark As Active
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                              href="#/action-1"
                                              onClick={() => {
                                                deleteTagHandler(item.id, item.tag_name);
                                              }}
                                            >
                                              <FiTrash className="text-danger" />
                                              &nbsp; Delete
                                            </Dropdown.Item>
                                          </div>
                                        )}
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </td>
                                </tr>
                              ))}

                            {!showLoader && tagList?.length === 0 && (
                              <tr>
                                <td colSpan={4}>
                                  <p className="noRecord">No data found</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </Col>
                    </Row>
                    <Modal show={show} onHide={modalToggle} centered size="lg">
                      <Formik
                        initialValues={mInitialValues}
                        enableReinitialize
                        validationSchema={editTagValidationSchema}
                        validateOnChange={editErrorMessageShow}
                        validateOnBlur={editErrorMessageShow}
                        onSubmit={updateTagHandler}
                      >
                        {({ values, setFieldValue, errors }) => (
                          <Form>
                            <Modal.Header closeButton>
                              <Modal.Title>Edit Label</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              {Object.keys(errors).length > 0 && setEditErrorMessageShow(true)}

                              <Row className="pt-3 pb-3">
                                <Col md="12" className="p-relative align-items-center">
                                  <Field
                                    className="form-control"
                                    type="text"
                                    id="tagname"
                                    name="tagname"
                                    placeholder="Edit label name"
                                    value={values.tagname}
                                    onChange={(event) => {
                                      setFieldValue(
                                        'tagname',
                                        event.target.value.replace(/ +/g, ' '),
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="tagname" component={TextError} />
                                  <Field
                                    className="form-control"
                                    type="hidden"
                                    name="TagId"
                                    value={values.TagId}
                                  />
                                </Col>
                              </Row>
                            </Modal.Body>
                            <Modal.Footer>
                              <Button size="lg" width="fix" onClick={modalToggle}>
                                Cancel
                              </Button>
                              <Button theme="primary" size="lg" width="fix" type="submit">
                                Save
                              </Button>
                            </Modal.Footer>
                          </Form>
                        )}
                      </Formik>
                    </Modal>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </S.Pagewrapper>
    </S.MainWrapper>
  );
};

Tags.propTypes = propTypes;
export default withApollo(Tags);
