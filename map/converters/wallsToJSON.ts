
import IWall from "../../interfaces/objects/wall";
import { V3 } from "../initialize";
import { fakeWalls, walls } from "../variables";

export function wallsToJSON(): Record<string, any>[] {
    const wallArr: any[] = [];
    walls.forEach((w: IWall) => {
        let wallJSON: Record<string, any> = {
            b: w.time,
            x: w.x,
            y: w.y,
            d: w.duration,
            w: w.width,
            h: w.height,
            customData: {
                ...w.data,
                animation: {
                    ...w.anim
                }
            }
        };
        if (Object.keys(wallJSON.customData.animation).length < 1)
            delete wallJSON.customData.animation;
        if (Object.keys(wallJSON.customData).length < 1)
            delete wallJSON.customData;
        let stringified = JSON.stringify(wallJSON)
            .replace('"njs"', '"noteJumpMovementSpeed"')
            .replace('"offset"', '"noteJumpStartBeatOffset"');
        if (V3) {
            stringified = stringified
                .replace('"interactable":false', '"uninteractable":true')
                .replace('"interactable":true', '"uninteractable":false')
                .replace('"disableSpawnEffect":true', '"spawnEffect":false');
        } else {
            stringified = stringified
                .replace('"b":', '"time":')
                .replace('"x":', '"lineIndex":')
                .replace(/"y":(\d)/, '"type":$1')
                .replace('"d":', '"duration":')
                .replace('"w":', '"width":')
                .replace(/"h":\d+,/, '')
                .replace(/"([^_][\w\d]+)":/g, '"_$1":');
        }
        wallJSON = JSON.parse(stringified);
        if (V3) {
            if (wallJSON.customData) {
                if (wallJSON.customData.animation) {
                    wallJSON.customData.animation = JSON.parse(JSON.stringify(wallJSON.customData.animation)
                    .replace(/"position":/g, '"offsetPosition":')
                    .replace(/"rotation":/g, '"offsetWorldRotation":'))
                }
                wallJSON.customData = JSON.parse(JSON.stringify(wallJSON.customData)
                .replace(/"position":/g, '"coordinates":')
                .replace(/"rotation":/g, '"worldRotation":')
                .replace(/"scale":/g, '"size":'))
            }
        }
        if (V3 && wallJSON.customData && Object.keys(wallJSON.customData).includes("fake")) {
            delete wallJSON.customData.fake;
            delete walls[walls.indexOf(w)];
            fakeWalls.push(wallJSON);
        } else {
            wallArr.push(wallJSON);
        }
    });
    return wallArr;
}
