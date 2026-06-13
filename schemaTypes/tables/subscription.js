import {defineTableDocument, requiredRule} from '../helpers.js'

export const subscription = defineTableDocument({
  name: 'subscription',
  title: 'Subscription',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'site', title: 'Site', type: 'url'},
    {name: 'price', title: 'Price', type: 'number'},
    {name: 'nextdate', title: 'Next Date', type: 'datetime'},
    {name: 'note', title: 'Note', type: 'text', rows: 8},
    {name: 'account', title: 'Account', type: 'string'},
    {name: 'currency', title: 'Currency', type: 'string'},
    {name: 'continue', title: 'Continue', type: 'boolean', initialValue: true},
    {name: 'category', title: 'Category', type: 'string'},
    {name: 'purpose', title: 'Purpose', type: 'string'},
    {name: 'usageFrequency', title: 'Usage Frequency', type: 'string'},
    {name: 'friendliness', title: 'Friendliness', type: 'string'},
    {name: 'alternative', title: 'Alternative', type: 'string'},
    {name: 'retentionRecommendation', title: 'Retention Recommendation', type: 'string'},
    {name: 'archived', title: 'Archived', type: 'boolean', initialValue: false}
  ]
})
