// Utilities

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

// Map

var totalSpent = 0;
var deltas = $.extend({}, data.deltas);
var map;

var currentTooltipStateName;
var currentTooltipStateCode;

$(document).ready(function () {
  $('body').flowtype();

  $('#reset').click(function () {
    deltas = $.extend({}, data.deltas);
    totalSpent = 0;
    update();
  });

  initMap();
  update();
});

function initMap() {
  map = new jvm.Map({
    map: 'us_lcc',
    container: $("#map"),
    backgroundColor: 'white',
    series: {
      regions: [{
        values: deltas,
        scale: ['#FF0000', '#EE0000', '#EEEEEE', '#00EE00', '#00FF00'],
        min: -100,
        max: 100
      }]
    },
    zoomOnScroll: false,
    panOnDrag: false,
    onRegionTipShow: function(e, el, code) {
      currentTooltipStateName = el.html();
      currentTooltipStateCode = code;

      el.html(mapTooltip());
    },
    onRegionClick: function(e, code) {
      payForAdCampaign(code, 50000);
    }
  });
}

function update() {
  // Update map
  map.series.regions[0].setValues(deltas);
  
  // Update tooltip
  $('.jvectormap-tip').html(mapTooltip());

  // Update sidebar

  if (total_delegates_delta() > 0) {
    $('#totalDelegateDelta').html("<span class='winning'>Bernie +" + total_delegates_delta() + "</span>");
  } else {
    $('#totalDelegateDelta').html("<span class='losing'>Hillary +" + (-total_delegates_delta()) + "</span>");
  }

  $('#totalSpent').text("$" + totalSpent.formatMoney(0));
}

function mapTooltip() {
  if (currentTooltipStateCode) {
    var state = currentTooltipStateCode;

    var delta = (deltas[state]).toFixed(1);
    var delegatesWon = bernie_delegates_delta_by_state(state);

    var tooltip = "<div class='topRow'><span class='stateName'>" + currentTooltipStateName + "</span>";
    if (delta > 0) {
      tooltip += "<span class='delta winning'>Bernie +" + delta + "%</span></div>";
      tooltip += "<span class='delegates'>Bernie will get <span class='winning'>" + delegatesWon + " more delegates</span> than Hillary.</span>"
    } else {
      tooltip += "<span class='delta losing'>Hillary +" + (-delta) + "%</span></div>";
      tooltip += "<span class='delegates'>Bernie will get <span class='losing'>" + (-delegatesWon) + " less delegates</span> than Hillary.</span>"
    }
    return tooltip;
  }
}

function payForAdCampaign(state, amount) {
  var viewers_reached = amount * 1000/10 * 2;
  var fraction_of_state_reached = viewers_reached / data.population[state];
  var pct_of_state_swayed = fraction_of_state_reached * 0.025 * 100;

  deltas[state] = Math.min(deltas[state] + pct_of_state_swayed, 100);
  totalSpent += amount;

  update();
}

function bernie_delegates_delta_by_state(state) {
  return Math.floor(deltas[state]/100 * data.delegates[state]);
}

function total_delegates_delta() {
  var sum = 0;
  for (s in data.delegates) {
    sum += bernie_delegates_delta_by_state(s);
  }
  return sum;
}