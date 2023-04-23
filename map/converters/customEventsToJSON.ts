import ICustomEvent from "../../interfaces/events/eventData/ICustomEvent";
import { V3 } from "../initialize";
import { events } from "../variables";

export function customEventsToJSON(): Record<string, any>[] {
    const eventArr: any[] = [];
    if (events)
        events.forEach((e: ICustomEvent) => {
            const eventJSON: Record<string, any> = {
                b: e.time,
                t: e.type,
                d: e.data
            };
            let stringified = JSON.stringify(eventJSON);
            if (!V3) {
                stringified = stringified
                    .replace('"b":', '"time":')
                    .replace('"t":', '"type":')
                    .replace('"d":', '"data":')
                    .replace(/"([^_][\w\d]+)":/g, '"_$1":');
            }
            eventArr.push(JSON.parse(stringified));
        });
    return eventArr;
}
