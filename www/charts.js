var timeformat = {
  second: '%S',
  minute: '%M',
  hour:   '%H',
  day:    '%b',
}

function repeat(kind,period) {
  var ajax = function() {
  var time = new Date().getTime();
      $.ajax({
        url:'/stats/data/'+kind+'/'+period+'/'+time,
        dataType:'json',
	timeout: 2000,
        success:function(data){
          console.log(JSON.stringify(data));
          var chartdata = [];
          for(var t = data.start,i=0; t <= data.end; t+=data.step,i++) {
            chartdata.push([t,data.points[i]]);
          }
          $.plot(
            $('#'+kind+'_'+period), 
            [{data:chartdata}], 
            { xaxis: { mode:'time', ticks:6, timeformat:timeformat[period] },
              yaxis: { min:0, ticks:5, 
                       tickFormatter:function(val,axis){
                         return Math.floor(val)}}}
          )
        }
      }); 
    };
    setInterval(ajax, 1000);
}

function refresh(){
  ['second','minute','hour','day'].forEach(function(period){
   ['total','done','notdone'].forEach(function(kind){
  		 repeat(kind,period);
	})
})};
refresh();
