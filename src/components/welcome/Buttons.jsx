import React from "react";
import { Button } from "@mui/material";
import styled from "styled-components";

const CustomButton = styled(Button)`
  background: #4c5c6b !important;
  color: white !important;
  padding: 0.3em 0.7em !important;
  fontsize: inherit !important;
  cursor: pointer !important;
  margin: 0.2em !important;
  &:hover {
    background: white !important;
    color: #4c5c6b !important;
    border: 1px solid #4c5c6b;
  }
`;

const Buttons = () => {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <CustomButton
      // onClick={() => setIsTourOpen(false)}
      >
        Skip Tour
      </CustomButton>
      <CustomButton
      // onClick={() => setIsTourOpen(false)}
      >
        Login
      </CustomButton>
      <CustomButton
      // onClick={() => setIsTourOpen(false)}
      >
        Next
      </CustomButton>
    </div>
  );
};

export default Buttons;