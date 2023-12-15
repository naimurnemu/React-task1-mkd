import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        token:null,
        role: null,
        user: null,
        
      };
    default:
      return state;
  }
};

const sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");
  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({ type: "Logout" });
    window.location.href = "/" + role + "/login";
  }
};

const AuthProvider = ({ children }) => {
  initialState.role = localStorage.getItem("role");
  initialState.isAuthenticated = localStorage.getItem("isAutheticated")
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    tokenExpireError();
  }, []);

  const value = { state, dispatch };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
