(function ($) {
  /* create an svg drawing */
  var draw = SVG('drawing')

  /* draw rectangle */
  var rect = draw.rect(50,50).move(100,100).fill('#f09')

  /* make rectangle jump and change color on mouse over */
  rect.mouseover(function() {
      this.animate(1000, SVG.easing.elastic)
          .move(400 * Math.random(), 400 * Math.random())
          .rotate(-45 + 90 * Math.random())
          .fill({
              r: ~~(Math.random() * 255)
            , g: ~~(Math.random() * 255)
            , b: ~~(Math.random() * 255)
          })
  })

  /* write text at the back */
  draw.text('svg.js playground\ntry to grab the rectangle!')
      .back()
      .fill('#ccc')
      .move('50%', '40%')
      .font({
          family: 'Source Sans Pro'
        , size: 18
        , anchor: 'middle'
      })
    /* create clock */
    var clock = draw.clock('15%').back().start().move('80%', '80%')
    var group = draw.group()
    group.add(rect)

  /* set admin variables based on admin form */
  var $adminForm = $('#admin-form'),
    thickness = $adminForm.find('#material-thickness').val().replace(/\D/g,''),
    overlapJointClearance = $adminForm.find('#overlap-clearance').val().replace(/\D/g,''),
    kerfClearance = $adminForm.find('#kerf-clearance').val().replace(/\D/g,''),
    gridUnits = $adminForm.find('#grid-units').val().replace(/\D/g,''),
    maxHeight = $adminForm.find('#max-height').val().replace(/\D/g,''),
    maxWidth = $adminForm.find('#max-width').val().replace(/\D/g,''),
    maxDepth = $adminForm.find('#max-depth').val().replace(/\D/g,''),
    minHeight = $adminForm.find('#min-height').val().replace(/\D/g,''),
    minWidth = $adminForm.find('#min-width').val().replace(/\D/g,''),
    minDepth = $adminForm.find('#min-depth').val().replace(/\D/g,''),
    minSegmentLength = $adminForm.find('#min-segment-length').val().replace(/\D/g,'');

  /* set user variables based on user form */
  var $userForm = $('#user-form'),
    drawerHeight = $userForm.find('#drawer-height').val().replace(/\D/g,''),
    drawerWidth = $userForm.find('#drawer-width').val().replace(/\D/g,''),
    drawerDepth = $userForm.find('#drawer-depth').val().replace(/\D/g,'');
  /* canvas variables */
  var canvasHeight = drawerDepth+'0px',
    canvasWidth = drawerWidth+'0px';

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

  /* admin-form submit actions */
  $(document).on('submit', '#admin-form', function(event) {
    event.preventDefault();
    /* Reset admin form variables, $adminForm defined above */
    var thickness = $adminForm.find('#material-thickness').val().replace(/\D/g,''),
      overlapJointClearance = $adminForm.find('#overlap-clearance').val().replace(/\D/g,''),
      kerfClearance = $adminForm.find('#kerf-clearance').val().replace(/\D/g,''),
      gridUnits = $adminForm.find('#grid-units').val().replace(/\D/g,''),
      maxHeight = $adminForm.find('#max-height').val().replace(/\D/g,''),
      maxWidth = $adminForm.find('#max-width').val().replace(/\D/g,''),
      maxDepth = $adminForm.find('#max-depth').val().replace(/\D/g,''),
      minHeight = $adminForm.find('#min-height').val().replace(/\D/g,''),
      minWidth = $adminForm.find('#min-width').val().replace(/\D/g,''),
      minDepth = $adminForm.find('#min-depth').val().replace(/\D/g,''),
      minSegmentLength = $adminForm.find('#min-segment-length').val().replace(/\D/g,'');

    //add event changes here.

  });

  /* user-form change actions */
  $(document).on('change', '#user-form input', function(event) {
    event.preventDefault();
    /* Reset user form variables, $userForm defined above */
    var $userForm = $('#user-form'),
      drawerHeight = $userForm.find('#drawer-height').val().replace(/\D/g,''),
      drawerWidth = $userForm.find('#drawer-width').val().replace(/\D/g,''),
      drawerDepth = $userForm.find('#drawer-depth').val().replace(/\D/g,'');
    /* canvas variables */
    var canvasHeight = drawerDepth+'0px',
      canvasWidth = drawerWidth+'0px';
    /* on input change, reset canvas css */
    $('#drawing').css({
      width: canvasWidth,
      height: canvasHeight
    });
  });

  /* Draw Vertical line */
  $(document).on('click', '#vertical-line', function(event) {
    event.preventDefault();
    var divWidth = $('#drawing').width();
    var halfWidth = divWidth/2;
    var divHeight = $('#drawing').height();
    var line = draw.line(halfWidth, 0, halfWidth, divHeight).stroke({ width: 1 })
    var group = draw.group()
    group.add(line) //-> returns group
  });

}(jQuery));
