import uniqid from 'uniqid'
import randomize from 'randomatic'

export { generateId, getRandom }

const generateId = (prefix?: string, suffix?: string) =>
  uniqid.process(prefix, suffix).toUpperCase()

const getRandom = (charType = '*', length = 10) => randomize(charType, length)
