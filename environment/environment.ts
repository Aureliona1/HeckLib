import { Track } from "../consts/types/objects";
import { vec3 } from "../consts/types/vec";
import { environment, V3 } from "../map/initialize";

export type LookupMethod = "Exact" | "Regex" | "Contains" | "StartsWith" | "EndsWith";

interface IILightWithId {
    lightID: number;
    type: number;
}

interface IFog {
    attenuation?: number;
    offset?: number;
    startY?: number;
    height?: number;
}

interface ITubeBloom {
    colorAlphaMultiplier?: number;
    bloomFogIntensityMultiplier?: number;
}

interface IComponents {
    ILightWithId?: IILightWithId,
    BloomFogEnvironment?: IFog,
    TubeBloomPrePassLight?: ITubeBloom
}

export interface IEnvironment {
    id?: string | RegExp;
    lookupMethod?: LookupMethod;
    components?: IComponents;
    duplicate?: number;
    active?: boolean;
    scale?: vec3;
    position?: vec3;
    localPosition?: vec3;
    rotation?: vec3;
    localRotation?: vec3;
    lightID?: number;
    track?: Track;
}

export default class Environment implements IEnvironment {
    static readonly Method: Record<string, LookupMethod> = {
        Exact: "Exact",
        Regex: "Regex",
        Contains: "Contains",
        StartsWith: "StartsWith",
        EndsWith: "EndsWith"
    }

    id?: string | RegExp;
    lookupMethod?: LookupMethod;
    components?: IComponents;
    duplicate?: number;
    active?: boolean;
    scale?: vec3;
    position?: vec3;
    localPosition?: vec3;
    rotation?: vec3;
    localRotation?: vec3;
    lightID?: number;
    track?: Track;
    constructor(properties?: IEnvironment) {
        this.id = undefined;
        this.lookupMethod = undefined;
        this.components = undefined;
        this.duplicate = undefined;
        this.active = undefined;
        this.scale = undefined;
        this.position = undefined;
        this.localPosition = undefined;
        this.rotation = undefined;
        this.localRotation = undefined;
        this.lightID = undefined;
        this.track = undefined;

        if (typeof properties !== 'undefined') {
            this.id = properties.id;
            this.lookupMethod = properties.lookupMethod;
            this.components = properties.components;
            this.duplicate = properties.duplicate;
            this.active = properties.active;
            this.scale = properties.scale;
            this.position = properties.position;
            this.localPosition = properties.localPosition;
            this.rotation = properties.rotation;
            this.localRotation = properties.localRotation;
            this.lightID = properties.lightID;
            this.track = properties.track;
        }

        return this;
    }

    push() : void {
        if (typeof this.id !== 'string' && typeof this.id !== 'undefined') {
            this.id = this.id.toString().replace(/(^\/|\/$)/g, "");
        }
        environment.push(this);
    }
}



