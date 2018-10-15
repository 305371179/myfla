function Scene1() {
    this.scene = Snap(550, 400);
    document.body.appendChild(this.scene.node);
    this._init();
}

Scene1.prototype._init = function() {
    new Layer1(this.scene)
}

function Layer1(scene) {
    this.scene = scene;
    this._init();
}

Layer1.prototype._init = function() {
    this.group = this.scene.g();
    this.instance = this.scene.paper.path('M360 71.05L494 71.05L494 183.05L360 183.05L360 71.05').attr({
        "fill": "none",
        "stroke": "#000",
        "strokeWidth": 1
    });
    this.group.add(this.instance);
    this.instance1 = this.scene.paper.path('M252 262.05L358 262.05L358 327.05L252 327.05L252 262.05').attr({
        "fill": "#00CC00",
        "fillWidth": 1,
        "stroke": "#000",
        "strokeWidth": 1
    });
    this.group.add(this.instance1);
    this.instance2 = this.scene.paper.path('M36 94.05Q58.4 89.5 73.8 76.55Q82.3 69.35 90.75 56.7Q93.7 52.25 94.75 51.35Q96.35 50 97.6 52Q99.4 54.95 105 80.05Q114.4 121.95 132.65 102.7Q134.3695 100.86 136 98.775Q143.127 89.6557 149 75.05').attr({
        "fill": "none",
        "stroke": "#000",
        "strokeWidth": 1
    });
    this.group.add(this.instance2);
    this.instance3 = this.scene.paper.path('M138 282.05L164 282.05L164 308.05L138 308.05L138 282.05').attr({
        "fill": "#00CC00",
        "fillWidth": 1,
        "stroke": "#000",
        "strokeWidth": 1
    });
    this.group.add(this.instance3);
    this.instance4 = this.scene.paper.path('M92 143.05L307 143.05L307 206.05L92 206.05L92 143.05').attr({
        "fill": "#454545",
        "fillWidth": 1,
        "stroke": "#000",
        "strokeWidth": 1
    });
    this.group.add(this.instance4);
}

var scene1 = new Scene1()