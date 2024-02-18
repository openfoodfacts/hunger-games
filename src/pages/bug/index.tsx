import * as React from "react";
import axios from "axios";
import off from "../../off";
import { TextField } from "@mui/material";
import { OFF_URL } from "../../const";

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

      <button
        onClick={() => {
          axios
            .post(
              `${OFF_URL}/cgi/product_jqm2.pl`,
              {
                code: "123456789",
                ingredients_text_fr: text,
              },
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              },
            )
            .then(({ data }) => setResponse(data));
        }}
      >
        Test jqm2 with credential
      </button>
      <button
        onClick={() => {
          axios
            .post(
              "https://world.openfoodfacts.org/api/v3/product/123456789",
              {
                ingredients_text_fr: text,
              },
              { withCredentials: true },
            )
            .then(({ data }) => setResponse(data));
        }}
      >
        Test v3 with credential
      </button>
      <button
        onClick={() => {
          axios
            .post(
              `${OFF_URL}/cgi/product_jqm2.pl`,
              {
                code: "123456789",
                ingredients_text_fr: text,
              },
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              },
            )
            .then(({ data }) => setResponse(data));
        }}
      >
        Test jqm2 without credential
      </button>
      <button
        onClick={() => {
          axios
            .post("https://world.openfoodfacts.org/api/v3/product/123456789", {
              ingredients_text_fr: text,
            })
            .then(({ data }) => setResponse(data));
        }}
      >
        Test v3 without credential
      </button>
      <button
        onClick={() => {
          axios
            .patch("https://world.openfoodfacts.org/api/v3/product/123456789", {
              ingredients_text_fr: text,
            })
            .then(({ data }) => setResponse(data));
        }}
      >
        Test v3 without credential patch
      </button>
      <p>response</p>
      <pre>{JSON.stringify(response)}</pre>
    </div>
  );
}
