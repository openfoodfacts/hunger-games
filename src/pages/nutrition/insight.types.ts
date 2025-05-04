export interface NutrimentPrediction {
  end: number;
  text: string;
  unit: string | null;
  score: number;
  start: number;
  valid: boolean;
  value: string | null;
  entity: string;
  char_end: number;
  char_start: number;
}

export interface InsightType {
  id: string;
  barcode: string;
  data: {
    entities: {
      postprocessed: NutrimentPrediction[];
    };
    nutrients: Record<string, NutrimentPrediction>;
  };
  source_image: string;
}
