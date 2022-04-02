export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | null
  | undefined;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}
