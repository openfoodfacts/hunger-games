import * as React from "react";

const LoginContext = React.createContext<{
  userName: string;
  isLoggedIn: boolean;
  refresh: () => boolean | Promise<boolean>;
}>({
  userName: "",
  isLoggedIn: false,
  refresh: () => false,
});

export default LoginContext;
