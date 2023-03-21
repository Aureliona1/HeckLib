import { readFileSync, writeFileSync } from "fs";
import { infoFile } from "../consts/info";
import { ARC, BOMB, CHAIN, CUSTOMEVENT, NOTE, POINTDEFINITION, WALL, vec1anim, vec3anim, vec4anim } from "../consts/mod";
import { IV2Map } from "./IV2Map";
import { IV3Map } from "./IV3Map";
import { LIGHT } from "../consts/types/lights/light";
import { JSONtoLights } from "./converters/JSONtoLights";
import { JSONtoCustomEvents } from "./converters/JSONtoCustomEvents";
import { JSONtoPointDefs } from "./converters/JSONtoPointDefs";
import { JSONtoArcs } from "./converters/JSONtoArcs";
import { JSONtoChains } from "./converters/JSONtoChains";
import { JSONtoNotes } from "./converters/JSONtoNotes";
import { JSONtoWalls } from "./converters/JSONtoWalls";

export const pointDefinitions = ["NULL"];

export let environment: any[];
/**
 * Array that contains all the notes in the map.
 */
export let notes: NOTE[];
/**
 * Array that contains all the arcs.
 * DOES NOT WORK WITH V2!
 */
export let arcs: ARC[];
/**
 * Array that contains all the burst sliders or chains in the map.
 * DOES NOT WORK WITH V2!
 */
export let chains: CHAIN[];
/**
 * Array that contains all the fake burst sliders or chains in the map.
 * DOES NOT WORK WITH V2!
 */
export let fakeChains: CHAIN[];
/**
 * Array that contains all the bombs in the map.
 * DOES NOT WORK WITH V2!
 */
export let bombs: BOMB[];
/**
 * Array that contains all the walls in the map.
 */
export let walls: WALL[];
/**
 * Array that contains all the custom events in the map.
 */
export let events: CUSTOMEVENT[];
/**
 * Object that contains all the materials in the map.
 */
export let materials: any = {};
/**
 * Array that contains all the geometry objects in the map.
 */
export let geometry: any[];
/**
 * Array that contains all the point definitions in the map.
 */
export const definitions: POINTDEFINITION[] = [];
/**
 * Array that contains all the light events in the map.
 */
export let lights: LIGHT[] = [];
/**
 * Array that contains all the fake notes in the map.
 * DOES NOT WORK IN V2!
 */
export let fakeNotes: any[];
/**
 * Array that contains all the fake walls in the map.
 * DOES NOT WORK IN V2!
 */
export let fakeWalls: any[];
/**
 * Array that contains all the fake bombs in the map.
 * DOES NOT WORK IN V2!
 */
export let fakeBombs: any[];
/**
 * Array that contains all the material names used in the map.
 */
export const materialNames: string[] = [];
export let MAPPROPERTIES: { njs: number, offset: number, bpm: number, halfJumpDuration: number, jumpDistance: number };
export let activeInput: string;
export let activeOutput: string;
export let activeLightshow: string;

type InitProperties = {
    /**
     * Sets the NJS of all notes
     */
    njs: number;
    /**
     * Sets the offset of all notes
     */
    offset: number;
    /**
     * Imports the lightshow from another difficulty.
     */
    lightshow?: string;
    /**
     * Whether the map should export as V2 or V3
     * This will enable V3 features even in V2 maps
     * WARNING: Will export as selected format
     */
    format?: "V2"|"V3";
};
/**
 * A boolean variable that indicates whether the map is V2 or V3.
 */
export let V3: boolean;

