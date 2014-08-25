(function ($) {

  /* set admin variables based on admin form */
  var $adminForm = $('#admin-form'),
    thickness = $adminForm.find('#material-thickness').val(),
    overlapJointClearance = $adminForm.find('#overlap-clearance').val(),
    kerfClearance = $adminForm.find('#kerf-clearance').val(),
    gridUnits = $adminForm.find('#grid-units').val(),
    maxHeight = $adminForm.find('#max-height').val(),
    maxWidth = $adminForm.find('#max-width').val(),
    maxDepth = $adminForm.find('#max-depth').val(),
    minHeight = $adminForm.find('#min-height').val(),
    minWidth = $adminForm.find('#min-width').val(),
    minDepth = $adminForm.find('#min-depth').val(),
    minSegmentLength = $adminForm.find('#min-segment-length').val(),
    roundTo = gridUnits*10;

  /* set user variables based on user form */
  var $userForm = $('#user-form'),
    drawerHeight = $userForm.find('#drawer-height').val(),
    drawerWidth = $userForm.find('#drawer-width').val(),
    drawerDepth = $userForm.find('#drawer-depth').val();
  /* canvas variables */
  var canvasHeight100 = drawerDepth*100,
      canvasWidth100 = drawerWidth*100,
      canvasWidthPx = canvasWidth100+"px",
      canvasHeightPx = canvasHeight100+"px";

  //nearest multiple function used to acheive snap to grid functionality
  function roundMultiple(num, multiple) {
    return(Math.round(num / multiple) * multiple);
  }

  //show admin form
  $(document).on('click', '#admin-form-link', function(event) {
    event.preventDefault();
    $('#admin-form').slideToggle();
    var $thisLink = $(this);
    if ($thisLink.hasClass('closed')) {
      $thisLink.attr('class', 'opened')
        .text('Hide Form');
    }else if ($thisLink.hasClass('opened')) {
      $thisLink.attr('class', 'closed')
        .text('Show Form');
    }
  });

  //create canvas

  var svgElement = document.getElementById("drawing");
  var s = Snap(svgElement);

  //style canvas
  s.attr({ viewBox: "0 0 "+canvasWidth100 +" "+ canvasHeight100});

  //style div
  $('#drawing').css({
      width: canvasWidthPx,
      height: canvasHeightPx,
      background: '#eee',
      border: 'solid #aaa 1px'
    });

  //draw outer wall (function below)
  buildOuterwall("outerWall");

  //drag plugin
  (function() {

    Snap.plugin( function( Snap, Element, Paper, global ) {

      Element.prototype.limitDrag = function( params ) {
        this.data('minx', params.minx ); this.data('miny', params.miny );
        this.data('maxx', params.maxx ); this.data('maxy', params.maxy );
        this.data('x', params.x );    this.data('y', params.y );
        this.data('ibb', this.getBBox() );
        this.data('ot', this.transform().local );
        this.drag( limitMoveDrag, limitStartDrag );
        return this;
      };

      function limitMoveDrag( dx, dy ) {
        var tdx, tdy;
        var sInvMatrix = this.transform().globalMatrix.invert();
            sInvMatrix.e = sInvMatrix.f = 0;
        var tdx = sInvMatrix.x( dx,dy ); tdy = sInvMatrix.y( dx,dy ),
            gridUnits = $adminForm.find('#grid-units').val(),
            roundTo = gridUnits*10,
            currentX = +this.data('ox') + tdx,
            currentY = +this.data('oy') + tdy,
            currentXrounded = roundMultiple(currentX, roundTo),
            currentYrounded = roundMultiple(currentY, roundTo);

        this.data('x', currentXrounded);
        this.data('y', currentYrounded);
        if( this.data('x') > this.data('maxx') - this.data('ibb').width  )
          { this.data('x', this.data('maxx') - this.data('ibb').width  ) };
        if( this.data('y') > this.data('maxy') - this.data('ibb').height )
          { this.data('y', this.data('maxy') - this.data('ibb').height ) };
        if( this.data('x') < this.data('minx') ) { this.data('x', this.data('minx') ) };
        if( this.data('y') < this.data('miny') ) { this.data('y', this.data('miny') ) };
        this.transform( this.data('ot') + "t" + [ this.data('x'), this.data('y') ]  );
      };

      function limitStartDrag( x, y, ev ) {
        this.data('ox', this.data('x')); this.data('oy', this.data('y'));
      };
    });
  })();

  Snap.plugin( function( Snap, Element, Paper, global ) {

    Element.prototype.addHandles = function() {
    var dragging = 0;
    var handleGroup;

    var startResize = function() {
            this.data('origTransform', this.transform().local);
    }

    var moveResize = function(dx,dy) {
            var scale = 1 + dx / 50;
            this.attr({
                    transform: this.data('origTransform') + (this.data('origTransform') ? "S" : "s") + scale
            });
    }

    var stopResize = function() {};

    var bb = this.getBBox();

    var x= bb.x,
      y=bb.y,
      x2 = bb.x2,
      y2=bb.y2,
      centerX=bb.cx,
      centerY=bb.cy,
      handle = new Array();

    var currentDrawerWidth = $userForm.find('#drawer-width').val(),
      currentDrawerDepth = $userForm.find('#drawer-depth').val(),
      currentDrawerWidth100 = currentDrawerWidth*100,
      currentDrawerDepth100= currentDrawerDepth*100;

    var halfDrawerWidth = currentDrawerWidth100/2;

    var halfDrawerDepth = currentDrawerDepth100/2;

    var quarterDrawerDepth = currentDrawerDepth100/4;

    var minxDragPoint = 0-(currentDrawerWidth100*0.25),
      minyDragPoint = 0-halfDrawerDepth,
      maxxDragPoint = currentDrawerWidth100-(currentDrawerWidth100*0.25),
      maxyDragPoint = currentDrawerDepth100-halfDrawerDepth;

    var ftOption = {
      handleFill: "silver",
      handleStrokeDash: "5,5",
      handleStrokeWidth: "2",
      handleLength: "75",
      handleRadius: "7",
      handleLineWidth: 2,
    };

    handle[0] = s.circle(x, y, ftOption.handleRadius).attr({class: 'handler', fill: ftOption.handleFill});
    handle[1] = s.circle(x2, y2, ftOption.handleRadius).attr({class: 'handler', fill: ftOption.handleFill});
    handle[2] = s.circle(centerX, centerY, ftOption.handleRadius).attr({class: 'handler', fill: ftOption.handleFill});
    handleGroup = s.group(handle[0], handle[1], handle[2]);
    // handleGroup.drag();
    // handleGroup.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
    };

  })

  // opens dialog then clears the canvas
  $('#clear-btn').click(function(event) {
    event.preventDefault();
    $( "#clear-canvas-dialog" ).dialog( "open" );
  });


  var drawerWidth100 = drawerWidth*100;
  var drawerDepth100= drawerDepth*100;

  //function that outputs Template (NON-FLEXIBLY) from orig json file.
  function getFixedTemplate(jsonFile){
    var jsonPath = "json/"+jsonFile+"Length.json",
    currentDrawerWidth = $userForm.find('#drawer-width').val(),
    currentDrawerDepth = $userForm.find('#drawer-depth').val(),
    currentDrawerWidth100 = currentDrawerWidth*100,
    currentDrawerDepth100= currentDrawerDepth*100;

    $.getJSON(jsonPath,function(result){
      $.each(result.paths, function(i, path){
        var x1 = path.x1,
          y1 = path.y1,
          x2 = path.x2,
          y2 = path.y2;
        var p = s.path(
          "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: "#000",
          strokeWidth: 4,
          "fill-opacity": "0"
        });
        if (x1==x2) {
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x2,
            maxyDragPoint = currentDrawerDepth100-y1;
          p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }else{
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x1,
            maxyDragPoint = currentDrawerDepth100-y2;
          p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }
      });
    });
  };

  //function that outputs Template FLEXIBLY from orig jSon File.
  function getFlexableTemplate(jsonFile) {
    var jsonPath = "json/"+jsonFile+".json",
    currentDrawerWidth = $userForm.find('#drawer-width').val(),
    currentDrawerDepth = $userForm.find('#drawer-depth').val(),
    currentDrawerWidth100 = currentDrawerWidth*100,
    currentDrawerDepth100= currentDrawerDepth*100;

    $.getJSON(jsonPath,function(result){
      $.each(result.paths, function(i, path){
        var x1 = (path.x1)*currentDrawerWidth100,
          y1 = (path.y1)*currentDrawerDepth100,
          x2 = (path.x2)*currentDrawerWidth100,
          y2 = (path.y2)*currentDrawerDepth100;
        var p = s.path(
          "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: "#000",
          strokeWidth: 4,
          "fill-opacity": "0"
        });
        if (x1==x2) {
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x2,
            maxyDragPoint = currentDrawerDepth100-y1;
          p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }else{
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x1,
            maxyDragPoint = currentDrawerDepth100-y2;
          p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }
      });
    });
  }

  //build outer wall (could change to hard code if json can't be pulled in)
  //function that outputs Template where VECTORS ARE NOT DRAGGABLE!
  function buildOuterwall(jsonFile) {
    var jsonPath = "json/"+jsonFile+".json",
    currentDrawerWidth = $userForm.find('#drawer-width').val(),
    currentDrawerDepth = $userForm.find('#drawer-depth').val(),
    currentDrawerWidth100 = currentDrawerWidth*100,
    currentDrawerDepth100= currentDrawerDepth*100;

    $.getJSON(jsonPath,function(result){
      $.each(result.paths, function(i, path){
        var x1 = (path.x1)*currentDrawerWidth100,
          y1 = (path.y1)*currentDrawerDepth100,
          x2 = (path.x2)*currentDrawerWidth100,
          y2 = (path.y2)*currentDrawerDepth100;
        var p = s.path(
          "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: "#000",
          strokeWidth: 4,
          "fill-opacity": "0"
        });
      });
    });
  }

  //template image link.
  //get json based on click.
  // $(document).on('click', '.template-image-link', function(event) {
  //   event.preventDefault();

  //   var thisId = $(this).attr('id'),
  //     $clickedLink = $(this);

  //   //add and remove selected class
  //   $('.template-image-link').each(function() {
  //     var $thisLink = $(this);
  //     if ($thisLink.hasClass('selected')) {
  //       $thisLink.removeClass('selected')
  //     };
  //   }).promise().done(function(){
  //     $clickedLink.addClass('selected');
  //   });

  //   //open dialog
  //   $( "#template-change-dialog" ).dialog( "open" );

  // });

  $(document).on('click', '.template-image-link', function(event) {
    event.preventDefault();

    var thisId = $(this).attr('id'),
      $clickedLink = $(this);

    //add and remove selected class
    $('.template-image-link').each(function() {
      var $thisLink = $(this);
      if ($thisLink.hasClass('selected')) {
        $thisLink.removeClass('selected')
      };
    }).promise().done(function(){
      $clickedLink.addClass('selected');
    });

    //clear canvas
    s.clear();

    //get json and draw
    getFlexableTemplate(thisId);

  });

    /* user-form change actions */
  $(document).on('submit', '#user-form', function(event) {
    event.preventDefault();
    /* Reset user form variables, $userForm defined above */
    var $userForm = $('#user-form'),
      drawerHeight = $userForm.find('#drawer-height').val(),
      drawerWidth = $userForm.find('#drawer-width').val(),
      drawerDepth = $userForm.find('#drawer-depth').val();
    /* canvas variables */
    var canvasHeight100 = drawerDepth*100,
      canvasWidth100 = drawerWidth*100,
      canvasWidth = canvasWidth100+"px",
      canvasHeight = canvasHeight100+"px";
    /* on input change, reset canvas css */
    $('#drawing').css({
      width: canvasWidth,
      height: canvasHeight
    });
    s.attr({ viewBox: "0 0 "+canvasWidth100 +" "+ canvasHeight100});
    //clear canvas
    s.clear();

    //draw outer wall
    buildOuterwall("outerWall");

    $('.template-image-link').each(function() {
      if ($(this).hasClass('selected')) {
        var thisId = $(this).attr('id');
        //get json and draw
        getFlexableTemplate(thisId);
      };
    });

  });

  //create horizontal line
  $('#horizontal-line').click(function(event) {
    var currentDrawerWidth = $userForm.find('#drawer-width').val(),
      currentDrawerDepth = $userForm.find('#drawer-depth').val(),
      currentDrawerWidth100 = currentDrawerWidth*100,
      currentDrawerDepth100= currentDrawerDepth*100;
    var halfDrawerWidth = currentDrawerWidth100/2;
    var halfDrawerDepth = currentDrawerDepth100/2;
    var quarterDrawerDepth = currentDrawerDepth100/4;
    var minxDragPoint = 0-(currentDrawerWidth100*0.25),
      minyDragPoint = 0-halfDrawerDepth,
      maxxDragPoint = currentDrawerWidth100-(currentDrawerWidth100*0.25),
      maxyDragPoint = currentDrawerDepth100-halfDrawerDepth;
    var circleRadius = 10;
    var p = s.path("M " + currentDrawerWidth100*0.25 + " "+ halfDrawerDepth + " " + currentDrawerWidth100*0.75+" "+halfDrawerDepth);
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
    // p.addHandles()
  });

  //create vertical line
  $('#vertical-line').click(function(event) {
    var currentDrawerWidth = $userForm.find('#drawer-width').val(),
      currentDrawerDepth = $userForm.find('#drawer-depth').val(),
      currentDrawerWidth100 = currentDrawerWidth*100,
      currentDrawerDepth100= currentDrawerDepth*100;
    var halfDrawerWidth = currentDrawerWidth100/2;
    var halfDrawerDepth = currentDrawerDepth100/2;
    var quarterDrawerDepth = currentDrawerDepth100*0.25;
    var threequarterDrawerDepth = currentDrawerDepth100*0.75;
    var minxDragPoint = 0-halfDrawerWidth,
      minyDragPoint = 0-quarterDrawerDepth,
      maxxDragPoint = halfDrawerWidth,
      maxyDragPoint = threequarterDrawerDepth;
    var circleRadius = 10;
    var p = s.path("M " + halfDrawerWidth + " "+ quarterDrawerDepth + " " + halfDrawerWidth+" "+threequarterDrawerDepth);
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
  });

  $('#save-page').click(function(event) {
    event.preventDefault();
    var a= [],
      points="",
      paths = "";
    $('svg path').each(function(index, el) {
      var $thisPath = $(this),
        array=[],
        thisDValue = $thisPath.attr('d'),
        splitString = thisDValue.replace('M ', '').replace('L ', '').split(' ');
      $.each(splitString, function(i, val) {
        var val = parseFloat(val);
         if (i == 0) {
          var x1 = '{"x1": '+ val+', ';
          points += x1;
         }else if (i == 1) {
          var y1 = '"y1": '+val+', ';
          points += y1;
         }else if (i == 2) {
          var x2 = '"x2": '+val+', ';
          points += x2;
         }else if (i == 3) {
          var y2 = '"y2": '+val+'}';
          points += y2;
         }
      });
      // a.push(array);
      // var json=JSON.stringify({paths: array});
      paths += points;
    });
    points.replace('}{', '}, {');
    var json='{ "paths": [ ' + points.replace(/\}{/g, '}, {') + " ] }";
    alert("Just saved this json: "+json);
  });

  //create template dialog
  $( "#template-change-dialog" ).dialog({
      resizable: false,
      autoOpen: false,
      height:420,
      width:520,
      modal: true,
      buttons: {
        "Fit into drawer": function() {
          //clear canvas
          s.clear();
          var thisId = $('.template-image-link.selected').attr('id');
          //get json and draw
          getFlexableTemplate(thisId);

          $( this ).dialog( "close" );
        },
        "Place above": function() {
          //clear canvas
          s.clear();
          var thisId = $('.template-image-link.selected').attr('id');
          //get json and draw
          getFixedTemplate(thisId);

          $( this ).dialog( "close" );
        }
      }
    });

  //create clear dialog
  $( "#clear-canvas-dialog" ).dialog({
      resizable: false,
      autoOpen: false,
      height:420,
      width:520,
      modal: true,
      buttons: {
        "Yes": function() {
          s.clear();
          //add and remove selected class
          $('.template-image-link').each(function() {
            var $thisLink = $(this);
            if ($thisLink.hasClass('selected')) {
              $thisLink.removeClass('selected')
            };
          });
          //draw outer wall
          buildOuterwall("outerWall");

          $( this ).dialog( "close" );
        },
        "Cancel": function() {
          $( this ).dialog( "close" );
        }
      }
    });

}(jQuery));
