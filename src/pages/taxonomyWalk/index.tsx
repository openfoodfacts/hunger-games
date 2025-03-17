import * as React from "react";
import TaxonomyAutoSelect from "../../components/TaxonomyAutoSelect";
import CategoryCard, { CategoryType } from "./ItemCard";
import getTaxonomy from "../../offTaxonomy";
import Stack from "@mui/material/Stack";
import { ErrorBoundary } from "./Error";
import { Button, Typography } from "@mui/material";
import ForceGraph from "./ForceGraph";
import { generateGraph } from "./generateGraph";

export default function TaxonomyWalk() {
  const [initialItem, setInitialItem] = React.useState<null | {
    id: string;
    text: string;
  }>(null);

  const [currentId, setCurrentId] = React.useState(
    "en:meals",
    // "en:carrots"
  );

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
    "en:meals": {
      children: [
        "en:acras",
        "en:aligots",
        "en:banh-bao",
        "en:basque-style-piperade",
        "en:bean-dishes",
        "en:boiled-meat-with-vegetables",
        "en:braised-european-hake",
        "en:buckwheat-crepe-filled-with-cheese-ham-and-mushrooms",
        "en:buckwheat-crepe-with-mushrooms",
        "en:bulgur-dishes",
        "en:canned-meals",
        "en:chinese-dumplings",
        "en:chop-suey",
        "en:combination-meals",
        "en:cooked-egg-yolk",
        "en:cooked-steamed-shrimp-dumplings",
        "en:cooked-unsalted-couscous",
        "en:couscous",
        "en:crepe-filled-with-cheese",
        "en:crepe-filled-with-egg-ham-and-cheese",
        "en:crepe-filled-with-scallops",
        "en:crepes-filled-with-fish",
        "en:crepes-filled-with-seafood",
        "en:dough-based-meals-ready",
        "en:dough-based-meals-variety-packs",
        "en:dried-meals",
        "en:egg-white-cooked",
        "en:endives-with-ham",
        "en:fajitas",
        "en:filled-buckwheat-crepes",
        "en:filled-fritter-garnished-with-shrimps-and-vegetables-and-poultry-and-meat",
        "en:filled-fritters",
        "en:filled-pinsa",
        "en:filled-steamed-buns",
        "en:focaccia",
        "en:fresh-meals",
        "en:fried-egg",
        "en:frozen-dough-based-meals-to-prepare",
        "en:frozen-grain-based-meals",
        "en:frozen-ready-made-meals",
        "en:grain-based-meals",
        "en:gratins",
        "en:hotpots",
        "en:irish-stews",
        "en:khatfa",
        "en:lentil-dishes",
        "en:low-fat-prepared-meals",
        "en:meal-replacements",
        "en:meals-with-falafels",
        "en:meals-with-fish",
        "en:meals-with-meat",
        "en:meals-with-shellfish",
        "en:microwave-meals",
        "en:moussaka",
        "en:nems",
        "en:non-frozen-dough-based-meals-to-prepare",
        "en:omelettes",
        "en:pad-thai",
        "en:pan-fried-dishes",
        "en:pasta-dishes",
        "en:pizzas-pies-and-quiches",
        "en:plant-based-meals",
        "en:poached-eggs",
        "en:pork-sausage-stew-with-cabbage-carrots-and-potatoes",
        "en:potato-dishes",
        "en:prepared-lentils",
        "en:prepared-salads",
        "en:puff-pastry-meals",
        "en:quinoa-dishes",
        "en:ratatouille",
        "en:refrigerated-dough-based-meals-ready",
        "en:refrigerated-meals",
        "en:rice-dishes",
        "en:samosas",
        "en:sauerkraut-with-garnish",
        "en:savory-semolina-dishes",
        "en:scrambled-egg",
        "en:soft-boiled-eggs",
        "en:soups",
        "en:spanish-omelettes",
        "en:spring-rolls",
        "en:stews",
        "en:stuffed-cabbage",
        "en:stuffed-vine-leaves",
        "en:sushi-and-maki",
        "en:tabbouleh",
        "en:tajine",
        "en:truffades",
        "en:vegetarian-meals",
        "en:waterzooi",
        "fr:cereales-preparees",
        "fr:choucroutes-de-la-mer",
        "fr:crepes-au-jambon",
        "fr:fondues",
        "fr:quenelles",
      ],
      food_groups: {
        en: "en:one-dish-meals",
      },
      incompatible_with: {
        en: "categories:en:beverages",
      },
      name: {
        en: "Meals",
        fr: "Plats préparés",
      },
      nova: {
        en: "3",
      },
      pnns_group_2: {
        en: "One-dish meals",
      },
      synonyms: {
        en: ["Meals", "Prepared meals", "Prepared dishes"],
        fr: [
          "Plats préparés",
          "plat préparé",
          "plats cuisinés",
          "plat cuisiné",
        ],
      },
      wikidata: {
        en: "Q3391775",
      },
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

  const { nodes, links } = generateGraph("en:meals", taxonomyLookup);
  return (
    <ErrorBoundary>
      <div>
        <ForceGraph linksData={links} nodesData={nodes} />
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
