import React, { createContext, useContext, useReducer, Dispatch, useCallback } from "react";

import { IGlobalContext, ROLES, GlobalActionTypes, ILoginUser } from 'global/types'
import { globalReducer, initialGlobalState } from "global/globalReducer";

import { IUser } from "global/types";
//////////////////
// Initial data
import data from 'question-groups.json';
//import { IQuestionGroupData, IQuestionData } from 'global/types'
import { ICategory, IQuestion } from 'categories/types';

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(globalReducer, initialGlobalState);

  const health = useCallback(() => {
    const url = `api/health`;
    // axios
    //   .post(url)
    //   .then(({ status }) => {
    //     if (status === 200) {
    //       console.log('health successfull:', status)
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //     }
    //   })
    //   .catch((err: any | AxiosError) => {
    //     console.log(err);
    //   });
  }, []);

  const signInUser = useCallback(async (loginUser: ILoginUser): Promise<any> => {
    console.log("signInUser", { loginUser })
    try {
      // const res = await axios.post(`/api/users/sign-in-user`, { ...loginUser, date: new Date() });
      // const { status, data } = res;
      // if (status === 200) {
      const user: IUser = {
        _id: 0,
        userName: loginUser.userName,
        email: 'slavko.parezanin@gmail.com',
        role: ROLES.ADMIN,
        color: 'blue',
        level: 1,
        parentGroup: null,  // null is allowed because of registerUser, and will be set at Server
        created: {
          date: new Date(),
          by: {
            userId: '',
          }
        },
        confirmed: true
      }

      console.log('User successfully logged in', user)    
      dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user, wsName: 'ws' } })
      return true;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   dispatch({
      //     type: GlobalActionTypes.SET_ERROR, payload: {
      //       error: new Error('Status is not 200 status: ' + status)
      //     }
      //   })
      // }
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("")
        }
      });
      return false;
    }
  }, [dispatch]);


  const addInitialData = async (db: IDBDatabase): Promise<void> => {
    new Promise<void>((resolve) => {
      // Open a read/write DB transaction, ready for adding the data
      const transaction = db!.transaction(['QuestionGroup', 'Question'], 'readwrite');
      transaction.oncomplete = () => {
        console.log('trans complete')
        resolve();
      };
      transaction.onerror = () => {
        //alert(`${transaction.error}`);
        console.log(`${transaction.error}`);
      };
      const groupStore = transaction.objectStore('QuestionGroup');
      const questionStore = transaction.objectStore('Question');

      data.forEach(g => {
        const group: ICategory = {
          title: g.title,
          level: 1,
          questions: []
        }
        console.log('group', group);
        const groupRequest = groupStore.add(group);
        groupRequest.onsuccess = (event) => {
          console.log('dodao group');
          const groupId: IDBValidKey = groupRequest.result;
          // add questions
          g.questions.forEach(q => {
            const question: IQuestion = {
              groupId,
              title: q.title,
              source: q.source,
              status: q.status,
              questionAnswers: []
            }
            console.log('question', question)
            const questionRequest = questionStore.add(question);
            questionRequest.onsuccess = (event) => {
              console.log('dodao question')
            }
          })
        }
      })
    })
  }

  const openDB = useCallback(async (): Promise<any> => {
    try {
      const DBOpenRequest = window.indexedDB.open('SupportKnowledge', 1);

      DBOpenRequest.onerror = (event) => {
        alert('Error loading database SupportKnowledge.')
      };

      let db: IDBDatabase | null;
      DBOpenRequest.onsuccess = async (event) => {
        console.log('Database initialised SupportKnowledge.');
        // Store the result of opening the database in the db variable. This is used a lot below
        db = DBOpenRequest.result;
        dispatch({ type: GlobalActionTypes.SET_DB, payload: { db } })
      }
      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      //it is only implemented in recent browsers
      DBOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        db = event && event.target && (event.target as any).result;
        DBOpenRequest.onerror = (event: Event) => {
          console.error('Error loading database.');
        };

        // Create an objectStore for this database
        const objectStore = db!.createObjectStore('QuestionGroup', { autoIncrement: true });
        objectStore.createIndex('title_idx', 'title', { unique: true });

        // create an objectStore for Question
        const objectStore2 = db!.createObjectStore('Question', { autoIncrement: true });
        objectStore2.createIndex('groupId_idx', 'groupId', { unique: false });
        objectStore2.createIndex('title_idx', 'title', { unique: true });

        const txn: IDBTransaction = event && event.target && (event.target as any).transaction;
        txn.oncomplete = () => {
          addInitialData(db!);
        }
      }
      return true;
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("")
        }
      });
      return false;
    }
  }, [dispatch]);

  return (
    <GlobalContext.Provider value={{
      globalState, signInUser, openDB, health
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
};

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
