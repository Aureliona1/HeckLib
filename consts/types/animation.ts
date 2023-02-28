import {Track} from "./objects";
import {vec1anim, vec3anim, vec4anim} from "./vec";

export type POINTDEFINITION = {
    name: string;
    points: vec1anim | vec3anim | vec4anim;
};

export type parentTrackType = {
    parentTrack: Track;
    childrenTracks: string[];
};

export type playerTrackType = {
    track: Track;
};

export type animateTrackData = {
    track: Track;
    duration: number;
    easing?: string;
    position?: vec3anim;
    localPosition?: vec3anim;
    rotation?: vec3anim;
    localRotation?: vec3anim;
    scale?: vec3anim;
    color?: vec4anim;
    dissolve?: vec1anim;
    dissolveArrow?: vec1anim;
    interactable?: vec1anim;
    timeAnim?: vec1anim;
};

export type pathAnimData = {
    track: Track;
    easing?: string;
    position?: vec3anim;
    localPosition?: vec3anim;
    definitePosition?: vec3anim;
    rotation?: vec3anim;
    localRotation?: vec3anim;
    scale?: vec3anim;
    color?: vec4anim;
    dissolve?: vec1anim;
    dissolveArrow?: vec1anim;
    interactable?: vec1anim;
};

export type animComponentData = {
    track: Track;
    duration: number;
    easing?: string;
    BloomFogEnvironment?: {
        attenuation?: vec1anim;
        offset?: vec1anim;
        startY?: vec1anim;
        height?: vec1anim;
    };
    TubeBloomPrePassLight?: {
        colorAlphaMultiplier?: vec1anim;
        bloomFogIntensityMultiplier?: vec1anim;
    };
};

export type fogTrackData = {
    track: Track;
};

export type CUSTOMEVENT = {
    json: {
        time: number;
        type: string;
        data: | fogTrackData | animateTrackData | pathAnimData | playerTrackType | parentTrackType;
    };
};
