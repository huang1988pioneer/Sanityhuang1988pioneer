import {defineTableDocument, requiredRule} from '../helpers.js'

export const food = defineTableDocument({
  name: 'food',
  title: 'Food',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'amount', title: 'Amount', type: 'number'},
    {name: 'price', title: 'Price', type: 'number'},
    {name: 'shop', title: 'Shop', type: 'string'},
    {name: 'todate', title: 'To Date', type: 'datetime'},
    {name: 'photo', title: 'Photo', type: 'url'},
    {name: 'photohash', title: 'Photo Hash', type: 'string'}
  ]
})
