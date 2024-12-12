/* eslint-disable react/no-unescaped-entities */
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

export default function Instructions() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClickOpen}
        sx={{ margin: 2 }}
      >
        Instructions
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Comment utiliser cette interface
        </DialogTitle>
        <DialogContent sx={{ "& p": { marginBottom: 2 } }}>
          <DialogContentText component="div" id="alert-dialog-description">
            <Typography>
              Avec les checkbox du haut, vous pouvez choisir entre traiter des
              tableux de produit sans tableau nutritionel. Ou traiter des
              produits pour lequels robotoof à trouver des nutriments en plus.
            </Typography>
            <Typography>
              La date de la photo est affichée au dessus de la photo.
            </Typography>
            <Typography>
              Les nutriments déjà associé au produit sont affiché en petit sous
              les inputs.
              <ol>
                <li>
                  En <span style={{ color: "green" }}>vert</span> pour ceux qui
                  matchent avec la valeur du champ
                </li>
                <li>
                  En <span style={{ color: "orange" }}>orange</span> si le champ
                  est vide
                </li>
                <li>
                  En <span style={{ color: "red" }}>rouge</span> si le champ est
                  différent de la valeur connue.
                </li>
              </ol>
              La valeur "-" indique une valeur abscente du tableau nutritionel.
              Particulierement utile pour les fibres qui sont souvent abscente.
            </Typography>
            <Typography>
              Quand une colone a été vérifiée (celle pour 100g ou celle par
              portion) il ne vous reste plus qu'à la valider pour passer à la
              suite. Innutil de remplir les deux colones. Une seul des deux peut
              être enregistrée par OFF.
            </Typography>

            <ul>
              <li>
                Le bouton "skip" passe à la suite. quelqu'un d'autre s'en
                chargera.
              </li>
              <li>
                Le bouton "invalid image" indique que la photo ne correspond pas
                à un tableau nutritionel, et supprime la question pour tout le
                monde.
              </li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
