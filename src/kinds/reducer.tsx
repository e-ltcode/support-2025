import { Mode, ActionTypes, IKindsState, IKind, IAnswer, KindsActions } from "kinds/types";

export const initialAnswer: IAnswer = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: "", 
  parentKind: "",
  _id: "",
  title: '',
  level: 0
}

export const initialKind: IKind = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: "", 
  _id: "",
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

    case ActionTypes.SET_SUB_KINDS: {
      const { subKinds } = action.payload;
      const kinds = state.kinds.concat(subKinds);
      return {
        ...state,
        kinds,
        loading: false
      };
    }
    
    case ActionTypes.CLEAN_SUB_TREE: {
      const { _id } = action.payload.kind;
      const arr = markForClean(state.kinds, _id!)
      console.log('clean:', arr)
      const _ids = arr.map(c => c._id)
      return {
        ...state,
        mode: Mode.NULL,
        kinds: state.kinds.filter(c => !_ids.includes(c._id))
      }
    }

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ActionTypes.ADD_SUB_KIND: {
      const { parentKind, level } = action.payload;
      const kind: IKind = {
        ...initialKind,
        Name: '',
        level: level + 1,
        parentKind,
        inAdding: true
      }
      return {
        ...state,
        kinds: [kind, ...state.kinds],
        mode: Mode.AddingKind
      };
    }

    case ActionTypes.SET_ADDED_KIND: {
      const { kind } = action.payload;
      // kind doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        kinds: state.kinds.map(c => c.inAdding ? kind : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    // case ActionTypes.SET_KIND: {
    //   const { kind } = action.payload; // kind doesn't contain inViewving, inEditing, inAdding 
    //   const { answers } = kind;
    //   const kindInAdding = state.kinds.find(c => c.inAdding);
    //   const answerInAdding = kindInAdding ? kindInAdding.answers.find(q => q.inAdding) : null;
    //   if (answerInAdding) {
    //     answers.unshift(answerInAdding);
    //     console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
    //   }
    //   return {
    //     ...state,
    //     kinds: state.kinds.map(c => c._id === kind._id ? { ...kind, answers, inAdding: c.inAdding } : c),
    //     // keep mode
    //     loading: false
    //   }
    // }

    case ActionTypes.SET_KIND: {
      const { kind } = action.payload; // kind doesn't contain inViewving, inEditing, inAdding 
      const { answers } = kind;
      const cat = state.kinds.find(c => c._id === kind._id);
      const answerInAdding = cat!.answers.find(q => q.inAdding);
      if (answerInAdding) {
        answers.unshift(answerInAdding);
        console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
      }
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === kind._id
          ? { ...kind, answers, inViewing: c.inViewing, inEditing: c.inEditing, inAdding: c.inAdding }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_KIND: {
      const { kind } = action.payload;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === kind._id
          ? { ...kind, inViewing: true } // kind.answers are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingKind,
        loading: false
      };
    }

    case ActionTypes.EDIT_KIND: {
      const { kind } = action.payload;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === kind._id
          ? { ...kind, inEditing: true }
          : {...c, inEditing: false }
        ),
        mode: Mode.EditingKind,
        loading: false
      };
    }

    case ActionTypes.DELETE: {
      const { _id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        kinds: state.kinds.filter(c => c._id !== _id)
      };
    }

    case ActionTypes.CANCEL_KIND_FORM:
    case ActionTypes.CLOSE_KIND_FORM: {
      const kinds = state.mode === Mode.AddingKind
        ? state.kinds.filter(c => !c.inAdding)
        : state.kinds
      return {
        ...state,
        mode: Mode.NULL,
        kinds: kinds.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    // First we add a new answer to the kind.guestions
    // After user clicks Save, we call createAnswer 
    case ActionTypes.ADD_ANSWER: {
      const { kindInfo } = action.payload;
      const { _id, level } = kindInfo;
      const answer: IAnswer = {
        ...initialAnswer,
        parentKind: _id,
        level,
        inAdding: true
      }
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === _id
          ? { ...c, answers: [answer, ...c.answers], inAdding: true }
          : { ...c, inAdding: false }),
        mode: Mode.AddingAnswer
      };
    }

    case ActionTypes.VIEW_ANSWER: {
      const { answer } = action.payload;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === answer.parentKind
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
      const { parentKind, _id } = answer;
      const inAdding = state.mode === Mode.AddingAnswer;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const kinds = state.kinds.map(c => c._id === parentKind
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
        kinds: state.kinds.map(c => c._id === answer.parentKind
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
      const { _id, parentKind } = answer;
      return {
        ...state,
        kinds: state.kinds.map(c => c._id === parentKind
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
      const kind = state.kinds.find(c => c._id === answer.parentKind)
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
        kinds: state.kinds.map(c => c._id === answer.parentKind
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

function markForClean(kinds: IKind[], parent_id: IDBValidKey) {
  let arr = kinds
    .filter(kind => kind.parentKind === parent_id)

  arr.forEach(kind => {
    arr = arr.concat(markForClean(kinds, kind._id!))
  })
  return arr
}
