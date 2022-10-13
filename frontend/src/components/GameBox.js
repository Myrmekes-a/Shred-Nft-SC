import { Dialog } from "@mui/material";
import Iframe from "react-iframe";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

export default function GameBox({ opened, onClose }) {
    const openFullscreen = () => {
        var elem = document.getElementById("flappy-ape");
        if (elem) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        }
    }
    return (
        <Dialog
            open={opened}
            onClose={() => onClose()}
            maxWidth="md"
        >
            <Iframe url="https://i.simmer.io/@KiD/flappy-ape"
                width="800px"
                height="450px"
                id="flappy-ape"
                className="flappy-ape"
                display="initial"
                position="relative" />
            <button className="full-width-cta" onClick={() => openFullscreen()}>
                <FullscreenIcon fontSize="medium" />
            </button>
            <button className="full-close-cta" onClick={() => onClose()}>
                <CloseIcon fontSize="medium" />
            </button>
        </Dialog>
    )
}