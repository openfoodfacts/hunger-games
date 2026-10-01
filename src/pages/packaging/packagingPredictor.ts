import type {
  DetectedPackagingItem,
  OcrAnalysisResult,
  ProductDescription,
} from "./types";

/**
 * Deduce number of items from product quantity (e.g. "6 x 33cl" -> 6)
 */
export function deduceQuantityUnits(
  quantity?: string | null,
): number | undefined {
  if (!quantity) return undefined;

  // Patterns like: "6 x 33cl", "4x100g", "6*50ml", "pack of 12", "12 canettes", "8 pots", "4 portions"
  const multiMatch = quantity.match(
    /\b(\d+)\s*(?:x|\*|×|bouteilles?|pots?|canettes?|boites?|boîtes?|portions?|sachets?|pièces?|pieces?|briques?|flacons?|sticks?)\b/i,
  );
  if (multiMatch && multiMatch[1]) {
    const val = parseInt(multiMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 100) {
      return val;
    }
  }

  const prefixMatch = quantity.match(/\b(?:pack|lot)\s*(?:de\s*)?(\d+)\b/i);
  if (prefixMatch && prefixMatch[1]) {
    const val = parseInt(prefixMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 100) {
      return val;
    }
  }

  return undefined;
}

/**
 * Predict packaging components from product categories
 */
