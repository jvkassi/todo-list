
document.ontouchmove = function(e){ e.preventDefault(); }

var items = [];
var saveon = false;
var swipeon = false;
var appinfo = {};

	window.addEventListener('load', function() {
		FastClick.attach(document.body);
	}, false);
$(document).ready(function(){

	
	  items = loaditems();
	  for( var i = 0; i < items.length; i++ ) {
	  	additem(items[i]);
	  }		

	initapp();
	  $('#add').click(function(e){
	  	$('#cancel').show();
	 	  $('#add').hide();
	 	 $('#newitem').slideDown();
		  saveon = false;
		  activatesave(); 
   
	  });

  $('#cancel').click(function(){
		$('#add').show();
	    $('#cancel').hide();
	    $('#newitem').slideUp();
	    $('div.delete').hide();
	    
  });

  $('#text').keyup(function(){
    activatesave();
  });

  $('#save').tap(function(){
    var text = $('#text').val();
    if( 0 == text.length ) {
      return;
    }
    $('#text').val('');

    var id = new Date().getTime();
    var itemdata = {id:id,text:text,done:false}; 
    items.push(itemdata);
    additem(itemdata);

    $('#newitem').slideUp();
    $('#add').show();
    $('#cancel').hide();

    saveitems(items);
  });

});

function activatesave() {
  var textlen = $('#text').val().length;
  if( !saveon && 0 < textlen ) {
    $('#save').css('opacity',1);
    saveon = true;
  }
  else if( 0 == textlen ) {
    $('#save').css('opacity',0.3);
    saveon = false;
  }
}


function additem(itemdata) {
	// clone item and set attr
  var item = $('#item_tm').clone();
  item.attr({id:itemdata.id});
  var check = item.find('span.check')[0];
  item.find('span.text').text(itemdata.text);
  item.data('itemdata', itemdata); 
  var delbutton = $('#delete_tm').clone();
  item.append(delbutton);

  delbutton.attr('id','delete_'+itemdata.id).tap(function(){
    for( var i = 0; i < items.length; i++ ) {
      if( itemdata.id == items[i].id ) {
        items.splice(i,1);
      }
    }
    item.fadeOut();
    $('#add').show();
    $('#cancel').hide();
    saveitems(items);
    return false;
  });
	function done() {
     		$('#delete_'+itemdata.id).slideDown();
	    markitem(item, itemdata.done = true, saveitems);
		};
	function undone() {
                $('#delete_'+itemdata.id).slideUp();
	            markitem(item, itemdata.done = false, saveitems);

	}	

  item.bind("swiperight", function(){
  	done();
      });
  item.bind("swipeleft", function(){
  	undone();
});
	item.bind("tap", function(){
		$('#delete_' + itemdata.id).slideToggle();
		markitem(item, itemdata.done = !itemdata.done, saveitems);
	});
  $('#todolist').prepend(item).listview('refresh');
  if(itemdata.done) {
	$('#delete_'+itemdata.id).slideDown();
	markitem(item, itemdata.done);
  }
}

function markitem( item, done , saveitems) {
  item.find('span.check').html( done ? '&#10003;' : '&nbsp;' );
  item.find('span.text').css({'text-decoration': done ? 'line-through' : 'none' });
  saveitems && saveitems(items);
}

function saveitems(items) {
  localStorage.items = JSON.stringify(items);
  sendstats(items);
}

function loaditems() {
  return JSON.parse(localStorage.items || '[]');
}

function sendjson(urlsuffix, obj, win, fail) {
	$.ajax({
		url: 'http://todolist.tk/' + urlsuffix,
		type: 'POST',
		contentType: 'application/json',
		datatype: 'json',
		data: JSON.stringify(obj),
		success: function(result) {
			win && win(result);
		},
		failure: function(){
			fail && fail();
		}

	});
}
function initapp() {
	appinfo = JSON.parse(localStorage.appinfo || '{}');
	if( !appinfo.id) {
		var id = ''+ Math.floor(Math.abs(10000000 * Math.random()));
		appinfo.id = id;
		localStorage.appinfo = JSON.stringify(appinfo);
	}
	sendjson('stats/init', {id:appinfo.id});
}

function sendstats(items) {
	if(navigator.onLine) {
		var total = 0;
		var done = 0;
		items.forEach(function(item) {
			total++;
			done+= item.done ? 1:0;
		});
	var time = new Date().getTime();
	var send = {time:time,total:total,done:done};
	sendjson('stats/collect/'+appinfo.id,send);
	}
}

var appCache = window.applicationCache;
//appCache.update();
window.applicationCache.addEventListener('updateready',function(){
window.applicationCache.swapCache();
location.reload();
});

