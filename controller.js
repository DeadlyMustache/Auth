const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('./models/RefreshToken');
const config = require('./config');

const SaveTokenToDB = async function(guid, token) {

    await RefreshToken.findOneAndRemove({ guid });

    const dbRefreshToken = new RefreshToken({
        guid: guid,
        token: bcrypt.hashSync(token, 10)
    });

    await dbRefreshToken.save();

}

module.exports.gettoken = async function(req, res) {

    const guid = req.body.guid;

    const accessToken = jwt.sign({ guid, tid: uuidv4() }, config.ACCESS_TOKEN_SECRET, { expiresIn: '30m', algorithm: "HS512" });
    const refreshToken = jwt.sign({ guid, tid: uuidv4() }, config.REFRESH_TOKEN_SECRET, { expiresIn: '1y', algorithm: "HS512" });

    await SaveTokenToDB(guid, refreshToken);

    res.json({ accessToken, refreshToken });
}

module.exports.refreshtoken = async function(req, res) {

    const refreshToken = req.body.refreshToken;    
    if (refreshToken == null) return res.sendStatus(401);

    var payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, { algorithms: ["HS512"] });
    
    var token = await RefreshToken.findOne({
        guid: payload.guid
    });
    
    
    if(token == null) { 
        return res.json({ message: "Token not found" }); 
    }

    const bcryptedRefreshToken = token.token;    
    let comparisonResult = bcrypt.compareSync(refreshToken, bcryptedRefreshToken);
    if (!comparisonResult) {
        return res.json({ message: "Refresh token has beem modified!" });
    }
    
    const newAccessToken = jwt.sign({ guid: payload.guid, tid: uuidv4() }, config.ACCESS_TOKEN_SECRET, { expiresIn: '30m', algorithm: "HS512" });
    const newRefreshToken = jwt.sign({ guid: payload.guid, tid: uuidv4() }, config.REFRESH_TOKEN_SECRET, { expiresIn: '1y', algorithm: "HS512" });

    await SaveTokenToDB(payload.guid, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

}