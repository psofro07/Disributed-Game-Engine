exports.chess = (req, res, next) => {

    const gameID = req.session.gameID;
    const username = req.session.username;

    let mycolor = 'w';
    if(req.session.player === 'player2'){
        mycolor = 'b';
    }
    


    res.render('chess', { mycolor: mycolor, username: username}); 
}