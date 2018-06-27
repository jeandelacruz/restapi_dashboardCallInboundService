/**
 * Agent_online.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name_proyect: { type: 'string' },
    agent_user_id: { type: 'integer' },
    agent_role: { type: 'string' },
    agent_name: { type: 'string' },
    agent_annexed: { type: 'string' },
    agent_status: { type: 'integer' },
    agent_total_calls: { type: 'string' },
    event_id: { type: 'integer' },
    event_id_old: { type: 'integer' },
    event_time: { type: 'string' },
    inbound_queue: { type: 'string' },
    inbound_phone: { type: 'string' },
    inbound_start: { type: 'string' },
    outbound_phone: { type: 'string' },
    outbound_start: { type: 'string' },
    second_status_call: { type: 'integer' },
    second_outbound_phone: { type: 'string' },
    second_outbound_start: { type: 'string' },
    second_event_id: { type: 'integer' },
    timeElapsed: { type: 'string' },
    transfer: { type: 'integer' },
    event_observaciones: { type: 'string' },
    event_hangup: { type: 'integer' }
  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
