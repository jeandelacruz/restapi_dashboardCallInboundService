/**
 * call_WaitingController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  deleteCallWaiting: function (req, res) {
    let query = {unique_id : req.param('unique_id')}
    call_waiting.destroy(query)
    .then(data => {
      const values = {
        'name_proyect': data[0].name_proyect,
        'unique_id' : data[0].unique_id,
        'number_phone': data[0].number_phone
      }

      res.json(values)
    })
    .catch(err => res.json(err))
  },

  deleteAllCallWaiting: function (req, res) {
      call_waiting.destroy({})
      .then(data => {
        res.json(data)
      })
      .catch(err => res.json(err))
  },

  createCallWaiting: function (req, res) {

    if (typeof (req.param('number_phone')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el number_phone no puede estar vacío!')
    if (typeof (req.param('name_number')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el name_number no puede estar vacío!')
    if (typeof (req.param('name_queue')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el name_queue no puede estar vacío!')
    if (typeof (req.param('start_call')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el start_call no puede estar vacío!')
    if (typeof (req.param('unique_id')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el unique_id no puede estar vacío!')
    if (typeof (process.env.nameProyect) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el name_Proyect no puede estar vacío!')

    let values = {
      number_phone: req.param('number_phone'),
      name_number: req.param('name_number'),
      name_queue: req.param('name_queue'),
      start_call: req.param('start_call'),
      unique_id: req.param('unique_id'),
      name_proyect: process.env.nameProyect
    }

    call_waiting.create(values).then(data => res.json(data)).catch(err => res.json(err))
  }
}
