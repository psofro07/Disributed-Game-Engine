
module.exports = (req, res, next) => {
    const isLogged = req.session.isLoggedIn;

    if((typeof(isLogged) != "undefined") && (isLogged === true)){
        next();
    }
    else{
        console.log("Not logged in");
        res.status(302).redirect('/login');
    }

}