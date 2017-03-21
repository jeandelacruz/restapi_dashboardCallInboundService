/**
 * AnexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const dateFormat = require('dateformat')
const aio = require('asterisk.io')
var ami = null

module.exports = {

  set_anexo: function (req, res) {
    if (!req.param('user_id')) res.send({ Response: 'error', Message: 'Parameters incompleted' })

    let query = ''
    if (req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
      query = {
        select: ['id', 'name', 'user_id'],
        where: {
          user_id: req.param('user_id')
        }
      }
    } else {
      query = {
        select: ['id', 'name', 'user_id'],
        where: {
          name: req.param('anexo')
        }
      }
    }

    Anexos.query('BEGIN', function (err) {
      if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - set_anexo' })

      Anexos.find(query)
        .then(record_find => {
          let userID = ''
          let parameterSearch = ''

          if (req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
            userID = '0'
            parameterSearch = { user_id: req.param('user_id') }
          } else {
            userID = req.param('user_id')
            parameterSearch = { name: req.param('anexo') }
          }

          if (record_find[0].user_id === 0 || req.param('user_id') === 0 || req.param('type_action') === 'disconnect' || req.param('type_action') === 'release') {
            let query = {
              user_id: userID,
              updated_at: date_format(new Date())
            }

            return Anexos.update(parameterSearch, query)
            .then(record_update => {
              Anexos.query('COMMIT')
              connection_ami()
              queue_remove(req.param('anexo'))
              return res.json({ Response: 'success', Message: 'Updated Anexo' })
            })
            .catch(err => {
              sails.log(err)
              Anexos.query('ROLLBACK')
              return res.json({ Response: 'error', Message: 'Fail Updated Anexo' })
            })
          } else {
            let query = {
              select: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno'],
              where: {id: record_find[0].user_id}
            }

            return Users.findOne(query).populate('anexo')
            .then(record_findone => {
              Anexos.query('COMMIT')
              return res.json({ Response: 'warning', Message: 'El anexo ' + req.param('anexo') + ' ya se encuentra en uso ' + record_findone.primer_nombre + ' ' + record_findone.segundo_nombre + ' ' + record_findone.apellido_paterno + ' ' + record_findone.apellido_materno })
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

// Funciones independientes

function date_format (date) {
  let date_format = dateFormat(date, 'yyyy-mm-dd H:MM:ss')
  return date_format
}

function connection_ami () {
  ami = aio.ami('192.167.99.224', 5038, 'admin', 'admin')
  ami.on('error', err => { console.log(err) })
}
function queue_remove (anexo) {
  // Remover agente
  ami.on('ready', data => {
    ami.action(
        'QueueRemove', {
          Interface: 'SIP/' + anexo,
          Queue: 'HD_CE_Telefonia'
        },
        function (data) {
          console.log(data)
        }
    )
  })
}