// TODO Lightshow importer
function lightshowImport(file: string) {
    let lV3 = false;
    const lightShowDiff = JSON.parse(readFileSync(file, 'utf-8'))
    if (lightShowDiff.version) lV3 = true;
    let localLights: Record<string, any>[];

    if (lV3) localLights = lightShowDiff.basicBeatmapEvents;
    else localLights = lightShowDiff._events;

    lights = JSONtoLights(localLights);
}
function isV3(diffName: string) {
    const diff = JSON.parse(readFileSync(diffName, 'utf-8'));

    if (typeof diff._version !== 'undefined') V3 = false;
    if (typeof diff.version !== 'undefined') V3 = true;
}
function V3toV2(diff: IV3Map) {
    const v2Diff: IV2Map = {
        _version: "2.2.0",
        _notes: [],
        _obstacles: [],
        _events: [],
        _waypoints: [],
        _customData: {
            _bookmarks: [],
            _customEvents: [],
            _environment: [],
            _pointDefinitions: [],
            _materials: {}
        }
    }
    diff.colorNotes.forEach(n => {
        const note = {
            _time: n.b,
            _lineIndex: n.x,
            _lineLayer: n.y,
            _type: n.c,
            _cutDirection: n.d,
            _customData: {}
        };
        v2Diff._notes.push(note)
    });
    diff.bombNotes.forEach(n => {
        const bomb = {
            _time: n.b,
            _lineIndex: n.x,
            _lineLayer: n.y,
            _type: 3,
            _cutDirection: 0,
            _customData: {}
        };
        v2Diff._notes.push(bomb)
    });
    diff.obstacles.forEach(w => {
        let wallType = 0;
        if (w.y > 0) wallType = 1;
        const wall = {
            _time: w.b,
            _lineIndex: w.x,
            _type: wallType,
            _duration: w.d,
            _width: w.w,
            _customData: {}
        };
        v2Diff._obstacles.push(wall)
    });
    diff.basicBeatmapEvents.forEach(l => {
        let floatValue = 1.0;
        if (l.f) floatValue = l.f;
        const light = {
            _time: l.b,
            _type: l.et,
            _value: l.i,
            _floatValue: floatValue,
            _customData: {}
        };
        v2Diff._obstacles.push(light)
    });
    if (diff.customData) {
        const d = diff.customData;
        if (d.customEvents) {
            d.customEvents.forEach(e => {
                let strEvent = JSON.stringify(e);
                strEvent = strEvent
                    .replace('"b":', '"time":')
                    .replace('"t":', '"type":')
                    .replace('"d":', '"data":')
                    .replace('"offsetPosition":', '"position":')
                    .replace('"offsetWorldRotation":', '"rotation":')
                    .replace(/"(\w+)":/g, '"_$1":')
                v2Diff._customData._customEvents.push(JSON.parse(strEvent))
            })
        }
        if (d.environment) {
            d.environment.forEach(e => {
                let strEnv = JSON.stringify(e);
                strEnv = strEnv.replace(/"(\w+)":/g, '"_$1":')
                v2Diff._customData._environment.push(JSON.parse(strEnv))
            })
        }
    }
    return v2Diff;
}
function V2toV3(diff: IV2Map) {
    const v3Diff: IV3Map = {
        version: "3.2.0",
        bpmEvents: [],
        rotationEvents: [],
        colorNotes: [],
        bombNotes: [],
        obstacles: [],
        sliders: [],
        burstSliders: [],
        waypoints: [],
        basicBeatmapEvents: [],
        colorBoostBeatmapEvents: [],
        lightColorEventBoxGroups: [],
        lightRotationEventBoxGroups: [],
        lightTranslationEventBoxGroups: [],
        basicEventTypesWithKeywords: {},
        useNormalEventsAsCompatibleEvents: false,
        customData: {
            bookmarks: [],
            customEvents: [],
            environment: [],
            pointDefinitions: {},
            materials: {}
        }
    }
    diff._notes.forEach(n => {
        if (n._type == 3) {
            const bomb = {
                b: n._time,
                x: n._lineIndex,
                y: n._lineIndex,
                customData: {}
            }
            v3Diff.bombNotes.push(bomb)
        } else {
            const note = {
                b: n._time,
                x: n._lineIndex,
                y: n._lineLayer,
                a: 0,
                c: n._type,
                d: n._cutDirection,
                customData: {}
            };
            v3Diff.colorNotes.push(note)
        }
    });
    diff._obstacles.forEach(w => {
        const wall = {
            b: w._time,
            x: w._lineIndex,
            y: w._type,
            d: w._duration,
            w: w._width,
            h: 3 - w._type,
            customData: {}
        };
        v3Diff.obstacles.push(wall)
    });
    diff._events.forEach(l => {
        let floatValue = 1.0;
        if (l._floatValue) floatValue = l._floatValue;
        const light = {
            b: l._time,
            et: l._type,
            i: l._value,
            f: floatValue,
            customData: {
                ...l._customData
            }
        };
        v3Diff.basicBeatmapEvents.push(light)
    });
    if (diff._customData) {
        const d = diff._customData;
        if (d._customEvents) {
            d._customEvents.forEach(e => {
                let strEvent = JSON.stringify(e);
                strEvent = strEvent
                    .replace('"_time":', '"b":')
                    .replace('"_type":', '"t":')
                    .replace('"_data":', '"d":')
                    .replace('"_position":', '"offsetPosition":')
                    .replace('"_rotation":', '"offsetWorldRotation":')
                    .replace(/"_(\w+)":/g, '"$1":')
                v3Diff.customData.customEvents.push(JSON.parse(strEvent));
            })
        }
        if (d._environment) {
            d._environment.forEach(e => {
                let strEnv = JSON.stringify(e);
                strEnv = strEnv.replace(/"_(\w+)":/g, '"$1":')
                v3Diff.customData.environment.push(JSON.parse(strEnv))
            })
        }
        if (d._pointDefinitions) {
            d._pointDefinitions.forEach((p: {_name: string, _points: vec1anim|vec3anim|vec4anim}) => {
                const pd = {
                    [p._name]: p._points
                };
                Object.assign(v3Diff.customData.pointDefinitions, pd)
            })
        }
    }
    return v3Diff;
}
function getJumps() {
    const _startHalfJumpDurationInBeats = 4;
    const _maxHalfJumpDistance = 18;
    const _startBPM = MAPPROPERTIES.bpm; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -
    const bpm = MAPPROPERTIES.bpm; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -
    const _startNoteJumpMovementSpeed = MAPPROPERTIES.njs; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -
    const _noteJumpStartBeatOffset = MAPPROPERTIES.offset; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -
  
    let _noteJumpMovementSpeed = (_startNoteJumpMovementSpeed * bpm) / _startBPM;
    let num = 60 / bpm;
    let num2 = _startHalfJumpDurationInBeats;
    while (_noteJumpMovementSpeed * num * num2 > _maxHalfJumpDistance) {
      num2 /= 2;
    }
    num2 += _noteJumpStartBeatOffset;
    if (num2 < 1) {
      num2 = 1;
    }
    const _jumpDuration = num * num2 * 2;
    const _jumpDistance = _noteJumpMovementSpeed * _jumpDuration;
    return { half: num2, dist: _jumpDistance };
}
/**
 * @param input The input file for the difficulty.
 * @param output The output file for the difficulty.
 * @param properties The additional properties such as NJS and offset.
 * ```ts
 * const diff = Map.initialize(INPUT, OUTPUT, {
 *     njs: 18,
 *     offset: 0
 * });
 */
