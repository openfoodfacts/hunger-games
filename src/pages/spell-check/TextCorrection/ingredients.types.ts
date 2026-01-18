export type BooleanEstimation = "no" | "yes" | "maybe";
export type ParsedIngredientsType = {
    ciqual_proxy_food_code?: string;
    id: string;
    ingredients?: ParsedIngredientsType[];
    is_in_taxonomy: 0 | 1;
    origins?: string;
    percent_estimate: number;
    percent_max: number;
    percent_min: number;
    text: string;
    vegan: BooleanEstimation;
    vegetarian: BooleanEstimation;
};