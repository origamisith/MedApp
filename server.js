const express = require('express');
const mustacheExpress = require('mustache-express');

const app = express();
const mustache = mustacheExpress();
const bodyParser = require('body-parser');
const { Client } = require('pg');
mustache.cache = null;
app.engine('mustache',mustache);
app.set('view engine', 'mustache');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));

app.get('/add',(req,res)=>{
    res.render('med-form');
});

app.post('/meds/add',(req,res)=>{
    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });
    client.connect()
        .then(()=>{
            console.log('Connection Complete');
            const sql = 'INSERT INTO meds (name, count, brand) VALUES ($1, $2, $3)';
            const params = [req.body.name, req.body.count, req.body.brand];
            return client.query(sql,params);
        })
        .then((result)=>{
            res.redirect('/meds');
        });
});

app.get('/dashboard',(req,res)=>{
    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });
    client.connect()
        .then(()=>{
            return client.query('SELECT SUM(count) FROM meds; SELECT DISTINCT COUNT(brand) FROM meds');
        })
        .then((results)=>{
            res.render('dashboard', {n1:results[0].rows,n2:results[1].rows});
        })
        .catch(next){
            console.log(next)
        };
});

app.get('/meds',(req,res)=>{

    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });

    client.connect()
        .then(()=>{
            return client.query('SELECT * FROM meds ORDER BY mid');
        })
        .then((results)=>{
            res.render('meds',results);
        })
    ;
});

app.post('/meds/delete/:id',(req,res)=>{
    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });

    client.connect()
        .then(()=>{
            const sql = 'DELETE FROM meds WHERE mid=$1';
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results)=>{
            res.redirect('/meds');
        })
    ;
});

app.get('/edit/:id',(req,res)=>{
    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });

    client.connect()
        .then(()=>{
            const sql = 'SELECT * FROM meds WHERE mid=$1';
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results)=>{
            res.render('med-edit', {meds: results.rows[0]});
        })
    ;
});

app.post('/meds/edit/:id',(req,res)=>{
    const client = new Client({
        host:'localhost',
        database:'medical',
        port: 5432,
        password: '1110',
        user: 'postgres',
    });

    client.connect()
        .then(()=>{
            const sql = 'UPDATE meds SET name=$1, count=$2,brand=$3 WHERE mid=$4';
            const params = [req.body.name, req.body.count, req.body.brand,req.params.id];
            return client.query(sql, params);
        })
        .then(()=>{
            res.redirect('/meds');
        })
    ;
});
/*
app.listen(5001,()=>{
    console.log('Listening to port 5001');
});
*/

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});