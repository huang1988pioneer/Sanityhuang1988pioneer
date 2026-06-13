import {defineTableDocument, requiredRule} from '../helpers.js'

export const cronsanity = defineTableDocument({
  name: 'cronsanity',
  title: 'CronSanity',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: requiredRule},
    {name: 'targetUrl', title: 'Target URL', type: 'url'},
    {name: 'schedule', title: 'Schedule', type: 'string'},
    {name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true},
    {name: 'status', title: 'Status', type: 'string'},
    {name: 'lastRunAt', title: 'Last Run At', type: 'datetime'},
    {name: 'nextRunAt', title: 'Next Run At', type: 'datetime'},
    {name: 'lastSuccessAt', title: 'Last Success At', type: 'datetime'},
    {name: 'lastFailureAt', title: 'Last Failure At', type: 'datetime'},
    {name: 'responseStatus', title: 'Response Status', type: 'number'},
    {name: 'durationMs', title: 'Duration MS', type: 'number'},
    {name: 'attempts', title: 'Attempts', type: 'number'},
    {name: 'message', title: 'Message', type: 'text', rows: 5},
    {name: 'note', title: 'Note', type: 'text', rows: 5}
  ]
})
