import * as React from "react";

import axios from "axios";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import off from "../../off";
import { OFF_IMAGE_URL } from "../../const";

type FlaggedImage = {
  code: string;
  imgid: number;
  url: string;
};

type ApiRequest = {
  result: FlaggedImage[];
};

const flagImageUrl = "https://amathjourney.com/api/off-annotation/flag-image/";

const getImageUrl = (code: string, imgid: number) =>
  `${OFF_IMAGE_URL}/${off.getFormatedBarcode(code)}/${imgid}.jpg`;

export default function FlaggedImages() {
  const { t } = useTranslation();
  const [data, setData] = React.useState<FlaggedImage[] | null>(null);
  const [deleteError, setDeleteError] = React.useState(false);

  React.useEffect(() => {
    axios
      .get<ApiRequest>(flagImageUrl)
      .then(({ data: { result } }) => setData(result))
      .catch(() => {
        setData([]);
      });
  }, []);

  if (data === null) {
    return <p>{t(`flagged_images.loading`)}</p>;
  }
  return (
    <React.Suspense>
      <Box>
        <Box sx={{ padding: 2 }}>
          <Typography>{t("flagged_images.title")}</Typography>
          {deleteError && (
            <Alert severity="error">
              {t("flagged_images.delete_error", {
                defaultValue: "Could not delete the flagged image. Try again.",
              })}
            </Alert>
          )}
          <table>
            {data.map(({ code, imgid }) => (
              <tr key={`${code}-${imgid}`}>
                <td>
                  <a
                    target="_blank"
                    href={off.getProductEditUrl(code)}
                    rel="noreferrer"
                  >
                    {code}
                  </a>
                </td>
                <td>
                  <img
                    src={getImageUrl(code, imgid).replace(".jpg", ".400.jpg")}
                    height={200}
                    alt=""
                  />
                </td>
                <td>
                  <IconButton
                    onClick={() => {
                      setDeleteError(false);
                      axios
                        .delete(flagImageUrl + code, {
                          data: {
                            imgid,
                          },
                        })
                        .then(() => {
                          setData((prev) =>
                            prev.filter(
                              (line) =>
                                line.code !== code || line.imgid !== imgid,
                            ),
                          );
                        })
                        .catch(() => setDeleteError(true));
                    }}
                  >
                    <DeleteOutlineIcon
                      sx={{ cursor: "pointer", color: "red" }}
                    />
                  </IconButton>
                </td>
              </tr>
            ))}
          </table>
        </Box>
      </Box>
    </React.Suspense>
  );
}
