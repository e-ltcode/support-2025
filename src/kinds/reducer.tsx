import { Mode, ActionTypes, IKindsState, IKind, IAnswer, KindsActions } from "kinds/types";

export const initialAnswer: IAnswer = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: "", 
  parentKind: "",
  id: 0,
  title: '',
  level: 0
}

export const initialKind: IKind = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: "", 
  id: "",
  Name: '',
  level: 0,
  parentKind: null,
  answers: []
}


export const reducer = (state: IKindsState, action: KindsActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    default:
      return state;  // TODO throw error
  }
};

