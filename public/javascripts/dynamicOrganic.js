(typeof define == 'function' ? define : (function (dependencies, fn) {
    fn();
}))(['yfiles/lang'], function () {
    yfiles.module("Orbifold", function (exports) {

        exports.DynamicOrganic = new yfiles.ClassDefinition(function () {

            function increaseHeat(copiedNode, layouter, delta) {
                copiedNode.neighbors.forEach(function (neighbor) {
                    var oldStress = layouter.getStress(neighbor);
                    layouter.setStress(neighbor, Math.min(1, oldStress + delta));
                });
            };

            return {
                'graphControl': null,

                'loaded': function () {
                    this.graphControl.inputMode = this.createEditorMode();
                    this.initializeGraph();
                    this.layouter.wakeUp();
                },
                'initializeGraph': function () {
                    var graph = this.graphControl.graph;

                    this.graphControl.fitGraphBounds();

                    this.movedNodes = new yfiles.collections.List();

                    graph.getDecorator().nodeDecorator.positionHandlerDecorator.setImplementationWrapper((function (/**yfiles.graph.INode*/ item, /**yfiles.input.IPositionHandler*/ implementation) {
                        return new Orbifold.DynamicOrganic.CollectingPositionHandlerWrapper(item, this.movedNodes, implementation);
                    }).bind(this));

                    // create a copy of the graph for the layout algorithm
                    var adapter = new yfiles.graph.LayoutGraphAdapter.ForGraph(this.graphControl.graph);
                    this.copiedLayoutGraph = new yfiles.layout.CopiedLayoutGraph.FromGraphAndLayout(adapter, adapter);

                    // create and start the layout algorithm
                    this.layouter = this.startLayouter();
                    this.wakeUp(this, yfiles.system.EventArgs.EMPTY);

                    // register a listener so that structure updates are handled automatically
                    graph.addNodeCreatedListener((function (/**Object*/ source, args) {
                        if (this.layouter !== null) {
                            var /**yfiles.geometry.PointD*/ center = args.item.layout.getRectangleCenter();
                            this.layouter.syncStructure();
                            this.layoutContext.continueLayout(10);
                            //we nail down all newly created nodes
                            var /**yfiles.algorithms.Node*/ copiedNode = this.copiedLayoutGraph.getCopiedNode(args.item);
                            this.layouter.setCenter(copiedNode, center.x, center.y);
                            this.layouter.setInertia(copiedNode, 1);
                            this.layouter.setStress(copiedNode, 0);
                        }
                    }).bind(this));
                    graph.addNodeRemovedListener(yfiles.lang.delegate(this.synchronize, this));
                    graph.addEdgeCreatedListener(yfiles.lang.delegate(this.synchronize, this));
                    graph.addEdgeRemovedListener(yfiles.lang.delegate(this.synchronize, this));
                },
                'startLayouter': function () {
                    var organicLayouter = new yfiles.organic.InteractiveOrganicLayouter();
                    organicLayouter.maxTime = 2000;
                    organicLayouter.preferredEdgeLength = 200;
                    this.layoutContext = organicLayouter.startLayout(this.copiedLayoutGraph);
                    var /**yfiles.canvas.Animator*/ animator = new yfiles.canvas.Animator.FromCanvasControl(this.graphControl);
                    animator.autoInvalidation = false;
                    animator.useWaitInputMode = false;
                    animator.animateHandler((function (time) {
                        this.layoutContext.continueLayout(100);
                        if (organicLayouter.commitPositionsSmoothly(50, 0.05) > 0) {
                            this.graphControl.updateVisual();
                        }
                    }).bind(this), yfiles.system.TimeSpan.fromSeconds(Number.POSITIVE_INFINITY));

                    return organicLayouter;
                },
                'createEditorMode': function () {
                    var mode = new yfiles.input.GraphEditorInputMode();
                    mode.nodeCreationAllowed = false;
                    mode.edgeCreationAllowed = false;
                    this.initMoveMode(mode.moveInputMode);
                    return mode;
                },

                'initMoveMode': function (moveInputMode) {
                    moveInputMode.addDragStartingListener((function (sender, args) {
                        this.movedNodes.clear();
                    }).bind(this));

                    moveInputMode.addDragStartedListener(yfiles.lang.delegate(this.onMoveInitialized, this));
                    moveInputMode.addDragCanceledListener(yfiles.lang.delegate(this.onMoveCanceled, this));
                    moveInputMode.addDraggedListener(yfiles.lang.delegate(this.onMoving, this));
                    moveInputMode.addDragFinishedListener(yfiles.lang.delegate(this.onMovedFinished, this));
                },

                'onMoveInitialized': function (sender, eventArgs) {
                    if (this.layouter !== null) {
                        var copy = this.copiedLayoutGraph;
                        var componentNumber = copy.createNodeMap();
                        yfiles.algorithms.GraphConnectivity.connectedComponentsWithIndex(copy, componentNumber);
                        var movedComponents = new yfiles.collections.HashSet();
                        var selectedNodes = new yfiles.collections.HashSet();
                        this.movedNodes.forEach((function (node) {
                            var copiedNode = copy.getCopiedNode(node);
                            if (copiedNode !== null) {
                                selectedNodes.add(copiedNode);
                                movedComponents.add(componentNumber.getInt(copiedNode));
                                this.layouter.setCenter(copiedNode, node.layout.x + node.layout.width * 0.5, node.layout.y + node.layout.height * 0.5);
                                this.layouter.setInertia(copiedNode, 1.0);
                                increaseHeat(copiedNode, this.layouter, 0.5);
                            }
                        }).bind(this));
                        copy.nodes.forEach((function (copiedNode) {
                            if (!movedComponents.contains(componentNumber.getInt(copiedNode))) {
                                this.layouter.setInertia(copiedNode, 1);
                            } else {
                                if (!selectedNodes.contains(copiedNode)) {
                                    // make it float freely
                                    this.layouter.setInertia(copiedNode, 0);
                                }
                            }
                        }).bind(this));
                        copy.disposeNodeMap(componentNumber);
                        this.layouter.wakeUp();
                    }
                },

                'onMoving': function (sender, inputModeEventArgs) {
                    if (this.layouter !== null) {
                        var copy = this.copiedLayoutGraph;
                        this.movedNodes.forEach((function (node) {
                            var copiedNode = copy.getCopiedNode(node);
                            if (copiedNode !== null) {
                                this.layouter.setCenter(copiedNode, node.layout.getRectangleCenter().x, node.layout.getRectangleCenter().y);
                                increaseHeat(copiedNode, this.layouter, 0.05);
                            }
                        }).bind(this));
                        this.layouter.wakeUp();
                    }
                },

                'onMoveCanceled': function (sender, inputModeEventArgs) {
                    if (this.layouter !== null) {
                        var /**yfiles.layout.CopiedLayoutGraph*/ copy = this.copiedLayoutGraph;
                        this.movedNodes.forEach((function (/**yfiles.graph.INode*/ node) {
                            var /**yfiles.algorithms.Node*/ copiedNode = copy.getCopiedNode(node);
                            if (copiedNode !== null) {
                                //Update the position of the node in the CLG to match the one in the IGraph
                                this.layouter.setCenter(copiedNode, node.layout.getRectangleCenter().x, node.layout.getRectangleCenter().y);
                                this.layouter.setStress(copiedNode, 0);
                            }
                        }).bind(this));
                        copy.nodes.forEach((function (/**yfiles.algorithms.Node*/ copiedNode) {
                            //Reset the node's inertia to be fixed
                            this.layouter.setInertia(copiedNode, 1.0);
                            this.layouter.setStress(copiedNode, 0);
                        }).bind(this));
                        //We don't want to restart the layout (since we canceled the drag anyway...)
                    }
                },

                'onMovedFinished': function (/**Object*/ sender, /**yfiles.input.InputModeEventArgs*/ inputModeEventArgs) {
                    if (this.layouter !== null) {
                        var /**yfiles.layout.CopiedLayoutGraph*/ copy = this.copiedLayoutGraph;
                        this.movedNodes.forEach((function (/**yfiles.graph.INode*/ node) {
                            var /**yfiles.algorithms.Node*/ copiedNode = copy.getCopiedNode(node);
                            if (copiedNode !== null) {
                                //Update the position of the node in the CLG to match the one in the IGraph
                                this.layouter.setCenter(copiedNode, node.layout.getRectangleCenter().x, node.layout.getRectangleCenter().y);
                                this.layouter.setStress(copiedNode, 0);
                            }
                        }).bind(this));
                        copy.nodes.forEach((function (/**yfiles.algorithms.Node*/ copiedNode) {
                            //Reset the node's inertia to be fixed
                            this.layouter.setInertia(copiedNode, 1.0);
                            this.layouter.setStress(copiedNode, 0);
                        }).bind(this));
                    }
                },
                'layouter': null,
                'copiedLayoutGraph': null,
                'movedNodes': null,
                'layoutContext': null,

                'wakeUp': function (sender, e) {
                    if (this.layouter !== null) {
                        this.copiedLayoutGraph.nodes.forEach((function (copiedNode) {
                            this.layouter.setInertia(copiedNode, 0);
                        }).bind(this));
                        this.layouter.wakeUp();
                        window.setTimeout((function () {
                            this.copiedLayoutGraph.nodes.forEach((function (copiedNode) {
                                this.layouter.setInertia(copiedNode, 1);
                            }).bind(this));
                        }).bind(this), 2000);
                    }
                },
                'go': function () {
                    //not sure what to do yet
                    //this.onMoving(this, yfiles.system.EventArgs.EMPTY);
                    //this.layoutContext.continueLayout(3000);
                    //this.wakeUp(this, yfiles.system.EventArgs.EMPTY);
                    this.layouter.wakeUp();
                },
                'synchronize': function (sender, e) {
                    if (this.layouter !== null) {
                        this.layouter.syncStructure();
                        this.layoutContext.continueLayout(10);
                    }
                },
                '$static': {
                    'CollectingPositionHandlerWrapper': new yfiles.ClassDefinition(function () {
                        return {
                            '$extends': yfiles.input.ConstrainedPositionHandler,

                            'constructor': function (item, movedNodes, baseImplementation) {
                                yfiles.input.ConstrainedPositionHandler.call(this, baseImplementation);
                                this.item = item;
                                this.movedNodes = movedNodes;
                            },

                            'item': null,
                            'movedNodes': null,

                            'onInitialized': function (inputModeContext, originalLocation) {
                                this.movedNodes.add(this.item);
                            },

                            'constrainNewLocation': function (context, originalLocation, newLocation) {
                                return newLocation;
                            }

                        };
                    })

                }
            };
        })


    });
});
