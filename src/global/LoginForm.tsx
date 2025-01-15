import React, { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { ILoginUser } from "global/types";
import { useLocation, useNavigate } from "react-router-dom";

import './formik.css';

import { useGlobalContext } from 'global/GlobalProvider'

export interface ILoginFormProps {
}

const LoginForm = ({ initialValues, invitationId } : {initialValues: ILoginUser, invitationId: string}) => {
  const { globalState, signInUser } = useGlobalContext();
  const { isAuthenticated } = globalState;

  let navigate = useNavigate();
  
  const closeForm = () => {
    navigate('/about'); // enable closing of the form
  }

  const submitForm = (loginUser: ILoginUser) => {
    if (invitationId === '')
      signInUser(loginUser)
    else {
      // joinToWorkspace({...loginUser, invitationId})
    }
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object().shape({
      nickName: Yup.string().required("Required"),
      password: Yup.string()
        .required("Password is a required field")
        .min(8, "Password must be at least 8 characters"),
    }),
    onSubmit: values => {
      //alert(JSON.stringify(values, null, 2));
      submitForm(values)
    }
  });

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nickNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nickNameRef.current!.focus();
  }, [nickNameRef])

  useEffect(() => {
    if (isAuthenticated)
      navigate('/')
  }, [isAuthenticated, navigate])

  const isInvitation = formik.values.who !== '';
  return (
    <div className="form">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>

      { isInvitation ? (
        <span>Invitation from <b>{formik.values.who}</b></span>
      ) : (
        <span>Sign in</span>
      )}

        <Form.Group controlId="nickName">
          {/* <Form.Label>Title</Form.Label> */}
          <Form.Control
            as="input"
            name="nickName"
            ref={nickNameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.nickName !== formik.values.nickName)
            //     formik.submitForm();
            // }}
            value={formik.values.nickName}
            style={{ width: '100%' }}
            placeholder={'nickName'}
          />
          <Form.Text className="text-danger">
            {formik.touched.nickName && formik.errors.nickName ? (
              <div className="text-danger">{formik.errors.nickName}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="password">
          {/* <Form.Label>password</Form.Label> */}
          <Form.Control
            as="input"
            name="password"
            type="password"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.password}
            style={{ width: '100%' }}
            placeholder={'pwd'}
          />
          <Form.Text className="text-danger">
            {formik.touched.password && formik.errors.password ? (
              <div className="text-danger">{formik.errors.password}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <button type="submit" className="submit-button">{isInvitation ? 'Join to Workspace' : 'Sign in'}</button>

        {globalState.error &&
          <div>{globalState.error.message}</div>
        }

      </Form>

    </div >
  );
};

export default LoginForm;
