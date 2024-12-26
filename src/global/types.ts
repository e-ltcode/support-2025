// Define the Global State
import { IOption } from 'common/types';
import { IDBPDatabase } from 'idb';

export interface IDateAndBy {
	date: Date,
	by: {
		userId: string,
		userName?: string
	}
}

export interface IRecord {
	wsId: string,
	id: string,
	created?: IDateAndBy,
	createdBy?: string,
	modified?: IDateAndBy,
	modifiedBy?: string,
	inViewing?: boolean,
	inEditing?: boolean,
	inAdding?: boolean
}


export interface IAuthUser {
	wsId: string,
	wsName: string,
	userId: string, // fiktivni _id
	color?: string,
	userName: string,
	password: string,
	email: string,
	role: ROLES,
	registrationConfirmed: boolean,
	registered?: Date,
	visited?: Date
}

export enum ROLES {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER',
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
	kindOptions: IOption<string>[],
}

export interface IGlobalContext {
	globalState: IGlobalState;
	registerUser: (loginUser: ILoginUser) => Promise<any>;
	signInUser: (loginUser: ILoginUser) => Promise<any>;
	OpenDB: () => Promise<any>;
	getKindOptions: () => void;
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
	SET_KIND_OPTIONS = 'SET_KIND_OPTIONS',
	SET_REGISTRATION_CONFIRMED = 'SET_REGISTRATION_CONFIRMED'
}

export interface ILoginUser {
	// wsId: string,
	// wsName: string,
	// who?: string,
	// userId?: string,
	// userName: string;
	// email?: string;
	// password: string;
	// date?: Date;
	wsId: string,
	wsName: string, 
	who?: string,
	userId?: string,
	userName: string,
	password: string,
	email: string,
	color?: string,
	level?: number,
	role?: ROLES,
	confirmed?: boolean
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
		user: IUser,
		wsName: string
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

	[GlobalActionTypes.SET_KIND_OPTIONS]: {
		kindOptions: IOption<string>[];
	};

	[GlobalActionTypes.SET_REGISTRATION_CONFIRMED]: undefined
};

export interface IUser extends IRecord {
	userId?: string,
	userName: string,
	password?: string,
	email: string,
	color: string,
	level: number,
	parentGroup: IDBValidKey | null,  // null is allowed because of registerUser, and will be set at Server
	role: ROLES,
	confirmed: boolean
}

export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];