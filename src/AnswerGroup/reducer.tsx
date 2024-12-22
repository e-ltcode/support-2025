import React from 'react';
import { Mode, ActionTypes, IAnswerGroupsState, IAnswerGroup, IAnswer, AnswerGroupsActions } from "AnswerGroup/types";

export const initialAnswer: IAnswer = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: "", 
  parentAnswerGroup: undefined,
  _id: undefined,
  title: '',
  level: 0
}

export const initialAnswerGroup: IAnswerGroup = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: '',
  _id: 0,
  Name: '',
  level: 0,
  parentAnswerGroup: null,
  answers: []
}


export const reducer = (state: IAnswerGroupsState, action: AnswerGroupsActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

        

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    

    case ActionTypes.VIEW_ANSWER: {
      const { answer } = action.payload;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === answer.parentAnswerGroup
          ? {
            ...c,
            answers: c.answers.map(q => q._id === answer._id ? {
              ...answer,
              inViewing: true
            }
              : {
                ...q,
                inViewing: false
              }),
            inViewing: true
          }
          : {
            ...c,
            inViewing: false
          }
        ),
        mode: Mode.ViewingAnswer,
        loading: false
      }
    }

    case ActionTypes.SET_ANSWER:
      const { answer } = action.payload;
      const { parentAnswerGroup, _id } = answer;
      const inAdding = state.mode === Mode.AddingAnswer;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const kinds = state.kinds.map(c => c._id === parentAnswerGroup
        ? {
          ...c,
          answers: inAdding
            ? c.answers.map(q => q.inAdding ? answer : q)
            : c.answers.map(q => q._id === _id ? answer : q),
          inViewing: false,
          inEditing: false,
          inAdding: false
        }
        : c
      );
      return {
        ...state,
        kinds,
        mode: Mode.NULL,
        loading: false
      };

    case ActionTypes.EDIT_ANSWER: {
      const { answer } = action.payload;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === answer.parentAnswerGroup
          ? {
            ...c,
            answers: c.answers.map(q => q._id === answer._id ? {
              ...answer,
              inEditing: true
            }
              : {
                ...q,
                inEditing: false
              }),
            inEditing: true
          }
          : {
            ...c,
            inEditing: false
          }
        ),
        mode: Mode.EditingAnswer,
        loading: false
      };
    }

    case ActionTypes.DELETE_ANSWER: {
      const { answer } = action.payload;
      const { _id, parentAnswerGroup } = answer;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === parentAnswerGroup
          ? {
            ...c,
            answers: c.answers.filter(q => q._id !== _id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_ANSWER_FORM:
    case ActionTypes.CLOSE_ANSWER_FORM: {
      const { answer } = action.payload;
      const kind = state.kinds.find(c => c._id === answer.parentAnswerGroup)
      let answers: IAnswer[] = [];
      switch (state.mode) {
        case Mode.AddingAnswer: {
          console.assert(kind!.inAdding, "expected kind.inAdding");
          answers = kind!.answers.filter(q => !q.inAdding)
          break;
        }

        case Mode.ViewingAnswer: {
          console.assert(kind!.inViewing, "expected kind.inViewing");
          answers = kind!.answers.map(q => ({ ...q, inViewing: false }))
          break;
        }

        case Mode.EditingAnswer: {
          console.assert(kind!.inEditing, "expected kind.inEditing");
          answers = kind!.answers.map(q => ({ ...q, inEditing: false }))
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        kinds: state.kinds.map(c => c._id === answer.parentAnswerGroup
          ? { ...c, answers, inAdding: false, inEditing: false, inViewing: false }
          : c
        ),
        mode: Mode.NULL,
      };
    }

    default:
      return state;  // TODO throw error
  }
};

