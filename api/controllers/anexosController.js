/**
 * anexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const users = require('./usersController')

module.exports = {

  asignarAnexo: function (req, res) {
    let eventAnnexed = req.param('eventAnnexed')

    let asyncAsignarAnexo = async () => {
      try {
        let dataAnexos = await anexos.find({ name: eventAnnexed })
        let userIDinUse = dataAnexos[0].user_id
        if (dataAnexos.length === 0) Helper.responseMessage(res, 'error', 'No existe el anexo ' + eventAnnexed)
        if (dataAnexos[0].user_id === 0) {
          let Prueba = Helper.getPrueba(req, res, 'Anexo actualizado', '', '', '', false, true, true, false)
        } else {
          let dataUser = await users.search(userIDinUse)
          let nombreCompleto = 'Nombre Desconocido'
          if (dataUser) nombreCompleto = dataUser.primer_nombre + ' ' + dataUser.apellido_paterno + ' ' + dataUser.apellido_materno
          Helper.responseMessage(res, 'error', 'El Anexo ya se encuentra en uso por ' + nombreCompleto)
        }
      } catch (err) { Helper.getError(res, err, 'Error al asignar anexo') }
    }
    asyncAsignarAnexo()
  },

  logout: function (req, res) {
    let asyncLogout = async () => {
      try {
        await Helper.getPrueba(req, res, 'Desconectado con exito', '', '', '', true, true, true, true)
      } catch (err) { Helper.getError(res, err, 'Error al liberar anexo') }
    }
    asyncLogout()
  },

  update: function (req) {
    let isAction = req.param('eventNextID')
    let queryCompare = (isAction !== 15) ? { name: req.param('eventAnnexed') } : { user_id: req.param('userID') }
    let remoteUserID = (isAction !== 15) ? req.param('userID') : 0
    return new Promise((resolve, reject) => anexos.update(queryCompare, { user_id: remoteUserID }).then(data => resolve(data)).catch(err => reject(err)))
  },

  liberarAnexoOnline: function (req, res) {
    let userID = req.param('userID')
    let eventAnnexed = req.param('eventAnnexed')
    let username = req.param('username')
    let statusQueueRemove = req.param('statusQueueRemove')
    let dataAsterisk = []

    let asyncLiberarAnexoOnline = async () => {
      try {
        const dataAnexo = await anexos.update({ user_id: userID }, { user_id: 0 })
        if (dataAnexo) {
          if (dataAnexo.length === 0) Helper.responseMessage(res, 'error', 'No cuentas con un anexo asignado')
          if (statusQueueRemove === true) dataAsterisk = await Helper.addremoveQueue(userID, username, dataAnexo[0].name, true, 'QueueRemove')
          Helper.getPrueba(req, res, 'Se libero el anexo correctamente', 'Se removio anexo de las colas del Asterisk', 'success', dataAsterisk, true, true, true, false)
        } else {
          Helper.responseMessage(res, 'error', 'Problemas para liberar el anexo')
        }
      } catch (err) { Helper.getError(res, err, 'Error al liberar anexo') }
    }
    asyncLiberarAnexoOnline()
  }
}
