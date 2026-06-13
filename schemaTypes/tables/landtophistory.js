import {defineTableDocument, requiredRule} from '../helpers.js'

export const landtophistory = defineTableDocument({
  name: 'landtophistory',
  title: 'Landtop History',
  previewField: 'name',
  fields: [
    {name: 'source', title: 'Source', type: 'string', validation: requiredRule},
    {name: 'snapshotKey', title: 'Snapshot Key', type: 'string', validation: requiredRule},
    {name: 'productId', title: 'Product ID', type: 'string', validation: requiredRule},
    {name: 'brand', title: 'Brand', type: 'string', validation: requiredRule},
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'sourceUrl', title: 'Source URL', type: 'url'},
    {name: 'landtopPrice', title: 'Landtop Price', type: 'number'},
    {name: 'suggestedPrice', title: 'Suggested Price', type: 'number'},
    {name: 'snapshotDate', title: 'Snapshot Date', type: 'datetime', validation: requiredRule}
  ]
})
