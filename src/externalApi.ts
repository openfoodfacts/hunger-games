// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addImageFlag = (opts: {
  barcode: string | undefined;
  imgid: number | undefined;
}) => {
  const {barcode, imgid} = opts;
  const imgidStr = imgid?.toString() || '';
  const NutriPatrolURL = 'https://nutripatrol.openfoodfacts.org/flag/image/?'+
  new URLSearchParams({
    barcode: barcode || '',
    image_id: imgidStr || '',
    source: "web", flavor: "off",
  }).toString();
  try {
    window.open(NutriPatrolURL, '_blank', 'noopener,noreferrer');
  } catch (error) {
    throw new Error("Could not open NutriPatrol, error: " + error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeImageFlag = (opts: { barcode: string; imgid: string }) => {
  // TODO: Replace this with NutriPatrol
  throw new Error("This function is not implemented yet");
};

const externalApi = {
  addImageFlag,
  removeImageFlag,
};

export default externalApi;
