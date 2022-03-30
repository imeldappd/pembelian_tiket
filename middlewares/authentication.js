var Auth = 
{ 
 is_login: function (req, res, next) 
 { 
 if (!req.session.is_login) 
 { 
 return res.redirect('/customers'); 
 } 
 next(); 
 },
}; 
module.exports = Auth;