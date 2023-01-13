import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import LogoForm from "./LogoForm";
import LogoGrid from "./LogoGrid";
import robotoff from "../robotoff";
import { DialogActions } from "@mui/material";
import { IS_DEVELOPMENT_MODE } from "../const";

const AnnotateLogoModal = (props) => {
  const {
    isOpen,
    logos,
    closeAnnotation,
    toggleLogoSelection,
    afterAnnotation,
    value = "",
    type = "",
  } = props;

  const sendAnnotation = async ({ type, value }) => {
    try {
      if (!IS_DEVELOPMENT_MODE) {
        await robotoff.annotateLogos(
          logos
            .filter((logo) => logo.selected)
            .map(({ id }) => ({
              logo_id: id,
              value,
              type,
            }))
        );
      }
      logos
        .filter((logo) => logo.selected)
        .forEach(({ id }) => {
          toggleLogoSelection(id);
        });
      closeAnnotation();
      afterAnnotation?.(
        logos.filter((logo) => logo.selected),
        { value, type }
      );
    } catch {}
  };
  return (
    <Dialog open={isOpen} onClose={closeAnnotation} maxWidth="xl">
      <DialogContent>
        <LogoForm value={value} type={type} request={sendAnnotation} />
        <LogoGrid
          logos={logos.filter((logo) => logo.selected)}
          toggleLogoSelection={toggleLogoSelection}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAnnotation}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnnotateLogoModal;
