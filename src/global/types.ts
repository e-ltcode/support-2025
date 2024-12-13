// Define the Global State
export type OptionValue = string | number;

export type IOption<T extends OptionValue> = {
	value: T;
	label: string;
	color?: string;
	checked?: boolean;
};

export interface IDateAndBy {
	date: Date,
	by: {
		userId: string,
		userName?: string
	}
}

export interface IRecord {
	_id?: string,
	created?: IDateAndBy,
	createdBy?: string,
	modified?: IDateAndBy,
	modifiedBy?: string,
	inViewing?: boolean,
	inEditing?: boolean,
	inAdding?: boolean
}

export interface IUser extends IRecord {
	_id: string,
	userName: string,
	password?: string,
	email: string,
	role: ROLES,
	color: string,
	level: number,
	parentGroup: string | null,  // null is allowed because of registerUser, and will be set at Server
	confirmed: boolean
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
	signInUser: (loginUser: ILoginUser) => Promise<any>;
	health: () => void;
}


export interface ILoginUser {
	wsName: string,
	who?: string,
	userName: string;
	email?: string;
	password: string;
	date?: Date;
}

export interface IGlobalState {
	isAuthenticated: boolean | null;
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

export enum GlobalActionTypes {
	SET_LOADING = 'SET_LOADING',
	AUTHENTICATE = "AUTHENTICATE",
	UN_AUTHENTICATE = "UN_AUTHENTICATE",
	SET_ERROR = 'SET_ERROR',
	DARK_MODE = "DARK_MODE",
	LIGHT_MODE = "LIGHT_MODE",
	SET_KIND_OPTIONS = 'SET_KIND_OPTIONS',
	SET_REGISTRATION_CONFIRMED = 'SET_REGISTRATION_CONFIRMED'
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



export type ICreatedModifiedProps = {
	created?: IDateAndBy,
	createdBy?: string,
	modified?: IDateAndBy,
	modifiedBy?: string
	classes?: string
}


export const FORM_MODES = {
	UNDEFINED: undefined,
	NULL: null,
	ADD: 'ADD',
	EDIT: 'EDIT',
	DELETE: 'DELETE'
}

export enum FormMode {
	viewing,
	adding,
	editing
}


export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];