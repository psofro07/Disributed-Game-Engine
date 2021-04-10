

exports.getHome = (req, res, next) => {

    // let email = req.body.userEmail;
    // let psw = req.body.userPass;
    res.render('home', { email: 'email', psw: 'psw'});
    
}