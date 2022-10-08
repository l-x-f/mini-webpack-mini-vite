import { cloneDeep } from 'lodash';
export const encodeObject = data => encodeURIComponent(JSON.stringify(cloneDeep(data)));
export const decodeObject = str => {
  let res = {};
  if (!str) return res;

  try {
    res = JSON.parse(decodeURIComponent(str));
  } catch (error) {
    console.log(error);
  }

  return res;
};