export function predictFromCategories(
  categoriesTags?: string[],
  unitsCount?: number,
): DetectedPackagingItem[] {
  if (!categoriesTags || categoriesTags.length === 0) return [];
  const tags = categoriesTags.map((c) => c.toLowerCase());
  const units = unitsCount ?? 1;

  // Prepared meals / Ready meals / Traiteur
  if (
    tags.some(
      (c) =>
        c.includes("prepared-meals") ||
        c.includes("ready-meals") ||
        c.includes("plats-prepares") ||
        c.includes("traiteur") ||
        c.includes("pizzas") ||
        c.includes("fresh-meat"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Category suggests tray meal",
        numberOfUnits: 1,
        shape: { id: "en:tray", name: "Tray (Barquette)" },
        material: { id: "en:plastic", name: "Plastic" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Category suggests sealing film",
        numberOfUnits: 1,
        shape: { id: "en:film", name: "Film" },
        material: { id: "en:plastic", name: "Plastic" },
        recycling: { id: "en:discard", name: "Discard" },
      },
    ];
  }

  // Dairy desserts / Yogurts
  if (
    tags.some(
      (c) =>
        c.includes("yogurts") ||
        c.includes("dairy-desserts") ||
        c.includes("yaourts") ||
        c.includes("compotes"),
    )
  ) {
    const potCount = units > 1 ? units : 4;
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Category suggests yogurt pots",
        numberOfUnits: potCount,
        shape: { id: "en:pot", name: "Pot" },
        material: { id: "en:plastic", name: "Plastic" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Category suggests seals",
        numberOfUnits: potCount,
        shape: { id: "en:seal", name: "Seal (Opercule)" },
        material: { id: "en:aluminium", name: "Aluminium" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Beers
  if (tags.some((c) => c.includes("beers") || c.includes("bieres"))) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Beer bottle",
        numberOfUnits: units,
        shape: { id: "en:bottle", name: "Bottle" },
        material: { id: "en:glass", name: "Glass" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Beer bottle crown cap",
        numberOfUnits: units,
        shape: { id: "en:cap", name: "Cap (Capsule)" },
        material: { id: "en:metal", name: "Metal" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Beverages, waters, sodas
  if (
    tags.some(
      (c) =>
        c.includes("beverages") ||
        c.includes("waters") ||
        c.includes("sodas") ||
        c.includes("boissons") ||
        c.includes("soft-drinks"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Beverage bottle",
        numberOfUnits: units,
        shape: { id: "en:bottle", name: "Bottle" },
        material: { id: "en:pet", name: "Plastic (PET)" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Bottle cap",
        numberOfUnits: units,
        shape: { id: "en:cap", name: "Cap" },
        material: { id: "en:hdpe", name: "Plastic (HDPE)" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Jams, sauces, pickles
  if (
    tags.some(
      (c) =>
        c.includes("jams") ||
        c.includes("sauces") ||
        c.includes("spreads") ||
        c.includes("pickles") ||
        c.includes("confitures"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Glass jar for sauce/jam",
        numberOfUnits: units,
        shape: { id: "en:jar", name: "Jar (Bocal)" },
        material: { id: "en:glass", name: "Glass" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Metal lid",
        numberOfUnits: units,
        shape: { id: "en:lid", name: "Lid (Couvercle)" },
        material: { id: "en:metal", name: "Metal" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Canned foods
  if (
    tags.some(
      (c) =>
        c.includes("canned-foods") ||
        c.includes("canned-vegetables") ||
        c.includes("conserves"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Canned food metal can",
        numberOfUnits: units,
        shape: { id: "en:can", name: "Can (Boîte)" },
        material: { id: "en:steel", name: "Steel / Metal" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Biscuits, cakes, cereals
  if (
    tags.some(
      (c) =>
        c.includes("biscuits") ||
        c.includes("cereals") ||
        c.includes("cookies") ||
        c.includes("gateaux"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Outer cardboard box",
        numberOfUnits: 1,
        shape: { id: "en:box", name: "Box (Étui)" },
        material: { id: "en:cardboard", name: "Cardboard" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
      {
        source: "category",
        confidence: "medium",
        description: "Inner plastic bag / wrapper",
        numberOfUnits: units > 1 ? units : 1,
        shape: { id: "en:bag", name: "Bag / Sachet" },
        material: { id: "en:plastic", name: "Plastic" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  // Chips, crisps, snacks
  if (
    tags.some(
      (c) =>
        c.includes("chips-and-crisps") ||
        c.includes("snacks") ||
        c.includes("bonbons"),
    )
  ) {
    return [
      {
        source: "category",
        confidence: "medium",
        description: "Snack plastic bag",
        numberOfUnits: units,
        shape: { id: "en:bag", name: "Bag / Sachet" },
        material: { id: "en:plastic", name: "Plastic" },
        recycling: { id: "en:recycle", name: "Recycle" },
      },
    ];
  }

  return [];
}

/**
 * Predict packaging clues from product labels
 */
export function predictFromLabels(
  labelsTags?: string[],
): DetectedPackagingItem[] {
  if (!labelsTags || labelsTags.length === 0) return [];
  const items: DetectedPackagingItem[] = [];

  for (const label of labelsTags) {
    const l = label.toLowerCase();

    if (l.includes("fsc") || l.includes("pefc")) {
      items.push({
        source: "label",
        confidence: "high",
        description:
          "FSC/PEFC certification confirms paper/cardboard component",
        shape: { id: "en:box", name: "Box (Carton)" },
        material: { id: "en:cardboard", name: "Cardboard" },
        recycling: { id: "en:recycle", name: "Recycle" },
      });
    }

    if (l.includes("tetrapak") || l.includes("tetra-pak")) {
      items.push({
        source: "label",
        confidence: "high",
        description: "Tetra Pak label detected",
        shape: { id: "en:carton", name: "Carton / Brique" },
        material: { id: "en:tetra-pak", name: "Tetra Pak" },
        recycling: { id: "en:recycle", name: "Recycle" },
      });
    }

    if (l.includes("1-pet") || l.includes("pet")) {
      items.push({
        source: "label",
        confidence: "high",
        description: "01 PET plastic resin label",
        material: { id: "en:pet", name: "Plastic (01 PET)" },
      });
    }

    if (l.includes("2-pehd") || l.includes("hdpe")) {
      items.push({
        source: "label",
        confidence: "high",
        description: "02 HDPE plastic resin label",
        material: { id: "en:hdpe", name: "Plastic (02 HDPE)" },
      });
    }

    if (l.includes("triman") || l.includes("ecoponto")) {
      items.push({
        source: "label",
        confidence: "high",
        description: "Sorting info (Triman / Ecoponto)",
        recycling: { id: "en:recycle", name: "Recycle" },
      });
    }
  }

  return items;
}

/**
 * Analyze OCR text extracted from Google Cloud Vision JSON
 */
export function analyzeOcrText(
  text: string,
  quantityUnits?: number,
): OcrAnalysisResult {
  const normText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const detectedItems: DetectedPackagingItem[] = [];
  const shapesFound: string[] = [];
  const materialsFound: string[] = [];
  const recyclingsFound: string[] = [];

  // Keywords dictionary
  const shapeKeywords: Record<string, { id: string; name: string }> = {
    barquette: { id: "en:tray", name: "Barquette" },
    tray: { id: "en:tray", name: "Tray" },
    film: { id: "en:film", name: "Film" },
    opercule: { id: "en:seal", name: "Opercule" },
    bouteille: { id: "en:bottle", name: "Bouteille" },
    bottle: { id: "en:bottle", name: "Bottle" },
    bouchon: { id: "en:cap", name: "Bouchon" },
    cap: { id: "en:cap", name: "Cap" },
    capsule: { id: "en:cap", name: "Capsule" },
    boite: { id: "en:box", name: "Boîte" },
    box: { id: "en:box", name: "Box" },
    etui: { id: "en:box", name: "Étui" },
    bocal: { id: "en:jar", name: "Bocal" },
    jar: { id: "en:jar", name: "Jar" },
    couvercle: { id: "en:lid", name: "Couvercle" },
    lid: { id: "en:lid", name: "Lid" },
    canette: { id: "en:can", name: "Canette" },
    can: { id: "en:can", name: "Can" },
    pot: { id: "en:pot", name: "Pot" },
    sachet: { id: "en:bag", name: "Sachet" },
    poche: { id: "en:bag", name: "Poche" },
    sac: { id: "en:bag", name: "Sac" },
    bag: { id: "en:bag", name: "Bag" },
    tube: { id: "en:tube", name: "Tube" },
    brique: { id: "en:carton", name: "Brique" },
    carton: { id: "en:carton", name: "Carton" },
    gobelet: { id: "en:cup", name: "Gobelet" },
    blister: { id: "en:tray", name: "Blister" },
  };

  const materialKeywords: Record<string, { id: string; name: string }> = {
    plastique: { id: "en:plastic", name: "Plastique" },
    plastic: { id: "en:plastic", name: "Plastic" },
    verre: { id: "en:glass", name: "Verre" },
    glass: { id: "en:glass", name: "Glass" },
    carton: { id: "en:cardboard", name: "Carton" },
    cardboard: { id: "en:cardboard", name: "Cardboard" },
    papier: { id: "en:paper", name: "Papier" },
    paper: { id: "en:paper", name: "Paper" },
    metal: { id: "en:metal", name: "Métal" },
    alu: { id: "en:aluminium", name: "Alu" },
    aluminium: { id: "en:aluminium", name: "Aluminium" },
    aluminum: { id: "en:aluminium", name: "Aluminum" },
    acier: { id: "en:steel", name: "Acier" },
    steel: { id: "en:steel", name: "Steel" },
    bois: { id: "en:wood", name: "Bois" },
    tetrapak: { id: "en:tetra-pak", name: "Tetra Pak" },
    pet: { id: "en:pet", name: "PET (01)" },
    pehd: { id: "en:hdpe", name: "PEHD (02)" },
    hdpe: { id: "en:hdpe", name: "HDPE (02)" },
    pp: { id: "en:pp", name: "PP (05)" },
    ps: { id: "en:ps", name: "PS (06)" },
  };

  const recyclingKeywords: Record<string, { id: string; name: string }> = {
    "a recycler": { id: "en:recycle", name: "À recycler" },
    recycler: { id: "en:recycle", name: "Recycler" },
    recyclable: { id: "en:recycle", name: "Recyclable" },
    "bac de tri": { id: "en:recycle", name: "Bac de tri" },
    "bac jaune": { id: "en:recycle", name: "Bac jaune" },
    "poubelle jaune": { id: "en:recycle", name: "Poubelle jaune" },
    "ecoponto amarelo": { id: "en:recycle", name: "Ecoponto amarelo" },
    "gelbe tonne": { id: "en:recycle", name: "Gelbe tonne" },
    "a jeter": { id: "en:discard", name: "À jeter" },
    jeter: { id: "en:discard", name: "À jeter" },
    "ordures menageres": { id: "en:discard", name: "Ordures ménagères" },
    "bac noir": { id: "en:discard", name: "Bac noir" },
    "bac gris": { id: "en:discard", name: "Bac gris" },
    "non recyclable": { id: "en:discard", name: "Non recyclable" },
    compostable: { id: "en:compost", name: "Compostable" },
    consigne: { id: "en:deposit", name: "Consigne" },
    pfand: { id: "en:deposit", name: "Pfand" },
  };

  // Find shape keywords present in OCR
  for (const [kw, shape] of Object.entries(shapeKeywords)) {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(normText) && !shapesFound.includes(shape.id)) {
      shapesFound.push(shape.id);
    }
  }

  // Find material keywords present in OCR
  for (const [kw, mat] of Object.entries(materialKeywords)) {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(normText) && !materialsFound.includes(mat.id)) {
      materialsFound.push(mat.id);
    }
  }

  // Find recycling keywords present in OCR
  for (const [kw, rec] of Object.entries(recyclingKeywords)) {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(normText) && !recyclingsFound.includes(rec.id)) {
      recyclingsFound.push(rec.id);
    }
  }

  // Co-occurrence patterns:
  // e.g. "BARQUETTE ET FILM PLASTIQUE A JETER"
  if (normText.includes("barquette") && normText.includes("film")) {
    const isPlastic =
      normText.includes("plastique") || normText.includes("plastic");
    const isDiscard =
      normText.includes("a jeter") || normText.includes("jeter");
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Barquette détectée",
      numberOfUnits: 1,
      shape: { id: "en:tray", name: "Tray (Barquette)" },
      material: isPlastic ? { id: "en:plastic", name: "Plastic" } : undefined,
      recycling: isDiscard
        ? { id: "en:discard", name: "Discard" }
        : { id: "en:recycle", name: "Recycle" },
    });
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Film détecté",
      numberOfUnits: 1,
      shape: { id: "en:film", name: "Film" },
      material: isPlastic ? { id: "en:plastic", name: "Plastic" } : undefined,
      recycling: isDiscard
        ? { id: "en:discard", name: "Discard" }
        : { id: "en:recycle", name: "Recycle" },
    });
  } else if (normText.includes("bouteille") && normText.includes("bouchon")) {
    const isPlastic =
      normText.includes("plastique") || normText.includes("pet");
    const isGlass = normText.includes("verre");
    const units = quantityUnits ?? 1;
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Bouteille détectée",
      numberOfUnits: units,
      shape: { id: "en:bottle", name: "Bottle (Bouteille)" },
      material: isGlass
        ? { id: "en:glass", name: "Glass" }
        : { id: "en:pet", name: "Plastic (PET)" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Bouchon détecté",
      numberOfUnits: units,
      shape: { id: "en:cap", name: "Cap (Bouchon)" },
      material: isGlass
        ? { id: "en:metal", name: "Metal" }
        : { id: "en:hdpe", name: "Plastic (HDPE)" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
  } else if (normText.includes("bocal") && normText.includes("couvercle")) {
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Bocal en verre détecté",
      numberOfUnits: 1,
      shape: { id: "en:jar", name: "Jar (Bocal)" },
      material: { id: "en:glass", name: "Glass" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Couvercle métal détecté",
      numberOfUnits: 1,
      shape: { id: "en:lid", name: "Lid (Couvercle)" },
      material: { id: "en:metal", name: "Metal" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
  } else if (normText.includes("boite") && normText.includes("sachet")) {
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Boîte carton détectée",
      numberOfUnits: 1,
      shape: { id: "en:box", name: "Box (Boîte)" },
      material: { id: "en:cardboard", name: "Cardboard" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
    detectedItems.push({
      source: "ocr",
      confidence: "high",
      description: "OCR: Sachet plastique détecté",
      numberOfUnits: quantityUnits ?? 1,
      shape: { id: "en:bag", name: "Bag (Sachet)" },
      material: { id: "en:plastic", name: "Plastic" },
      recycling: { id: "en:recycle", name: "Recycle" },
    });
  } else {
    // Individual detections
    shapesFound.forEach((shapeId) => {
      const defaultMat = materialsFound[0]
        ? { id: materialsFound[0], name: materialsFound[0].replace("en:", "") }
        : undefined;
      const defaultRec = recyclingsFound[0]
        ? {
            id: recyclingsFound[0],
            name: recyclingsFound[0].replace("en:", ""),
          }
        : undefined;

      detectedItems.push({
        source: "ocr",
        confidence: "medium",
        description: `OCR detected ${shapeId.replace("en:", "")}`,
        numberOfUnits: quantityUnits ?? 1,
        shape: { id: shapeId, name: shapeId.replace("en:", "") },
        material: defaultMat,
        recycling: defaultRec,
      });
    });
  }

  return {
    fullText: text,
    detectedItems,
    shapesFound,
    materialsFound,
    recyclingsFound,
    suggestedQuantityUnits: quantityUnits,
  };
}

/**
 * Consolidate all predictions for a product
 */
export function generateSmartPredictions(
  product: ProductDescription,
  ocrText = "",
): DetectedPackagingItem[] {
  const quantityUnits = deduceQuantityUnits(product.quantity);
  const ocrResults = analyzeOcrText(ocrText, quantityUnits);
  const categoryResults = predictFromCategories(
    product.categories_tags,
    quantityUnits,
  );
  const labelResults = predictFromLabels(product.labels_tags);

  const all: DetectedPackagingItem[] = [];

  // Prioritize OCR detections if available
  if (ocrResults.detectedItems.length > 0) {
    all.push(...ocrResults.detectedItems);
  } else if (categoryResults.length > 0) {
    all.push(...categoryResults);
  }

  // Add label-based items
  labelResults.forEach((lr) => {
    // If not already in list, add it
    if (
      !all.some(
        (item) =>
          item.shape?.id === lr.shape?.id &&
          item.material?.id === lr.material?.id,
      )
    ) {
      all.push(lr);
    }
  });

  return all;
}
