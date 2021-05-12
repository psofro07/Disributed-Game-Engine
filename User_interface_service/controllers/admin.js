const axios = require('axios');


exports.getAdmin = (req, res, next) => {

    res.render('admin',{role: req.session.role});
    
}


exports.createTable = (req, res, next) => {

    var data = '{\n"key": "value"\n}';

    var config = {
    method: 'get',
    url: 'http://authentication:4000/api/user/',
    headers: { 
        'Authorization': '190', 
        'Content-Type': 'text/plain'
    },
    data : data
    };

    axios(config)
        .then(response => {
            console.log(response.data)
            

            if(response.data.success === true){

                let i = 1;
                var myRow = "";
                response.data.users.forEach( user => {

                    let username = user.username;
                    let email = user.email;
                    let role = user.role;

                    myRow = myRow.concat('<tr><th scope="row">'+i+'</th><td contenteditable="false">'+username+'</td><td contenteditable="false">'+email+'</td><td contenteditable="false">'+role+'</td><td> <button  type="submit" name="edit_btn" class="btn-edit">EDIT</button></td>'
                    +'<td><button id="'+username+'" type="submit" name="delete_btn" class="btn-delete">DELETE</button></td></tr>');
                    i++;
                    
                })

                res.json({success: true, data: myRow})
            }
        })
        .catch(error => {
            console.log(error);
            res.send(error.response.data.message);
        });
    
}


exports.editTable = (req, res, next) => {

    const username = req.body.username;
    const email = req.body.email;
    const role = req.body.role;

    var data = JSON.stringify({"email": email,"role": role});

    var config = {
    method: 'put',
    url: 'http://authentication:4000/api/user/'+username,
    headers: { 
        'Content-Type': 'application/json'
    },
    data : data
    };

    axios(config)
        .then( (response) => {
            console.log(response.data.message);
            res.json({success: true})
        })
        .catch( (error) => {
            console.log(error.response.data.message);
            res.json({success: false})
        });
    
}

exports.deleteTable = (req, res, next) => {

    const username = req.body.username;
    
   
    var config = {
        method: 'delete',
        url: 'http://authentication:4000/api/user/'+username,
        headers: { }
    };
    
    axios(config)
        .then(function (response) {
            console.log(response.data.message);
            res.json({success: true})
        })
        .catch(function (error) {
            console.log(error.response.data.message);
            res.json({success: false})
        });
  
    
}

