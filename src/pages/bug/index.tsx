import * as React from "react";
import { checkedFetch } from "../../utils/checkedFetch";
import off from "../../off";
import { TextField } from "@mui/material";
import { OFF_URL, OFF_API_URL_V3 } from "../../const";

export default function BugPage() {
  const [text, setText] = React.useState("test ingredient values");
  const [response, setResponse] = React.useState<unknown>();
  const sendRequest = (request: Promise<Response>) => {
    request
      .then((response) => response.text())
      .then((data) => {
        try {
          setResponse(JSON.parse(data) as unknown);
        } catch {
          setResponse(data);
        }
      })
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
        {JSON.stringify(
          off.setIngedrient({
            code: "123456789",
            text,
            lang: "fr",
          }),
        )}
      </pre>

      <button
        onClick={() => {
          sendRequest(
            checkedFetch(`${OFF_URL}/cgi/product_jqm2.pl`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code: "123456789",
                ingredients_text_fr: text,
              }),
            }),
          );
        }}
      >
        Test jqm2 with credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            checkedFetch(`${OFF_API_URL_V3}/product/123456789`, {
              method: "POST",
              credentials: "include",
              body: JSON.stringify({
                ingredients_text_fr: text,
              }),
              headers: { "Content-Type": "application/json" },
            }),
          );
        }}
      >
        Test v3 with credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            checkedFetch(`${OFF_URL}/cgi/product_jqm2.pl`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code: "123456789",
                ingredients_text_fr: text,
              }),
            }),
          );
        }}
      >
        Test jqm2 without credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            checkedFetch(`${OFF_API_URL_V3}product/123456789`, {
              method: "POST",
              body: JSON.stringify({
                ingredients_text_fr: text,
              }),
              headers: { "Content-Type": "application/json" },
            }),
          );
        }}
      >
        Test v3 without credential
      </button>
      <button
        onClick={() => {
          sendRequest(
            checkedFetch(`${OFF_API_URL_V3}product/123456789`, {
              method: "PATCH",
              body: JSON.stringify({
                ingredients_text_fr: text,
              }),
              headers: { "Content-Type": "application/json" },
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
