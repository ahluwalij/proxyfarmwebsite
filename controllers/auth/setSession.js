module.exports = function (req, id, email) {
	req.session.userId = id;
	req.session.email = email;
	req.session.authed = Date.now();
}