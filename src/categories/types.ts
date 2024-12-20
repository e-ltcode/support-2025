
import { IAnswer } from 'AnswerGroup/types';
import { ActionMap, IDateAndBy, IRecord } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingCategory: 'AddingCategory',
	ViewingCategory: 'ViewingCategory',
	EditingCategory: 'EditingCategory',
	DeletingCategory: 'DeletingCategory',
	//////////////////////////////////////
	// questions
	AddingQuestion: 'AddingQuestion',
	ViewingQuestion: 'ViewingQuestion',
	EditingQuestion: 'EditingQuestion',
	DeletingQuestion: 'DeletingQuestion',
}

export enum FormMode {
	viewing,
	adding,
	editing
}

export interface IQuestionAnswer {
	categoryId: number;
	questionId: number;
	_id: number,
	answer: {
		_id: string,
		title: string
	},
	user: {
		_id?: string,
		createdBy: string
	}
	assigned: IDateAndBy
}

export interface IFromUserAssignedAnswer {
	_id: string,
	createdBy: string
}

export interface IQuestion extends IRecord {
	title: string,
	//level: number,
	//parentCategory: string | undefined,
	categoryTitle?: string,
	groupId: IDBValidKey,
	questionAnswers: IQuestionAnswer[],
	numOfAnswers?: number,
	source: number,
	status: number,
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[]
}

export interface ICategory extends IRecord {
	title: string,
	level: number,
	questions: IQuestion[],
	numOfQuestions?: number,
	isExpanded?: boolean,
	parentCategory?: IDBValidKey
}

export interface ICategoryInfo {
	_id: IDBValidKey,
	level: number
}


export interface 	IParentInfo {
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
	groupId?: IDBValidKey
}

export interface ICategoriesState {
	mode: string | null,
	loading: boolean,
	categories: ICategory[],
	currentCategoryExpanded: string,
	lastCategoryExpanded: string | null;
	categoryId_questionId_done: string | null;
	error?: string; //AxiosError;
}

export interface ICategoriesContext {
	state: ICategoriesState,
	reloadCategoryNode: (categoryId: string, questionId: string | null) => Promise<any>;
	getCategories: ({ title }: IParentInfo) => void,
	//getCats: () => Promise<any>,
	createCategory: (category: ICategory) => void,
	viewCategory: (_id: IDBValidKey) => void,
	editCategory: (_id: IDBValidKey) => void,
	updateCategory: (category: ICategory) => void,
	deleteCategory: (_id: IDBValidKey) => void,
	//////////////
	// questions
	//getCategoryQuestions: ({ parentCategory, level, inAdding }: IParentInfo) => void,
	loadCategoryQuestions: ({ groupId }: IParentInfo) => void,
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;

	viewQuestion: (_id: IDBValidKey) => void;
	editQuestion: (_id: IDBValidKey) => void;
	updateQuestion: (question: IQuestion) => Promise<any>;
	assignQuestionAnswer?: (questionId: IDBValidKey, answerId: IDBValidKey, assigned: IDateAndBy) => Promise<any>;
	unAssignQuestionAnswer?: (questionId: IDBValidKey, answerId: IDBValidKey) => Promise<any>;
	createAnswer: (answer: IAnswer) => Promise<any>;

	deleteQuestion: (_id: IDBValidKey) => void
}

export interface ICategoryFormProps {
	inLine: boolean;
	category: ICategory;
	mode: FormMode;
	submitForm: (category: ICategory) => void,
	children: string
}

export interface IQuestionFormProps {
	question: IQuestion;
	mode: FormMode;
	closeModal?: () => void;
	submitForm: (question: IQuestion) => void,
	showCloseButton: boolean;
	children: string
}



export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_CATEGORIES = 'SET_CATEGORIES',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_CATEGORY = 'ADD_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_CATEGORY_QUESTIONS = 'SET_CATEGORY_QUESTIONS',
	SET_ADDED_CATEGORY = 'SET_ADDED_CATEGORY',
	VIEW_CATEGORY = 'VIEW_CATEGORY',
	EDIT_CATEGORY = 'EDIT_CATEGORY',
	DELETE = 'DELETE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CATEGORIES = "SET_PARENT_CATEGORIES",

	// questions
	ADD_QUESTION = 'ADD_QUESTION',
	VIEW_QUESTION = 'VIEW_QUESTION',
	EDIT_QUESTION = 'EDIT_QUESTION',

	SET_QUESTION = 'SET_QUESTION',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_QUESTION_ANSWERS = 'SET_QUESTION_ANSWERS',
	DELETE_QUESTION = 'DELETE_QUESTION',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

export type CategoriesPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_CATEGORIES]: {
		categories: ICategory[];
	};

	[ActionTypes.ADD_CATEGORY]: IParentInfo;

	[ActionTypes.VIEW_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.EDIT_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_CATEGORY_QUESTIONS]: {
		groupId: IDBValidKey,
		questions: IQuestion[]
	};


	[ActionTypes.SET_ADDED_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.DELETE]: {
		_id: number;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		category: ICategory;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_CATEGORY_FORM]: undefined;

	[ActionTypes.CANCEL_CATEGORY_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		_id: number;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: string; //AxiosError;
	};

	/////////////
	// questions

	[ActionTypes.ADD_QUESTION]: {
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.VIEW_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.EDIT_QUESTION]: {
		question: IQuestion;
	};


	[ActionTypes.SET_QUESTION]: {
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_ANSWERS]: {
		answers: IQuestionAnswer[];
	};

	[ActionTypes.DELETE_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		question: IQuestion;
	};

};

export type CategoriesActions =
	ActionMap<CategoriesPayload>[keyof ActionMap<CategoriesPayload>];

/////////////////////////////////////////////////////////////////////////
// DropDown Select Category
export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CATEGORY = 'SET_PARENT_CATEGORY'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: undefined;

	[CatsActionTypes.SET_SUB_CATS]: {
		subCats: ICategory[];
	};

	[CatsActionTypes.SET_EXPANDED]: {
		_id: number;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: ''; //AxiosError;
	};

	[CatsActionTypes.SET_PARENT_CATEGORY]: {
		category: ICategory;
	};

};


export interface ICatInfo {
	parentCategory: IDBValidKey | null,
	level: number,
	setParentCategory : (category: ICategory) => void;
}

export interface ICatsState {
	loading: boolean,
	parentCategory: IDBValidKey | null,
	title: string,
	cats: ICategory[], // drop down categories
	error?: string;
}
export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];