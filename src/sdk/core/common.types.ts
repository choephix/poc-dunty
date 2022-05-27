//// Math

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export type IPoint = { x: number; y: number };
export type IDimensions = { width: number; height: number };
export type IRect = IPoint & IDimensions;

export type IWithLRTB = { lrtb: Vec4 };

//// Js

export type valueOrGetter<T> = T | (() => T);
