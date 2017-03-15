/**
 * AnexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const unflatten = require('flat').unflatten
const dateFormat = require('dateformat')

module.exports = {

  set_anexo: function (req, res) {
    if (!req.param('user_id')) {
      res.send({ Response: 'error', Message: 'Parameters incompleted' })
    } else {
      if (req.param('type_action') == 'disconnect' || req.param('type_action') == 'release') {
        var query = {
          select: ['id', 'name', 'user_id'],
          where: {
            user_id: req.param('user_id')
          }
        }
      } else {
        var query = {
          select: ['id', 'name', 'user_id'],
          where: {
            name: req.param('anexo')
          }
        }
      }

      Anexos.find(query)
      .then(function (records) {
        if (req.param('type_action') == 'disconnect' || req.param('type_action') == 'release') {
          var user_id = '0'
          var parameterSearch = { user_id: req.param('user_id') }
        } else {
          var user_id = req.param('user_id')
          var parameterSearch = { name: req.param('anexo') }
        }

        if (records[0].user_id == 0 || req.param('user_id') == 0 || req.param('type_action') == 'disconnect' || req.param('type_action') == 'release') {
          let query = {
            user_id: user_id,
            updated_at: dateFormat(new Date(), 'yyyy-mm-dd H:MM:ss')
          }

          return Anexos.update(parameterSearch, query)
          .then(function () {
          	return res.json({ Response: 'success', Message: 'Updated Anexo' })
          })
          .catch(function (err) {
            sails.log(err)
            return res.json({ Response: 'error', Message: 'Fail Updated Anexo' })
          })
        } else {
          let query = {
            select: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno'],
            where: {
              id: records[0].user_id
            }
          }
          return Users.findOne(query).populate('anexo')
          .then(function (record) {
          	return res.json({ Response: 'warning', Message: 'El anexo ' + req.param('anexo') + ' ya se encuentra en uso ' + record.primer_nombre + ' ' + record.segundo_nombre + ' ' + record.apellido_paterno + ' ' + record.apellido_materno })
          })
          .catch(function (err) {
          	return res.json({ Response: 'error', Message: 'Fail Search User' })
          })
        }
      })
      .catch(function (err) {
      	return res.json({Response: 'error', Message: 'Fail Search Event'})
      })
    }
  }
}
