* * *

## Class: Sketch

This is an implementation of sketch tool using canvas which helps to draw simple drawings with custom colors and shapes.The drawn sketch can be saved or download as png using the sketch tool.

#### Version:
1.0

#### Author:
Mithun KT

### Usage

    var sketch = new Sketch({
        container: $("#container"),
        sizes: [1, 2, 3, 4, 5],
        toolsPosition: "right",
        colors:{
            fillDefaultColor:"#ffffff",
            sketchDefaultColor:"#000000"
        }
    });

### Resources

    <link rel="stylesheet" href="css/sketch.css">
    <script src="js/src/sketch.js"></script>

### Dependency

    <script src="js/lib/jquery-2.1.1.js"></script>

* * *

API
---

## Constructor: new Sketch(options)

**Options**

**sizes**: `Array`, Specify the range of sketch line sizes.

**toolsPosition**: `String`, Specify the position where the tools to be shown. Valid values are 'right', 'left', 'top' and 'bottom'. Default value is 'right'

**colors**: `Object`, Expect an object with 'fillDefaultColor' and 'sketchDefaultColor' in hexadecimal. Eg: {fillDefaultColor: "#000000", sketchDefaultColor: "#ffffff"}

**container**: `String | Node`, Container that to be made sketch board

* * *







