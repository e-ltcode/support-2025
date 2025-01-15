// Define the Global State
import { IOption } from 'common/types';
import { IDBPDatabase } from 'idb';
import { IUser } from 'roles/types';

export interface IDateAndBy {
	date: Date,
	by: {
		nickName: string
	}
}

export interface IRecord {
	created?: IDateAndBy,
	createdBy?: string,
	modified?: IDateAndBy,
	modifiedBy?: string,
	inViewing?: boolean,
	inEditing?: boolean,
	inAdding?: boolean
}


export interface IAuthUser {
	color?: string,
	nickName: string,
	name: string;
	password: string,
	email: string,
	role: ROLES,
	registrationConfirmed: boolean,
	registered?: Date,
	visited?: Date
}

// export const ROLES: Map<string, string> = new Map<string, string>([
// 	['OWNER', 'OWNER'],
// 	['ADMIN', 'ADMIN'],
// 	['EDITOR', 'EDITOR'],
// 	['VIEWER', 'VIEWER']
// ])

export enum  ROLES  {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER'
}

export interface IGlobalState {
		isAuthenticated: boolean | null;
		dbp: IDBPDatabase | null;
		everLoggedIn: boolean;
		authUser: IAuthUser;
		canEdit: boolean,
		isOwner: boolean,
		isDarkMode: boolean;
		variant: string,
		bg: string,
	loading: boolean;
	error?: Error;
}

export interface IGlobalStateFromLocalStorage {
	nickName: string;
	everLoggedIn: boolean;
	isDarkMode: boolean;
	variant: string;
	bg: string;
}

export interface IGlobalContext {
	globalState: IGlobalState;
	getUser: (nickName: string) => Promise<any>;
	registerUser: (regUser: IRegisterUser, isOwner: boolean, dbp: IDBPDatabase|null) => Promise<any>;
	signInUser: (loginUser: ILoginUser) => Promise<any>;
	OpenDB: () => Promise<any>;
	health: () => void;
}

export enum GlobalActionTypes {
	SET_LOADING = 'SET_LOADING',
	AUTHENTICATE = "AUTHENTICATE",
	UN_AUTHENTICATE = "UN_AUTHENTICATE",
	SET_DBP = "SET_DBP",
	SET_ERROR = 'SET_ERROR',
	DARK_MODE = "DARK_MODE",
	LIGHT_MODE = "LIGHT_MODE",
	SET_REGISTRATION_CONFIRMED = 'SET_REGISTRATION_CONFIRMED'
}

export interface ILoginUser {
	nickName: string;
	password?: string;
	who?: string;
}

export interface IRegisterUser {
	who?: string,
	nickName: string,
	name: string,
	password: string,
	email: string,
	color: string,
	level: number,
	confirmed: boolean
}


export interface IJoinToWorkspace {
	invitationId: string,
	userName: string;
	password: string;
	date?: Date;
}


export type ActionMap<M extends Record<string, any>> = {
	[Key in keyof M]: M[Key] extends undefined
	? {
		type: Key;
	}
	: {
		type: Key;
		payload: M[Key];
	}
};

export type GlobalPayload = {
	[GlobalActionTypes.SET_LOADING]: {
	};

	[GlobalActionTypes.AUTHENTICATE]: {
		user: IUser
	};

	[GlobalActionTypes.UN_AUTHENTICATE]: undefined;

	[GlobalActionTypes.SET_DBP]: {
		dbp: IDBPDatabase
	};

	[GlobalActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GlobalActionTypes.LIGHT_MODE]: undefined;

	[GlobalActionTypes.DARK_MODE]: undefined;


	[GlobalActionTypes.SET_REGISTRATION_CONFIRMED]: undefined
};



////////////////////////
// Category -> questions
export interface IQuestionData {
	title: string;
	source: number;
	status: number;
}

export interface ICategoryData {
	id: string,
	title: string,
	categories?: ICategoryData[],
	questions?: IQuestionData[]
}

////////////////////
// Group -> answers
export interface IAnswerData {
	title: string;
	source: number;
	status: number;
}

export interface IGroupData {
	id: string,
	title: string,
	groups?: IGroupData[],
	answers?: IAnswerData[]
}

////////////////////
// Role -> users
export interface IUserData {
	nickName: string;
	name: string;
	password: string;
	email: string;
	color: string;
}

export interface IRoleData {
	title: string,
	roles?: IRoleData[],
	users?: IUserData[]
}


export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];