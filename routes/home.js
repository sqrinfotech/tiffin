exports.home = function(req, res){
  var op=req.body.submitButton;
  if(op=='Yes'){
    console.log("Yaaaaaaaaaaaaaaaaaaaaaaaaaaa "); 
    res.render('dabbawalas/login'); 
  } else{
    console.log("Noooooooooooooooooooo ");  
    res.render('users/login'); 
  };
};
