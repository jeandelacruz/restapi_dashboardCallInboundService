/**
 * AnexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const dateFormat = require('dateformat')

module.exports = {

  set_anexo: function (req, res) {
    if (!req.param('user_id')) {
      res.send({ Response: 'error', Message: 'Parameters incompleted' })
    } else {
      let query = ''
      if (req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
        query = {
          select: ['id', 'name', 'user_id'], where: {user_id: req.param('user_id')}
        }
      } else {
        query = {
          select: ['id', 'name', 'user_id'], where: {name: req.param('anexo')}
        }
      }

      Anexos.query('BEGIN', function (err) {
        if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - set_anexo' })

        Anexos.find(query)
        .then(function (records) {
          let userID = ''
          let parameterSearch = ''

          if (req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
            userID = '0'
            parameterSearch = { user_id: req.param('user_id') }
          } else {
            userID = req.param('user_id')
            parameterSearch = { name: req.param('anexo') }
          }

          if (records[0].user_id === 0 || req.param('user_id') === 0 || req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
            let query = {
              user_id: userID,
              updated_at: dateFormat(new Date(), 'yyyy-mm-dd H:MM:ss')
            }

            return Anexos.update(parameterSearch, query)
            .then(function () {
              Anexos.query('COMMIT')
              return res.json({ Response: 'success', Message: 'Updated Anexo' })
            })
            .catch(function (err) {
              sails.log(err)
              Anexos.query('ROLLBACK')
              return res.json({ Response: 'error', Message: 'Fail Updated Anexo' })
            })
          } else {
            let query = {
              select: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno'],
              where: {id: records[0].user_id}
            }

            return Users.findOne(query).populate('anexo')
            .then(record => {
              Anexos.query('COMMIT')
              return res.json({ Response: 'warning', Message: 'El anexo ' + req.param('anexo') + ' ya se encuentra en uso ' + record.primer_nombre + ' ' + record.segundo_nombre + ' ' + record.apellido_paterno + ' ' + record.apellido_materno })
            })
            .catch(err => {
              sails.log(err)
              Anexos.query('ROLLBACK')
              return res.json({ Response: 'error', Message: 'Fail Search User' })
            })
          }
        })
        .catch(err => {
          sails.log(err)
          Anexos.query('ROLLBACK')
          return res.json({Response: 'error', Message: 'Fail Search Event'})
        })
      })
    }
  }
}
