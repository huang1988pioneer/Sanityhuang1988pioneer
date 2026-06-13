import {defineTableDocument, requiredRule} from '../helpers.js'

const numberedFields = (prefix, titlePrefix) =>
  Array.from({length: 37}, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    return {
      name: `${prefix}${number}`,
      title: `${titlePrefix} ${number}`,
      type: 'string'
    }
  })

export const commonaccount = defineTableDocument({
  name: 'commonaccount',
  title: 'Common Account',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: requiredRule
    },
    ...numberedFields('site', 'Site'),
    ...numberedFields('note', 'Note')
  ]
})
