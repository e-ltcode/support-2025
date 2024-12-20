// import { useGlobalState } from 'global/GlobalProvider'
import React from 'react';
import { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IParentInfo, IFromUserAssignedAnswer
} from 'categories/types';
import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';
import { IDateAndBy } from 'global/types';
import { useGlobalState } from 'global/GlobalProvider';
import { IAnswer } from 'AnswerGroup/types';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { db } = globalState;
  // const { wsId } = globalState.authUser;

  const [state, dispatch] = useReducer(CategoriesReducer, initialCategoriesState);

  const getCategories = useCallback(({ title }: IParentInfo) => {
    //const url = `/api/categories/${wsId}-${parentCategory}`
    //const url = `/api/categories/${parentCategory}`
    console.log('FETCHING --->>> getCategories')

    // dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories: [] } });
    // return
    //dispatch({ type: ActionTypes.SET_LOADING })
    const objectStore = db!.transaction('QuestionGroup').objectStore('QuestionGroup');
    const list: ICategory[] = [];
    const cursor = objectStore.openCursor().onsuccess = (event) => {
      const cursor = (event.target as any).result;
      // Check if there are no (more) cursor items to iterate through
      if (!cursor) {
        // No more items to iterate through, we quit.
        dispatch({ type: ActionTypes.SET_CATEGORIES, payload: { categories: list } });
        return;
      }
      const category: ICategory = cursor.value;
      list.push({ _id: cursor.key, ...category })
      cursor.continue();
    }
    /*
    axios
      .get(url)
      .then(({ data }) => {
        const subCategories = data.map((c: ICategory) => ({
          ...c,
          questions: [],
          isExpanded: categoryIds ? categoryIds.includes(c._id!.toString()) : false
        }))
        dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
      */
  }, []);

  // const getCategoryQuestions = useCallback(({_id: IDBValidKey}) => {
  //    getCategory(_id!, ActionTypes.SET_CATEGORY)
  //    //(state.mode === Mode.AddingCategory || state.mode === Mode.AddingQuestion) 
  // }, []);

  const loadCategoryQuestions = useCallback(({ groupId }: IParentInfo) => {
    //    getCategory(_id!, ActionTypes.SET_CATEGORY)
    //    //(state.mode === Mode.AddingCategory || state.mode === Mode.AddingQuestion) 
    // Load Questions
    const questions: IQuestion[] = []
    const store = db!.transaction(['Question'], 'readwrite').objectStore('Question');
    // moze ovako, ali bolje je preko indexa
    // store.openCursor().onsuccess = (event) => {
    //   const cursor = event && (event.target as any).result;
    //   if (!cursor) {
    //     dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS, payload: { groupId: groupId!, questions } } );
    //     return;
    //   }
    //   const question = {_id: cursor.key, ...cursor.value};
    //   if (question.groupId === groupId) {
    //     questions.push(question)
    //   }
    //   cursor.continue();
    // };
    const groupIdIndex = store.index('groupId_idx');
    //let request = groupIdIndex.getAll(groupId);
    groupIdIndex.openCursor().onsuccess = (event) => {
      const cursor = event && (event.target as any).result;
      if (!cursor) {
        dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS, payload: { groupId: groupId!, questions } });
        return;
      }
      const question = { _id: cursor.key, ...cursor.value };
      // if (question.groupId === groupId) {
      questions.push(question)
      //}
      cursor.continue();
    };

  }, []);


  const createCategory = useCallback((category: ICategory) => {
    // dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    const transaction = db!.transaction(['QuestionGroup'], 'readwrite');
    transaction.oncomplete = () => {
      console.log('trans complete')
      // resolve();
      dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
      dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    };
    transaction.onerror = () => {
      //alert(`${transaction.error}`);
      console.log(`${transaction.error}`);
    };
    const groupStore = transaction.objectStore('QuestionGroup');
    const groupRequest = groupStore.add(category);
    groupRequest.onsuccess = (event) => {
      console.log('dodao group');
      const groupId: IDBValidKey = groupRequest.result;
      category._id = groupId!
    }
    transaction.commit();

    // axios
    //   .post(`/api/categories/create-category`, category)
    //   .then(({ status, data }) => {
    //     if (status === 200) {
    //       console.log('Category successfully created')
    //       dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...data, questions: [] } } });
    //       dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //       dispatch({
    //         type: ActionTypes.SET_ERROR,
    //         payload: {
    //           error: new AxiosError('Status is not 200 status:' + status)
    //         }
    //       })
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, []);


  const getCategory = (_id: IDBValidKey,
    type:
      ActionTypes.VIEW_CATEGORY |
      ActionTypes.EDIT_CATEGORY |
      ActionTypes.SET_CATEGORY
  ) => {
    //const url = `/api/categories/get-category/${_id}`
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!db) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: "db is null" } });
      return;
    }
    const objectStore = db.transaction('QuestionGroup').objectStore('QuestionGroup');
    objectStore.get(_id).onsuccess = function (event) {
      const category = (event.target as any).result || null;

      // // Load Questions
      // const objectStoreQuestions = db.transaction(['Question'], 'readwrite').objectStore('Question');
      // objectStoreQuestions.openCursor().onsuccess = (event) => {
      //   const cursor = event && (event.target as any).result;
      //   if (!cursor)
      //     return;
      //   const question = cursor.value;
      //   const { groupId, title } = question;
      //   if (_id === groupId) {
      //     category.questions.push(question)
      //   }
      //   cursor.continue();
      // };

      dispatch({ type, payload: { category: { _id, ...category } } });
    };
  };

  // axios
  //   .get(url)
  //   .then(({ data: category }) => {
  //     dispatch({ type, payload: { category } });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  //   });
  //};

  const viewCategory = useCallback((_id: IDBValidKey) => {
    getCategory(_id, ActionTypes.VIEW_CATEGORY)
  }, []);

  const editCategory = useCallback((_id: IDBValidKey) => {
    getCategory(_id, ActionTypes.EDIT_CATEGORY)
  }, []);

  const updateCategory = useCallback((category: ICategory) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    const transaction = db!.transaction(['QuestionGroup'], 'readwrite');
    transaction.oncomplete = () => {
      console.log('trans complete')
      dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
      dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    };
    transaction.onerror = () => {
      //alert(`${transaction.error}`);
      console.log(`${transaction.error}`);
    };
    const groupStore = transaction.objectStore('QuestionGroup');
    const cat = { ...category }
    delete cat['_id'];
    groupStore.put({ k: category._id, v: cat });
    const groupRequest = groupStore.add(category);
    groupRequest.onsuccess = (event) => {
      console.log('dodao group');
    }
    transaction.commit();
    // const url = `/api/categories/update-category/${category._id}`
    // axios
    //   .put(url, category)
    //   .then(({ status, data: category }) => {
    //     if (status === 200) {
    //       console.log("Category successfully updated");
    //       dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { category } });
    //       dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
    //       dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //       dispatch({
    //         type: ActionTypes.SET_ERROR,
    //         payload: { error: new AxiosError('Status is not 200 status:' + status) }
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, []);

  const deleteCategory = (_id: IDBValidKey) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .delete(`/api/categories/delete-category/${_id}`)
    //   .then(res => {
    //     if (res.status === 200) {
    //       console.log("Category successfully deleted");
    //       dispatch({ type: ActionTypes.DELETE, payload: { _id } });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const reloadCategoryNode = useCallback(async (categoryId: string, questionId: string | null): Promise<any> => {
    try {
      // const res = await axios.get(`/api/categories/get-parent-categories/${categoryId}`);
      // const { status, data } = res;
      // if (status === 200) {
      //   dispatch({
      //     type: ActionTypes.SET_PARENT_CATEGORIES, payload: {
      //       parentCategories: {
      //         categoryId,
      //         questionId,
      //         categoryIds: data.map((c: { _id: string, title: string }) => c._id)
      //       }
      //     }
      //   })
      // }
    }
    catch (err) {
      console.error(err);
    }
    return false;
  }, [dispatch]);

  /////////////
  // Questions
  //

  // const getQuestions = useCallback(({ title }: IParentInfo) => {
  //   //const url = `/api/questions/${wsId}-${parentQuestion}`
  //   //const url = `/api/questions/${parentQuestion}`
  //   console.log('FETCHING --->>> getQuestions')

  //   // dispatch({ type: ActionTypes.SET_SUB_QUESTIONS, payload: { subQuestions: [] } });
  //   // return
  //   //dispatch({ type: ActionTypes.SET_LOADING })
  //   const objectStore = db!.transaction('QuestionGroup').objectStore('QuestionGroup');
  //   const list: IQuestion[] = [];
  //   const cursor = objectStore.openCursor().onsuccess = (event) => {
  //     const cursor = (event.target as any).result;
  //     // Check if there are no (more) cursor items to iterate through
  //     if (!cursor) {
  //       // No more items to iterate through, we quit.
  //       dispatch({ type: ActionTypes.SET_QUESTIONS, payload: { questions: list } });
  //       return;
  //     }
  //     const question: IQuestion = cursor.value;
  //     list.push({ _id: cursor.key, ...question })
  //     cursor.continue();
  //   }
  //   /*
  //   axios
  //     .get(url)
  //     .then(({ data }) => {
  //       const subQuestions = data.map((c: IQuestion) => ({
  //         ...c,
  //         questions: [],
  //         isExpanded: questionIds ? questionIds.includes(c._id!.toString()) : false
  //       }))
  //       dispatch({ type: ActionTypes.SET_SUB_QUESTIONS, payload: { subQuestions } });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  //     });
  //     */
  // }, []);

  // const getQuestionQuestions = useCallback(({_id } : IDBValidKey) => {
  //   getQuestion(_id!, ActionTypes.SET_QUESTION)
  //   //(state.mode === Mode.AddingQuestion || state.mode === Mode.AddingQuestion) 
  // }, []);

  const createQuestion = useCallback(async (question: IQuestion, fromModal: boolean): Promise<any> => {
    // dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    const transaction = db!.transaction(['Question'], 'readwrite');
    transaction.oncomplete = () => {
      console.log('trans complete')
      // resolve();
      dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: { ...question, questionAnswers: [] } } });
      dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question } }) // TODO proveri payload
    };
    transaction.onerror = () => {
      //alert(`${transaction.error}`);
      console.log(`${transaction.error}`);
    };
    const groupStore = transaction.objectStore('QuestionGroup');
    const questionRequest = groupStore.add(question);
    questionRequest.onsuccess = (event) => {
      console.log('dodao question');
      const questionId: IDBValidKey = questionRequest.result;
      question._id = questionId!
    }
    transaction.commit();

    // axios
    //   .post(`/api/questions/create-question`, question)
    //   .then(({ status, data }) => {
    //     if (status === 200) {
    //       console.log('Question successfully created')
    //       dispatch({ type: ActionTypes.SET_ADDED_QUESTION, payload: { question: { ...data, questions: [] } } });
    //       dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //       dispatch({
    //         type: ActionTypes.SET_ERROR,
    //         payload: {
    //           error: new AxiosError('Status is not 200 status:' + status)
    //         }
    //       })
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, []);


  const getQuestion = (_id: IDBValidKey,
    type:
      ActionTypes.VIEW_QUESTION |
      ActionTypes.EDIT_QUESTION |
      ActionTypes.SET_QUESTION
  ) => {
    //const url = `/api/questions/get-question/${_id}`
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!db) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: "db is null" } });
      return;
    }
    const objectStore = db.transaction('Question').objectStore('Question');
    objectStore.get(_id).onsuccess = function (event) {
      const question = (event.target as any).result || null;

      // Load QuestionAnswers
      // const objectStoreAnswers = db.transaction(['Question'], 'readwrite').objectStore('Question');
      // objectStoreAnswers.openCursor().onsuccess = (event) => {
      //   const cursor = event && (event.target as any).result;
      //   if (!cursor)
      //     return;
      //   const question = cursor.value;
      //   const { groupId, title } = question;
      //   if (_id == groupId) {
      //     question.questions.push(question)
      //   }
      //   cursor.continue();
      // };

      dispatch({ type, payload: { question: { _id, ...question } } });
    };
  };

  // axios
  //   .get(url)
  //   .then(({ data: question }) => {
  //     dispatch({ type, payload: { question } });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  //   });
  //};

  const viewQuestion = useCallback((_id: IDBValidKey) => {
    getQuestion(_id, ActionTypes.VIEW_QUESTION)
  }, []);

  const editQuestion = useCallback((_id: IDBValidKey) => {
    getQuestion(_id, ActionTypes.EDIT_QUESTION)
  }, []);

  const updateQuestion = useCallback(async (question: IQuestion): Promise<any> => {
    dispatch({ type: ActionTypes.SET_LOADING })
    const transaction = db!.transaction(['Question'], 'readwrite');
    transaction.oncomplete = () => {
      console.log('trans complete')
      dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
      //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
    };
    transaction.onerror = () => {
      //alert(`${transaction.error}`);
      console.log(`${transaction.error}`);
    };
    const store = transaction.objectStore('Question');
    const cat = { ...question }
    delete cat['_id'];
    store.put(cat, question._id);
    const groupRequest = store.add(question);
    groupRequest.onsuccess = (event) => {
      console.log('put question success');
    }
    transaction.commit();
    // const url = `/api/questions/update-question/${question._id}`
    // axios
    //   .put(url, question)
    //   .then(({ status, data: question }) => {
    //     if (status === 200) {
    //       console.log("Question successfully updated");
    //       dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { question } });
    //       dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
    //       dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //       dispatch({
    //         type: ActionTypes.SET_ERROR,
    //         payload: { error: new AxiosError('Status is not 200 status:' + status) }
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, []);

  const createAnswer = useCallback(async (answer: IAnswer): Promise<any> => {
    // try {
    //   const res = await axios.post(`/api/answers/create-answer`, answer);
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log('Answer successfully created')
    //     return data;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //   }
    // }
    // catch (error) {
    //   console.log(error);
    // }
    return null;
  }, []);

  const deleteQuestion = (_id: IDBValidKey) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .delete(`/api/questions/delete-question/${_id}`)
    //   .then(res => {
    //     if (res.status === 200) {
    //       console.log("Question successfully deleted");
    //       dispatch({ type: ActionTypes.DELETE, payload: { _id } });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };




  const contextValue: ICategoriesContext = {
    state,
    reloadCategoryNode,
    loadCategoryQuestions,
    getCategories, createCategory, viewCategory, editCategory, updateCategory, deleteCategory,
    createQuestion, viewQuestion, editQuestion, updateQuestion, deleteQuestion,
    //assignQuestionAnswer, unAssignQuestionAnswer, 
    createAnswer
  }
  return (
    <CategoriesContext.Provider value={contextValue}>
      <CategoryDispatchContext.Provider value={dispatch}>
        {children}
      </CategoryDispatchContext.Provider>
    </CategoriesContext.Provider>
  );
}

export function useCategoryContext() {
  return useContext(CategoriesContext);
}

export const useCategoryDispatch = () => {
  return useContext(CategoryDispatchContext)
};

