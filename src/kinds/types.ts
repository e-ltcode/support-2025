
import { ActionMap,  IRecord } from 'global/types';
import { IOption } from 'common/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingKind: 'AddingKind',
	ViewingKind: 'ViewingKind',
	EditingKind: 'EditingKind',
	DeletingKind: 'DeletingKind',
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
	id?: number,
	title: string,
	level: number,
	parentKind: IDBValidKey
}

export interface IKind extends IRecord {
	id: string,
	parentKind: IDBValidKey | null,
	Name: string,
	level: number,
	answers: IAnswer[],
	numOfAnswers?: number,
	expandMe?: boolean
}

export interface IKindInfo {
	_id: IDBValidKey,
	level: number
}


export interface IParentInfo {
	parentKind: IDBValidKey | null,
	level: number,
	inAdding?: boolean
}

export interface IKindsState {
	mode: string | null,
	loading: boolean,
	kinds: IKind[],
	lastKindExpanded: string;
	error?: Error;
}

export interface IKindsContext {
	state: IKindsState,
	getSubKinds: ({ parentKind, level }: IParentInfo) => void,
	createKind: (kind: IKind) => void,
	viewKind: (_id: IDBValidKey) => void,
	editKind: (_id: IDBValidKey) => void,
	updateKind: (kind: IKind) => void,
	deleteKind: (_id: IDBValidKey) => void,
	//////////////
	// answers
	getKindAnswers: ({parentKind, level, inAdding}: IParentInfo) => void,
	createAnswer: (answer: IAnswer) => void,
	viewAnswer: (_id: IDBValidKey) => void,
	editAnswer: (_id: IDBValidKey) => void,
	updateAnswer:  (answer: IAnswer) => void,
	deleteAnswer: (_id: IDBValidKey) => void
}

export interface IKindFormProps {
	inLine: boolean;
	kind: IKind;
	mode: FormMode;
	submitForm: (kind: IKind) => void,
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
	SET_SUB_KINDS = 'SET_SUB_KINDS',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_KIND = 'ADD_SUB_KIND',
	SET_KIND = 'SET_KIND',
	SET_ADDED_KIND = 'SET_ADDED_KIND',
	VIEW_KIND = 'VIEW_KIND',
	EDIT_KIND = 'EDIT_KIND',
	DELETE = 'DELETE',

	CLOSE_KIND_FORM = 'CLOSE_KIND_FORM',
	CANCEL_KIND_FORM = 'CANCEL_KIND_FORM',

	// answers
	ADD_ANSWER = 'ADD_ANSWER',
	VIEW_ANSWER = 'VIEW_ANSWER',
	EDIT_ANSWER = 'EDIT_ANSWER',

	SET_ANSWER = 'SET_ANSWER',
	DELETE_ANSWER = 'DELETE_ANSWER',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}


export type KindsPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_SUB_KINDS]: {
		subKinds: IKind[];
	};
	
	[ActionTypes.ADD_SUB_KIND]: IParentInfo;

	[ActionTypes.VIEW_KIND]: {
		kind: IKind;
	};

	[ActionTypes.EDIT_KIND]: {
		kind: IKind;
	};

	[ActionTypes.SET_KIND]: {
		kind: IKind;
	};

	[ActionTypes.SET_ADDED_KIND]: {
		kind: IKind;
	};

	[ActionTypes.DELETE]: {
		id: string;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		kind: IKind;
	};

	[ActionTypes.CLOSE_KIND_FORM]: undefined;

	[ActionTypes.CANCEL_KIND_FORM]: undefined;

	[ActionTypes.SET_ERROR]: {
		error: Error;
	};

	/////////////
	// answers

	[ActionTypes.ADD_ANSWER]: {
		kindInfo: IKindInfo;
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

export type KindsActions =	
	ActionMap<KindsPayload>[keyof ActionMap<KindsPayload>];

