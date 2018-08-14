"use strict";
define(['DemoLayoutSupport'], function (support) {
    var DemoGridLayout = {

    };
    /**
     * Grid layout function that does a grid layout with layout arguments
     * If neither rows or cols arguments specified, will make a square grid
     * If both specified, will use rows to calculate grid
     * @param {number=} rows optional number of rows in the grid
     * @param {number=} cols optional number of cols in the grid
     * @return {function} layout function
     */
    DemoGridLayout.gridLayout = function (rows, cols) {
        var func = function (layoutContext) {
            return DemoGridLayout.gridLayoutHelper(layoutContext, rows, cols);
        };
        return func;
    };

    /**
     * Helper function that performs the grid layout
     * If neither rows or cols arguments specified, will make a square grid
     * If both specified, will use rows to calculate grid
     * @param {DvtDiagramLayoutContext} layoutContext object that defines a context for layout call
     * @param {number=} rows optional number of rows in the grid
     * @param {number=} cols optional number of cols in the grid
     * @return {Promise} Promise object that will be resolved when the layout is done
     */
    DemoGridLayout.gridLayoutHelper = function (layoutContext, rows, cols) {
        var maxNodeBounds = support.getMaxNodeBounds(layoutContext);
        var nodeSize = Math.max(maxNodeBounds.w, maxNodeBounds.h);
        var nodeCount = layoutContext.getNodeCount();
        var linkCount = layoutContext.getLinkCount();
        var size = Math.floor(Math.sqrt(nodeCount));

        //var space = linkCount > 0 ? 2*nodeSize : 1.25*nodeSize;
        var padding = 0;
        var layoutAttrs = layoutContext.getLayoutAttributes();
        if (layoutAttrs && layoutAttrs["padding"]) {
            padding = parseInt(layoutAttrs["padding"]);
        }
        else {
            padding = linkCount > 0 ? nodeSize : .25 * nodeSize;
        }
        var space = nodeSize + padding;

        if (rows) {
            cols = Math.floor(nodeCount / rows);
        }
        else if (cols) {
            rows = Math.ceil(nodeCount / cols);
        }
        else {
            rows = Math.ceil(nodeCount / size);
            cols = size;
        }

        var startx = - (cols - 1) * space / 2;
        var starty = - (rows - 1) * space / 2;
        var row = 0;
        var col = 0;
        for (var ni = 0; ni < nodeCount; ni++) {
            var node = layoutContext.getNodeByIndex(ni);
            row = node.getData().sequence;
            col = node.getData().path;
            var currX = startx + space * col;
            var currY = starty + space * row;
            support.centerNodeAndLabel(layoutContext, node, currX, currY);
        }
        support.layoutLinks(layoutContext);
    };
    return DemoGridLayout;
});
