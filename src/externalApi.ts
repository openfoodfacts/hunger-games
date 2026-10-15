import { NUTRI_PATROL_PRODUCT_URL, NUTRI_PATROL_URL } from "./const";

export const addImageFlag = (opts: { barcode: string; imgid: number }) => {
  const { barcode, imgid } = opts;
  const imgidStr = imgid?.toString() || "";
  const NutriPatrolURL =
    `${NUTRI_PATROL_URL}?` +
    new URLSearchParams({
      barcode: barcode || "",
      image_id: imgidStr || "",
      source: "web",
      flavor: "off",
    }).toString();
  try {
    window.open(NutriPatrolURL, "_blank", "noopener,noreferrer");
  } catch (error) {
    throw new Error("Could not open NutriPatrol", { cause: error });
  }
};

export const getProductFlagUrl = (barcode: string) =>
  `${NUTRI_PATROL_PRODUCT_URL}?` +
  new URLSearchParams({
    barcode: barcode || "",
    source: "web",
    flavor: "off",
  }).toString();

const externalApi = {
  addImageFlag,
  getProductFlagUrl,
};

export default externalApi;
