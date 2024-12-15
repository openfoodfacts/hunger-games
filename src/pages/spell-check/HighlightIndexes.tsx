import * as React from "react";

export default function Highlight({ text, highlight }) {
  let rep = "";
  // console.log(highlight);
  let lastIndex = 0;
  highlight.forEach(({ color, index }) => {
    rep =
      rep +
      text.slice(lastIndex, index) +
      `<span class="${color}">${text[index]}</span>`;
    lastIndex = index + 1;
  });

  rep = rep + text.slice(lastIndex);

  return <p dangerouslySetInnerHTML={{ __html: rep }} />;
}
