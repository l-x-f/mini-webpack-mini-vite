import { cloneDeep } from 'lodash'

/**
 * 转义query对象中的特殊字符
 * @param data
 * @returns  `string`
 */
export const encodeObject = data =>
  encodeURIComponent(JSON.stringify(cloneDeep(data)))

/**
 * 解析url中的特殊字符
 * @param {string} str
 * @returns `RecordType`
 */
export const decodeObject = str => {
  let res = {}
  if (!str) return res
  try {
    res = JSON.parse(decodeURIComponent(str))
  } catch (error) {
    console.log(error)
  }
  return res
}
