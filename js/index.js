var bw, convert_to_bw, display_bw, display_points, find_points, fish_points, load_new_image, points, process_new_image, setup, unchanged;

Array.prototype.remove = function(from, to) {
  var rest;
  rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

unchanged = {};

bw = {};

points = {
  fisheye: d3.fisheye().radius(50).power(2),
  threshold: 195,
  edges: []
};

convert_to_bw = function() {
  var b, g, grey, i, pixels, r, _ref, _results;
  bw.imageData = unchanged.context.getImageData(0, 0, unchanged.width, unchanged.height);
  pixels = bw.imageData.data;
  _results = [];
  for (i = 0, _ref = unchanged.height * unchanged.width; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
    r = pixels[i * 4];
    g = pixels[i * 4 + 1];
    b = pixels[i * 4 + 2];
    grey = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
    pixels[i * 4] = grey;
    pixels[i * 4 + 1] = grey;
    _results.push(pixels[i * 4 + 2] = grey);
  }
  return _results;
};

display_bw = function() {
  bw.canvas = document.getElementById("blackwhite_c");
  bw.context = bw.canvas.getContext("2d");
  bw.canvas.setAttribute('height', bw.imageData.height);
  bw.canvas.setAttribute('width', bw.imageData.width);
  return bw.context.putImageData(bw.imageData, 0, 0);
};

find_points = function() {
  var bottom, e, edge, horizon, i, left, pixels, right, tmp, top, vertical, x, y, _ref, _ref2, _ref3, _results;
  console.log(points.threshold, points.edges.length);
  points.imageData = bw.imageData;
  pixels = points.imageData.data;
  tmp = [];
  for (i = _ref = unchanged.width * 1, _ref2 = unchanged.height * (unchanged.width - 1); _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
    left = pixels[(i - 1) * 4];
    right = pixels[(i + 1) * 4];
    top = pixels[(i - unchanged.width) * 4];
    bottom = pixels[(i + unchanged.width) * 4];
    horizon = (right - left) / 2;
    vertical = (bottom - top) / 2;
    edge = 255 - Math.sqrt(horizon * horizon + vertical * vertical);
    tmp[i * 4] = edge;
    tmp[i * 4 + 1] = edge;
    tmp[i * 4 + 2] = edge;
  }
  points.edges = [];
  _results = [];
  for (i = 1, _ref3 = unchanged.height * unchanged.width; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
    e = tmp[i * 4];
    if (e < points.threshold) {
      e = 0;
      x = i % unchanged.width;
      y = (i - x) / unchanged.width;
      _results.push(points.edges.push({
        x: x,
        y: y
      }));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

display_points = function() {
  points.viz.attr("height", unchanged.height).attr("width", unchanged.width);
  points.circs = points.g.selectAll("circle").data(points.edges);
  points.circs.enter().append("circle");
  points.circs.attr("r", 1).attr("fill", "black").attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
  return points.circs.exit().remove();
};

process_new_image = function() {
  convert_to_bw();
  display_bw();
  find_points();
  return display_points();
};

load_new_image = function(source) {
  var $org, done, f, go, gone;
  $org = $("img#original").attr("src", source);
  unchanged.image = new Image();
  unchanged.image.src = source;
  done = function() {
    var counter;
    counter = 0;
    return function() {
      counter++;
      return counter === 2;
    };
  };
  go = function() {
    var $canvas;
    unchanged.height = $org.height();
    unchanged.width = $org.width();
    $canvas = $("canvas#original").attr({
      "width": unchanged.width,
      "height": unchanged.height
    });
    unchanged.canvas = $canvas[0];
    unchanged.context = unchanged.canvas.getContext("2d");
    unchanged.context.drawImage(unchanged.image, 0, 0, unchanged.width, unchanged.height);
    return process_new_image();
  };
  gone = false;
  f = function() {
    if (done() && !gone) return go() && (gone = true);
  };
  $org.load(f);
  return $(unchanged.image).load(f);
};

fish_points = function(e) {
  var currentElement, m, totalOffsetX, totalOffsetY, x, y;
  x = e.offsetX;
  y = e.offsetY;
  m = $("#points > svg").offset();
  if (!(x != null)) {
    totalOffsetX = 0;
    totalOffsetY = 0;
    currentElement = this;
    while (true) {
      totalOffsetX += currentElement.offsetLeft;
      totalOffsetY += currentElement.offsetTop;
      if ((currentElement = currentElement.offsetParent)) break;
    }
    x = e.pageX - totalOffsetX;
    y = e.pageY - totalOffsetY;
  }
  points.fisheye.center([x, y]);
  return points.circs.each(function(d) {
    var move, point;
    move = points.fisheye(d);
    $(this).tooltip({
      title: "[" + d.x + "," + d.y + "]",
      placement: "top"
    });
    point = d3.select(this);
    if (move.x === d.x && move.y === d.y) {
      return point.attr("r", 1).attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    } else {
      return point.attr("transform", function(d) {
        return "translate(" + move.x + "," + move.y + ")";
      }).attr("r", 3);
    }
  });
};

setup = function() {
  var file_input, handleFileUpload, i, _i, _len, _ref;
  $(".nav-tabs a:last").tab('show');
  handleFileUpload = function(e) {
    var file, reader;
    file = e.target.files[0];
    if (!file.type.match('image.*')) return;
    reader = new FileReader();
    reader.onload = function(e) {
      return load_new_image(e.target.result);
    };
    return reader.readAsDataURL(file);
  };
  file_input = $("#file").on('change', handleFileUpload);
  load_new_image("./img/leaf.jpg");
  points.viz = d3.select("div#points").append("svg");
  points.g = points.viz.append("g");
  _ref = ["mousemove", "mousein", "mouseout"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    $("#points").on(i, fish_points);
  }
  return $("#threshold-slider").slider({
    max: 255,
    min: 0,
    step: 1,
    value: points.threshold,
    slide: function(event, ui) {
      points.threshold = ui.value;
      find_points();
      return display_points();
    }
  });
};

setup();
