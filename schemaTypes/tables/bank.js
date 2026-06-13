import {defineTableDocument, requiredRule} from '../helpers.js'

export const bank = defineTableDocument({
  name: 'bank',
  title: 'Bank',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'deposit', title: 'Deposit', type: 'number'},
    {name: 'site', title: 'Site', type: 'url'},
    {name: 'address', title: 'Address', type: 'string'},
    {name: 'withdrawals', title: 'Withdrawals', type: 'number'},
    {name: 'transfer', title: 'Transfer', type: 'number'},
    {name: 'activity', title: 'Activity', type: 'url'},
    {name: 'card', title: 'Card', type: 'string'},
    {name: 'account', title: 'Account', type: 'string'}
  ]
})
