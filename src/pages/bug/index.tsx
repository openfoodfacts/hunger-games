import * as React from "react";
import axios, { AxiosResponse } from "axios";
import off from "../../off";
import { TextField } from "@mui/material";
import { OFF_URL, OFF_API_URL_V3 } from "../../const";

export default function BugPage() {
  const [text, setText] = React.useState("test ingredient values");
  const [response, setResponse] = React.useState<unknown>();
  const sendRequest = (request: Promise<AxiosResponse<unknown>>) => {
    request
      .then(({ data }) => setResponse(data))
      .catch((error: unknown) => {
        setResponse({
          error: error instanceof Error ? error.message : "Request failed",
        });
      });
  };

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
          sendRequest(
            axios.post<unknown>(
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
            ),
          );
        }}
      >
        Test jqm2 with credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            axios.post<unknown>(
              `${OFF_API_URL_V3}/product/123456789`,
              {
                ingredients_text_fr: text,
              },
              { withCredentials: true },
            ),
          );
        }}
      >
        Test v3 with credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            axios.post<unknown>(
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
            ),
          );
        }}
      >
        Test jqm2 without credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            axios.post<unknown>(`${OFF_API_URL_V3}product/123456789`, {
              ingredients_text_fr: text,
            }),
          );
        }}
      >
        Test v3 without credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            axios.patch<unknown>(`${OFF_API_URL_V3}product/123456789`, {
              ingredients_text_fr: text,
            }),
          );
        }}
      >
        Test v3 without credential patch
      </button>
      <p>response</p>
      <pre>{JSON.stringify(response)}</pre>
    </div>
  );
}
