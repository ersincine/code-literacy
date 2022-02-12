import { Audio } from './utils';

export const ROWS = 5;
export const COLS = 5;
export const TILE_SIZE = 90;
export const TILE_PADDING = 10;
export const INIT_ROW_IDX = 0;
export const INIT_COL_IDX = 0;
export const TEXT_SIZE = 16;
export const ICON_SIZE = 40;
export const TILE_COLOR = "#E0E0E0";
export const CANVAS_COLOR = "#505050";

const YELLOW = "rgb(230, 220, 30)";
const RED = "rgb(210, 75, 75)";
const BLUE = "rgb(70, 150, 220)";
const GREEN = "rgb(100, 225, 100)";

//export const SOUND_ACTION = new Sound("../beep.wav"); // Adım cevaplanınca.
export const SOUND_GOOD = new Audio("../sounds/beep.wav"); // Adım doğru cevaplanınca.
export const SOUND_BAD = new Audio("../sounds/negative.wav"); // Adım yanlış cevaplanınca.
export const SOUND_SUCCESS = new Audio("../sounds/tada.wav"); // Problem çözülünce.
export const SOUND_FINISHED = new Audio("../sounds/tada.wav"); // Son problem çözülünce.
export const SOUND_START = new Audio("../sounds/confirm.wav"); // Yardım aldıktan sonra bir probleme başlarken (Tuvale tıklama sonrası da dahil).
export const SOUND_CHANGE = new Audio("../sounds/change.wav"); // Önceki-sonraki problem düğmelerine basınca.
export const SOUND_HELP_OR_EXIT = new Audio("../sounds/help.wav"); // İpucu alırken (Yardım düğmesine basınca veya tuvale tıklayınca). Veya exit yaparken.
export const SOUND_ARCADE = new Audio("../sounds/arcade.wav");

export function getColor(color: string) {
    if (color == "yellow") return YELLOW;
    if (color == "red") return RED;
    if (color == "blue") return BLUE;
    if (color == "green") return GREEN;
    return undefined;
}