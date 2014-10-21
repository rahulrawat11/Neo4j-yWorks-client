/*
 * Contains the API of the Neo4j application.
 * */

define(['jquery.min', 'yfiles/complete', 'underscore.min', 'yStyles'], function () {

    /***
     * Creates the yFiles canvas on the given HTML id.
     * @param name The #name of the div.
     * @constructor
     */
    function CreateCanvas(name) {

        var graphControl = new yfiles.canvas.GraphControl.ForId(name);

        var nodeStyle = new yfiles.drawing.ShapeNodeStyle();
        nodeStyle.drawShadow = false;
        graphControl.graph.nodeDefaults.style = nodeStyle;

        var graph = graphControl.graph;
        graph.edgeDefaults.labels.style = new Orbifold.NeoSimpleLabelStyle();

        var mode = new yfiles.input.GraphEditorInputMode();
        mode.nodeCreationAllowed = false;
        mode.edgeCreationAllowed = false;
        graphControl.inputMode = mode;


        var model = {
            term: null,
            nodes: {},
            edges: {},
            nodeExists: function (id) {
                return _.where(this.nodes, {id: id}).length > 0
            },
            clear: function () {
                this.nodes = {};
                this.edges = {};
                this.term = null;
            },
            isEmpty: function () {
                return app.isUndefined(this.term) || app.isUndefined(this.nodes) || isEmptyLiteral(this.nodes);
            }
        };

        var dynamics = new Orbifold.DynamicOrganic();
        dynamics.graphControl = graphControl;
        //dynamics.loaded();

        app.graph = graph;
        app.graphControl = graphControl;
        app.model = model;
        app.dynamics = dynamics;
    }

    function loadUIHandlers() {
        $("#SearchBox").focus();
        $("#HelpTab").click(function () {
            $.pageslide({href: '/settings', direction: 'right' })
        });
        $("#DetailsTab").click(function () {
            if (app.model.isEmpty()) {
                app.showMessage("No details for this empty search.", "No details");
                return;
            }
            $.pageslide({href: '/details/' + app.model.term, direction: 'left' })
        });
        $("#SearchBox").keydown(
            function (e) {
                var code = e.which;
                if (code == 13)e.preventDefault();
                if (code == 13 || code == 188 || code == 186) {
                    var term = $("#SearchBox").val().trim();
                    if (term.length === 0) {
                        app.showMessage("No term specified.");
                        return;
                    }
                    app.search(term);
                }
            }
        );
        $("#Message").hide();
        $("#Message").kendoWindow({
            width: "300px",
            height: "100px",
            modal: true,
            title: "Notification"
        });
        app.messager = $("#Message").data("kendoWindow");
    }

    function loadPeople() {
        clear();

        $.get("/people", function (d) {
            var nodes = d.nodes;
            var links = d.links;
            var mapper = {};
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                var node = addNode(n.name);
                mapper[n.id] = node;
            }
            for (var i = 0; i < links.length; i++) {
                var n = links[i];
                var edge = connectNodes(mapper[n.from], mapper[n.to], n.label);
            }
            organicLayout();
        })
    }

    function isEmptyLiteral(o) {
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    };
    /***
     * Searches the Neo4j topics for the given term.
     * @param term A topic to search for.
     */
    function search(term) {
        clear();
        app.model.term = term;
        $.get("/search/" + term, function (d) {
            if (d.nodes.length === 0) {
                app.showMessage("Nothing found");
                return;
            }
            var nodes = d.nodes;
            var links = d.links;
            var mapper = {};
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                var node = addNode(n.name);
                mapper[n.id] = node;
            }
            for (var i = 0; i < links.length; i++) {
                var n = links[i];
                if (i === 0) {
                    setStyle(mapper[n.from], "Orange");
                    app.graph.setBounds(mapper[n.from], new yfiles.geometry.RectD(10, 0, 100, 80));
                }
                var edge = connectNodes(mapper[n.from], mapper[n.to], n.label);
            }
            if(app.preferredLayout=="organic")
                organicLayout();
            else
                hierarchyLayout();
            //app.dynamics.go();
        });
    }

    /***
     * Changes the content in the SearchBox and performs an actual search.
     * @param term The topic to search for.
     */
    function query(term) {
        $("#SearchBox").val(term);
        search(term);
        $.pageslide.close();
    }
    function requery() {
        var term = $("#SearchBox").val();
        search(term);
    }

    function launch(span) {
        window.top.app.query($(span).html());
    };
    /***
     * Returns the details to be shown in the details panel for a given term.
     * @param term A topic term.
     */
    function details(term) {
        $.get("/search/" + term, function (d) {
            return d.nodes;
        });
    }

    /***
     * Applies a hierarchical layout to the current graph.
     */
    function hierarchyLayout() {
        var layouter = new yfiles.hierarchic.IncrementalHierarchicLayouter();
        layouter.updateContentRect = true;
        app.graphControl.graph.applyLayout(layouter);
        app.graphControl.updateContentRectWithMargins(new yfiles.geometry.InsetsD.FromLeftTopRightAndBottom(10, 10, 10, 10));
        app.graphControl.fitGraphBounds();
    }

    /***
     * Applies an organic layout to the current graph.
     */
    function organicLayout() {
        var l = new yfiles.organic.OrganicLayouter();
        l.preferredEdgeLength = 180;
        l.maximumDuration = 5000;
        app.graphControl.graph.applyLayout(l);
        app.graphControl.fitGraphBounds();
    } 

    var orangeStyle = new yfiles.drawing.ShapeNodeStyle.WithShapePenAndBrush(
                        yfiles.drawing.ShapeNodeShape.ELLIPSE,
                        yfiles.system.Pens.ORANGE_RED,
                        yfiles.system.Brushes.ORANGE);
                        
    var blueStyle = new yfiles.drawing.ShapeNodeStyle.WithShapePenAndBrush(
                        yfiles.drawing.ShapeNodeShape.ELLIPSE,
                        yfiles.system.Pens.BLUE,
                        yfiles.system.Brushes.LIGHT_BLUE);  
                        
    var purpleStyle = new yfiles.drawing.ShapeNodeStyle.WithShapePenAndBrush(
                        yfiles.drawing.ShapeNodeShape.ELLIPSE,
                        yfiles.system.Pens.DARK_BLUE,
                        yfiles.system.Brushes.VIOLET); 

    var turquoiseStyle = new yfiles.drawing.ShapeNodeStyle.WithShapePenAndBrush(
                        yfiles.drawing.ShapeNodeShape.ELLIPSE,
                        yfiles.system.Pens.LIGHT_SLATE_GRAY,
                        yfiles.system.Brushes.MEDIUM_TURQUOISE); 

    var defaultStyle = new yfiles.drawing.ShapeNodeStyle.WithShapePenAndBrush(
                        yfiles.drawing.ShapeNodeShape.ELLIPSE,
                        yfiles.system.Pens.GRAY,
                        yfiles.system.Brushes.LIGHT_STEEL_BLUE);                        
    
    /***
     * Sets a predefined style from the palette.
     * @param node The node to style.
     * @param name The name of the style.
     */
    function setStyle(node, name) {
        switch (name.toLocaleLowerCase()) {
            case "orange":
                app.graph.setNodeStyle(node, orangeStyle);
                break;
            case "blue":
                app.graph.setNodeStyle(node, blueStyle);
                break;
            case "purple":
                app.graph.setNodeStyle(node, purpleStyle);
                break;
            case "turquoise":
                app.graph.setNodeStyle(node, turquoiseStyle);
                break;
            case "default":
                app.graph.setNodeStyle(node, defaultStyle);
                break;
        }
    }

    /***
     * Set a predefined size.
     * @param node The node to size.
     * @param name The name of the predefined size.
     */
    function setSize(node, name) {
        var size = 50;
        switch (name.toLocaleLowerCase()) {
            case "small":
                size = 50;
                break;
            case "default":
                size = 60;
                break;
            case "medium":
                size = 70;
                break;
            case "large":
                size = 80;
                break;
            case "extralarge":
                size = 100;
                break;
        }
        app.graph.setBounds(node, new yfiles.geometry.RectD(10, 10, size, size))
    }

    function oneEdge() {
        var node = app.graph.createNode();
        graph.addLabel(node, 'aha');
        var node2 = graph.createNode();
        graph.addLabel(node2, 'aha');
        var edge = graph.createEdge(node, node2);
        graph.addLabel(edge, "HasSize");
        setStyle(node, "turquoise");
        setStyle(node2, "blue");
        setSize(node2, "small");
        setSize(node2, "large");
        organicLayout();
    }

    function randomId() {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);

        });
    }
    function addNode(title, stylename) {
        var found = _.where(app.model.nodes, {title: title});
        if (found.length === 0) {
            var node = createNode(title, stylename);
            app.model.nodes[node.id] = node;
            return node;
        }
        return found[0];
    }

    function createNode(title, stylename) {
        var node = app.graph.createNode();
        app.graph.addLabel(node, title);
        setStyle(node, app.isUndefined(stylename) ? "default" : stylename);
        setSize(node, "default");
        node.id = randomId();
        node.title = title;
        return node;
    }

    function isDefined(thing) {
        return thing !== undefined && thing !== null;
    }

    function isUndefined(thing) {
        return !isDefined(thing);
    }

    function connectNodes(from, to, label) {
        var edge = app.graph.createEdge(from, to);
        if (isDefined(label)) {
            app.graph.addLabel(edge, label);
        }
    }

    function clear() {
        app.graph.clear();
        app.model.clear();
    }


    function showMessage(message, title) {
        $("#Message").show();
        app.messager.center();
        app.messager.content(message);
        if (isDefined(title)) {
            app.messager.title(title);
        }
        app.messager.open();
    }

    // Defines the API of the app.
    app = {
        "hierarchyLayout": hierarchyLayout,
        "organicLayout": organicLayout,
        "graph": null,
        "graphControl": null,
        "dynamics": null,
        "loadPeople": loadPeople,
        "oneEdge": oneEdge,
        "setStyle": setStyle,
        "setSize": setSize,
        "search": search,
        "isDefined": isDefined,
        "isUndefined": isUndefined,
        "model": null,
        "query": query,
        "launch": launch,
        "showMessage": showMessage,
        "preferredLayout": "organic",
        "requery": requery
    }

    // Creates the yFiles canvas and sets the interactions and such.
    CreateCanvas('graphCanvas');
    $(document).ready(function () {
        loadUIHandlers();
    });

});