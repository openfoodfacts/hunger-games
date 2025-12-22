import { useTranslation } from "react-i18next";
import { FilterParams, useFilterState } from "../../hooks/useFilterState";
import getTaxonomy from "../../offTaxonomy";
import { Stack, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Loader from "../loader";
import { useQuestionsQuery } from "../../hooks/useQuestions";
import { getValueTagQuestionsURL } from "./utils/getValueTagQuestionsURL";
import { t } from "i18next";

export function SimilarQuestions({
  filterState,
  setFilterState,
}: {
  filterState: FilterParams;
  setFilterState: (params: Partial<FilterParams>) => void;
}) {
  const { t } = useTranslation();

  const valueTag = filterState.valueTag || "";

  const { data: similars, isPending } = useQuery({
    queryKey: ["taxonomy", filterState.insightType, valueTag],
    queryFn: async () => {
      const rep = await getTaxonomy({
        taxonomy: filterState.insightType,
        tag: valueTag,
      });

      return [
        ...(rep[valueTag]?.parents ?? []),
        ...(rep[valueTag]?.children ?? []),
      ];
    },
  });

  return (
    <Stack direction="column" alignItems="center" spacing={1}>
      <p>{t("questions.no_questions_remaining")}</p>

      <p>{t("questions.similar_questions")}</p>
      {isPending ? (
        <Loader />
      ) : similars?.length === 0 ? (
        <p>{t("questions.no_similar_questions")}</p>
      ) : (
        <ul>
          {similars?.map((tag) => (
            <LabelWithNumber key={tag} tag={tag} />
          ))}
        </ul>
      )}
      <Button
        size="small"
        variant="contained"
        onClick={() => setFilterState({})}
      >
        {t("questions.reset_filters")}
      </Button>
    </Stack>
  );
}

function LabelWithNumber({ tag }: { tag: string }) {
  const [filterState] = useFilterState();

  const valueTagQuestionsURL = getValueTagQuestionsURL(filterState, {
    insight_id: "",
    insight_type: filterState.insightType || "",
    value_tag: tag,
  });

  const { status, count } = useQuestionsQuery(tag);

  if (!valueTagQuestionsURL) {
    return null;
  }
  return (
    <li>
      <a href={valueTagQuestionsURL}>
        {tag} (
        {status === "pending"
          ? "..."
          : t("questions.remaining_questions_count", { count: count ?? 0 })}
        )
      </a>
    </li>
  );
}
