
import { ActionMap,  IRecord } from 'global/types';
import { IOption } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingAnswerGroup: 'AddingAnswerGroup',
	ViewingAnswerGroup: 'ViewingAnswerGroup',
	EditingAnswerGroup: 'EditingAnswerGroup',
	DeletingAnswerGroup: 'DeletingAnswerGroup',
	//////////////////////////////////////
	// answers
	AddingAnswer: 'AddingAnswer',
	ViewingAnswer: 'ViewingAnswer',
	EditingAnswer: 'EditingAnswer',
	DeletingAnswer: 'DeletingAnswer',
}

export enum FormMode {
	viewing,
	adding,
	editing
}


export interface IAnswer extends IRecord {
	title: string,
	level: number,
	parentAnswerGroup?: IDBValidKey
}

export interface IAnswerGroup extends IRecord {
	parentAnswerGroup: IDBValidKey | null,
	Name: string,
	level: number,
	answers: IAnswer[],
	numOfAnswers?: number,
	expandMe?: boolean
}

export interface IAnswerGroupInfo {
	_id: IDBValidKey,
	level: number
}


export interface IParentInfo {
	parentAnswerGroup: IDBValidKey | null,
	level: number,
	inAdding?: boolean
}

export interface IAnswerGroupsState {
	mode: string | null,
	loading: boolean,
	kinds: IAnswerGroup[],
	lastAnswerGroupExpanded: string;
	error?: string;
}

export interface IAnswerGroupsContext {
	state: IAnswerGroupsState,
	getSubAnswerGroups: ({ parentAnswerGroup, level }: IParentInfo) => void,
	createAnswerGroup: (kind: IAnswerGroup) => void,
	viewAnswerGroup: (_id: IDBValidKey) => void,
	editAnswerGroup: (_id: IDBValidKey) => void,
	updateAnswerGroup: (kind: IAnswerGroup) => void,
	deleteAnswerGroup: (_id: IDBValidKey) => void,
	//////////////
	// answers
	getAnswerGroupAnswers: ({parentAnswerGroup, level, inAdding}: IParentInfo) => void,
	createAnswer: (answer: IAnswer) => void,
	viewAnswer: (_id: IDBValidKey) => void,
	editAnswer: (_id: IDBValidKey) => void,
	updateAnswer:  (answer: IAnswer) => void,
	deleteAnswer: (_id: IDBValidKey) => void
}

export interface IAnswerGroupFormProps {
	inLine: boolean;
	kind: IAnswerGroup;
	mode: FormMode;
	submitForm: (kind: IAnswerGroup) => void,
	children: string
}

export interface IAnswerFormProps {
	initialValues: IAnswer;
	mode: FormMode;
	submitAnswer?: (answer: IAnswer, kindUpdated: boolean) => void,
	closeModal?: () => void,
	children: string
  }

export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_ANSWERGROUPS = 'SET_SUB_ANSWERGROUPS',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_ANSWERGROUP = 'ADD_SUB_ANSWERGROUP',
	SET_ANSWERGROUP = 'SET_ANSWERGROUP',
	SET_ADDED_ANSWERGROUP = 'SET_ADDED_ANSWERGROUP',
	VIEW_ANSWERGROUP = 'VIEW_ANSWERGROUP',
	EDIT_ANSWERGROUP = 'EDIT_ANSWERGROUP',
	DELETE = 'DELETE',

	CLOSE_ANSWERGROUP_FORM = 'CLOSE_ANSWERGROUP_FORM',
	CANCEL_ANSWERGROUP_FORM = 'CANCEL_ANSWERGROUP_FORM',

	// answers
	ADD_ANSWER = 'ADD_ANSWER',
	VIEW_ANSWER = 'VIEW_ANSWER',
	EDIT_ANSWER = 'EDIT_ANSWER',

	SET_ANSWER = 'SET_ANSWER',
	DELETE_ANSWER = 'DELETE_ANSWER',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}


export type AnswerGroupsPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_SUB_ANSWERGROUPS]: {
		subAnswerGroups: IAnswerGroup[];
	};
	
	[ActionTypes.ADD_SUB_ANSWERGROUP]: IParentInfo;

	[ActionTypes.VIEW_ANSWERGROUP]: {
		kind: IAnswerGroup;
	};

	[ActionTypes.EDIT_ANSWERGROUP]: {
		kind: IAnswerGroup;
	};

	[ActionTypes.SET_ANSWERGROUP]: {
		kind: IAnswerGroup;
	};

	[ActionTypes.SET_ADDED_ANSWERGROUP]: {
		kind: IAnswerGroup;
	};

	[ActionTypes.DELETE]: {
		_id: IDBValidKey;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		kind: IAnswerGroup;
	};

	[ActionTypes.CLOSE_ANSWERGROUP_FORM]: undefined;

	[ActionTypes.CANCEL_ANSWERGROUP_FORM]: undefined;

	[ActionTypes.SET_ERROR]: {
		error: string;
	};

	/////////////
	// answers

	[ActionTypes.ADD_ANSWER]: {
		kindInfo: IAnswerGroupInfo;
	}

	[ActionTypes.VIEW_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.EDIT_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.DELETE_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.CLOSE_ANSWER_FORM]: {
		answer: IAnswer;
	};

	[ActionTypes.CANCEL_ANSWER_FORM]: {
		answer: IAnswer;
	};

};

export type AnswerGroupsActions =	
	ActionMap<AnswerGroupsPayload>[keyof ActionMap<AnswerGroupsPayload>];

