import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRef, useEffect } from 'react';
import { FormMode, ActionTypes, IGroup } from '../types';
import { useGroupDispatch } from '../GroupProvider';

export const useGroupForm = (mode: FormMode, group: IGroup, submitForm: (values: IGroup) => void) => {
  const dispatch = useGroupDispatch();
  const nameRef = useRef<HTMLInputElement>(null);
  
  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: group,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
    }),
    onSubmit: (values: IGroup) => {
      submitForm(values);
    }
  });

  useEffect(() => {
    if (nameRef.current && !viewing) {
      nameRef.current.focus();
    }
  }, [nameRef, viewing]);

  const handleClose = () => {
    dispatch({ type: ActionTypes.CLOSE_GROUP_FORM });
  };

  const handleCancel = () => {
    dispatch({ type: ActionTypes.CANCEL_GROUP_FORM });
  };

  return {
    formik,
    nameRef,
    viewing,
    editing,
    adding,
    handleClose,
    handleCancel
  };
}; 