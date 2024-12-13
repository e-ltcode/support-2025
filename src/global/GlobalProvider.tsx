import React, { createContext, useContext, useReducer, Dispatch, useCallback } from "react";

import { IGlobalContext, ROLES, GlobalActionTypes, ILoginUser } from 'global/types'
import { globalReducer, initialGlobalState } from "global/globalReducer";

import { IUser } from "global/types";

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(globalReducer, initialGlobalState);

  const health = useCallback(() => {
    const url = `api/health`;
    // axios
    //   .post(url)
    //   .then(({ status }) => {
    //     if (status === 200) {
    //       console.log('health successfull:', status)
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //     }
    //   })
    //   .catch((err: any | AxiosError) => {
    //     console.log(err);
    //   });
  }, []);

  const signInUser = useCallback(async (loginUser: ILoginUser): Promise<any> => {
    console.log("signInUser", { loginUser })
    try {
      // const res = await axios.post(`/api/users/sign-in-user`, { ...loginUser, date: new Date() });
      // const { status, data } = res;
      // if (status === 200) {
      const user: IUser = {
        _id: '',
        userName: loginUser.userName,
        email: 'slavko.parezanin@gmail.com',
        role: ROLES.ADMIN,
        color: 'blue',
        level: 1,
        parentGroup: null,  // null is allowed because of registerUser, and will be set at Server
        created: {
          date: new Date(),
          by: {
            userId: '',
          }
        },
        confirmed: true
      }

      console.log('User successfully logged in', user)
      dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user, wsName: 'ws' } })
      return true;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   dispatch({
      //     type: GlobalActionTypes.SET_ERROR, payload: {
      //       error: new Error('Status is not 200 status: ' + status)
      //     }
      //   })
      // }
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("")
        }
      });
      return false;
    }
  }, [dispatch]);

  return (
    <GlobalContext.Provider value={{
      globalState, signInUser, health
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
};

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
