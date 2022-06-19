import * as React from "react";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import robotoffService from "../../robotoff";

const columns = [
  { field: "barcode", width: 180 },
  { field: "id" },
  { field: "type" },
  { field: "value_tag" },
  { field: "timestamp" },
  { field: "completed_at" },
  { field: "annotation" },
  { field: "automatic_processing" },
];

const PAGE_SIZE = 10;

const InsightGrid = ({ filterState = {} }) => {
  const [pageState, setPageState] = React.useState({ page: 1, rowCount: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    setIsLoading(true);
    let isValid = true;
    robotoffService
      .getInsights(filterState.barcode, filterState.insightType, filterState.valueTag, filterState.annotationStatus, pageState.page, PAGE_SIZE)
      .then((result) => {
        if (isValid) {
          const newRowCount = result.data.count;
          setPageState((prevState) => (newRowCount !== prevState.rowCount ? { ...prevState, rowCount: newRowCount } : prevState));
          setRows(result.data.insights);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isValid) {
          setIsLoading(false);
        }
      });
    return () => {
      isValid = false;
    };
  }, [filterState.barcode, filterState.valueTag, filterState.insightType, filterState.annotationStatus, pageState.page]);

  return (
    <DataGrid
      autoHeight
      columns={columns}
      rows={rows}
      disableColumnFilter
      componentsProps={{ toolbar: { printOptions: { disableToolbarButton: true }, csvOptions: { disableToolbarButton: true } } }}
      components={{ Toolbar: GridToolbar }}
      isLoading={isLoading}
      page={pageState.page - 1}
      pageSize={PAGE_SIZE}
      rowsPerPageOptions={[PAGE_SIZE]}
      onPageChange={(page) => setPageState((prev) => ({ ...prev, page: page + 1 }))}
      paginationMode="server"
      rowCount={pageState.rowCount}
    />
  );
};

export default InsightGrid;
