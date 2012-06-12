#TODOs:
# Add in a json outputter
# Make it easier to take out items
# Fisheye for moving apart nodes
# Expand on hover
# Better pixel finder

# Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = (from, to) ->
  rest = @slice((to or from) + 1 or @length)
  @length = if from < 0 then @length + from else from
  @push.apply(this, rest);


unchanged = {}
bw = {}
points = {
  fisheye : d3.fisheye().radius(50).power(2)
  threshold: 195
  edges: []
  }

convert_to_bw = ()->
  bw.imageData = unchanged.context.getImageData(0,0,unchanged.width,unchanged.height)
  pixels = bw.imageData.data
  for i in [0..(unchanged.height*unchanged.width)]
    r = pixels[i*4]
    g = pixels[i*4+1]
    b = pixels[i*4+2]

    #http://en.wikipedia.org/wiki/Grayscale
    grey = Math.round(0.3*r+0.59*g+0.11*b)

    pixels[i*4] = grey
    pixels[i*4+1] = grey
    pixels[i*4+2] = grey


display_bw = ()->
  bw.canvas = document.getElementById("blackwhite_c")
  bw.context = bw.canvas.getContext("2d")
  bw.canvas.setAttribute('height',bw.imageData.height)
  bw.canvas.setAttribute('width',bw.imageData.width)
  bw.context.putImageData(bw.imageData,0,0)

find_points = ()->
  console.log(points.threshold,points.edges.length)
  points.imageData = bw.imageData
  pixels = points.imageData.data

  tmp = []

  for i in [(unchanged.width*1)..(unchanged.height*(unchanged.width-1))]
    left = pixels[(i-1)*4]
    right = pixels[(i+1)*4]
    top = pixels[(i-unchanged.width)*4]
    bottom = pixels[(i+unchanged.width)*4]

    horizon = (right-left)/2
    vertical = (bottom-top)/2

    #http://en.wikipedia.org/wiki/Edge_detection
    #Implement canny edge detection for better edges.
    edge = 255-Math.sqrt(horizon*horizon+vertical*vertical)

    tmp[i*4] = edge
    tmp[i*4+1] = edge
    tmp[i*4+2] = edge


  points.edges = []

  for i in [1..(unchanged.height*unchanged.width)]
      e = tmp[i*4]
      if e < points.threshold
        e = 0
        x = i%unchanged.width
        y = (i-x)/unchanged.width
        points.edges.push(x: x, y: y)

display_points = ()->
  points.viz
    .attr("height",unchanged.height)
    .attr("width",unchanged.width)

  points.circs = points.g.selectAll("circle").data(points.edges)

  points.circs.enter().append("circle")

  points.circs
    .attr("r",1)
    .attr("fill","black")
    .attr("transform",(d)-> "translate(#{d.x},#{d.y})")

  points.circs.exit().remove()

process_new_image = ()->
  convert_to_bw()
  display_bw()
  find_points()
  display_points()

load_new_image = (source)->
  $org = $("img#original").attr("src",source)

  unchanged.image = new Image()
  unchanged.image.src = source

  done = ()->
    counter = 0
    ()->
      counter++
      counter is 2

  go = ()->
    unchanged.height = $org.height()
    unchanged.width = $org.width()
    $canvas = $("canvas#original")
      .attr({"width": unchanged.width, "height": unchanged.height})
    unchanged.canvas = $canvas[0]
    unchanged.context = unchanged.canvas.getContext("2d")
    unchanged.context.drawImage(unchanged.image,0,0,unchanged.width,unchanged.height)
    process_new_image()

  gone = false

  f = ()-> if done() and not gone then go() and gone = true

  $org.load f
  $(unchanged.image).load f

fish_points = (e)->
  x = e.offsetX
  y = e.offsetY
  m = $("#points > svg").offset()
  if !x?
    totalOffsetX = 0
    totalOffsetY = 0
    currentElement = this
    while true
      totalOffsetX += currentElement.offsetLeft
      totalOffsetY += currentElement.offsetTop
      break if (currentElement = currentElement.offsetParent)

    x = e.pageX - totalOffsetX
    y = e.pageY - totalOffsetY

  points.fisheye.center([x,y])
  points.circs
   .each((d)->
      move = points.fisheye(d)
      point = d3.select(this)
      if move.x is d.x and move.y is d.y
          point
          .attr("r",1)
          .attr("transform",(d)-> "translate(#{d.x},#{d.y})")
      else
        point
          .attr("transform",(d)-> "translate(#{move.x},#{move.y})")
          .attr("r",3)
  )

setup = ()->
  $(".nav-tabs a:last").tab('show')

  handleFileUpload = (e)->
    file = e.target.files[0]
    if !file.type.match('image.*') then return

    reader = new FileReader()

    reader.onload = (e)->
      load_new_image(e.target.result)

    reader.readAsDataURL(file)

  file_input = $("#file").on('change',handleFileUpload)

  load_new_image("./img/leaf.jpg")

  points.viz = d3.select("div#points").append("svg")
  points.g = points.viz.append("g")


  $("#points").on(i,fish_points) for i in ["mousemove","mousein","mouseout"]

  $("#threshold-slider").slider(
    max: 255
    min: 0
    step: 1
    value: points.threshold
    slide: (event,ui)->
      points.threshold = ui.value
      find_points()
      display_points()
  )

setup()
