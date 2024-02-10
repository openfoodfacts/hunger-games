import * as React from "react";

export function useFilterSearch(
  queryName: string,
  defaultValue: string,
): [string, (val: string) => void] {
  const [value, setValue] = React.useState<string>(
    () =>
      new URLSearchParams(window.location.search).get(queryName) ??
      defaultValue ??
      "",
  );

  function handleUpdate(term: string) {
    const params = new URLSearchParams(window.location.search);
    setValue(term);
    if (term !== "") {
      params.set(queryName, term);
    } else {
      params.delete(queryName);
    }
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }

  React.useEffect(() => {
    // If the default update we use the new default value
    handleUpdate(
      new URLSearchParams(window.location.search).get(queryName) ??
        defaultValue ??
        "",
    );
  }, [defaultValue]);

  return [value, handleUpdate];
}
