// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addImageFlag = (opts: {
  barcode: string;
  imgid: string;
  url: string;
}) => {
  // TODO: Replace this with NutriPatrol
  throw new Error("This function is not implemented yet");
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
