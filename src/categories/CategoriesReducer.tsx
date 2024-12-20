import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions } from "categories/types";

export const initialQuestion: IQuestion = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  groupId: 0,
  //parentCategory: '',
  //categoryTitle: '',
  title: '',
  //level: 0,
  questionAnswers: [],
  source: 0,
  status: 0
}

export const initialCategory: ICategory = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  _id: 0,
  title: '',
  level: 0,
  questions: [],
  isExpanded: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  loading: false,
  categories: [],
  currentCategoryExpanded: '',
  lastCategoryExpanded: null,
  categoryId_questionId_done: null,
}

let initialStateFromLocalStorage: ICategoriesState | undefined;

const hasMissingProps = (): boolean => {
  let b = false;
  const keys = Object.keys(initialStateFromLocalStorage!)
  Object.keys(initialState).forEach((prop: string) => {
    if (!keys.includes(prop)) {
      b = true;
      console.log('missing prop:', prop, ' try with SignOut')
    }
  })
  return b;
}

if ('localStorage' in window) {
  const s = localStorage.getItem('CATEGORIES_STATE');
  if (s !== null) {
    initialStateFromLocalStorage = JSON.parse(s);
    if (hasMissingProps()) {
      initialStateFromLocalStorage = undefined;
    }
    else {
      const { currentCategoryExpanded  } = initialStateFromLocalStorage!;
      initialStateFromLocalStorage = {
        ...initialStateFromLocalStorage!,
        lastCategoryExpanded: currentCategoryExpanded,
        
      }
      console.log('categories initialState FromLocalStorage', { initialStateFromLocalStorage });
    }
  }
}

export const initialCategoriesState: ICategoriesState = initialStateFromLocalStorage
  ? initialStateFromLocalStorage
  : initialState

export const CategoriesReducer: Reducer<ICategoriesState, CategoriesActions> = (state, action) => {
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.SET_EXPANDED
  ];
  if (aTypesToStore.includes(action.type)) {
    const value = JSON.stringify({
      ...initialState,
      currentCategoryExpanded: newState.currentCategoryExpanded
    })
    localStorage.setItem('CATEGORIES_STATE', value);
  }
  return newState;
}

const reducer = (state: ICategoriesState, action: CategoriesActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return {
        ...state,
        error,
        loading: false
      };
    }

    case ActionTypes.SET_CATEGORIES: {
      const { categories } = action.payload;
      const newCategories = state.categories.concat(categories);
      return {
        ...state,
        categories: newCategories,
        loading: false
      };
    }

    case ActionTypes.ADD_CATEGORY: {
      const category: ICategory = {
        ...initialCategory,
        title: '',
        level: 1,
        inAdding: true
      }
      return {
        ...state,
        categories: [category, ...state.categories],
        mode: Mode.AddingCategory
      };
    }

    case ActionTypes.SET_ADDED_CATEGORY: {
      const { category } = action.payload;
      // category doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        categories: state.categories.map(c => c.inAdding ? category : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY: {
      const { category } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      const { questions } = category;
      const cat = state.categories.find(c => c._id === category._id);
      const questionInAdding = cat!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, questions, inViewing: c.inViewing, inEditing: c.inEditing, inAdding: c.inAdding, isExpanded: c.isExpanded }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY_QUESTIONS: {
      const { groupId, questions } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      const category = state.categories.find(c => c._id === groupId);
      const questionInAdding = category!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      return {
        ...state,
        categories: state.categories.map(c => c._id === groupId
          ? { ...c, questions, numOfQuestions: questions.length,
            inViewing: c.inViewing, 
            inEditing: c.inEditing, 
            inAdding: c.inAdding, 
            isExpanded: c.isExpanded 
          }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, inViewing: true, isExpanded: c.isExpanded } // category.questions are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingCategory,
        loading: false
      };
    }

    case ActionTypes.EDIT_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, inEditing: true, isExpanded: c.isExpanded }
          : { ...c, inEditing: false }
        ),
        mode: Mode.EditingCategory,
        loading: false
      };
    }

    case ActionTypes.DELETE: {
      const { _id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        categories: state.categories.filter(c => c._id !== _id)
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      const categories = state.mode === Mode.AddingCategory
        ? state.categories.filter(c => !c.inAdding)
        : state.categories
      return {
        ...state,
        mode: Mode.NULL,
        categories: categories.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { _id, expanding } = action.payload;
      let { categories } = state;
      if (!expanding) {
      }
      return {
        ...state,
        categories: categories.map(c => c._id === _id
          ? { ...c, inViewing: c.inViewing, inEditing: c.inEditing, isExpanded: expanding }
          : c
        ),
        mode: expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        currentCategoryExpanded: expanding ? _id.toString() : state.currentCategoryExpanded
      };
    }

    

    default:
      return state;  // TODO throw error
  }
};

// function markForClean(categories: ICategory[], parentCategory: string) {
//   let deca = categories
//     .filter(c => c.parentCategory === parentCategory)
//     .map(c => ({ _id: c._id, parentCategory: c.parentCategory }))

//   deca.forEach(c => {
//     deca = deca.concat(markForClean(categories, c._id!))
//   })
//   return deca
// }

