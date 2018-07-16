/**
 * EventosController
 *
 * @description :: Server-side logic for managing eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (eventID) {
    return new Promise((resolve, reject) => {
      eventos.findOne({ select: ['id', 'name', 'status_hangup', 'estado_call_id'], where: { id: eventID } })
      .then(record => resolve(record))
      .catch(err => reject(err))
    })
  }
}
