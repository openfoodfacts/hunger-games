import * as React from "react";

import { checkedFetch, checkedJsonFetch } from "../../utils/checkedFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

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
const flaggedImagesKey = ["flagged-images"] as const;

const getImageUrl = (code: string, imgid: number) =>
  `${OFF_IMAGE_URL}/${off.getFormatedBarcode(code)}/${imgid}.jpg`;

export default function FlaggedImages() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data = [], isPending } = useQuery({
    queryKey: flaggedImagesKey,
    queryFn: async () =>
      (await checkedJsonFetch<ApiRequest>(flagImageUrl)).result,
    retry: false,
  });
  const deleteImage = useMutation({
    mutationFn: ({ code, imgid }: Pick<FlaggedImage, "code" | "imgid">) =>
      checkedFetch(flagImageUrl + code, {
        method: "DELETE",
        body: JSON.stringify({ imgid }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (_response, { code, imgid }) => {
      queryClient.setQueryData<FlaggedImage[]>(flaggedImagesKey, (previous) =>
        previous?.filter(
          (image) => image.code !== code || image.imgid !== imgid,
        ),
      );
    },
  });

  if (isPending) {
    return <p>{t(`flagged_images.loading`)}</p>;
  }
  return (
    <React.Suspense>
      <Box>
        <Box sx={{ padding: 2 }}>
          <Typography>{t("flagged_images.title")}</Typography>
          {deleteImage.isError && (
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
                    onClick={() => deleteImage.mutate({ code, imgid })}
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
