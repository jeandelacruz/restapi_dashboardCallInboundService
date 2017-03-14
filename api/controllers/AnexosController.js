/**
 * AnexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const unflatten = require('flat').unflatten;
const dateFormat = require('dateformat');

module.exports = {
	
	set_anexo: function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  		if(!req.param('user_id') || !req.param('anexo')){
		    res.send(
		    	unflatten({
			        Response: 'error',
			        Message: 'Parameters incompleted'
			    })
		    );
		    //console.log('holi');
		    return;
	  	}else{
	  		var user_id = req.param('user_id');
	  		var anexo = req.param('anexo');
	  		var now = new Date();
		    var updated_at = dateFormat(now, "yyyy-mm-dd H:MM:ss");

		    Anexos.findOne({
		    	select	: ['id','name','user_id'],
		    	where	: {
		    		name: anexo
		    	}
		    }).exec( function (err,records) {
		    	if(records.user_id == 0 || user_id == 0){
		    		Anexos.update(
			  			{  
			  				name: anexo
			  			},
			  			{
			  				user_id: user_id,
			  				updated_at: updated_at
			  			}
		  			).exec( function (err,records) {
		  				sails.log(err);
		  				if(err){
				        	res.send(
								unflatten({
						        	Response 	: 'error',
						        	Message 	: 'Fail Updated Anexo'
						    	})
				          	);
				        }else{
				          	res.send(
								unflatten({
						        	Response 	: 'success',
						        	Message 	: 'Updated Anexo'
						    	})
				          	);
				        }
			  		});
		    	}else{
		    		Users.findOne({
		    		select 	: ['id','primer_nombre','segundo_nombre','apellido_paterno','apellido_materno'],
		    		where 	: {
		    			id 	: records.user_id
			    		}}).populate('anexo').exec(function (err, record) {
			          		res.send(
								unflatten({
						        	Response 	: 'warning',
						        	Message 	: 'El anexo '+ anexo +' ya se encuentra en uso ' + record.primer_nombre + ' ' + record.segundo_nombre + ' ' + record.apellido_paterno + ' ' + record.apellido_materno
						    	})
				          	);
		            });
		    	}
		    });
	  	}
	}

};

