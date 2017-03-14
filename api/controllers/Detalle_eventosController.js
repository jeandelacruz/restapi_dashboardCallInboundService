/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const unflatten = require('flat').unflatten;
const dateFormat = require('dateformat');

var socket = require('socket.io-client')('http://192.167.99.246:1337');
const io = sails.io;

module.exports = {

  	change_status: function (req, res) {
	  	res.header("Access-Control-Allow-Origin", "*");
	  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  	if(!req.param('user_id') || !req.param('event_id') || !req.param('anexo') || !req.param('ip')){
		    res.send(
		    	unflatten({
			        Response: 'error',
			        Message: 'Parameters incompleted'
			    })
		    );
		    return;
	  	}else{

	  		//Declaracion de variables
		    var user_id = req.param('user_id');
		    var event_id = req.param('event_id');
		    var now = new Date();
		    var date_event = dateFormat(now, "yyyy-mm-dd H:MM:ss");
		    var anexo = req.param('anexo');
		    var ip = req.param('ip');
		    var name = req.param('name');

		    //Construyo el json
		    var values_event = 
		    {
		    	evento_id: event_id,
		    	user_id: user_id,
		    	fecha_evento: date_event,
		    	ip_cliente: ip,
		    	observaciones: '',
		    	anexo: anexo,
		    	date_really: date_event
		    };

		    //Crea un nuevo evento con las variables 'values_event'
		  	Detalle_eventos.create(values_event).exec(function (err, records) {
		  		if(err){
		          res.send(
					unflatten({
				        Response: 'error',
				        Message: 'Fail Inserted Event'
				    })
		          );
		        }else{
		          res.send(
					unflatten({
				        Response: 'success',
				        Message: name
				    })
		          );

		          Eventos.findOne({
		    		select 	: ['id','name'],
		    		where 	: {
		    			id 	: event_id
		    		}}).populate('detalle_evento').exec(function (err, record) {
		          		io.socket.emit('status_agent', {Response: 'success', Message: record.name});
		          		//Detalle_eventos.message('status_agent', {Response: 'success', Message: record.name});
		          });
		        }
			});
	  	}
  	},

  	register_assistence: function (req, res) {
	  	res.header("Access-Control-Allow-Origin", "*");
	  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  	
	  	if(!req.param('new_date_event') || !req.param('user_id')){
		    res.send(
		    	unflatten({
			        Response 	: 'error',
			        Message 	: 'Parameters incompleted'
			    })
		    );
		    return;
	  	}else{

	  		//Declaracion de variables
	    	var user_id 		= req.param('user_id');
	    	var new_date_event 	= req.param('new_date_event');
		    var now 			= new Date();
		    var date_event 		= dateFormat(now, "yyyy-mm-dd H:mm:ss");

		    //Verifica si exista mas de un registro (logeo) en la BD
			Detalle_eventos.count(
				{
					user_id : user_id, 
					evento_id : 11
				}
			).exec(function countCB(err, records){
				if(records > 1){
					res.send(
						unflatten({
				        	Response 	: 'error',
				        	Message 	: 'More Records'
				    	})
		          	);
				}else{
				//Extrae el 'id','fecha_evento' del primer evento de 'Login', realizado por el agente
		    	Detalle_eventos.findOne(
		    	{
		    		select 	: ['id','fecha_evento'],
		    		where 	: {
		    			user_id 	: user_id,
		    			evento_id 	: 11
	    		},
		    		sort 	: 'fecha_evento ASC'
		    	}).exec(function(err,record){
		    		if(err){
			        	res.send(
							unflatten({
					        	Response 	: 'error',
					        	Message 	: 'Fail Search Event'
					    	})
			          	);
		    		}else{
    					//Actualiza el registro para actualización del registro de fecha_evento
		    			Detalle_eventos.update(
		    				{
		    					id 				: record.id
		    				},{
		    					date_really		: record.fecha_evento, 
		    					fecha_evento	: new_date_event
		    				}
		    			).exec(function (err, records){
					  		if(err){
					        	res.send(
									unflatten({
							        	Response 	: 'error',
							        	Message 	: 'Fail Updated Event'
							    	})
					          	);
					        }else{
					          	res.send(
									unflatten({
							        	Response 	: 'success',
							        	Message 	: 'Updated Event'
							    	})
					          	);
					        }
		    			});
					}	   		
    			});
				}
			});
		}
	}
};