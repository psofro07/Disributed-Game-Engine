

exports.getHome = (req, res, next) => {
    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;

    res.render('home', { email: email, username: username, role: role});
    
}