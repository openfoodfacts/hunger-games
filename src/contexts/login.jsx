import * as React from "react";

const LoginContext = React.createContext({
  userName: "",
  isLoggedIn: false,
  refresh: () => {},
});

export default LoginContext;
