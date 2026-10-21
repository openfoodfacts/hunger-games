export interface DataQualityProduct {
  code: string;
  product_name: string;
  brands: string;
  unique_scans_n: number;
  data_quality_errors_tags: string[];
  image_front_url?: string;
  image_nutrition_url?: string;
  image_ingredients_url?: string;
  countries?: string;
  energy_100g?: number;
  status?: "pending" | "fixed" | "skipped";
}

export interface DataQualityMetrics {
  lastProductEditedOn: string;
  totalNbOfProducts: number;
  nbOfProductsWithAnIssue: number;
  percentOfProductsWithAnIssue: number;
  goalInPercent: number;
  totalNBOfModifiedProducts: number;
  totalNBOfNewProducts: number;
  newProductsLast7Days: { day: string; count: number }[];
  nbOfProductsFixedYesterday: number;
  nbOfNewProductsWithIssuesYesterday: number;
  nbOfNewProductsWithIssues: number;
  averageNbOfProductsFixedPerDay: number;
  averageNbOfNewProductsInErrorPerDay: number;
  averageNetProductsFixedPerDay: number;
  uniqScans: number;
  uniqScansIssues: number;
  issuesInScansPercent: number;
  activeContributorsCount: number;
  estimatedDaysToGoal: number;
}

export interface LeaderboardContributor {
  rank: number;
  username: string;
  nbOfProductsFixed: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface ErrorCategoryInfo {
  id: string;
  titleKey: string;
  defaultTitle: string;
  descriptionKey: string;
  defaultDescription: string;
  count: number;
  tags: string[];
  icon: "nutrition" | "ingredients" | "label" | "weight" | "all";
}

export type MissionFilterType =
  "all" | "nutrition" | "ingredients" | "labels" | "high_popularity";
export type MissionMode = "daily" | "hero_more" | "hardcore_random";
