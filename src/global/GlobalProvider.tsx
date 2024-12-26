import React, { createContext, useContext, useReducer, Dispatch, useCallback } from "react";

import { IGlobalContext, ILoginUser, ROLES, GlobalActionTypes } from 'global/types'
import { globalReducer, initialGlobalState } from "global/globalReducer";

import { IUser } from "global/types";
import { ICategory, IQuestion } from "categories/types";
import { IDBPDatabase, openDB } from 'idb'

//////////////////
// Initial data
import data from 'question-groups.json';

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
    //   .catch((err: any | Error) => {
    //     console.log(err);
    //   });
  }, []);

  const registerUser = useCallback(async (loginUser: ILoginUser) => {
    const user: IUser = {
      id: '',
      wsId: loginUser.wsId,
      userName: loginUser.userName,
      password: loginUser.password,
      level: 0,
      parentGroup: null,
      role: ROLES.VIEWER,
      email: loginUser.email!,
      color: 'blue',
      confirmed: false
    }
    const url = `/api/users/register-user`;
    try {
      console.log("registerUser", { loginUser })
      const user: IUser = { ...loginUser, id: '', parentGroup: 'null', role: ROLES.ADMIN, color: 'blue', level: 0, confirmed: true, userId: '123' };
      dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user, wsName: '' } });
      return user;
      // const res = await axios.post(url, { ...user, wsName: loginUser.wsName });
      // const { status, data } = res;
      // if (status === 200) {
      //   console.log('User successfully registered:', data)
      //   dispatch({
      //     type: GlobalActionTypes.AUTHENTICATE, payload: {
      //       user: data.user,
      //       wsName: data.wsName
      //     }
      //   })
      //   return data.user;
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
          error: new Error(err)
        }
      });
    }
    return null;
  }, [dispatch]);


  const signInUser = useCallback(async (loginUser: ILoginUser): Promise<any> => {

    console.log("signInUser", { loginUser })

    const user: IUser = { ...loginUser, id: loginUser.userId!, parentGroup: 'null', color: 'blue', level: 0, role: ROLES.ADMIN, confirmed: true }
    dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user, wsName: '' } })
    return true;
    // try {
    //   const res = await axios.post(`/api/users/sign-in-user`, { ...loginUser, date: new Date() });
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log('User successfully logged in', data)
    //     dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user: data, wsName: loginUser.wsName } })
    //     return true;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: GlobalActionTypes.SET_ERROR, payload: {
    //         error: new Error('Status is not 200 status: ' + status)
    //       }
    //     })
    //   }
    // }
    // catch (err: any | Error) {
    //   console.log(err);
    //   dispatch({
    //     type: GlobalActionTypes.SET_ERROR,
    //     payload: {
    //       error: new Error(axios.isError(err) ? err.response?.data : err)
    //     }
    //   });
    //   return false;
    // }
  }, [dispatch]);


  const getKindOptions = useCallback(async (): Promise<any> => {
    // try {
    //   const res = await axios.get(`/api/kinds/get-options/${globalState.authUser.wsId}`);
    //   const { status, data } = res;
    //   if (status === 200) {
    //     data.unshift({ label: 'Select', value: '000000000000000000000000' })
    //     dispatch({ type: GlobalActionTypes.SET_KIND_OPTIONS, payload: { kindOptions: data } });
    //   }
    //   else {
    //     dispatch({
    //       type: GlobalActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error('Status is not 200 status:' + status)
    //       }
    //     })
    //   }
    // }
    // catch (err: any | Error) {
    //   dispatch({
    //     type: GlobalActionTypes.SET_ERROR,
    //     payload: {
    //       error: new Error(axios.isError(err) ? err.response?.data : err)
    //     }
    //   })
    // }
  }, [globalState.authUser.wsId]);


  const addInitialData = async (dbp: IDBPDatabase): Promise<void> => {
    new Promise<void>(async (resolve) => {
      // Open a read/write DB transaction, ready for adding the data
      const tx = dbp.transaction(['Groups', 'Questions'], 'readwrite');
      // tx.oncomplete = () => {
      //   console.log('trans complete')
      //   dispatch({ type: GlobalActionTypes.SET_DB, payload: { db } })
      //   resolve();
      // };
      // tx.onerror = () => {
      //   //alert(`${transaction.error}`);
      //   console.log(`${tx.error}`);
      // };
      try {
        data.forEach(async g => {
          const { id, level, parentCategory, title, questions } = g;
          const group: ICategory = {
            wsId: '',
            id,
            parentCategory: parentCategory ?? 'null',
            title,
            level,
            questions: [],
            created: {
              date: new Date(),
              by: {
                userId: '',
                userName: 'ADMIN'
              }
            },
          }
          console.log('group', group);
          await dbp.add('Groups', group);
          console.log('group added');
          if (questions) {
            questions.forEach(async q => {
              const question: IQuestion = {
                parentCategory: group.id,
                title: q.title,
                source: 0,
                status: 0,
                questionAnswers: [],
                level: 0,
                wsId: "",
                id: ""
              }
              await dbp.add('Questions', question);
              console.log('question added');
            })
          }
          // groupRequest.onsuccess = (event) => {
          //   console.log('dodao group');
          //   const groupId: IDBValidKey = groupRequest.result;
          //   // add questions
          //   g.questions.forEach(q => {
          //     const question: IQuestion = {
          //       groupId,
          //       title: q.title,
          //       source: q.source,
          //       status: q.status,
          //       questionAnswers: []
          //     }
          //     console.log('question', question)
          //     const questionRequest = questionStore.add(question);
          //     questionRequest.onsuccess = (event) => {
          //       console.log('dodao question')
          //     }
          //   })
          // }
        })
        await tx.done;
        console.log('trans complete')
        // dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
        resolve();

      } catch (err) {
        console.log('error', err);
      }
    })
  }

  const OpenDB = useCallback(async (): Promise<any> => {
    try {
      let initializeData = false;
      const dbp = await openDB('SupportKnowledge', 1, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
          //console.error('Error loading database.');

          // Question Groups
          const store = db.createObjectStore('Groups', { keyPath: 'id' });
          store.createIndex('title_idx', 'title', { unique: true });
          // store.createIndex('created_idx', 'created.date', { unique: false });
          store.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          // Questions
          const questionsStore = db.createObjectStore('Questions', { autoIncrement: true });
          questionsStore.createIndex('title_idx', 'title', { unique: true });
          questionsStore.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          initializeData = true;

          //const txn: IDBTransaction = event && event.target && (event.target as any).transaction;
          //txn.oncomplete = () => {
          //}
        },
        terminated() {
          alert('terminated')
        }
      });
      // Add initial data
      if (initializeData) {
        addInitialData(dbp);
      }
      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      //it is only implemented in recent browsers
      dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
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
      globalState, health, registerUser, signInUser, OpenDB, getKindOptions
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
