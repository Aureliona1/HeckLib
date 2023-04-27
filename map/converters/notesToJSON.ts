import V2JsonNote from "../../interfaces/objects/json/v2/v2jsonNote";
import INote from "../../interfaces/objects/note";
import { V3FILE } from "../finalize";
import { fakeNotes, notes } from "../variables";

export function notesToJSON(): V2JsonNote[] {
    const noteArr: any[] = [];
    if (notes) notes.forEach((n: INote) => {
        let noteJSON: Record<string, any> = {
            b: n.time,
            c: n.type,
            d: n.direction,
            a: n.angle,
            x: n.x,
            y: n.y,
            customData: {
                ...n.customData,
                animation: {
                    ...n.animation
                }
            }
        };
        if (Object.keys(noteJSON.customData.animation).length < 1)
            delete noteJSON.customData.animation;
        if (Object.keys(noteJSON.customData).length < 1)
            delete noteJSON.customData;
        let stringified = JSON.stringify(noteJSON)
            .replace('"njs"', '"noteJumpMovementSpeed"')
            .replace('"offset"', '"noteJumpStartBeatOffset"');
        if (V3FILE) {
            stringified = stringified
                .replace('"interactable":false', '"uninteractable":true')
                .replace(/"interactable":true,?/, '')
                .replace('"disableSpawnEffect":true', '"spawnEffect":false');
        } else {
            stringified = stringified
                .replace('"b":', '"time":')
                .replace('"c":', '"type":')
                .replace('"d":', '"cutDirection":')
                .replace('"x":', '"lineIndex":')
                .replace('"y":', '"lineLayer":')
                .replace(/"a":\d+,/g, '')
                .replace(/"([^_][\w\d]+)":/g, '"_$1":');
        }
        noteJSON = JSON.parse(stringified);
        if (V3FILE) {
            if (noteJSON.customData) {
                if (noteJSON.customData.animation) {
                    noteJSON.customData.animation = JSON.parse(JSON.stringify(noteJSON.customData.animation)
                    .replace(/"position":/g, '"offsetPosition":')
                    .replace(/"rotation":/g, '"offsetWorldRotation":'))
                }
                noteJSON.customData = JSON.parse(JSON.stringify(noteJSON.customData)
                .replace(/"position":/g, '"coordinates":')
                .replace(/"rotation":/g, '"worldRotation":'))
            }
        }
        if (V3FILE && noteJSON.customData && Object.keys(noteJSON.customData).includes("fake")) {
            delete noteJSON.customData.fake;
            fakeNotes.push(noteJSON);
        } else
            noteArr.push(noteJSON);
    });
    return noteArr;
}
