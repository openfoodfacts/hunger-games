import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@mui/material";

export type CategoryType = {
  id: string;
  children?: string[];
  parents?: string[];
  name?: { en?: string; fr?: string };
  agribalyse_food_code?: { en: string };
  ciqual_food_code?: { en: string };
  intake24_category_code?: { en: string };
};

export default function CategoryCard(props: {
  id: string;
  data: CategoryType | "failed" | "loading";
  clickChildren?: (id: string) => void;
  clickParent?: (id: string) => void;
  goTo?: () => void;
  hideParent?: boolean;
  hideChildren?: boolean;
}) {
  const { id: itemId, data, clickParent, hideChildren, goTo } = props;

  const [showMore, setShowMore] = React.useState(false);

  if (data === "loading") {
    return null;
  }

  if (data === "failed") {
    return (
      <Card sx={{ border: "solid black 1px", mb: 0.5 }}>
        <CardContent>
          <Box>
            <Typography variant="h5">{itemId}</Typography>
            <Typography>No data found</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  const { parents = [], children = [], name, id, ...other } = data;

  return (
    <Card sx={{ border: "solid black 1px", mb: 0.5 }}>
      <CardContent>
        <Box>
          <Typography variant="h5">
            {name ? Object.values(name).join("/") : id}
            {!!goTo && <Button onClick={() => goTo()}>Go</Button>}
          </Typography>
          {showMore && (
            <pre style={{ fontSize: 10 }}>{JSON.stringify(other, null, 2)}</pre>
          )}
          <button onClick={() => setShowMore((p) => !p)}>
            {showMore ? "hide data" : "additional info"}
          </button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            borderTop: "solid black 1px",
            pt: 1,
            mt: 1,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography>parents</Typography>
            <List>
              {parents.map((parentId) => (
                <ListItem
                  key={parentId}
                  onClick={() => clickParent?.(parentId)}
                  sx={{ p: 0 }}
                >
                  {parentId}
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography>enfants</Typography>
            <List>
              {children &&
                !hideChildren &&
                children.map((childId) => (
                  <ListItem
                    key={childId}
                    onClick={() => clickParent?.(childId)}
                    sx={{ p: 0 }}
                  >
                    {childId}
                  </ListItem>
                ))}
            </List>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
