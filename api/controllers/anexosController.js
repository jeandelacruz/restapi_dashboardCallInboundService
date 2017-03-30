/**
 * anexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const users = require('./usersController')

module.exports = {

  set_anexo: function (req, res) {
    let userID = req.param('user_id')
    let anexo = req.param('anexo')
    let parameterSearch = ''
    let message = ''

    if (!req.param('user_id')) res.send({ Response: 'error', Message: 'Parameters incompleted' })

    if (req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
      /**
       * [Se usa cuando liberamos anexo o cuando procedemos a cerrar session]
       */
      Helper.addremoveQueue(userID, anexo, true, 'QueueRemove')
      .then(dataRemove => {
        let flatAction = false
        dataRemove.forEach((array) => {
          if (array.Response === 'Success') flatAction = true
        })

        if (flatAction === false) {
          Helper.responseMessage(res, 'error', dataRemove)
        } else {
          parameterSearch = { user_id: userID }
          this.update(parameterSearch, '0')
          .then(data => {
            if (data) {
              Helper.responseMessage(res, 'success', dataRemove)
            } else {
              Helper.responseMessage(res, 'warning', 'The user does not have any assigned annexes')
            }
          })
          .catch(err => {
            Helper.responseMessage(res, 'error', 'Problemas para liberar anexo en la BD')
            return err
          })
        }
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Problemas para liberar anexo de las Colas del Asterisk')
        return err
      })
    } else {
      /**
       * [Se usa solo cuando seleccionan un anexo]
       */
      this.validateBusy(anexo)
      .then(data => {
        if (data.user_id === 0) {
          parameterSearch = { name: anexo }
          this.update(parameterSearch, userID)
            .then(value => {
              Helper.responseMessage(res, 'success', 'Attachment selected correctly')
            })
            .catch(err => {
              Helper.responseMessage(res, 'error', 'Fail Updated Anexo')
            })
        } else {
          users.search(userID)
          .then(data => {
            message = 'El Anexo ya se encuentra en uso por ' + data.primer_nombre + ' ' + data.segundo_nombre + ' ' + data.apellido_paterno + ' ' + data.apellido_materno
            Helper.responseMessage(res, 'warning', message)
          })
          .catch(err => {
            Helper.responseMessage(res, 'error', 'Fail Search User')
          })
        }
      })
      .catch(err => {
        return err
      })
    }
  },

  searchUserID: function (userID) {
    return new Promise((resolve, reject) => {
      sails.log('Search in table anexo according to the userID')
      anexos.find({ user_id: userID })
      .then(record => {
        return resolve(record[0])
      })
      .catch(err => {
        sails.log('Error in searchUserID the AnexosController : ' + err)
        return reject(err)
      })
    })
  },

  validateBusy: function (anexo) {
    return new Promise((resolve, reject) => {
      sails.log('Validating if the anexo ' + anexo + ' is in use')
      anexos.find({ name: anexo })
      .then(record => {
        resolve(record[0])
      })
      .catch(err => {
        sails.log('Error in validatebusy the AnexosController : ' + err)
        reject(err)
      })
    })
  },

  update: function (parameterSearch, userID) {
    return new Promise((resolve, reject) => {
      sails.log('Update table anexo con el userID seteado en: ' + userID)
      let query = {
        user_id: userID,
        updated_at: Helper.formatDate(new Date())
      }

      anexos.update(parameterSearch, query)
      .then(record => {
        return resolve(record[0])
      })
      .catch(err => {
        sails.log('Error in update the AnexosController : ' + err)
        reject(err)
      })
    })
  }
}
