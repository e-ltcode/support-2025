import React from 'react';
import { ActionMap, IDateAndBy, IRecord } from 'global/types';
import { IAnswer } from 'kinds/types';

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
	categoryId: IDBValidKey;
	questionId: IDBValidKey;
	_id: IDBValidKey,
	answer: {
		_id: IDBValidKey,
		title: string
	},
	user: {
		_id?: IDBValidKey,
		createdBy: string
	}
	assigned: IDateAndBy
}

export interface IFromUserAssignedAnswer {
	_id: IDBValidKey,
	createdBy: string
}

export interface IQuestion extends IRecord {
	title: string,
	level: number,
	parentCategory: IDBValidKey,
	categoryTitle: string,
	questionAnswers: IQuestionAnswer[],
	numOfAnswers?: number,
	source: number,
	status: number,
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[]
}

export interface ICategory extends IRecord {
	id: string,
	parentCategory: string | null,
	title: string,
	level: number,
	questions: IQuestion[],
	numOfQuestions?: number,
	isExpanded?: boolean
}

export interface ICategoryInfo {
	_id: IDBValidKey,
	level: number
}


export interface IParentInfo {
	parentCategory: string | null,
	level: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean
}

export interface ICatInfo {
	parentCategory: string | null,
	level: number,
	setParentCategory : (category: ICategory) => void;
}

export interface ICategoriesState {
	mode: string | null,
	loading: boolean,
	categories: ICategory[],
	currentCategoryExpanded: string,
	lastCategoryExpanded: string | null;
	categoryId_questionId_done: string | null;
	parentCategories: IParentCategories;
	error?: Error;
}

export interface ICatsState {
	loading: boolean,
	parentCategory: IDBValidKey | null,
	title: string,
	cats: ICategory[], // drop down categories
	error?: Error;
}

export interface ICategoriesContext {
	state: ICategoriesState,
	reloadCategoryNode: (categoryId: string, questionId: string | null) => Promise<any>;
	getSubCategories: ({ parentCategory, level }: IParentInfo) => void,
	getSubCats: ({ parentCategory, level }: IParentInfo) => Promise<any>,
	createCategory: (category: ICategory) => void,
	viewCategory: (_id: IDBValidKey) => void,
	editCategory: (_id: IDBValidKey) => void,
	updateCategory: (category: ICategory) => void,
	deleteCategory: (_id: IDBValidKey) => void,
	//////////////
	// questions
	getCategoryQuestions: ({ parentCategory, level, inAdding }: IParentInfo) => void,
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (_id: IDBValidKey) => void;
	editQuestion: (_id: IDBValidKey) => void;
	updateQuestion: (question: IQuestion) => Promise<any>;
	assignQuestionAnswer: (questionId: IDBValidKey, answerId: IDBValidKey, assigned: IDateAndBy) => Promise<any>;
	unAssignQuestionAnswer: (questionId: IDBValidKey, answerId: IDBValidKey) => Promise<any>;
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

export interface IParentCategories {
	categoryId: string | null;
	questionId: string | null;
	categoryIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
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

	[ActionTypes.SET_PARENT_CATEGORIES]: {
		parentCategories: IParentCategories
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		subCategories: ICategory[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: IParentInfo;

	[ActionTypes.VIEW_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.EDIT_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_ADDED_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.DELETE]: {
		_id: IDBValidKey;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		category: ICategory;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_CATEGORY_FORM]: undefined;

	[ActionTypes.CANCEL_CATEGORY_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		_id: IDBValidKey;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
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
		_id: IDBValidKey;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[CatsActionTypes.SET_PARENT_CATEGORY]: {
		category: ICategory;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];