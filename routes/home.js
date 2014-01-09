exports.home = function(req, res){
  var op=req.body.submitButton;
  if(op=='Yes'){
    res.render('dabbawalas/login'); 
  } else{
    res.render('users/login'); 
  };
};
