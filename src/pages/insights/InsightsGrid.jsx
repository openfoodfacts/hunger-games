import * as React from "react";

import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import FaceIcon from "@mui/icons-material/Face";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import Tooltip from "@mui/material/Tooltip";
import Link from "@mui/material/Link";

import robotoffService from "../../robotoff";
import offService from "../../off";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";

const RenderLink = (props) => {
  const { value, ...other } = props;
  return (
    <Link component="button" {...other}>
      {value}
    </Link>
  );
};

const getProductUrl = (code) => {
  if (!code) {
    return "";
  }
  return offService.getProductUrl(code);
};
const getLogoCropsByBarcodeUrl = (code) => {
  if (!code) {
    return "";
  }
  return offService.getLogoCropsByBarcodeUrl(code);
};
const getProductEditUrl = (code) => {
  if (!code) {
    return "";
  }
  return offService.getProductEditUrl(code);
};
const getQuestionUrl = (type, value_tag) => {
  if (
    !value_tag ||
    !["category", "brand", "product_weight", "label"].includes(type)
  ) {
    return "";
  }
  return `/questions?type=${type}&value_tag=${value_tag}`;
};

const typeKeyToTranslationKey = {
  "": "insights.all",
  product_weight: "insights.product_weight",
  label: "insights.label",
  category: "insights.category",
  expiration_date: "insights.expiration_date",
  packager_code: "insights.packager_code",
  brand: "logos.brand",
  packaging: "logos.packaging",
  qr_code: "logos.qr_code",
};

const annotationValueToTranslationKey = {
  "": "insights.all",
  "-1": "insights.skipped",
  0: "insights.rejected",
  1: "insights.accepted",
  not_annotated: "insights.not_annotated",
};

const TypeCell = ({ value }) => {
  const { t } = useTranslation();
  const text = typeKeyToTranslationKey[value ?? ""]
    ? t(typeKeyToTranslationKey[value ?? ""])
    : value;

  return <Typography>{text}</Typography>;
};
const AnnotationStateCell = ({ value }) => {
  const { t } = useTranslation();
  const text = t(annotationValueToTranslationKey[value ?? ""]);

  switch (value) {
    case 1:
      return (
        <Tooltip title={text}>
          <CheckCircleOutlineIcon color="success" />
        </Tooltip>
      );
    case 0:
      return (
        <Tooltip title={text}>
          <CancelOutlinedIcon color="error" />
        </Tooltip>
      );
    case -1:
      return (
        <Tooltip title={text}>
          <QuestionMarkOutlinedIcon color="warning" />
        </Tooltip>
      );
    default:
      return null;
  }
};

const dateTimeColumn = {
  type: "dateTime",
  minWidth: 150,
  maxWidth: 200,
  flex: 1,
  valueGetter: (params) => (params.value ? new Date(params.value) : null),
};

const PAGE_SIZE = 25;

const InsightGrid = ({ filterState = {}, setFilterState }) => {
  const { t } = useTranslation();

  const [pageState, setPageState] = React.useState({ page: 1, rowCount: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);

  const columns = React.useMemo(() => {
    return [
      {
        field: "actions",
        type: "actions",
        getActions: (params) => [
          <GridActionsCellItem
            component="a"
            href={getProductEditUrl(params.row.barcode)}
            label={t("insights.edit_product")}
            icon={
              <Tooltip title={t("insights.edit_product")}>
                <EditIcon />
              </Tooltip>
            }
          />,
          <GridActionsCellItem
            component="a"
            href={getProductUrl(params.row.barcode)}
            label={t("insights.view_product")}
            icon={
              <Tooltip title={t("insights.view_product")}>
                <VisibilityIcon />
              </Tooltip>
            }
          />,
          <GridActionsCellItem
            component="a"
            href={getLogoCropsByBarcodeUrl(params.row.barcode)}
            label={t("insights.view_crops_for_this_product")}
            icon={
              <Tooltip title={t("insights.view_crops_for_this_product")}>
                <VisibilityIcon />
              </Tooltip>
            }
          />,
        ],
      },
      {
        field: "type",
        minWidth: 150,
        flex: 1,
        maxWidth: 200,
        renderCell: (params) => <TypeCell {...params} />,
      },
      {
        field: "value_tag",
        minWidth: 200,
        flex: 1,
        renderCell: ({ row }) =>
          row.type && row.value_tag ? (
            <Link href={getQuestionUrl(row.type, row.value_tag)}>
              {row.value_tag} : {row.value}
            </Link>
          ) : (
            <span>
              {row.value_tag} : {row.value}
            </span>
          ),
      },
      {
        field: "barcode",
        renderCell: ({ value, tabIndex }) => {
          return (
            <RenderLink
              value={value}
              tabIndex={tabIndex}
              onClick={() => {
                setFilterState((f) => ({ ...f, barcode: value }));
              }}
            />
          );
        },
        minWidth: 180,
        flex: 1,
        maxWidth: 200,
      },
      { field: "id", flex: 1 },
      { field: "timestamp", ...dateTimeColumn },
      {
        field: "completed_at",
        ...dateTimeColumn,
      },
      {
        field: "annotation",
        renderCell: (params) => <AnnotationStateCell {...params} />,
        minWidth: 70,
        maxWidth: 110,
        flex: 1,
      },
      {
        field: "automatic_processing",
        type: "boolean",
        valueGetter: ({ value }) => Boolean(value),
        minWidth: 70,
        flex: 1,
        maxWidth: 110,
        renderCell: ({ value }) =>
          value ? (
            <Tooltip title={t("insights.automatic")}>
              <SmartToyIcon color="action" />
            </Tooltip>
          ) : (
            <Tooltip title={t("insights.human_required")}>
              <FaceIcon color="action" />
            </Tooltip>
          ),
      },
    ].map((col) => ({ ...col, sortable: false }));
  }, [setFilterState, t]);

  React.useEffect(() => {
    setIsLoading(true);
    let isValid = true;
    robotoffService
      .getInsights(
        filterState.barcode,
        filterState.insightType,
        filterState.valueTag,
        filterState.annotationStatus,
        pageState.page,
        PAGE_SIZE,
      )
      .then((result) => {
        if (isValid) {
          const newRowCount = result.data.count;
          setPageState((prevState) =>
            newRowCount !== prevState.rowCount
              ? { ...prevState, rowCount: newRowCount }
              : prevState,
          );
          setRows(
            result.data.insights.map((row) => ({
              ...row,
              value_tag: row.value_tag ?? row.value,
            })),
          );
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
  }, [
    filterState.barcode,
    filterState.valueTag,
    filterState.insightType,
    filterState.annotationStatus,
    pageState.page,
    t,
  ]);

  return (
    <DataGrid
      autoHeight
      columns={columns}
      rows={rows}
      disableColumnFilter
      isLoading={isLoading}
      page={pageState.page - 1}
      pageSize={PAGE_SIZE}
      pageSizeOptions={[PAGE_SIZE]}
      onPageChange={(page) =>
        setPageState((prev) => ({ ...prev, page: page + 1 }))
      }
      paginationMode="server"
      rowCount={pageState.rowCount}
      density="compact"
      initialState={{
        columns: {
          columnVisibilityModel: {
            id: false,
          },
        },
      }}
    />
  );
};

export default InsightGrid;
