import React from 'react';
import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, FormMode, ICategory, IQuestion, IQuestionFormProps } from "categories/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'
import CatList from 'categories/components/SelectCategory/CatList'

import { useCategoryDispatch } from "categories/CategoryProvider";
import Dropdown from 'react-bootstrap/Dropdown';

const QuestionForm = ({ mode, question, submitForm, children, showCloseButton, closeModal }: IQuestionFormProps) => {

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const { title, _id, questionAnswers } = question;

  const dispatch = useCategoryDispatch();

  const closeForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question } })
    }
  }

  const cancelForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CANCEL_QUESTION_FORM, payload: { question } })
    }
  }
  
  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    nameRef.current!.focus();
  }, [nameRef])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: question,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      groupId: Yup.string().required("Required").notOneOf(['000000000000000000000000'])
    }),
    onSubmit: (values: IQuestion) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('QuestionForm.onSubmit', JSON.stringify(values, null, 2))
      //submitForm({ ...values, ...cat })
      submitForm(values)
      //props.handleClose(false);
    }
  });

  const isDisabled = mode === FormMode.viewing;

  const setParentCategory = (cat: ICategory) => {
    formik.setFieldValue('groupId', cat._id!);
    formik.setFieldValue('categoryTitle', cat.title);
  }

  return (
    <div className="form-wrapper px-3 py-1 my-0 my-1 w-100">
      {showCloseButton && <CloseButton onClick={closeForm} className="float-end" />}
      <Form onSubmit={formik.handleSubmit}>

        <Form.Label>Category</Form.Label>
        <Form.Group controlId="groupId" className="category-select form-select-sm">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-2 py-1 text-primary" disabled={isDisabled}>
              {formik.values.categoryTitle}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-0">
              <Dropdown.Item className="p-0 m-0 rounded-3">
                {/* <CatList
                  groupId={null}
                  level={1}
                  setParentCategory={setParentCategory}
                /> */}
                Cat List
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control
            as="input"
            name="groupId"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.groupId.toString()}
            placeholder='Category'
            className="text-primary w-100"
            disabled={isDisabled}
            hidden={true}
          />
          <Form.Text className="text-danger">
            {formik.touched.groupId && formik.errors.groupId ? (
              <div className="text-danger">{formik.errors.groupId ? 'required' : ''}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="textarea"
            name="title"
            ref={nameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title}
            rows={3}
            placeholder='New Question'
            className="text-primary w-100"
            disabled={isDisabled}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="source">
          <Form.Label>Source</Form.Label>
          <Select
            id="source"
            name="source"
            options={sourceOptions}
            onChange={(e, value) => {
              formik.setFieldValue('source', value)
                // .then(() => { if (editing) formik.submitForm() })
            }}
            value={formik.values.source}
            disabled={isDisabled}
            classes="text-primary"
          />
          <Form.Text className="text-danger">
            {formik.touched.source && formik.errors.source ? (
              <div className="text-danger">{formik.errors.source}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="status">
          <Form.Label>Status</Form.Label>
          <Select
            id="status"
            name="status"
            options={statusOptions}
            //onChange={formik.handleChange}
            onChange={(e, value) => {
              formik.setFieldValue('status', value)
                //.then(() => { if (editing) formik.submitForm() })
            }}
            value={formik.values.status}
            disabled={isDisabled}
            classes="text-primary"
          />
          <Form.Text className="text-danger">
            {formik.touched.status && formik.errors.status ? (
              <div className="text-danger">{formik.errors.status}</div>
            ) : null}
          </Form.Text>
        </Form.Group>


        {(viewing || editing) &&
          <>
            Question Answers

            <CreatedModifiedForm
              created={question.created}
              createdBy={question.createdBy}
              modified={question.modified}
              modifiedBy={question.modifiedBy}
              classes="text-primary"
            />
          </>
        }
        {(editing || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }
      </Form>
    </div >
  );
};

export default QuestionForm;