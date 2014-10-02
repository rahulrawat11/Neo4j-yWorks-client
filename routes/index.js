var express = require('express');
var router = express.Router();
var neo4j = require('neo4j-js');
// the default application page
router.get('/', function (req, res) {
    res.render('index', { title: "Neo4j client" });
});
router.get('/query/:term', function (req, res) {
    res.render('index', { title: "Neo4j client", term: req.params.term });
});
// the help/settings side-panel
router.get('/settings', function (req, res) {
    res.render('settings');
});
// the details side-panel
router.get('/details/:term', function (req, res) {
    res.render('details',{term: req.params.term});
});
// the JSON service searching the Neo4j graph
router.get('/search/:term', function (req, res) {
    var term = req.params.term.trim();
    //match (s)-->q where s.id=~"qua.*" return s,q limit 10
    if (term.length === 0) {
        res.json({});
    }
    neo4j.connect('http://localhost:7474/db/data/', function (err, graph) {
        if (err)
            throw err;

        var query = [
                'match (s:Topic)-[r]->(q:Topic) where s.id=~"' + term + '.*" return s,r,q limit 20'
        ];

        graph.query(query.join('\n'), { id: 1 }, function (err, results) {
            if (err) {
                console.log(err);
                console.log(err.stack);
            }
            else {
                var toreturn = {
                    "nodes": [],
                    "links": []
                };
                var linker = [];

                function addNode(obj) {
                    toreturn.nodes.push({
                        "id": obj.id,
                        "name": obj.data.id
                    });
                    linker.push(obj.id);
                }

                function addLink(obj) {
                    toreturn.links.push({
                        "from": obj.start,
                        "to": obj.end,
                        "label": obj.type
                    });
                }

                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    if (linker.indexOf(item.q.id) < 0) {
                        addNode(item.q);
                    }
                    if (linker.indexOf(item.s.id) < 0) {
                        addNode(item.s);
                    }
                    addLink(item.r);

                }
                res.json(toreturn);
            }
        });
    });
});
// the simple yFiles client
router.get('/simple', function (req, res) {
    res.render('yClient');
});
module.exports = router;