export function initialize(input: string, output: string, properties: InitProperties): Record<string, any> {
    for (let i = 0; i <= 100; i++) {
        console.log("")
    }
    infoFile._difficultyBeatmapSets.forEach((x: any) => {
        if (Object.keys(x).includes('_beatmapCharacteristicName')) {
            x._difficultyBeatmaps.forEach((y: any) => {
                if (y._beatmapFilename.includes(output)) {
                    if (!y._customData)
                        y._customData = {};

                    y._customData._suggestions = undefined;
                    y._customData._requirements = undefined;
                }
            });
        }
    });
    writeFileSync("Info.dat", JSON.stringify(infoFile, null, 4));
    console.time('HeckLib ran in')
    const p = properties;
    const NJS = p.njs;
    const offset = p.offset;
    MAPPROPERTIES = {
        njs: p.njs,
        offset: p.offset,
        bpm: infoFile._beatsPerMinute,
        halfJumpDuration: 0,
        jumpDistance: 0
    };
    MAPPROPERTIES.halfJumpDuration = getJumps().half;
    MAPPROPERTIES.jumpDistance = getJumps().dist;
    if (p.lightshow) {
        lights.length = 0;
        lightshowImport(`./${p.lightshow}`)
    }
    const info = infoFile;
    let translate = false;
    isV3(`./${input}`);
    if (properties.format) {
        switch (properties.format) {
            case "V2":
                if (V3) translate = true;
                V3 = false;
                break;
            case "V3":
                if (!V3) translate = true;
                V3 = true;
                break;
        }
    }
    let diff = JSON.parse(readFileSync(`./${input}`, 'utf-8'));
    if (translate) {
        if (properties.format == "V2") diff = V3toV2(diff);
        if (properties.format == "V3") diff = V2toV3(diff);
    }
    infoFile._difficultyBeatmapSets.forEach((x: any) => {
        x._difficultyBeatmaps.forEach((y: any) => {
            if (y._settings) delete (y._settings)
            if (y._requirements) delete (y._requirements)
            if (y._suggestions) delete (y._suggestions)
        })
    });
    writeFileSync('Info.dat', JSON.stringify(infoFile, null, 4))
    activeInput = input;
    activeOutput = output;

    if (info._difficultyBeatmapSets) {
        info._difficultyBeatmapSets.forEach((x: any) => {
            if (JSON.stringify(x).includes(output)) {
                x._difficultyBeatmaps.forEach((y: any) => {
                    if (JSON.stringify(y).includes(output)) {
                        y._customData = {};
                    }
                })
            }
        })
    }

    if (!V3) {
        notes = JSONtoNotes(diff._notes, NJS, offset);
        walls = JSONtoWalls(diff._obstacles, NJS, offset);
        if (!p.lightshow) lights = JSONtoLights(diff._events);

        if (!diff._customData) {
            diff._customData = {};
        }

        const customData = diff._customData;

        if (!customData._customEvents) customData._customEvents = [];
        else customData._customEvents = JSONtoCustomEvents(diff._customData._customEvents);
        if (!customData._pointDefinitions) customData._pointDefinitions = [];
        else JSONtoPointDefs(diff._customData._pointDefinitions);
        if (!customData._environment) customData._environment = [];
        if (!customData._materials) customData._materials = {};

        events = diff._customData._customEvents;
        environment = customData._environment;
        materials = customData._materials;
    }
    else if (V3) {
        notes = JSONtoNotes(diff.colorNotes, NJS, offset);
        walls = JSONtoWalls(diff.obstacles, NJS, offset);
        chains = JSONtoChains(diff.burstSliders, NJS, offset);
        arcs = JSONtoArcs(diff.sliders, NJS, offset);
        bombs = diff.bombNotes;
        lights = JSONtoLights(diff.basicBeatmapEvents);

        if (!diff.customData) {
            diff.customData = {};
        }
        if (!diff.customData.fakeColorNotes) {
            diff.customData.fakeColorNotes = [];
        } 
        if (!diff.customData.fakeBurstSliders) {
            diff.customData.fakeBurstSliders = [];
        }
        if (!diff.customData.fakeObstacles) {
            diff.customData.fakeObstacles = [];
        }
        if (!diff.customData.fakeBombNotes) {
            diff.customData.fakeBombNotes = [];
        }

        const customData = diff.customData;

        if (!customData.customEvents) customData.customEvents = [];
        else customData.customEvents = JSONtoCustomEvents(diff.customData.customEvents)
        if (!customData.pointDefinitions) customData.pointDefinitions = [];
        else JSONtoPointDefs(diff.customData.pointDefinitions);
        if (!customData.environment) customData.environment = [];
        if (!customData.materials) customData.materials = {};

        //(output, JSON.stringify(diff, null, 4));

        events = customData.customEvents;
        environment = customData.environment;
        materials = customData.materials;
        fakeNotes = customData.fakeColorNotes;
        fakeWalls = customData.fakeObstacles;
        fakeBombs = customData.fakeBombNotes;
    }
    return diff;
}