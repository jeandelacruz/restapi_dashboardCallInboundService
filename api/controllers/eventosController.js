/**
 * EventosController
 *
 * @description :: Server-side logic for managing eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (eventID) {
    return new Promise((resolve, reject) => {
      sails.log('Searching event according to the userID')
      let query = { select: ['id', 'name', 'estado_call_id'], where: { id: eventID } }
      eventos.findOne(query)
      .then(record => {
        return resolve(record)
      })
      .catch(err => {
        sails.log('Error in Search the EventosController : ' + err)
        return reject(err)
      })
    })
  }
}
