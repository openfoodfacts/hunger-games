import * as React from "react";
import TaxonomyAutoSelect from "../../components/TaxonomyAutoSelect";
import CategoryCard, { CategoryType } from "./ItemCard";
import getTaxonomy from "../../offTaxonomy";
import Stack from "@mui/material/Stack";
import { ErrorBoundary } from "./Error";
import { Button, Typography } from "@mui/material";

export default function TaxonomyWalk() {
  const [initialItem, setInitialItem] = React.useState<null | {
    id: string;
    text: string;
  }>(null);

  const [currentId, setCurrentId] = React.useState("en:carrots");

  const [taxonomyLookup, setTaxonomyLookup] = React.useState<
    Record<string, "loading" | "failed" | CategoryType>
  >({
    "en:carrots": {
      id: "en:carrots",
      agribalyse_food_code: { en: "20009" },
      children: [
        "en:canned-carrots",
        "en:cooked-carrots",
        "en:dehydrated-carrots",
        "en:fresh-carrots",
        "en:frozen-carrots",
        "en:grated-carrots",
      ],
      ciqual_food_code: { en: "20009" },
      intake24_category_code: { en: "CRTS" },
      name: { en: "Carrots", fr: "Carottes" },
      parents: ["en:vegetables"],
    },
  });

  const fetchItem = React.useCallback(async (tag: string) => {
    setTaxonomyLookup((prev) => ({
      ...prev,
      [tag]: "loading",
    }));
    const { data } = await getTaxonomy({ tag });

    const id = Object.keys(data)[0];

    setTaxonomyLookup((prev) => ({
      ...prev,
      [id]: data[id],
    }));
  }, []);

  const currentItem = taxonomyLookup[currentId] ?? "loading";

  React.useEffect(() => {
    if (currentItem === "loading" || currentItem === "failed") {
      return;
    }

    const parentIds = currentItem.parents ?? [];
    const childrenIds = currentItem.children ?? [];

    [...parentIds, ...childrenIds].forEach((i) => {
      if (taxonomyLookup[i] === undefined) {
        fetchItem(i);
      }
    });
  }, [taxonomyLookup, currentItem]);

  return (
    <ErrorBoundary>
      <div>
        <Stack direction="row" sx={{ m: 2 }} justifyContent="flex-start">
          <TaxonomyAutoSelect
            taxonomy="category"
            value={initialItem?.text ?? null}
            onChange={(_, item) => {
              // @ts-expect-error la flem de typer cet element. C'est tout le autocomplet qui est a refaire pour supporter les objects
              fetchItem(item.id);
              // @ts-expect-error la flem de typer cet element. C'est tout le autocomplet qui est a refaire pour supporter les objects
              setInitialItem(item);
            }}
            showKey
            size="small"
            label="initial item"
            lang="fr"
            sx={{ width: 200 }}
          />

          <Button
            variant="outlined"
            disabled={initialItem === null}
            onClick={() => {
              if (!initialItem) {
                return;
              }

              fetchItem(initialItem.id);
              setCurrentId(initialItem.id);
            }}
          >
            Go to this item
          </Button>
        </Stack>

        {typeof currentItem === "string" ? (
          currentItem
        ) : (
          <Stack direction="row">
            {/* The parents */}
            <Stack direction="column" sx={{ width: "30%", mr: 1 }}>
              <Typography>Parents</Typography>
              {currentItem.parents?.map((pId) => (
                <CategoryCard
                  key={pId}
                  data={taxonomyLookup[pId] ?? "loading"}
                  goTo={() => setCurrentId(pId)}
                  id={pId}
                />
              ))}
            </Stack>

            {/* The item */}
            <Stack direction="column" sx={{ width: "30%", mr: 1 }}>
              <Typography>element</Typography>
              <CategoryCard id={currentId} data={currentItem} />
            </Stack>

            {/* The children */}
            <Stack direction="column" sx={{ width: "30%", mr: 1 }}>
              <Typography>Enfants</Typography>
              {currentItem.children?.map((cId) => (
                <CategoryCard
                  key={cId}
                  data={taxonomyLookup[cId] ?? "loading"}
                  id={cId}
                  goTo={() => setCurrentId(cId)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </div>
    </ErrorBoundary>
  );
}
