/****************************************************************************
 **
 ** This file is part of yFiles for HTML 1.2.0.3.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2014 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
(typeof define=='function'?define:(function(dependencies, fn){fn();}))(['yfiles/lang'],function(){
    yfiles.module("Orbifold", function(exports) {
        exports.NeoSimpleLabelStyle = new yfiles.ClassDefinition(function() {
            return {
                '$extends': yfiles.drawing.SimpleAbstractLabelStyle,
                'constructor': function() {
                    yfiles.drawing.SimpleAbstractLabelStyle.call(this, yfiles.canvas.CanvasContainer.$class);
                    var /**yfiles.system.Typeface*/ newTypeface = new yfiles.system.Typeface();
                    newTypeface.fontFamily = "Arial";
                    newTypeface.fontSize = 12;
                    this.typeface = newTypeface;

                },
                '$typeface': null,
                'typeface': {
                    '$meta': function() {
                        return [yfiles.system.TypeAttribute(yfiles.system.Typeface.$class)];
                    },
                    'get': function() {
                        return this.$typeface;
                    },
                    'set': function(/**yfiles.system.Typeface*/ value) {
                        this.$typeface = value;
                    }
                },
                'render': function(/**SVGGElement*/ container, /**yfiles.geometry.IOrientedRectangle*/ labelLayout, /**yfiles.drawing.IRenderContext*/ context, cache) {
                    // store information with the visual on how we created it
                    container["data-renderDataCache"] = cache;
                    
                    // background rectangle
                    var /**SVGRectElement*/ rect;
                    if (container.childNodes.length > 0) {
                        rect = (/**@type {SVGRectElement}*/(container.childNodes.item(0)));
                    } else {
                        rect = window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        rect.width.baseVal.value = labelLayout.width;
                        rect.height.baseVal.value = labelLayout.height;
                        var /**number*/ radius = (labelLayout.width / 10);
                        rect.rx.baseVal.value = radius;
                        rect.ry.baseVal.value = radius;
                        container.appendChild(rect);
                    }
                    rect.setAttributeNS(null, "fill", "White");
                    rect.setAttributeNS(null, "stroke", "dimgray");
                    rect.setAttributeNS(null, "stroke-width", 1);

                    var /**SVGTextElement*/ text;
                    if (container.childNodes.length > 1) {
                        text = (/**@type {SVGTextElement}*/(container.childNodes.item(1)));
                    } else {
                        text = window.document.createElementNS("http://www.w3.org/2000/svg", "text");
                        container.appendChild(text);
                    }
                    text.textContent = cache.labelText;
                    text.setAttributeNS(null, "font-family", this.typeface.fontFamily);
                    text.setAttributeNS(null, "font-style", yfiles.canvas.SVGExtensions.toSvgFontStyle(this.typeface.fontStyle));
                    text.setAttributeNS(null, "font-weight", yfiles.canvas.SVGExtensions.toSvgFontWeight(this.typeface.fontWeight));
                    text.setAttributeNS(null, "font-size", this.typeface.fontSize + "px");
                    text.setAttributeNS(null, "fill", yfiles.system.Colors.BLACK.toSvgColor());
                    text.setAttributeNS(null, "style", "dominant-baseline: central;");

                    var /**yfiles.geometry.SizeD*/ textSize = yfiles.drawing.TextRenderSupport.measureText(cache.labelText, this.typeface);
                    var /**number*/ textPositionLeft = (labelLayout.width - textSize.width) / 2;

                    text.setAttributeNS(null, "transform", "translate(" + textPositionLeft + " " + (labelLayout.height * 0.5) + ")");
                    while (container.childNodes.length > 2) {
                        container.removeChild(container.childNodes.item(2));
                    }
                },
                'createVisual': function(/**yfiles.graph.ILabel*/ label, /**yfiles.drawing.IRenderContext*/ renderContext) {
                    // This implementation creates a 'g' element and uses it for the rendering of the label.
                    var /**yfiles.canvas.CanvasContainer*/ container = new yfiles.canvas.CanvasContainer();
                    var /**SVGGElement*/ g = (/**@type {SVGGElement}*/(container.svgElement));
                    // Get the necessary data for rendering of the label
                    var /**tutorial.styles12.MySimpleLabelStyle.RenderDataCache*/ cache = this.createRenderDataCache(renderContext, label, this.typeface);
                    // Render the label
                    this.render(g, label.layout, renderContext, cache);
                    // move container to correct location
                    this.arrangeByLayout(container, label.layout, true);
                    return container;
                },
                /**
                 * Re-renders the label using the old visual for performance reasons.
                 * @return {yfiles.canvas.CanvasContainer}
                 */
                'updateVisual': function(/**yfiles.graph.ILabel*/ label, /**yfiles.drawing.IRenderContext*/ renderContext, /**yfiles.canvas.CanvasContainer*/ oldVisual) {
                  var /**SVGGElement*/ container = (/**@type {SVGGElement}*/(oldVisual.svgElement));
                  // get the data with which the oldvisual was created
                  var /**tutorial.styles12.MySimpleLabelStyle.RenderDataCache*/ oldCache = (/**@type {tutorial.styles12.MySimpleLabelStyle.RenderDataCache}*/(container["data-renderDataCache"]));
                  // get the data for the new visual
                  var /**tutorial.styles12.MySimpleLabelStyle.RenderDataCache*/ newCache = this.createRenderDataCache(renderContext, label, this.typeface);
                  if (!oldCache.equals(newCache)) {
                    // something changed - re-render the visual
                    this.render(container, label.layout, renderContext, newCache);
                  }
                  // nothing changed, return the old visual
                  // arrange because the layout might have changed
                  this.arrangeByLayout(oldVisual, label.layout, true);
                  return oldVisual;
                },
                'getPreferredSize': function(/**yfiles.graph.ILabel*/ label) {
                    return new yfiles.geometry.SizeD(80, 15);
                },
                /**
                 * Creates an object containing all necessary data to create a label visual
                 * @return {tutorial.styles12.MySimpleLabelStyle.RenderDataCache}
                 * @private
                 */
                'createRenderDataCache': function(/**yfiles.drawing.IRenderContext*/ context, /**yfiles.graph.ILabel*/ label, /**yfiles.system.Typeface*/ typeface) {
                  return {'labelText': label.text, 'typeface': typeface, 'equals': function(other) {
                    return other !== null && other.labelText && other.typeface && other.labelText===this.labelText && other.typeface.equals(this.typeface);
                  }};
                },

            };
        })


    });});
