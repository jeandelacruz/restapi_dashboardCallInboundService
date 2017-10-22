/**
 * QueuesController
 *
 * @description :: Server-side logic for managing queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (queueID) {
    return new Promise((resolve, reject) => {
      queues.find({ id: queueID })
      .then(record => resolve(record))
      .catch(err => reject(err))
    })
  },
  queuesReload: function(req, res) {
    let asyncQueueReload = async () => {
      try {
        await Helper.actionsAmi({ Action: 'QueueReload'})
        Helper.responseMessage(res, 'success', 'Se actualizaron las colas en el Asterisk')
      } catch (err) { Helper.getError(res, err, 'No se pudo actualizar las colas en el Asterisk') }
    }
    asyncQueueReload()
  }
}
