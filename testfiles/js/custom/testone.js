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
    minSegmentLength = $adminForm.find('#min-segment-length').val();

  /* set user variables based on user form */
  var $userForm = $('#user-form'),
    drawerHeight = $userForm.find('#drawer-height').val(),
    drawerWidth = $userForm.find('#drawer-width').val(),
    drawerDepth = $userForm.find('#drawer-depth').val();
  /* canvas variables */
  var canvasHeight100 = drawerDepth*100,
      canvasWidth100 = drawerWidth*100,
      canvasWidth = canvasWidth100+"px",
      canvasHeight = canvasHeight100+"px"

  $('#drawing').css({
    width: canvasWidth,
    height: canvasHeight,
    background: '#eee',
    border: 'solid #aaa 1px'
  });

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

  var svgElement = document.getElementById("drawing");
  var s = Snap(svgElement);

  $('#clear-btn').click(function(event) {
    event.preventDefault();
    s.clear();
  });

  var drawerWidth100 = drawerWidth*100;
  var drawerDepth100= drawerDepth*100;

  //function that outputs Template
  function getTemplate(jsonFile) {
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
        console.log(x1+', '+y1+', '+x2+', '+y2);
        var p = s.path(
          "M "+x1+" "+y1+" L " +x2+ " "+y2
        ).attr({
          stroke: "#000",
          strokeWidth: 4,
          "fill-opacity": "0"
        });
        p.drag();
      });
    });
  }

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
    getTemplate(thisId);

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
      canvasHeight = canvasHeight100+"px"
    /* on input change, reset canvas css */
    $('#drawing').css({
      width: canvasWidth,
      height: canvasHeight
    });

    //clear canvas
    s.clear();

    $('.template-image-link').each(function() {
      if ($(this).hasClass('selected')) {
        var thisId = $(this).attr('id');
        //get json and draw
        getTemplate(thisId);
      };
    });

  });

  //create vertical line
  $('#horizontal-line').click(function(event) {
    var currentDrawerWidth = $userForm.find('#drawer-width').val(),
      currentDrawerDepth = $userForm.find('#drawer-depth').val(),
      currentDrawerWidth100 = currentDrawerWidth*100,
      currentDrawerDepth100= currentDrawerDepth*100;
    var halfDrawerWidth = currentDrawerWidth100/2;
    var halfDrawerDepth = currentDrawerDepth100/2;
    var quarterDrawerDepth = currentDrawerDepth100/4;
    var circleRadius = 10;
    var p = s.path("M " + currentDrawerWidth100*0.25 + " "+ halfDrawerDepth + " " + currentDrawerWidth100*0.75+" "+halfDrawerDepth);
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    p.drag();
  });

  $('#vertical-line').click(function(event) {
    var currentDrawerWidth = drawerWidth + "0";
    var halfDrawerWidth = currentDrawerWidth/2;
    var currentDrawerDepth = drawerDepth+'0';
    var halfDrawerDepth = currentDrawerDepth/2;
    var quarterDrawerDepth = currentDrawerDepth/4;
    var circleRadius = 10;
    var p = s.path("M"+halfDrawerDepth + " " + halfDrawerDepth + " " + quarterDrawerDepth+" "+halfDrawerDepth).transform('t20,20r90');
    p.attr({
        stroke: "#000",
        strokeWidth: 4
    });
    p.drag();
  });


}(jQuery));
