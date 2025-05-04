import { useQuery } from "@tanstack/react-query";
import offService from "../off";

export const useProductData = (barcode?: string) => {
  return useQuery({
    queryKey: ["product", barcode],
    queryFn: () => {
      if (!barcode) {
        throw new Error("No Barcode");
      }
      return offService.getProduct(barcode).then((result) => {
        const product = result.data.product;

        if (!product) {
          throw new Error("No product found");
        }

        return { code: result.data.code, ...product };
      });
    },
  });
};
