/**
 * @classdesc This is an implementation of sketch tool using canvas which helps to draw simple
 * drawings with custom colors and shapes.The drawn sketch can be saved or download as png using the sketch tool.
 *
 * @class Sketch
 * @param {Object} options Valid options are "container", "sizes",
 *                         "colors", "toolsPosition". @see "Members" section for details
 *
 * @example
 *
 * var sketch = new Sketch({
 *         container: $("#container"),
 *         sizes: [1, 2, 3, 4, 5],
 *         toolsPosition: "right",
 *         colors:{
 *             fillDefaultColor:"#ffffff",
 *             sketchDefaultColor:"#000000"
 *         },
 *         hideTools:false
 * });
 *
 * @author Mithun KT
 * @version 1.0
 *
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2015 Mithun KT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (factory, globalScope) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery", "underscore"], factory);
    } else {
        // Browser globals
        globalScope.Sketch = factory(globalScope.jQuery);
    }
})(function ($) {

    "use strict";

    return function Sketch(options) {

        var _domNode;
        var _sketchBoard, _sketchBoardContext, _mode = "Pen",
            _draggableTool = false;
        var _tempCanvas, _tempContext;
        var _config = {};
        var _defaultColors = ["red", "blue", "green", "black", "white", "transparent"];
        var _sizes = options.sizes ? options.sizes : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var _colors = {};
        var _fillDefaultColor = "#ffffff";
        var _sketchDefaultColor = "#000000";
        var _hideTools = options.hideTools ? options.hideTools : false;
        window.sketch = this;

        // If optional colors are given setting it to sketch colors
        if (options.colors) {
            _colors = {
                fillColors: options.colors.fillColors ? options.colors.fillColors : _defaultColors,
                sketchColors: options.colors.sketchColors ? options.colors.sketchColors : _defaultColors,
                fillDefaultColor: options.colors.fillDefaultColor ?
                    options.colors.fillDefaultColor : _fillDefaultColor,
                sketchDefaultColor: options.colors.sketchDefaultColor ?
                    options.colors.sketchDefaultColor : _sketchDefaultColor
            };
        } else {
            _colors = {
                fillColors: _defaultColors,
                sketchColors: _defaultColors,
                fillDefaultColor: _fillDefaultColor,
                sketchDefaultColor: _sketchDefaultColor
            };
        }

        /**
         * Calculates height,width,x and y position from given coordinates
         *
         * @memberof Sketch
         * @param   {Number} xStart X start position
         * @param   {Number} yStart Y start position
         * @param   {Number} xPos   drag end x position
         * @param   {Number} yPos   drag end y position
         * @returns {Object} calculated height,width,left and top
         */
        var getRectDimensions = function (xStart, yStart, xPos, yPos) {
            var height = yPos - yStart;
            var width = xPos - xStart;
            var x = xStart;
            var y = yStart;
            if (width < 0) {
                x = xPos;
            }
            if (height < 0) {
                y = yPos;
            }
            return {
                x: x,
                y: y,
                height: Math.abs(height),
                width: Math.abs(width)
            };
        };

        /**
         * Creating sketch canvas which is ready to draw.
         *
         * @memberof Sketch
         */
        var createSketchBoard = function () {
            var mouseDown = false;
            var xPos, yPos, xStart, yStart;
            _domNode = $("<div>").addClass("sketch").appendTo(_config.container);

            var _canvasStr = "<canvas height='" + _domNode.height() + "' width='" + _domNode.width() + "'>";
            _tempCanvas = $(_canvasStr).addClass("sketch-board-temp").appendTo(_domNode);
            _tempContext = _tempCanvas[0].getContext("2d");

            _sketchBoard = $(_canvasStr).addClass("sketch-board").appendTo(_domNode);
            _sketchBoardContext = _sketchBoard[0].getContext("2d");

            _tempContext.fillStyle = $(".fill-color").val() ? $(".fill-color").val() : _colors.fillDefaultColor;
            _tempContext.strokeStyle = $(".sketch-color").val() ?
                $(".sketch-color").val() : _colors.sketchDefaultColor;
            _tempContext.lineWidth = $(".sketch-size").val();

            var _offsetX = _sketchBoard.offset().left;
            var _offsetY = _sketchBoard.offset().top;

            _tempCanvas.on("mousedown", function (event) {
                event.preventDefault();
                mouseDown = true;
                _tempContext.clearRect(0, 0, _tempCanvas.width(), _tempCanvas.height());
                xPos = event.clientX - _offsetX;
                yPos = event.clientY - _offsetY;
                xStart = xPos;
                yStart = yPos;
                _tempContext.beginPath();
                _tempContext.moveTo(xPos, yPos);
            });

            _tempCanvas.on("mouseup", function (event) {
                event.preventDefault();
                if (!mouseDown) {
                    return;
                }
                mouseDown = false;
                xPos = event.pageX - _sketchBoard.offset().left;
                yPos = event.pageY - _sketchBoard.offset().top;

                // translating to real canvas
                _sketchBoardContext.drawImage(_tempContext.canvas, 0, 0);
                _tempContext.clearRect(0, 0, _tempCanvas.width(), _tempCanvas.height());
            });

            // mouse drag handler
            _tempCanvas.on("mousemove", function (event) {
                event.preventDefault();
                if (mouseDown) {
                    xPos = event.clientX - _offsetX;
                    yPos = event.clientY - _offsetY;
                    if (_draggableTool) {
                        _tempContext.clearRect(0, 0, _tempCanvas.width(), _tempCanvas.height());
                        _tempContext.beginPath();
                    }
                    if (_mode === "Pen") {
                        _tempContext.lineTo(xPos, yPos);
                        _tempContext.stroke();
                    } else if (_mode === "Eraser") {
                        _sketchBoardContext.lineWidth = $(".sketch-size").val();
                        _sketchBoardContext.clearRect(xPos, yPos,
                            _sketchBoardContext.lineWidth, _sketchBoardContext.lineWidth);
                    } else if (_mode === "Line" || _mode === "Rectangle" || _mode === "Circle") {
                        if (_mode === "Line") {
                            _tempContext.moveTo(xStart, yStart);
                            _tempContext.lineTo(xPos, yPos);
                        } else if (_mode === "Rectangle") {
                            _tempContext.moveTo(xStart, yStart);
                            var rectDimensions = getRectDimensions(xStart, yStart, xPos, yPos);
                            _tempContext.rect(rectDimensions.x,
                                rectDimensions.y, rectDimensions.width, rectDimensions.height);
                        } else if (_mode === "Circle") {
                            var radius = Math.sqrt(Math.pow((xPos - xStart), 2) +
                                Math.pow((yPos - yStart), 2));
                            _tempContext.arc(xStart, yStart, radius, 0, 2 * Math.PI);
                        }
                        _tempContext.stroke();
                        _tempContext.fill();
                    }
                }
            });
        };

        /**
         * Converts canvas to image and downloads the same
         *
         * @memberof Sketch
         */
        var download = function () {
            var imageURL = _sketchBoard[0].toDataURL("image/png");
            this.href = imageURL.replace(/^data:image\/[^;]/, "data:application/octet-stream");
        };

        /**
         * Creating controlls which support sketch tool
         *
         * @memberof Sketch
         */
        var createControlls = function () {
            var controlls = $("<div>").addClass("sketch-controlls").appendTo(_domNode);

            switch (options.toolsPosition) {
            case "left":
                controlls.addClass("vertical left");
                break;
            case "right":
                controlls.addClass("vertical right");
                break;
            case "top":
                controlls.addClass("horizontal top");
                break;
            case "bottom":
                controlls.addClass("horizontal bottom");
                break;
            default:
                controlls.addClass("vertical right");
            }

            var clear = $("<div title='Clear'>")
                .addClass("sketch-clear tool tool-large fa fa-recycle").appendTo(controlls);
            clear.on("click", function () {
                _sketchBoardContext.clearRect(0, 0, _sketchBoard.width(), _sketchBoard.height());
            });

            var pen = $("<div title='Pen'>")
                .addClass("sketch-pen tool active fa fa-pencil").appendTo(controlls);
            pen.on("click", function () {
                $(".tool", controlls).removeClass("active");
                $(this).addClass("active");
                _mode = "Pen";
                _draggableTool = false;
            });

            var eraser = $("<div title='Eraser'>")
                .addClass("sketch-eraser tool fa fa-eraser").appendTo(controlls);
            eraser.on("click", function () {
                $(".tool", controlls).removeClass("active");
                $(this).addClass("active");
                _mode = "Eraser";
                _draggableTool = false;
            });

            var line = $("<div title='Line'>")
                .addClass("sketch-line tool fa fa-minus").appendTo(controlls);
            line.on("click", function () {
                $(".tool", controlls).removeClass("active");
                $(this).addClass("active");
                _mode = "Line";
                _draggableTool = true;
            });

            var rectangle = $("<div title='Rectangle'>")
                .addClass("sketch-rectangle tool fa fa-square-o").appendTo(controlls);
            rectangle.on("click", function () {
                $(".tool", controlls).removeClass("active");
                $(this).addClass("active");
                _mode = "Rectangle";
                _draggableTool = true;
            });

            var circle = $("<div title='Circle'>")
                .addClass("sketch-circle tool fa fa-circle-thin").appendTo(controlls);
            circle.on("click", function () {
                $(".tool", controlls).removeClass("active");
                $(this).addClass("active");
                _mode = "Circle";
                _draggableTool = true;
            });

            var save = $("<a download='image.png' href='#' title='Download'>")
                .addClass("save tool fa fa-download").appendTo(controlls);
            save.on("click", download);

            // color selector control
            var colorControl = $("<input type='color' class='sketch-color tool sketch-input' value='" +
                _colors.sketchDefaultColor + "'>").appendTo(controlls);
            var colorControlOverlay = $("<div title='Sketch Color'>")
                .addClass("sketch-color tool").appendTo(controlls);
            colorControlOverlay.on("click", function () {
                colorControl.trigger("click");
            });
            colorControlOverlay.css("background-color", _colors.sketchDefaultColor);
            colorControl.on("change", function () {
                _tempContext.strokeStyle = $(".sketch-color", _domNode).val();
                colorControlOverlay.css("background-color", $(".sketch-color", _domNode).val());
            });

            // fill style control
            var fillControl = $("<input type='color' class='fill-color tool sketch-input' value='" +
                _colors.fillDefaultColor + "'>").appendTo(controlls);
            fillControl.css("visibility", "hidden");
            var fillControlOverlay = $("<div title='Fill Color'>")
                .addClass("sketch-fill tool").appendTo(controlls);
            fillControlOverlay.on("click", function () {
                fillControl.trigger("click");
            });
            fillControlOverlay.css("background-color", _colors.fillDefaultColor);
            fillControl.on("change", function () {
                _tempContext.fillStyle = $(".fill-color", _domNode).val();
                fillControlOverlay.css("background-color", $(".fill-color", _domNode).val());
            });

            // line size control
            var sizeControl = $("<select class='sketch-size'>").appendTo(controlls);
            for (var sizeCnt = 0; sizeCnt < _sizes.length; sizeCnt++) {
                var size = _sizes[sizeCnt];
                sizeControl.append("<option value='" + size + "'>" + size + "</option>");
            }
            sizeControl.on("change", function () {
                _tempContext.lineWidth = $(".sketch-size", _domNode).val();
            });

            if (_hideTools) {
                controlls.hide();
            }
        };

        /**
         * Resizes the sketch canvas according to the target node.
         *
         * @memberof sketch
         */
        this.resize = function () {
            _tempCanvas.width(_domNode.width());
            _tempCanvas.height(_domNode.height());
            _sketchBoard.width(_domNode.width());
            _sketchBoard.height(_domNode.height());
        };

        /**
         * Returns the image url of the drawn sketch
         *
         * @memberof sketch
         * @returns {String} image url
         */
        this.getImage = function () {
            return _sketchBoard[0].toDataURL("image/png");
        };

        /**
         * This function sets the sketch control to given control
         *
         * @memberof sketch
         * @param {String} tool tool name that is to be set
         */
        this.setTool = function (tool) {
            var toolControl = $(".sketch-" + tool, _domNode);
            toolControl.trigger("click");
        };

        /**
         * This function will hide the controll.
         *
         * @memberof sketch
         */
        this.hideTool = function () {
            $(".sketch-controlls", _domNode).hide();
        };

        /**
         * This function will show the controll.
         *
         * @memberof sketch
         */
        this.showTool = function () {
            $(".sketch-controlls", _domNode).show();
        };

        /**
         * Clears the sketch draws.
         *
         * @memberof sketch
         */
        this.clear = function () {
            _sketchBoardContext.clearRect(0, 0, _sketchBoard.width(), _sketchBoard.height());
        };

        /**
         * This function will change position of the tool according to the given position.
         *
         * @memberof sketch
         * @param {String} position position of the tool to be placed
         */
        this.changeToolPosition = function (position) {
            if (position && (position === "top" ||
                    position === "bottom" ||
                    position === "left" ||
                    position === "right")) {
                var controlls = $(".sketch-controlls", _domNode);
                controlls.removeClass("vertical horizontal left top right bottom");
                switch (position) {
                case "left":
                    controlls.addClass("vertical left");
                    break;
                case "right":
                    controlls.addClass("vertical right");
                    break;
                case "top":
                    controlls.addClass("horizontal top");
                    break;
                case "bottom":
                    controlls.addClass("horizontal bottom");
                    break;
                default:
                    controlls.addClass("vertical right");
                }
            }
        };

        /**
         * Init this instance. Called once at startup.
         *
         * @memberof Sketch
         */
        var init = function () {
            _config = $.extend(true, _config, options);
            createSketchBoard();
            createControlls();
        };

        init.call(this);
    };
}, this);