import React, { createContext, useContext, useReducer, Dispatch, useCallback } from "react";

import { IGlobalContext, ILoginUser, ROLES, GlobalActionTypes, IGroupData } from 'global/types'
import { globalReducer, initialGlobalState } from "global/globalReducer";

import { IUser, ICategoryData, IQuestionData } from "global/types";
import { ICategory, IQuestion } from "categories/types";
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb'

//////////////////
// Initial data
import categoryData from './categories-questions.json';
import groupData from './groups-answers.json';
import { IAnswer, IGroup } from "groups/types";

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

  // const sleep = (ms: number | undefined) => new Promise(r => setTimeout(r, ms));

  const addGroup = async (
    dbp: IDBPDatabase,
    //tx: IDBPTransaction<unknown, string[], "readwrite">, 
    groupData: IGroupData,
    parentGroup: string,
    level: number)
    : Promise<void> => {
    const { id, title, groups, answers } = groupData;

    // if (id === 'SAFARI') {
    //   const q = {
    //     title: '',
    //     source: 0,
    //     status: 0,
    //   }
    //   for (var i = 999; i > 100; i--) {
    //     questions!.push({ ...q, title: 'Zagor_' + i });
    //   }
    // }

    const g: IGroup = {
      wsId: '',
      id,
      parentGroup,
      hasSubGroups: groups ? groups.length > 0 : false,
      title,
      level,
      answers: [],
      numOfAnswers: answers?.length || 0,
      created: {
        date: new Date(),
        by: {
          userId: '',
          userName: 'ADMIN'
        }
      },
    }
    await dbp.add('Groups', g);
    console.log('group added', g);
    
    if (answers) {
      let i = 0;
      while (i < answers.length) {
        const qData = answers[i]
        const answer: IAnswer = {
          parentGroup: g.id,
          title: qData.title,
          words: qData.title.toLowerCase().replaceAll('?', '').split(' '),
          source: 0,
          status: 0,
          level: 2,
          wsId: ""
        }
        await dbp.add('Answers', answer);
        i++;
      }
    }

    if (groups) {
      const parentGroup = g.id;
      let j = 0;
      const parentGroups = groups;
      while (j < parentGroups.length) {
        addGroup(dbp, parentGroups[j], parentGroup, level + 1);
        j++;
      }
    }
    Promise.resolve();
  }

  const addCategory = async (
    dbp: IDBPDatabase,
    //tx: IDBPTransaction<unknown, string[], "readwrite">, 
    categoryData: ICategoryData,
    parentCategory: string,
    level: number)
    : Promise<void> => {
    const { id, title, categories, questions } = categoryData;

    if (id === 'SAFARI') {
      const q = {
        title: '',
        source: 0,
        status: 0,
      }
      for (var i = 999; i > 100; i--) {
        questions!.push({ ...q, title: 'Zagor_' + i });
      }
    }

    const cat: ICategory = {
      wsId: '',
      id,
      parentCategory,
      hasSubCategories: categories ? categories.length > 0 : false,
      title,
      level,
      questions: [],
      numOfQuestions: questions?.length || 0,
      created: {
        date: new Date(),
        by: {
          userId: '',
          userName: 'ADMIN'
        }
      },
    }
    await dbp.add('Categories', cat);
    console.log('category added', cat);
    
    if (questions) {
      let i = 0;
      while (i < questions.length) {
        const qData = questions[i]
        const question: IQuestion = {
          parentCategory: cat.id,
          title: qData.title,
          words: qData.title.toLowerCase().replaceAll('?', '').split(' '),
          source: 0,
          status: 0,
          questionAnswers: [],
          level: 2,
          wsId: ""
        }
        await dbp.add('Questions', question);
        i++;
      }
    }

    if (categories) {
      const parentCategory = cat.id;
      let j = 0;
      const parentCategories = categories;
      while (j < parentCategories.length) {
        addCategory(dbp, parentCategories[j], parentCategory, level + 1);
        j++;
      }
    }
    Promise.resolve();
  }

  const addInitialData = async (dbp: IDBPDatabase): Promise<void> => {
    new Promise<void>(async (resolve) => {
      // Categries -> Questions
      try {
        let level = 1;
        let i = 0;
        const data: ICategoryData[] = categoryData;
        const tx = dbp.transaction(['Categories', 'Questions'], 'readwrite');
        while (i < data.length) {
          addCategory(dbp, data[i], 'null', level);
          i++;
        }
        console.log('trans categories complete')
        // dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
        await tx.done;
        // resolve();
      }
      catch (err) {
        console.log('error', err);
      }

      // Groups -> Answers
      try {
        let level = 1;
        let i = 0;
        const data: IGroupData[] = groupData;
        const tx = dbp.transaction(['Groups', 'Answers'], 'readwrite');
        while (i < data.length) {
          addGroup(dbp, data[i], 'null', level);
          i++;
        }
        console.log('trans groups complete')
        // dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
        await tx.done;
        resolve();
      }
      catch (err) {
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

          // Categories
          const store = db.createObjectStore('Categories', { keyPath: 'id' });
          store.createIndex('title_idx', 'title', { unique: true });
          store.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          // Questions
          const questionsStore = db.createObjectStore('Questions', { autoIncrement: true });
          questionsStore.createIndex('words_idx', 'words', { multiEntry: true, unique: false });
          questionsStore.createIndex('parentCategory_title_idx', ['parentCategory', 'title'], { unique: true });
          questionsStore.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          // Groups
          const groupStore = db.createObjectStore('Groups', { keyPath: 'id' });
          groupStore.createIndex('title_idx', 'title', { unique: true });
          groupStore.createIndex('parentGroup_idx', 'parentGroup', { unique: false });

          // Answers
          const answerStore = db.createObjectStore('Answers', { autoIncrement: true });
          answerStore.createIndex('words_idx', 'words', { multiEntry: true, unique: false });
          answerStore.createIndex('parentGroup_title_idx', ['parentGroup', 'title'], { unique: true });
          answerStore.createIndex('parentGroup_idx', 'parentGroup', { unique: false });

          initializeData = true;
        },
        terminated() {
          alert('terminated')
        }
      });
      // Add initial data
      if (initializeData) {
        await addInitialData(dbp);
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
