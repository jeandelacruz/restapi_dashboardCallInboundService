/**
 * Agent_online.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    agent_user_id: { type: 'string' },
    agent_name: { type: 'string' },
    agent_annexed: { type: 'string' },
    agent_status: { type: 'string' },
    agent_penality: { type: 'string' },
    agent_total_calls: { type: 'string' },
    event_id: { type: 'string' },
    event_id_old: { type: 'string' },
    event_name: { type: 'string' },
    event_observaciones: { type: 'string' },
    event_time: { type: 'string' },
    inbound_queue: { type: 'string' },
    inbound_phone: { type: 'string' },
    inbound_start: { type: 'string' },
    outbound_phone: { type: 'string' },
    outbound_start: { type: 'string' }
  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
