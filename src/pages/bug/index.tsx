import * as React from "react";
import axios from "axios";
import off from "../../off";
import { Button, TextField } from "@mui/material";

export default function BugPage() {
  const [text, setText] = React.useState("test ingredient values");
  const [response, setResponse] = React.useState();

  return (
    <div>
      <TextField
        label="the text to send"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <p>The request to send</p>
      <pre>
        {off.setIngedrient({
          code: "123456789",
          text,
          lang: "fr",
        })}
      </pre>
      <Button
        onClick={() => {
          axios
            .post(
              off.setIngedrient({
                code: "123456789",
                text,
                lang: "fr",
              }),
              { withCredentials: true },
            )
            .then(({ data }) => setResponse(data));
        }}
      >
        Test send
      </Button>
      <p>response</p>
      <pre>{JSON.stringify(response)}</pre>
    </div>
  );
}
