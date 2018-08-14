"use strict";
define(['DemoLayoutSupport'], function (support) {

    var DemoCircleLayout = {
    };

    /**
     * Main function that does the circle layout (Layout entry point)
     * @param {DvtDiagramLayoutContext} layoutContext object that defines a context for layout call
     */
    DemoCircleLayout.circleLayout = function (layoutContext) {
        DemoCircleLayout.circleLayoutHelper(layoutContext);
    };

    /**
     * Circle layout function with layout arguments. 
     * Used outside of ADF environment, when outside caller has to pass arguments to the layout.
     * @param {number} radius radius for the circle
     * @param {boolean} center true to have a center node
     * @param {string} anchor node id to use as a center
     * @param {string} sortAttr name of the sort attribute
     * @param {boolen} radialLabels true for curved labels
     * @param {boolean} curvedLinks true for curved links
     */
    DemoCircleLayout.circleLayoutWithLayoutArgs = function (radius, center, anchor, sortAttr, radialLabels, curvedLinks) {
        var func = function (layoutContext) {
            DemoCircleLayout.circleLayoutHelper(layoutContext, radius, center, anchor, sortAttr, radialLabels, curvedLinks);
        };
        return func;
    };

    /**
     * Helper function that does the circle layout
     * @param {DvtDiagramLayoutContext} layoutContext object that defines a context for layout call
     * @param {number} radius radius for the circle
     * @param {boolean} center true to have a center node
     * @param {string} anchor node id to use as a center
     * @param {string} sortAttr name of the sort attribute
     * @param {boolen} radialLabels true for curved labels
     * @param {boolean} curvedLinks true for curved links
     */
    DemoCircleLayout.circleLayoutHelper = function (layoutContext, radius, center, anchor, sortAttr, radialLabels, curvedLinks) {
        var layoutAttrs = layoutContext.getLayoutAttributes();
        center = center ? center : layoutAttrs ? "true" == layoutAttrs["center"] : false;
        sortAttr = sortAttr ? sortAttr : layoutAttrs ? layoutAttrs["sortAttr"] : null;
        radialLabels = radialLabels ? radialLabels : layoutAttrs ? "true" == layoutAttrs["radialLabels"] : false;
        curvedLinks = curvedLinks ? curvedLinks : layoutAttrs ? "true" == layoutAttrs["curvedLinks"] : false;

        var nodeCount = layoutContext.getNodeCount();
        if (center && !anchor) {
            for (ni = 0; ni < nodeCount; ni++) {
                var node = layoutContext.getNodeByIndex(ni);
                if ("true" == node.getLayoutAttributes()["anchor"]) {
                    anchor = node.getId();
                    break;
                }
            }
        }
        var maxNodeBounds = support.getMaxNodeBounds(layoutContext, radialLabels);
        var nodeSize = Math.max(maxNodeBounds.w, maxNodeBounds.h);
        if (nodeCount == 1) {
            support.centerNodeAndLabel(layoutContext, layoutContext.getNodeByIndex(0), 0, 0);
        }
        else {
            if (nodeCount == 2 && center) {
                center = false;
            }
            var angleStep = 2 * Math.PI / (nodeCount - (center ? 1 : 0));
            var extraSpaceFactor = center ? (3 / nodeCount) : (1 / nodeCount);

            radius = radius ? radius :
                layoutAttrs && layoutAttrs["radius"] ? parseInt(layoutAttrs["radius"]) :
                    (1 + extraSpaceFactor) * nodeSize / Math.sqrt(1 - Math.cos(angleStep));

            var sortedNodes = new Array();
            var ni;
            for (ni = 0; ni < nodeCount; ni++) {
                var node = layoutContext.getNodeByIndex(ni);
                sortedNodes.push(node);
            }
            if (sortAttr) {
                sortedNodes.sort(support.getNodeComparator(sortAttr));
            }
            var max = nodeCount;
            var offset = 0;
            for (ni = 0; ni < max; ni++) {
                var node = sortedNodes[ni];
                if (center && !anchor) {
                    anchor = node.getId();
                }
                if (center && node.getId() == anchor) {
                    support.centerNodeAndLabel(layoutContext, node, 0, 0);
                    offset = 1;
                    continue;
                }
                var angle = (ni - offset) * angleStep;
                var currX = radius * Math.cos(angle);
                var currY = radius * Math.sin(angle);
                if (radialLabels) {
                    support.centerNode(node, currX, currY);
                    DemoCircleLayout.positionRadialNodeLabel(layoutContext, node, angle, radius);
                }
                else {
                    support.centerNodeAndLabel(layoutContext, node, currX, currY);
                }
            }
        }
        if (curvedLinks) {
            DemoCircleLayout.layoutCurvedLinks(layoutContext);
        }
        else {
            support.layoutLinks(layoutContext);
        }
    };

    DemoCircleLayout.layoutCurvedLinks = function (layoutContext) {
        for (var li = 0; li < layoutContext.getLinkCount(); li++) {
            var link = layoutContext.getLinkByIndex(li);
            var endpoints = DemoCircleLayout.getCurvedEndpoints(layoutContext, link);

            var startX = endpoints[0].x;
            var startY = endpoints[0].y;
            var endX = endpoints[1].x;
            var endY = endpoints[1].y;

            // Quadratic Bezier through center of circle
            link.setPoints(["M", startX, startY, "Q", 0, 0, endX, endY]);

            // No label support for now
        }
    };

    DemoCircleLayout.getCurvedEndpoints = function (layoutContext, link) {
        var layoutAttrs = layoutContext.getLayoutAttributes();
        //support for laying out links to connect at the edges of node
        //bounding boxes instead of at the centers
        var bLinkToBounds = true;
        if (layoutAttrs) {
            bLinkToBounds = (layoutAttrs["linkToBounds"] !== "false");
        }

        var n1 = layoutContext.getNodeById(link.getStartId());
        var n2 = layoutContext.getNodeById(link.getEndId());

        var n1Position = n1.getPosition();
        var n2Position = n2.getPosition();

        var b1 = n1.getContentBounds();
        var b2 = n2.getContentBounds();

        var startX = n1Position.x + b1.x + .5 * b1.w;
        var startY = n1Position.y + b1.y + .5 * b1.h;
        var endX = n2Position.x + b2.x + .5 * b2.w;
        var endY = n2Position.y + b2.y + .5 * b2.h;

        //support for laying out links to connect at the edges of node
        //bounding boxes instead of at the centers
        if (bLinkToBounds) {
            b1 = { 'x': n1Position.x + b1.x, 'y': n1Position.y + b1.y, 'w': b1.w, 'h': b1.h };
            b2 = { 'x': n2Position.x + b2.x, 'y': n2Position.y + b2.y, 'w': b2.w, 'h': b2.h };

            var startP = support._intersectRect(b1, startX, startY, 0, 0, link.getStartConnectorOffset());
            var endP = support._intersectRect(b2, endX, endY, 0, 0, link.getEndConnectorOffset());
            startX = startP.x;
            startY = startP.y;
            endX = endP.x;
            endY = endP.y;
        }
        var endpoints = [];
        endpoints.push({ 'x': startX, 'y': startY });
        endpoints.push({ 'x': endX, 'y': endY });
        return endpoints;
    };

    DemoCircleLayout.positionRadialNodeLabel = function (layoutContext, node, angle, radius) {
        var nodeLabelBounds = node.getLabelBounds();
        if (nodeLabelBounds) {
            var flipLabel = angle > .5 * Math.PI && angle < 1.5 * Math.PI;
            var nodeBounds = node.getBounds();
            var radiusPadding = Math.max(nodeBounds.w, nodeBounds.h) * Math.sqrt(2) / 2;
            var labelAttachPoint = { 'x': (radius + radiusPadding) * Math.cos(angle), 'y': (radius + radiusPadding) * Math.sin(angle) };
            var rotationPoint = { 'x': nodeLabelBounds.x + (flipLabel ? nodeLabelBounds.w : 0), 'y': nodeLabelBounds.y + .5 * nodeLabelBounds.h };
            var labelPos = { 'x': labelAttachPoint.x - rotationPoint.x, 'y': labelAttachPoint.y - rotationPoint.y };

            node.setLabelPosition(labelPos);
            node.setLabelRotationAngle(angle - (flipLabel ? Math.PI : 0));
            node.setLabelRotationPoint(rotationPoint);
        }
    }
    return DemoCircleLayout;
});  
