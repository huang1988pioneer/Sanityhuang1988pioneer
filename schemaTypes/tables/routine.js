import {defineTableDocument, requiredRule} from '../helpers.js'

export const routine = defineTableDocument({
  name: 'routine',
  title: 'Routine',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'note', title: 'Note', type: 'string'},
    {name: 'lastdate1', title: 'Last Date 1', type: 'datetime'},
    {name: 'lastdate2', title: 'Last Date 2', type: 'datetime'},
    {name: 'lastdate3', title: 'Last Date 3', type: 'datetime'},
    {name: 'link', title: 'Link', type: 'url'},
    {name: 'photo', title: 'Photo', type: 'url'}
  ]
})
