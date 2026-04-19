interface HighlightItem {
  color: string;
  index: number;
}

interface HighlightProps {
  text: string;
  highlight: HighlightItem[];
}

export default function Highlight({ text, highlight }: HighlightProps) {
  let rep = "";
  let lastIndex = 0;
  highlight.forEach(({ color, index }) => {
    rep +=
      text.slice(lastIndex, index) +
      `<span class="${color}">${text.slice(index, index + 1)}</span>`;
    lastIndex = index + 1;
  });

  rep += text.slice(lastIndex);

  return <p dangerouslySetInnerHTML={{ __html: rep }} />;
}
