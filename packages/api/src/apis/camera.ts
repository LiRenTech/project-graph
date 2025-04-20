import { api } from "..";

export const Camera = {
  getLocation: api("getCameraLocation"),
  setLocation: api("setCameraLocation"),
};
