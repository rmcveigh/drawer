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
    drawerDepth = $userForm.find('#drawer-depth').val(),
    drawerWidth100 = drawerWidth*100,
    drawerDepth100= drawerDepth*100;

  /* canvas variables */
  var canvasHeight100 = drawerDepth*100,
      canvasWidth100 = drawerWidth*100,
      canvasWidthPx = canvasWidth100+"px",
      canvasHeightPx = canvasHeight100+"px";

  /*ui variables */
  var handleSize = 7;

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

  //create background image

  var svgBckElement = document.getElementById("background-drawing");

  //style canvas
  s.attr({ viewBox: "0 0 "+canvasWidth100 +" "+ canvasHeight100});

  //style div
  $('#background-drawing').css({
    width: canvasWidthPx,
    height: canvasHeightPx
  });

  //style div
  $('#drawing').css({
    width: canvasWidthPx,
    height: canvasHeightPx,
    background: '#eee',
    border: 'solid #aaa 1px'
  });

  //draw grid (function below)
  bckGrid();

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

  (function() {
    Snap.plugin(function( Snap, Element, Paper, global ) {
      Element.prototype.addHandles = function( params ) {
        //primary vars
        var line=this,
          bb=line.getBBox(),
          px2 = line.attr("x2"),
          py2 = line.attr("y2"),
          px1 = line.attr("x1"),
          py1 = line.attr("y1"),
          pcx = bb.cx,
          pcy = bb.cy;

        //current drawer vars
        var currentDrawerWidth = $userForm.find('#drawer-width').val(),
          currentDrawerDepth = $userForm.find('#drawer-depth').val(),
          currentDrawerWidth100 = currentDrawerWidth*100,
          currentDrawerDepth100= currentDrawerDepth*100;

        //check if the it is an outer line
        if (
            (px1==0 && px2==currentDrawerWidth100 && py1==0 && py2==0)
            ||(px1==0 && px2==0 && py1==currentDrawerDepth100 && py2==0)
            ||(px1==currentDrawerWidth100 && px2==currentDrawerWidth100 && py1==0 && py2==currentDrawerDepth100)
            ||(px1==currentDrawerWidth100 && px2==0 && py1==currentDrawerDepth100 && py2==currentDrawerDepth100)
          ) {
        }else{
          //if it isn't an outer line:

          //create handles
          var resizeCircle = s.circle(bb.x2,bb.y2,handleSize).attr({fill:"red"});
          var moveCircle = s.circle(bb.cx,bb.cy,handleSize).attr({fill:"red"});

          if (px2 == px1) {
            //if line is vertical

            //resize on move action
            var resizeMove = function(dx,dy) {
              var bb = line.getBBox(),
                  rcy = +py2+dy,
                  ly2 = +py2+dy,
                  mcy = +bb.cy,
                  gridUnits = $adminForm.find('#grid-units').val(),
                  roundTo = gridUnits*10,
                  roundRcy = roundMultiple(rcy, roundTo),
                  roundLy2 = roundMultiple(ly2, roundTo),
                  roundMcy = roundMultiple(mcy, roundTo);
              if (rcy >= currentDrawerDepth100){
                this.attr({cy: currentDrawerDepth100});
                line.attr({y2: currentDrawerDepth100});
                moveCircle.attr({cy: roundMcy});
              } else if (rcy <= 0){
                this.attr({cy: 0});
                line.attr({y2: 0});
                moveCircle.attr({cy: roundMcy});
              } else {
                this.attr({cy: roundRcy});
                line.attr({y2: roundLy2});
                moveCircle.attr({cy: roundMcy});
              }
            }

            //resize on start action
            var resizeStart = function() {
              var bb=line.getBBox();
              py1 = line.attr("y1");
              py2 = line.attr("y2");
              pcy = bb.cy;
            }

            //resize on stop action
            var resizeStop = function() {
            }

            //start resize drag action
            resizeCircle.drag(resizeMove, resizeStart, resizeStop);

          } else {

            //line is horizontal!!!

            //resize on move action
            var resizeMove = function(dx,dy) {
              var bb = line.getBBox(),
                  rcx = +px2+dx,
                  lx2 = +px2+dx,
                  mcx = +bb.cx,
                  gridUnits = $adminForm.find('#grid-units').val(),
                  roundTo = gridUnits*10,
                  roundRcx = roundMultiple(rcx, roundTo),
                  roundLx2 = roundMultiple(lx2, roundTo),
                  roundMcx = roundMultiple(mcx, roundTo);
              if (rcx >= currentDrawerWidth100){
                this.attr({cx: currentDrawerWidth100});
                line.attr({x2: currentDrawerWidth100});
                moveCircle.attr({cx: roundMcx});
              } else if (rcx <= 0){
                this.attr({cx: 0});
                line.attr({x2: 0});
                moveCircle.attr({cx: roundMcx});
              } else {
                this.attr({cx: roundRcx});
                line.attr({x2: roundLx2});
                moveCircle.attr({cx: roundMcx});
              }
            }

            //resize on start action
            var resizeStart = function() {
              var bb=line.getBBox();
              px1 = line.attr("x1");
              px2 = line.attr("x2");
              pcx = bb.cx;
            }

            //resize on stop action
            var resizeStop = function() {
            }

            //start resize drag action
            resizeCircle.drag(resizeMove, resizeStart, resizeStop);

          }//end vertical check else statement

          //move on move action
          var moveMove = function(dx,dy) {
            var bb=line.getBBox();
                lx1 = +px1+dx,
                ly1 = +py1+dy,
                lx2 = +px2+dx,
                ly2 = +py2+dy,
                mcx = +pcx+dx,
                mcy = +pcy+dy,
                rcx = +px2+dx,
                rcy = +py2+dy,
                gridUnits = $adminForm.find('#grid-units').val(),
                roundTo = gridUnits*10,
                roundLx1 = roundMultiple(lx1, roundTo),
                roundLy1 = roundMultiple(ly1, roundTo),
                roundLx2 = roundMultiple(lx2, roundTo),
                roundLy2 = roundMultiple(ly2, roundTo),
                roundMcx = roundMultiple(mcx, roundTo),
                roundMcy = roundMultiple(mcy, roundTo),
                roundRcx = roundMultiple(rcx, roundTo),
                roundRcy = roundMultiple(rcy, roundTo);
            if (lx1 <= 0) {
              var lx1Sum = 0-lx1;
              line.attr({x1:lx1+lx1Sum, y1:roundLy1, x2:lx2+lx1Sum, y2:roundLy2});
              this.attr({cx:mcx+lx1Sum, cy:roundMcy});
              resizeCircle.attr({cx:rcx+lx1Sum, cy:roundRcy});
            }else if (lx2 > currentDrawerWidth100) {
              var lx2Sum = lx2-currentDrawerWidth100;
              line.attr({x1:lx1-lx2Sum, y1:roundLy1, x2:lx2-lx2Sum, y2:roundLy2});
              this.attr({cx:mcx-lx2Sum, cy:roundMcy});
              resizeCircle.attr({cx:rcx-lx2Sum, cy:roundRcy});
            }else if (ly1 < 0) {
              var ly1Sum = 0-ly1;
              line.attr({x1:roundLx1, y1:ly1+ly1Sum, x2:roundLx2, y2:ly2+ly1Sum});
              this.attr({cx:roundMcx, cy:mcy+ly1Sum});
              resizeCircle.attr({cx:roundRcx, cy:rcy+ly1Sum});
            }else if (ly2 > currentDrawerDepth100) {
              var ly2Sum = ly2-currentDrawerDepth100;
              line.attr({x1:roundLx1, y1:ly1-ly2Sum, x2:roundLx2, y2:ly2-ly2Sum});
              this.attr({cx:roundMcx, cy:mcy-ly2Sum});
              resizeCircle.attr({cx:roundRcx, cy:rcy-ly2Sum});
            }else if (lx2 < 0) {
              var lx2Sum = 0-lx2;
              line.attr({x1:lx1+lx2Sum, y1:roundLy1, x2:lx2+lx2Sum, y2:roundLy2});
              this.attr({cx:mcx+lx2Sum, cy:roundMcy});
              resizeCircle.attr({cx:rcx+lx2Sum, cy:roundRcy});
            }else if (lx1 > currentDrawerWidth100) {
              var lx1Sum = lx1-currentDrawerWidth100;
              line.attr({x1:lx1-lx1Sum, y1:roundLy1, x2:lx2-lx1Sum, y2:roundLy2});
              this.attr({cx:mcx-lx1Sum, cy:roundMcy});
              resizeCircle.attr({cx:rcx-lx1Sum, cy:roundRcy});
            }else if (ly2 < 0) {
              var ly2Sum = 0-ly2;
              line.attr({x1:roundLx1, y1:ly1+ly2Sum, x2:roundLx2, y2:ly2+ly2Sum});
              this.attr({cx:roundMcx, cy:mcy+ly2Sum});
              resizeCircle.attr({cx:roundRcx, cy:rcy+ly2Sum});
            }else if (ly1 > currentDrawerDepth100) {
              var ly1Sum = ly1-currentDrawerDepth100;
              line.attr({x1:roundLx1, y1:ly1-ly1Sum, x2:roundLx2, y2:ly2-ly2Sum});
              this.attr({cx:roundMcx, cy:mcy-ly1Sum});
              resizeCircle.attr({cx:roundRcx, cy:rcy-ly1Sum});
            }else{
              line.attr({x1:roundLx1, y1:roundLy1, x2:roundLx2, y2:roundLy2});
              this.attr({cx:roundMcx, cy:roundMcy});
              resizeCircle.attr({cx:roundRcx, cy:roundRcy});
            }
          }

          //move on start action
          var moveStart = function() {
            var bb=line.getBBox();
            px1 = line.attr("x1");
            px2 = line.attr("x2");
            py1 = line.attr("y1");
            py2 = line.attr("y2");
            pcx = bb.cx;
            pcy = bb.cy;
          }

          //move on stop action
          var moveStop = function() {
          }

          //start move drag action
          moveCircle.drag(moveMove, moveStart, moveStop);

        }//end outer line else

      };//end addHandles Function
    });
  })();


  // opens dialog then clears the canvas
  $('#clear-btn').click(function(event) {
    event.preventDefault();
    $( "#clear-canvas-dialog" ).dialog( "open" );
  });

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
        var p = s.line(
          x1, y1, x2, y2
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
            p.addHandles();
          // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }else{
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x1,
            maxyDragPoint = currentDrawerDepth100-y2;
            p.addHandles();
          // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
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
        var p = s.line(
          x1, y1, x2, y2
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
            p.addHandles();
          // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
        }else{
          var minxDragPoint = 0-x1,
            minyDragPoint = 0-y1,
            maxxDragPoint = currentDrawerWidth100-x1,
            maxyDragPoint = currentDrawerDepth100-y2;
            p.addHandles();
          // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
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
        var p = s.line(
          x1, y1, x2, y2
        ).attr({
          stroke: "#000",
          strokeWidth: 4,
          "fill-opacity": "0"
        });
      });
    });
  }

  // create Background Grid
  function bckGrid(){
    //current drawer vars
    var currentDrawerWidth = $userForm.find('#drawer-width').val(),
      currentDrawerDepth = $userForm.find('#drawer-depth').val(),
      currentDrawerWidth100 = currentDrawerWidth*100,
      currentDrawerDepth100= currentDrawerDepth*100,
      gridUnits = $adminForm.find('#grid-units').val(),
      currentRoundTo = gridUnits*10;

    var v = currentRoundTo;
    var h = currentRoundTo;
    while (v < currentDrawerWidth100) {
      var x1 =v,
          x2 = v,
          y1 = 0,
          y2 = currentDrawerDepth100;
      var bckP = s.path(
        "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: '#ccc',
          strokeWidth: 1,
          strokeDasharray: "10 5",
          strokeDashoffset: 50,
          class: 'vert-bck-path'
        });
      v=v+currentRoundTo;
    }
    while (h < currentDrawerDepth100) {
      var x1 =0,
          x2 = currentDrawerWidth100,
          y1 = h,
          y2 = h;
      var bckP = s.path(
        "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: '#ccc',
          strokeWidth: 1,
          strokeDasharray: "10 5",
          strokeDashoffset: 50,
          class: 'horiz-bck-path'
        });
      h=h+currentRoundTo;
    }
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

    //draw background grid
    bckGrid();

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

    //draw background grid
    bckGrid();

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


  //admin form submit action
  $('#admin-form').submit(function(event) {
    event.preventDefault();
    $('#drawing path').remove();
    //draw background grid
    bckGrid();

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
    var p = s.line(currentDrawerWidth100*0.25, halfDrawerDepth, currentDrawerWidth100*0.75, halfDrawerDepth);
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
    p.addHandles();
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
    var p = s.line(halfDrawerWidth, quarterDrawerDepth, halfDrawerWidth, threequarterDrawerDepth);
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    p.addHandles();
    // p.limitDrag({ x: 0, y: 0, minx: minxDragPoint, miny: minyDragPoint, maxx: maxxDragPoint, maxy: maxyDragPoint});
  });


  //export json in needed format. Exports in Pixels!!!
  $('#save-page').click(function(event) {
    event.preventDefault();
    var a= [],
      points="",
      paths = "";
    $('svg line').each(function(index, el) {
      var x1 = $(this).attr('x1'),
        y1 = $(this).attr('y1'),
        x2 = $(this).attr('x2'),
        y2 = $(this).attr('y2');
      points+='{"x1": '+x1+', "y1": '+y1+', "x2": '+x2+', "y2": '+y2+'}';
    });
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

          //draw background grid
          bckGrid();

          var thisId = $('.template-image-link.selected').attr('id');
          //get json and draw
          getFlexableTemplate(thisId);

          $( this ).dialog( "close" );
        },
        "Place above": function() {
          //clear canvas
          s.clear();

          //draw background grid
          bckGrid();

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

          //draw background grid
          bckGrid();

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
