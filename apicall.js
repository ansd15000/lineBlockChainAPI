/* ====== 모듈 ====== */
    const express = require(`express`);
    const app = express();
    const path = require(`path`);
    const ejs = require(`ejs`);
    const bodyParser = require(`body-parser`);
    const router = require(`./routes/calls`);
/* ======  ====== */
    app.use("/js", express.static(path.join(__dirname + `js`)));
    app.use(express.static(path.join(__dirname)));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(`/api`, router); // 라우터
    app.set(`view engine`, `ejs`);
    app.set(`views`, path.join(__dirname + `/views`));

/* ======  ====== */
    app.get(`/`, (req, res) => res.render(`page`));
    app.listen(9201, () => console.log(`lineBlockchain test page on`))

app.use((err, req, res, next) => console.error(err.message) );

