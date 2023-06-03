$(function () {

  function initialize () {

    var $dice = $('#dice');
    var $loading = $('#loading');
    var $runDice = $('#run_dice');
    var $throwDice = $('#throw_dice');
    var $gpsTest = $('#gps_test');
    var $infoTest = $('#info_test');
    const api_key = "AIzaSyC-kx3lfIZdfF2uUsmpx10G40lCy9OzW8g";

    var markerInfos = [
      {position: new google.maps.LatLng (22.994694917547946, 120.20009125908481), title: '昭安理髮廳', place_id: "ChIJ5dc2m2N2bjQREu4PjT8ehCA", price: 1000},
      {position: new google.maps.LatLng (22.996879988605066, 120.20005337020355), title: '開基武廟', place_id: "ChIJK27mV2F2bjQRFIXYGEvb8NE", price: 100},
      {position: new google.maps.LatLng (22.997414202029148, 120.20054429718753), title: '府城百年木屐老店', place_id: "ChIJiZaJXGF2bjQRlGY7xsg-Ot8", price: 300},
      {position: new google.maps.LatLng (22.995686438504624, 120.20164759718756), title: '大井頭', place_id: "ChIJcXrNyGN2bjQRElVcsbLTbhM", price: 400},
      {position: new google.maps.LatLng (22.99531114006312, 120.20152957999139), title: '全美戲院', place_id: "ChIJ2VORzmN2bjQRBTGamcfvGgg", price: 300},
    ];

    var name1 = '玩家';
    var name2 = '電腦';
    name1 = prompt ("請輸入您的暱稱吧！!", name1);
    if (!name1 || name1.length <= 0)
      name1 = '玩家';

    $('#quota1 b').text (name1);
    $('#quota2 b').text (name2);

    var map = new window.funcs ();

    if (!map.init ($('#map'), markerInfos, $('#logs')))
      return alert ('地圖資料初始化失敗');
    //map.logs ('地圖資料初始化成功！', 'title');

    var user1 = map.createUser (name1, $('#quota1 span'), 'rgba(0, 0, 255, 0.9)');
    user1.setPosition ();

    var user2 = map.createUser (name2, $('#quota2 span'), 'rgba(0, 128, 0, 0.9)');
    user2.setPosition ();

    map.logs ('使用者初始化成功！', 'title');
    //map.logs ('遊戲開始，請擲骰子吧！', 'title');

    $gpsTest.click(function (){
      // for further usage
      var index = user1.index;
      $.ajax({
        type:'POST',
        url:"https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key,
        data:{},
        success: function(data){
          console.log(data);
          var loc = data.location;
          latitude = loc.lat;
          longitude = loc.lng;
          alert("gps: Latitude: " + loc.lat + "°, Longitude: " + loc.lng + "°");
          var target_lat = markerInfos[index].position.lat();
          var target_lng = markerInfos[index].position.lng();
          
          console.log(target_lat, target_lng);
          var result = compare_test(latitude, longitude, target_lat, target_lng, 0.001);
          if (result) markerInfos[index].layer += 1;
          
        },
        error: function (xhr, textStatus, thrownError) {
          alert(textStatus);
        }
      });
    });

    function compare_test(lat, lng, target_lat, target_lng, threshold) {
      var diff_lat = Math.abs(lat - target_lat);
      var diff_lng = Math.abs(lng - target_lng);
      console.log("lat: " + diff_lat + "; lng: " + diff_lng);
      var str;
      if (diff_lat < threshold && diff_lng < threshold) {
        str = "任務成功！！";
        alert("gps: " + str);
        return true;
      } else {
        str = "任務失敗！！";
        alert("gps: " + str);
        return false;
      }
      //alert("gps: " + str);
    };

    function update_info(){
      var index = user1.index;
      console.log(markerInfos[index].title);
      var place_id = markerInfos[index].place_id;
      // get info
      $.ajax({
        type:'GET',
        url:"https://maps.googleapis.com/maps/api/place/details/json?place_id="+ place_id +"&language=zh-TW&fields=formatted_address%2Cphotos&key=" + api_key,
        data:{},
        success: function(data){
          console.log(data);
          var address = data.result.formatted_address;
          var photo_ref = data.result.photos[index].photo_reference;
          var photo_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference="+ photo_ref + "&key=" + api_key;
          map.logs(photo_url, 'image');
          map.logs(address);
        },
        error: function (xhr, textStatus, thrownError) {
          alert(textStatus);
        }
      });
    };

    $throwDice.click (function () {
      $throwDice.prop ('disabled', true);

      var step = Math.floor ((Math.random () * 6) + 1);
      $dice.attr ('class', 'show' + step);

      $runDice.fadeIn (function () {
        for (var nStep = Math.floor ((Math.random () * 6) + 1); nStep == step; nStep = Math.floor ((Math.random () * 6) + 1));

        $dice.attr ('class', 'show' + nStep);
        //map.logs (user1.name + ' 擲出 ' + nStep + ' 點！');

        setTimeout (function () {
          $runDice.fadeOut (function () { user1.goStep (nStep, false, function () {
            //map.logs ('換 ' + user2.name + ' 擲骰子！', 'title');

            nStep = Math.floor ((Math.random () * 6) + 1);
            //map.logs (user2.name + ' 擲出 ' + nStep + ' 點！');

            user2.round_count += 1;
            user2.goStep (nStep, true, function () {
              $throwDice.prop ('disabled', false);
              //map.logs ('換 ' + user1.name + ' 擲骰子！', 'title');
              update_info();
            });
            if(user2.round_count == 15){
              if(user1.point > user2.point){
                alert("玩家1獲勝,遊戲結束");
              }else if(user1.point < user2.point){
                alert("玩家2獲勝,遊戲結束");
              }else alert("平手，遊戲結束")
            }
          });
        });
        }, 800);
      });
    });

    $loading.fadeOut (function () {
      $(this).hide (function () {
        $(this).remove ();
      });
    });
  }

  google.maps.event.addDomListener (window, 'load', initialize);
});