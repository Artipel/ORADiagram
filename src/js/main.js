/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * Example of Require.js boostrap javascript
 */
/* eslint-disable quote-props */

requirejs.config(
  {
    baseUrl: 'js',

    // Path mappings for the logical module names
    // Update the main-release-paths.json for release mode when updating the mappings
    paths:
    //injector:mainReleasePaths
    {
      'knockout': 'libs/knockout/knockout-3.4.2.debug',
      'jquery': 'libs/jquery/jquery-3.3.1',
      'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
      'promise': 'libs/es6-promise/es6-promise',
      'hammerjs': 'libs/hammer/hammer-2.0.8',
      'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.0',
      'ojs': 'libs/oj/v5.1.0/debug',
      'ojL10n': 'libs/oj/v5.1.0/ojL10n',
      'ojtranslations': 'libs/oj/v5.1.0/resources',
      'text': 'libs/require/text',
      'signals': 'libs/js-signals/signals',
      'customElements': 'libs/webcomponents/custom-elements.min',
      'proj4': 'libs/proj4js/dist/proj4-src',
      'css': 'libs/require-css/css'
    }
    //endinjector
    ,

    // Shim configurations for modules that do not expose AMD
    shim:
    {
      'jquery':
      {
        exports: ['jQuery', '$']
      }
    }
  }
);

require(['ojs/ojcore', 'knockout', 'jquery', 'DemoGridLayout', 'ojs/ojknockout',
    'ojs/ojprogress', 'ojs/ojdiagram', 'ojs/ojjsondiagramdatasource',
    ],
    function (oj, ko, $, layout) {
        $(function () {
            function init() {
                ko.applyBindings(new progressModel(), document.getElementById("progress_bar"));
                ko.applyBindings(new diagramModel(), document.getElementById("diagram1"));
            }

            function progressModel() {
                var self = this;
                self.progressValue = -1;
            }

            function diagramModel() {
                var self = this;

                self.panningValue = ko.observable("none");
                self.zoomingValue = ko.observable("none");

                function createNode(index, desc, color, pathId, seq) {
                    var words = desc.split(" ");
                    var tag = words.map(function foo(value) { return value.slice(0, 2).toUpperCase(); })
                        .toString()
                        .replace(",","-");
                    return {
                        id: "N" + index,
                        label: ""+tag,
                        shortDesc: desc,
                        path: pathId,
                        sequence: seq,
                        icon: { color: color }
                    };
                }
                function createLink(index, startId, endId, category, color) {
                    return {
                        id: "L" + index,
                        shortDesc: "Link L" + index + ", " + category + ", connects " + startId + " to " + endId,
                        startNode: "N" + startId,
                        endNode: "N" + endId,
                    };
                }

                var nodes = [], links = [];

                nodes.push(createNode(0, "Zadzwon", '#eee', 0, 1));
                nodes.push(createNode(1, "Popros grzecznie", '#edd', 0, 2));
                nodes.push(createNode(2, "Popros stanowczo", '#ecc', 0, 3));
                nodes.push(createNode(3, "Porozmawiaj", '#ebb', 0, 4));
                nodes.push(createNode(4, "Rozwiaz umowe", '#eaa', 0, 5));
                nodes.push(createNode(5, "Porozmawiaj ponownie", '#e99', 0, 6));
                links.push(createLink(0, 0, 1, 0, '#ccc'));
                links.push(createLink(1, 1, 2, 0, '#ccc'));
                links.push(createLink(2, 2, 3, 0, '#ccc'));
                links.push(createLink(3, 3, 4, 0, '#ccc'));
                links.push(createLink(4, 4, 5, 0, '#ccc'));

                nodes.push(createNode(6, "Zadzwon", '#eee', 1, 1));
                nodes.push(createNode(7, "Popros z wypowiedzeniem", '#ded', 1, 2));
                nodes.push(createNode(8, "Zadzwon ponownie", '#cec', 1, 3));
                nodes.push(createNode(9, "Wypowiedz umowe", '#cec', 1, 4));
                nodes.push(createNode(10, "Diagnozuj problem", '#beb', 1, 5));
                links.push(createLink(5, 6, 7, 0, '#ccc'));
                links.push(createLink(6, 7, 8, 0, '#ccc'));
                links.push(createLink(7, 8, 9, 0, '#ccc'));
                links.push(createLink(8, 9, 10, 0, '#ccc'));

                nodes.push(createNode(11, "Zadzwon", '#eee', 2, 1));
                nodes.push(createNode(12, "Odrzuc", '#eed', 2, 2));
                links.push(createLink(11, 11, 12, 0, '#ccc'));

                self.styleDefaults = {
                    nodeDefaults: {
                        icon: { width: 125, height: 100, shape: "square" },
                        labelStyle: {fontSize:"32px"}
                    },
                    linkDefaults: {
                        startConnectorType: "none",
                        endConnectorType: "arrow",
                        width: 5,
                        color: "#444"
                    }
                }
                self.dataSource = new oj.JsonDiagramDataSource({ 'nodes': nodes, 'links': links });
                self.layoutFunc = layout.gridLayout(3);
                //self.layoutFunc = oj.DiagramUtils.getLayout(data);
                

            }



      // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
      // event before executing any code that might interact with Cordova APIs or plugins.
      if ($(document.body).hasClass('oj-hybrid')) {
        document.addEventListener('deviceready', init);
      } else {
        init();
      }
    });
  }
);
