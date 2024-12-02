export interface InsightType {
  id: string;
  barcode: string;
  data: {
    entities: {
      postprocessed: {
        end: number;
        text: string;
        unit: string;
        score: number;
        start: number;
        valid: boolean;
        value: string;
        entity: string;
        char_end: number;
        char_start: number;
      }[];
    };
    nutrients: Record<
      string,
      {
        end: number;
        text: string;
        unit: string;
        score: number;
        start: number;
        valid: boolean;
        value: string;
        entity: string;
        char_end: number;
        char_start: number;
      }
    >;
  };
  source_image: string;
}
