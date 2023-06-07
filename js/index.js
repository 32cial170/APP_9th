$(function () {

  function initialize () {

    var $dice = $('#dice');
    var $loading = $('#loading');
    var $runDice = $('#run_dice');
    var $throwDice = $('#throw_dice');
    var $gpsTest = $('#gps_test');
    var $gpsInfo = $('#gps_info');
    var $gpsInfoClose = $('#gps_info_close');
    var $gpsInfoText1 = $('#gps_info_text1');
    var $gpsInfoText2 = $('#gps_info_text2');
    
    // 任務側欄
    var $place_img = $('#place_img');
    var $place_title = $('#place_title');
    var $place_info = $('#place_info');
    var $place_addr = $('#place_addr');

    const api_key = "";

    var markerInfos = [
      {position: new google.maps.LatLng (22.994694917547946, 120.20009125908481), title: '昭安理髮廳', place_id: "ChIJ5dc2m2N2bjQREu4PjT8ehCA", price: 1000},
      {position: new google.maps.LatLng (22.996879988605066, 120.20005337020355), title: '開基武廟', place_id: "ChIJK27mV2F2bjQRFIXYGEvb8NE", price: 100},
      {position: new google.maps.LatLng (22.997414202029148, 120.20054429718753), title: '百年木屐老店', place_id: "ChIJiZaJXGF2bjQRlGY7xsg-Ot8", price: 300},
      {position: new google.maps.LatLng (22.995686438504624, 120.20164759718756), title: '大井頭', place_id: "ChIJcXrNyGN2bjQRElVcsbLTbhM", price: 400},
      {position: new google.maps.LatLng (22.99531114006312, 120.20152957999139), title: '全美戲院', place_id: "ChIJ2VORzmN2bjQRBTGamcfvGgg", price: 300},
    ];

    var place_info = [
      {place_img: "./img/place/1.jpg", place_name: "昭安理髮廳", place_info: "昭安理髮廳是一間位於臺灣臺南市中西區的老字號理髮廳，老闆手藝精湛", place_addr: "臺南市中西區新美街9號"},
      {place_img: "./img/place/2.jpg", place_name: "開基武廟", place_info: "開基武廟原正殿位於臺南市中西區，為國定三級古蹟(現為市定古蹟)。該武廟為1669年所建全臺灣首座關帝廟，故原名為「開基武廟」。", place_addr: "臺南市中西區新美街114號"},
      {place_img: "./img/place/3.jpg", place_name: "百年木屐老店", place_info: "開店於日明治40年（1907年），是一家老字號的木屐店，值得一訪。", place_addr: "臺南市中西區西門路二段318號"},
      {place_img: "./img/place/4.jpg", place_name: "大井頭", place_info: "大井頭是位於臺灣臺南市中西區的一座井頭，為臺南市的信仰中心之一。", place_addr: "臺南市中西區民權路二段"},
      {place_img: "./img/place/5.jpg", place_name: "全美戲院", place_info: "全美戲院完工於民國39年，至今仍使用手繪的電影看板，為該戲院的一大特色。", place_addr: "臺南市中西區永福路二段187號"},
    ];

    $gpsInfo.showModal = function(text1, text2, text3) {
      $gpsInfoText1.text(text1);
      $gpsInfoText2.text(text2);
      el = $(this);
      if (el.is('dialog')) {
          el[0].showModal();
      }
      return el;
    };

    $gpsInfoClose.click(function() {
      $(this).closest('dialog').trigger('close');
    });

    var name1 = '玩家';
    var name2 = '電腦';
    //ame1 = prompt ("請輸入您的暱稱吧！!", name1);
    if (!name1 || name1.length <= 0)
      name1 = '玩家';

    $('#quota1 b').text (name1);
    $('#quota2 b').text (name2);

    var win = 0;

    var map = new window.funcs ();

    if (!map.init ($('#map'), markerInfos, $('#logs')))
      return alert ('地圖資料初始化失敗');
    //map.logs ('地圖資料初始化成功！', 'title');

    var user1 = map.createUser (name1, $('#quota1 span'), 'rgba(0, 0, 255, 0.9)');
    user1.setPosition ();

    var user2 = map.createUser (name2, $('#quota2 span'), 'rgba(0, 128, 0, 0.9)');
    user2.setPosition ();

    //map.logs ('使用者初始化成功！', 'title');
    //map.logs ('遊戲開始，請擲骰子吧！', 'title');

    function distance(lat1, lon1, lat2, lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
          return 0;
        }
        else {
          var radlat1 = Math.PI * lat1/180;
          var radlat2 = Math.PI * lat2/180;
          var theta = lon1-lon2;
          var radtheta = Math.PI * theta/180;
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          if (dist > 1) {
            dist = 1;
          }
          dist = Math.acos(dist);
          dist = dist * 180/Math.PI;
          dist = dist * 60 * 1.1515;
          dist = dist * 1.609344
          return dist;
        }
      }

    $gpsTest.click(function (){
      // for further usage
      var index = user1.index;
      $.ajax({
        type:'POST',
        url:"https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key,
        data:{},
        success: function(data){
          var loc = data.location;
          latitude = loc.lat;
          longitude = loc.lng;
          var target_lat = markerInfos[index].position.lat();
          var target_lng = markerInfos[index].position.lng();
          var result = compare_test(latitude, longitude, target_lat, target_lng, 10);
          if (result) markerInfos[index].layer += 1;
          var str;
          if (result) {
            str = "任務成功！";
            markerInfos[index].taskComplete();
            if (!markerInfos[index].finshed) {
              if (++win > 2) {
                str = "恭喜你獲勝了！";
                win = 0;
              }
            }
            markerInfos[index].finshed = true;
          } else {
            str = "任務失敗！";
          }
          $gpsInfo.showModal(
            str,
            "距離目標： " + distance(latitude, longitude, target_lat, target_lng).toFixed(2) + "公里"
          );
          
        },
        error: function (xhr, textStatus, thrownError) {
          alert(textStatus);
        }
      });
    });

    function compare_test(lat, lng, target_lat, target_lng, threshold) {
      var dis = distance(lat, lng, target_lat, target_lng);
      if (dis < threshold) {
        return true;
      } else {
        return false;
      }
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
          $place_img.css('background-image', 'url(' + photo_url + ')');
          $place_title.text(markerInfos[index].title);
          $place_info.text(place_info[index].place_info);
          $place_addr.text(place_info[index].place_addr);
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