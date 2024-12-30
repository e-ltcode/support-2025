import { useGlobalState } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';


import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IParentInfo, IFromUserAssignedAnswer
} from 'categories/types';
import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';
import { IDateAndBy } from 'global/types';
import { IAnswer } from 'kinds/types';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { dbp } = globalState;
  const { wsId } = globalState.authUser;

  const [state, dispatch] = useReducer(CategoriesReducer, initialCategoriesState);
  const { parentCategories } = state;
  const { categoryIds } = parentCategories!;

  const reloadCategoryNode = useCallback(async (categoryId: string, questionId: string | null): Promise<any> => {
    try {
      const ids: { id: string, title: string }[] = [];
      let category = await dbp!.get("Groups", categoryId);
      if (category) {
        ids.push({ id: category.id, title: category.title });
      }
      while (category && category.parentCategory !== 'null') {
        category = await dbp!.get("Groups", category.parentCategory);
        if (category) {
          ids.push({ id: category.id, title: category.title })
        }
      }
      dispatch({
        type: ActionTypes.SET_PARENT_CATEGORIES, payload: {
          parentCategories: {
            categoryId,
            questionId,
            categoryIds: ids.map(c => c.id)
          }
        }
      })

      // const res = await axios.get(`/api/categories/get-parent-categories/${categoryId}`);
      // const { status, data } = res;
      // if (status === 200) {
      //   console.log('!!! get-parent-categories', { cId: categoryId.toString(), data })
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

  const getSubCats = useCallback(async ({ parentCategory, level }: IParentInfo): Promise<any> => {
    try {
      // const url = `/api/categories/${wsId}-${parentCategory}`
      // const res = await axios.get(url)
      // const { status, data } = res;
      // if (status === 200) {
      //   const subCategories = data.map((c: ICategory) => ({
      //     ...c,
      //     questions: [],
      //     isExpanded: false
      //   }))
      //   return subCategories;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   dispatch({
      //     type: ActionTypes.SET_ERROR,
      //     payload: { error: new Error('Status is not 200 status:' + status) }
      //   });
      // }
    }
    catch (err: any | Error) {
      console.log(err);
    }
  }, [wsId]);

  const getSubCategories = useCallback(async ({ parentCategory, level }: IParentInfo) => {
    //const url = `/api/categories/${wsId}-${parentCategory}`
    try {
      const tx = dbp!.transaction('Groups')
      const index = tx.store.index('parentCategory_idx');
      const list: ICategory[] = [];
      for await (const cursor of index.iterate(parentCategory)) {
        console.log(cursor.value);
        list.push(cursor.value)
      }
      await tx.done;
      const subCategories = list.map((c: ICategory) => ({
        ...c,
        questions: [],
        page: 0,
        isExpanded: categoryIds ? categoryIds.includes(c.id) : false
      }))
      dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
    }
    catch (err) {
      console.log(err)
    }
    //console.log('FETCHING --->>> getSubCategories', level, parentCategory)
    //dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const subCategories = data.map((c: ICategory) => ({
    //       ...c,
    //       questions: [],
    //       isExpanded: categoryIds ? categoryIds.includes(c._id!.toString()) : false
    //     }))
    //     dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, [wsId, categoryIds]);

  const createCategory = useCallback(async (category: ICategory) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    await dbp!.add('Groups', category);
    console.log('Category successfully created')
    dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
    dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
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
    //           error: new Error('Status is not 200 status:' + status)
    //         }
    //       })
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
    // const transaction = db!.transaction(['QuestionGroup'], 'readwrite');
    // transaction.oncomplete = () => {
    //   console.log('trans complete')
    //   // resolve();
    //   dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
    //   dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    // };
    // transaction.onerror = () => {
    //   //alert(`${transaction.error}`);
    //   console.log(`${transaction.error}`);
    // };
    // const groupStore = transaction.objectStore('QuestionGroup');
    // const groupRequest = groupStore.add(category);
    // groupRequest.onsuccess = (event) => {
    //   console.log('dodao group');
    //   const groupId: IDBValidKey = groupRequest.result;
    //   category._id = groupId!
    // }
    // transaction.commit();
  }, []);

  const setCategory = async (id: string, type: ActionTypes.SET_CATEGORY) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const category = await dbp.get("Groups", id);
    dispatch({ type, payload: { category: { ...category } } });
  };

  const getCategory = async (id: string, type: ActionTypes.VIEW_CATEGORY | ActionTypes.EDIT_CATEGORY) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const category = await dbp.get("Groups", id);
    dispatch({
      type, payload: {
        category: {
          ...category,
          questionsPaging: {
            page: 0,
            numOfQuestions: 0,
            numOfQuestionsTotal: 0,
            isLoading: false
          }
        }
      }
    });
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data: category }) => {
    //     dispatch({ type, payload: { category } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewCategory = useCallback((id: string) => {
    getCategory(id, ActionTypes.VIEW_CATEGORY)
  }, []);

  const editCategory = useCallback((id: string) => {
    getCategory(id, ActionTypes.EDIT_CATEGORY)
  }, []);

  const updateCategory = useCallback((category: ICategory) => {
    dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: category.id, isLoading: false } })
    //const url = `/api/categories/update-category/${category.id}`
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
    //         payload: { error: new Error('Status is not 200 status:' + status) }
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

  /////////////
  // Questions
  //


  // const getCategoryQuestions = useCallback(({ parentCategory: _id, level }: IParentInfo) => {
  //   getCategory(_id!, ActionTypes.SET_CATEGORY)
  //   //(state.mode === Mode.AddingCategory || state.mode === Mode.AddingQuestion) 
  // }, []);


  const pageSize = 30;
  const loadCategoryQuestions = useCallback(async ({ parentCategory, page }: IParentInfo) => {
    //    getCategory(_id!, ActionTypes.SET_CATEGORY)
    //    //(state.mode === Mode.AddingCategory || state.mode === Mode.AddingQuestion) 
    // Load Questions
    const questions: IQuestion[] = [];
    try {
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory, isLoading: true } })
      let n = 0;
      const tx = dbp!.transaction('Questions')
      const index = tx.store.index('parentCategory_title_idx');
      for await (const cursor of index.iterate(IDBKeyRange.bound([parentCategory, ''], [parentCategory, 'ZZZZZ'], true, true))) {
        if (page !== 0)
          cursor.advance(pageSize * page!);
        console.log(cursor.value.title);
        questions.push({ ...cursor.value, id: cursor.key })
        if (++n > pageSize)
          break;
      }
      // const index = tx.store.index('parentCategory_idx');
      // for await (const cursor of index.iterate(parentCategory)) {
      //   if (questionsPage !== 0)
      //     cursor.advance(pageSize! * questionsPage!);
      //   console.log(cursor.value);
      //   questions.push({ ...cursor.value, id: cursor.key })
      //   if (++n > pageSize!)
      //     break;
      // }
      await tx.done;
      dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS, payload: { groupId: parentCategory, questions, page: page! + 1  } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory, isLoading: false } })
    }

  }, []);


  // const getQuestionAnswers = useCallback((questionId: IDBValidKey) => {
  //   const url = `/api/questions/question-answers/${questionId}`
  //   axios
  //     .get(url)
  //     .then(({ data }) => {
  //       const answers: IQuestionAnswer[] = data;
  //       console.log(answers)
  //       dispatch({type:  ActionTypes.SET_QUESTION_ANSWERS, payload: { answers } });
  //     })
  //     .catch((error) => { 
  //       console.log(error);
  //       dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  //     });
  //   }, []);

  const createQuestion = useCallback(async (question: IQuestion, fromModal: boolean): Promise<any> => {
    try {
      // const url = '/api/questions/create-question'
      // const res = await axios.post(url, question)
      // const { status, data } = res;
      // if (status === 200) {
      //   console.log("Question successfully created");
      //   // TODO check setting inViewing, inEditing, inAdding to false
      //   dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: data } });
      //   return data;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   if (fromModal)
      //     return { message: 'Status is not 200, ' + status };

      //   dispatch({
      //     type: ActionTypes.SET_ERROR,
      //     payload: {
      //       error: new Error('Status is not 200 status:' + status)
      //     }
      //   })
      //   return {};
      // }
    }
    catch (err: any | Error) {
      // if (axios.isError(err)) {
      //   if (fromModal)
      //     return { message: err.response?.data };

      //   dispatch({
      //     type: ActionTypes.SET_ERROR,
      //     payload: {
      //       error: new Error(axios.isError(err) ? err.response?.data : err)
      //     }
      //   })
      //}
      //else {
      console.log(err);
      //}
      return {}
    }
  }, []);


  const getQuestion = async (id: string, type: ActionTypes.VIEW_QUESTION | ActionTypes.EDIT_QUESTION) => {
    const url = `/api/questions/get-question/${id}`;
    try {
      const question = await dbp!.get("Questions", id);
      dispatch({ type, payload: { question } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }

    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const question: IQuestion = data;
    //     const { fromUserAssignedAnswer } = question;
    //     question.questionAnswers.forEach(questionAnswer => {
    //       const user = fromUserAssignedAnswer!.find((fromUser: IFromUserAssignedAnswer) => fromUser._id === questionAnswer.assigned.by.userId);
    //       questionAnswer.user.createdBy = user ? user.createdBy : 'unknown'
    //     })
    //     delete question.fromUserAssignedAnswer;
    //     dispatch({ type, payload: { question } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewQuestion = useCallback((id: string) => {
    getQuestion(id, ActionTypes.VIEW_QUESTION);
  }, []);

  const editQuestion = useCallback((id: string) => {
    getQuestion(id, ActionTypes.EDIT_QUESTION);
  }, []);

  const updateQuestion = useCallback(async (question: IQuestion): Promise<any> => {
    // try {
    //   const url = `/api/questions/update-question/${question._id}`
    //   const res = await axios.put(url, question)
    //   const { status, data } = res;
    //   if (status === 200) {
    //     // TODO check setting inViewing, inEditing, inAdding to false
    //     console.log("Question successfully updated");
    //     dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: data } });
    //     return data;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error('Status is not 200 status:' + status)
    //       }
    //     })
    //     return {};
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error(axios.isError(err) ? err.response?.data : err)
    //       }
    //     })
    //     return {};
    //   }
    //   else {
    //     console.log(err);
    //   }
    //   return {}
    // }
  }, []);

  const assignQuestionAnswer = useCallback(async (questionId: IDBValidKey, answerId: IDBValidKey, assigned: IDateAndBy): Promise<any> => {
    // try {
    //   const url = `/api/questions/assign-question-answer/${questionId}`;
    //   const res = await axios.put(url, { answerId, assigned })
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log("Answer successfully assigned to Question");
    //     dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: data } });
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: { error: new Error('Status is not 200 status:' + status) }
    //     });
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: err
    //       }
    //     })
    //   }
    //   else {
    //     console.log(err);
    //   }
    // }
  }, []);


  const unAssignQuestionAnswer = useCallback(async (questionId: IDBValidKey, answerId: IDBValidKey): Promise<any> => {
    // try {
    //   const url = `/api/questions/unassign-question-answer/${questionId}`
    //   const res = await axios.put(url, { answerId });
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log("Answer successfully un-assigned from Question");
    //     dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: data } });
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: { error: new Error('Status is not 200 status:' + status) }
    //     });
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: err
    //       }
    //     })
    //   }
    //   else {
    //     console.log(err);
    //   }
    // }
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
    //       dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { question: res.data.question } });
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
    getSubCategories, getSubCats, createCategory, viewCategory, editCategory, updateCategory, deleteCategory,
    loadCategoryQuestions, createQuestion, viewQuestion, editQuestion, updateQuestion, deleteQuestion,
    assignQuestionAnswer, unAssignQuestionAnswer, createAnswer
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

