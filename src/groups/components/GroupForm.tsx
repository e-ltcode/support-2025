import React from 'react';
import { Form, CloseButton, Button } from 'react-bootstrap';
import { IGroupFormProps, FormMode } from 'groups/types';
import AnswerList from 'groups/components/answers/AnswerList';
import { useGroupDispatch } from '../GroupProvider';
import { ActionTypes } from '../types';

const GroupForm: React.FC<IGroupFormProps> = ({ mode, group, submitForm, children }) => {
  const dispatch = useGroupDispatch();
  const { id, title, answers } = group;
  const showAnswers = !answers.find(q => q.inAdding);

  const handleClose = () => {
    dispatch({ type: ActionTypes.CLOSE_GROUP_FORM });
  };

  const handleCancel = () => {
    dispatch({ type: ActionTypes.CANCEL_GROUP_FORM });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(group);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ActionTypes.SET_GROUP,
      payload: {
        group: {
          ...group,
          title: e.target.value
        }
      }
    });
  };

  return (
    <div className="form-wrapper">
      <CloseButton onClick={handleClose} className="float-end m-3" />
      <Form onSubmit={handleSubmit} className="p-4">
        <div className="form-section">
          <div className="form-section-title">Group Information</div>
          <Form.Group className="form-group mb-0">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              disabled={mode === FormMode.viewing}
            />
          </Form.Group>
        </div>

        <div className="form-metadata">
          <div className="form-metadata-field">
            <div className="form-metadata-label">Created By:</div>
            <div className="form-metadata-value">
              {group.created?.by?.nickName}, {group.created?.date?.toLocaleString()}
            </div>
          </div>
          {group.modified && (
            <div className="form-metadata-field">
              <div className="form-metadata-label">Modified By:</div>
              <div className="form-metadata-value">
                {group.modified?.by?.nickName}, {group.modified?.date?.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="answers-section">
          <div className="answers-header">
            Answers ({answers?.length || 0})
          </div>
          <div className="answers-content">
            {showAnswers && (
              <AnswerList level={1} parentGroup={id} title={title} />
            )}
          </div>
        </div>

        {(mode === FormMode.editing || mode === FormMode.adding) && (
          <div className="row-buttons">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              className="text-decoration-none"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              {children}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default GroupForm;