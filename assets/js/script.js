var url_string = window.location.href;
var url = new URL(url_string);
var coin = url.searchParams.get("coin");
var target = url.searchParams.get("target");
var timeout = parseInt(url.searchParams.get("timeout"))*1000;
var statusalarm = url.searchParams.get("setalarm");
var position = url.searchParams.get("position");
var current_price = 0;
var number_table = 1; 
var limit_target_chart = 100;
var current_chart_width = 100;
var switch_ticker = true
var up_price_position = 0 
var down_price_position = 0 
var neutral_price_position = 0 
var up_price_position_p = 0 
var down_price_position_p = 0 
var neutral_price_position_p = 0 
var price_position = 0 

// menampilkan modal awal / start 
var modalStart = new bootstrap.Modal(document.getElementById('modalStartForm'))
if (coin == null) {
    modalStart.show()
}

// fungsi set alarm 
var modalAlarm = new bootstrap.Modal(document.getElementById('modalAlarm'))
var alarm_audio = document.getElementById("alarm_audio");
var modalalarmstatus = "hide"
function showmodalAlarm(modalAlarmBody) {
    if (modalalarmstatus == "hide") {
        document.getElementById('modalAlarmBody').innerHTML = modalAlarmBody
        modalAlarm.show()
    }
}
function set_label_alarm() {
    var alarmposition = document.getElementById("alarmposition").value;
    if (alarmposition == "above") {
        document.getElementById('alarmLabel').innerText = 'turn the alarm when the price is above the set target'
    } else if (alarmposition == "under") {
        document.getElementById('alarmLabel').innerText = 'turn the alarm when the price is under the set target'
    } else {document.getElementById('alarmLabel').innerText = ''}
}
function setAlarmPrice(currentprice) {
    if (statusalarm == "on") {
        if (position == "above") {
            if (parseInt(currentprice) > parseInt(target)) {
                alarm_audio.play()
                showmodalAlarm('<div class="alert alert-success" role="alert"> the current price is more than the set target! </div>')
                modalalarmstatus = "show"
            } else {
                modalalarmstatus = "hide"
            }
        } else {
            if (parseInt(currentprice) < parseInt(target)) {
                alarm_audio.play()
                showmodalAlarm('<div class="alert alert-danger" role="alert"> the current price is less than the set target! </div>')
                modalalarmstatus = "show"
            } else {
                modalalarmstatus = "hide"
            }
        }
    } else {
        console.log('alarm off')
    }
}

// fungsi on / off sistem 
function switch_crypto_ticker() {
    if (document.getElementById('switch_ticker').checked) {
        switch_ticker = true
        get_price(coin, target)
        document.getElementById('status_get_data').innerHTML = '<span class="badge rounded-pill bg-primary">Active</span>'
    } else {
        switch_ticker = false
        document.getElementById('status_get_data').innerHTML = '<span class="badge rounded-pill bg-danger">Inactive</span>'
    }
}

// fitur top list coin
var TopListCoinModal = new bootstrap.Modal(document.getElementById('TopListCoinModal'))
function top_list_coin_modal(){
    TopListCoinModal.show()
}
function get_top_list_limit(){
    var topListLimit = document.getElementById("topListLimit").value;
    get_top_list(parseInt(topListLimit))
}

// THE MAIN FUNCTION OF THIS WEBSITE 
if (coin!==null) {
    get_price(coin, target)
    get_coin_info(coin)
    document.getElementById('web_title').innerText = 'Monitor Crypto Price - '+coin
    document.getElementById('crypto_coin').innerText = coin+' = '
}
// function to get info of coin 
function get_coin_info(coin) {
    $.ajax({
        url   : 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms='+coin+'&tsyms=IDR',
        type  : 'GET',
        async : true,
        dataType : 'json',
        success : function(data){
            document.getElementById("coinImgIcon").src="https://www.cryptocompare.com/"+data.DISPLAY[coin].IDR.IMAGEURL;
            document.getElementById("openPrice").innerText=data.DISPLAY[coin].IDR.OPENDAY;
            document.getElementById("highestPrice").innerText=data.DISPLAY[coin].IDR.HIGHDAY;
            document.getElementById("lowestPrice").innerText=data.DISPLAY[coin].IDR.LOWDAY;
            document.getElementById("changeDay").innerText=data.DISPLAY[coin].IDR.CHANGEDAY;
            document.getElementById("changeHour").innerText=data.DISPLAY[coin].IDR.CHANGEHOUR;
            document.getElementById("lastUpdate").innerText=data.DISPLAY[coin].IDR.LASTUPDATE;
        }
    })  
}
// function to get top list coin
function get_top_list(amount_coin) {
    var top_list_coin_table = ''
    var number_table = 1;
    $.ajax({
        url   : 'https://min-api.cryptocompare.com/data/top/totalvolfull?limit='+amount_coin+'&tsym=IDR',
        type  : 'GET',
        async : true,
        dataType : 'json',
        success : function(data){
            for (let i = 0; i < data.Data.length; i++) {
                top_list_coin_table += '<tr>'+
                                    '<th scope="row">'+ (number_table++) +'</th>'+
                                    '<th><img style="width:18px;" src="https://www.cryptocompare.com/'+data.Data[i].CoinInfo.ImageUrl+'" alt="" loading="lazy"> '+data.Data[i].CoinInfo.FullName+'</th>'+
                                    '<td>'+data.Data[i].DISPLAY.IDR.PRICE+'</td>'+
                                    '<td>'+data.Data[i].DISPLAY.IDR.CHANGEPCTHOUR+'</td>'+
                                    '<td>'+data.Data[i].DISPLAY.IDR.CHANGEPCT24HOUR+'</td>'+
                                    '<td>'+data.Data[i].DISPLAY.IDR.MKTCAP+'</td>'+
                                    '<td>'+data.Data[i].DISPLAY.IDR.SUPPLY+'</td>'+
                                '</tr>'
            }
            $("#top_list_coin").html(top_list_coin_table);
        }
    })  
}
// function to get realtime coin price 
function get_price(coin, target) {
    if (switch_ticker == true) {
        document.getElementById('status_get_data').innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>'
        $.ajax({
            url   : 'https://min-api.cryptocompare.com/data/price?fsym='+ coin +'&tsyms='+ coin +',IDR',
            type  : 'GET',
            async : true,
            dataType : 'json',
            success : function(data){
                // menampilkan status get api 
                document.getElementById('status_get_data').innerHTML = '<span class="badge rounded-pill bg-success">Success</span>'
                
                // menampilkan price change 
                var price_change = (data.IDR - current_price).toString()
                price_change = price_change.split(".")[0];
                price_change = formatRupiah(price_change, 'Rp. ')
                if (data.IDR - current_price < 0) {
                    price_change = '-'+price_change
                    document.getElementById('price_change').innerText = price_change 
                } else {
                    price_change = '+'+price_change
                    document.getElementById('price_change').innerText = price_change 
                }
    
                // menampilkan price change from target 
                var price_change_from_target = (data.IDR - target).toString()
                price_change_from_target = price_change_from_target.split(".")[0];
                if (data.IDR - target < 0) {
                    document.getElementById('price_from_target').innerText = '-'+formatRupiah(price_change_from_target, 'Rp. ')
                } else {
                    document.getElementById('price_from_target').innerText = '+'+formatRupiah(price_change_from_target, 'Rp. ')
                }
    
                // mengubah warna font current price
                // push naik atau turun atau draw ke array price movement 
                if (current_price == 0) {
                    document.getElementById("coin_price").style.color = "#0dcaf0";
                } else {
                    if (current_price == data.IDR) {
                        // jika harga draw 
                        document.getElementById("coin_price").style.color = "#0dcaf0";
                        price_movement.push('neutral')
                    } else if(current_price < data.IDR){
                        // jika harga naik 
                        document.getElementById("coin_price").style.color = "#7feb7f";
                        price_movement.push('up')
                    } else {
                        // jika harga turun 
                        document.getElementById("coin_price").style.color = "#fd7878";
                        price_movement.push('down')
                    }
                }

                // mengupdate value current price 
                current_price = data.IDR
                
                // menampilkan current price 
                var coin_price = data.IDR.toString()
                coin_price = coin_price.split(".")[0];
                var coin_price_format = formatRupiah(coin_price, 'Rp. ')
                document.getElementById('coin_price').innerHTML = '<b>'+coin_price_format+'</b> <div class="spinner-grow spinner-grow-sm my-0" role="status"><span class="visually-hidden">Loading...</span></div>'
                // push data terbaru ke array chart                 
                data_chart.push(parseInt(coin_price));

                // trigger fungsi alarm 
                setAlarmPrice(coin_price)
    
                // menampilkan last update 
                date = new Date();
                detik = date.getSeconds();
                menit = date.getMinutes();
                jam = date.getHours();
                var date_time = jam+':'+menit+':'+detik
                document.getElementById('last_update_price').innerText = date_time
                // push data terbaru ke array chart 
                labels.push(date_time);
    
                // menampilkan total data yang berhasil diambil 
                document.getElementById('total_data_chart').innerText = labels.length
                
                // menampilkan harga tertinggi 
                var max_price = ss.max(data_chart)
                document.getElementById('max_data').innerText = formatRupiah(max_price.toString(), 'Rp. ') 

                // menampilkan harga terendah 
                var min_price = ss.min(data_chart)
                document.getElementById('min_data').innerText = formatRupiah(min_price.toString(), 'Rp. ') 

                // menampilkan range data 
                var range_price = max_price-min_price
                document.getElementById('range_data').innerText = formatRupiah(range_price.toString(), 'Rp. ') 

                // menampilkan harga rata-rata 
                var avg_price = Math.round(ss.mean(data_chart))
                var avg_price_string = formatRupiah(avg_price.toString(), 'Rp. ')
                document.getElementById('avg_data').innerText = avg_price_string
                // push data rata-rata ke array chart 
                avg_chart.push(parseInt(avg_price))

                // menampilkan median 
                var median_price = Math.round(ss.median(data_chart))
                var median_price_string = formatRupiah(median_price.toString(), 'Rp. ')
                document.getElementById('median_data').innerText = median_price_string
                // push data median ke array chart 
                median_chart.push(parseInt(median_price))

                // menampilkan modus 
                var mode_price = ss.mode(data_chart)
                document.getElementById('mode_data').innerText = formatRupiah(mode_price.toString(), 'Rp. ') 
                
                // menampilkan variance 
                var variance_price = Math.round(ss.variance(data_chart))
                document.getElementById('variance_data').innerText = formatRupiah(variance_price.toString(), 'Rp. ') 

                // menampilkan standart deviation 
                var sd_price = Math.round(ss.standardDeviation(data_chart))
                document.getElementById('sd_data').innerText = formatRupiah(sd_price.toString(), 'Rp. ') 

                // menampilkan chart sd atas & bawah 
                var sd_upper_price = (parseInt(avg_price))+(parseInt(sd_price))
                sd_upper_chart.push(sd_upper_price)
                var sd_lower_price = (parseInt(avg_price))-(parseInt(sd_price))
                sd_lower_chart.push(sd_lower_price)


                // menampilkan chart moving average 
                var moving_average_value = movingAverage(data_chart, 10)
                moving_average_value = moving_average_value.slice(-1)[0] 
                if (labels.length<=10) {
                    moving_average_value = current_price
                }
                mov_avg_chart.push(moving_average_value)
                // console.log(mov_avg_chart)


                // update chart 
                priceChart.update();

                // Buat kondisi untuk menentukan sinyal beli atau jual
                if (current_price > sd_upper_price) {
                    // console.log("Sinyal beli kuat");
                    document.getElementById('sellOrBuy').innerText = "Beli Kuat";
                } else if (current_price > avg_price) {
                    // console.log("Sinyal beli lemah");
                    document.getElementById('sellOrBuy').innerText = "Beli Lemah";
                } else if (current_price < sd_lower_price) {
                    // console.log("Sinyal jual kuat");
                    document.getElementById('sellOrBuy').innerText = "Jual Kuat";
                } else if (current_price < avg_price) {
                    // console.log("Sinyal jual lemah");
                    document.getElementById('sellOrBuy').innerText = "Jual Lemah";
                }
                //====================================================

                // price movement 
                up_price_position = price_movement.filter(x => x=='up').length
                down_price_position = price_movement.filter(x => x=='down').length
                neutral_price_position = price_movement.filter(x => x=='neutral').length
                // console.log(up_price_position+' '+down_price_position+' '+neutral_price_position) 
                up_price_position_p = Math.round((up_price_position/(price_movement.length))*100)
                down_price_position_p = Math.round((down_price_position/(price_movement.length))*100)
                neutral_price_position_p = Math.round((neutral_price_position/(price_movement.length))*100)
                // console.log(up_price_position_p+' '+down_price_position_p+' '+neutral_price_position_p) 
                price_position = 50-down_price_position_p+up_price_position_p
                // price_position = neutral_price_position_p-down_price_position_p+up_price_position_p
                if (up_price_position_p == 0) {
                    price_position -= 50 
                }
                if (price_position<0) {
                    price_position=0
                }
                if (up_price_position_p==down_price_position_p) {
                    price_position=50
                }
                gauge.set(price_position);
                document.getElementById('upPrice').innerHTML = '<b style="color:#30B32D;">'+up_price_position+'('+up_price_position_p+'%)</b>'
                document.getElementById('downPrice').innerHTML = '<b style="color:#F03E3E;">'+down_price_position+'('+down_price_position_p+'%)</b>'
                document.getElementById('neutralPrice').innerHTML = '<b style="color:#FFDD00;">'+neutral_price_position+'('+neutral_price_position_p+'%)</b>'
                if (price_position>=0 && price_position<34) {
                    document.getElementById('priceTrend').innerHTML = 'Down'
                } else if (price_position>=34 && price_position<66) {
                    document.getElementById('priceTrend').innerHTML = 'Neutral'
                } else if (price_position>=66 && price_position<=100) {
                    document.getElementById('priceTrend').innerHTML = 'Up'
                }
                // console.log('persentase akhir = '+price_position) 

                // masukkan data ke tabel 
                var data_for_table = ''
                data_for_table += '<tr>'+
                                    '<th scope="row">'+ (number_table++) +'</th>'+
                                    '<th>'+date_time+'</th>'+
                                    '<td>'+coin_price_format+'</td>'+
                                    '<td>'+price_change+'</td>'+
                                    '<td>'+avg_price_string+'</td>'+
                                '</tr>'
                $("#coin_data_table").append(data_for_table);

                // fungsi untuk expand width chart 
                if (labels.length == limit_target_chart) {
                    limit_target_chart += 50
                    current_chart_width += 50
                    document.getElementById("chartWrapper").style.width = current_chart_width+'vw';
                    document.getElementById('chartContainer').scrollLeft += 1000;
                } 

                // fungsi rekursif sesuai timeout yang ditentukan
                setTimeout(() => {
                    get_price(coin, target)
                }, timeout);
            }
        });
    }
}

// Fungsi untuk menghitung moving average
function movingAverage(data_mov_avg, period) {
    // Inisialisasi variabel untuk menyimpan hasil moving average
    var result_mov_avg = [];
    
    // Iterasi melalui data harga
    for (var i = 0; i < data_mov_avg.length; i++) {
      // Hitung jumlah dari "period" harga terakhir
      var sum = 0;
      for (var j = 0; j < period; j++) {
        if (i-j >= 0) {
          sum += data_mov_avg[i-j];
        }
      }
      // Hitung rata-rata dari jumlah harga tersebut
      var avg = sum / period;
      result_mov_avg.push(avg);
    }
    return result_mov_avg;
  }

// Fungsi untuk menghitung RSI
function calculateRSI(prices, period) {
    // Inisialisasi variabel
    let gains = 0;
    let losses = 0;
    let avgGains = 0;
    let avgLosses = 0;
    let relativeStrength = 0;
    let RS = 0;
    let RSI = 0;
  
    // Perulangan untuk menghitung rata-rata pergerakan harga naik dan turun
    for (let i = 1; i < period+1; i++) {
        let change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
  
    // Menghitung rata-rata pergerakan harga naik dan turun
    avgGains = gains / period;
    avgLosses = losses / period;
  
    // Menghitung relative strength
    relativeStrength = avgGains / avgLosses;
  
    // Menghitung relative strength index
    RS = relativeStrength;
    RSI = 100 - (100 / (1 + RS));
  
    return RSI;
}
// let cryptoPrices = [10000, 10050, 9950, 10000, 10100, 10200, 10150, 10250, 10300, 10350, 10400, 10500, 10600, 10700];
// let rsi = calculateRSI(cryptoPrices, 10);
// console.log(rsi);


// format angka biasa ke rupiah 
function formatRupiah(angka, prefix){
	var number_string = angka.replace(/[^,\d]/g, '').toString(),
	split   		= number_string.split(','),
	sisa     		= split[0].length % 3,
	rupiah     		= split[0].substr(0, sisa),
	ribuan     		= split[0].substr(sisa).match(/\d{3}/gi);
	if(ribuan){
		separator = sisa ? '.' : '';
		rupiah += separator + ribuan.join('.');
	}
	rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
	return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
}

// BLOK KODE UNTUK MEMBUAT CHART/GRAPHIC DENGAN CHART.JS
var labels = [];
var data_chart = [];
var avg_chart = [];
var median_chart = [];
var sd_upper_chart = [];
var sd_lower_chart = [];
var mov_avg_chart = []; 
var target_chart = [parseInt(target)];
var price_movement = [] 
// data chart 
const data = {
    labels: labels,
    datasets: [
        {
            label: 'Coin Price',
            fill: false,
            backgroundColor: 'rgb(174, 235, 224)',
            borderColor: 'rgb(63, 166, 204)',
            data: data_chart,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 3
        }, 
        {
            label: 'Mean',
            fill: false,
            backgroundColor: 'rgb(227, 148, 191)',
            borderColor: 'rgb(240, 96, 175)',
            data: avg_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'Median',
            fill: false,
            backgroundColor: 'rgb(161, 119, 199)',
            borderColor: 'rgb(122, 72, 168)',
            data: median_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'Mov Avg',
            fill: false,
            backgroundColor: 'rgb(238, 122, 65)',
            borderColor: 'rgb(245, 111, 43)',
            data: mov_avg_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'SD-Upper',
            fill: false,
            backgroundColor: 'rgb(228, 232, 109)',
            borderColor: 'rgb(249, 255, 61)',
            borderDash: [5, 5],
            data: sd_upper_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'SD-Lower',
            fill: false,
            backgroundColor: 'rgb(228, 232, 109)',
            borderColor: 'rgb(249, 255, 61)',
            borderDash: [5, 5],
            data: sd_lower_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'Target Price',
            fill: false,
            backgroundColor: 'rgb(78, 79, 82)',
            borderColor: 'rgb(51, 52, 54)',
            data: target_chart,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 1
        }
    ]
};
// horizontal line plugin  
const horizontalArbitaryLine = {
    id: 'horizontalArbitaryLine', 
    beforeDraw(chart, args, options) {
        const { ctx, chartArea: { top, right, bottom, left, width, height }, scales: {x, y} } = chart 
        ctx.save() 
        const yThickness = 2
        ctx.fillStyle = options.lineColor 
        ctx.fillRect(left, y.getPixelForValue(options.yPosition)-(yThickness/2), width, yThickness ) 
        ctx.restore() 
    }
}
// config chart 
const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: true,
        plugins: {
            horizontalArbitaryLine: {
                lineColor: 'grey', 
                yPosition: parseInt(target) 
            }
        }, 
        scales: {
            y: {
                // display: true, 
                position: 'right'
            }, 
        }
    }, 
    plugins: [
        horizontalArbitaryLine
    ]
};
// render chart 
const priceChart = new Chart(
    document.getElementById('priceChart'),config
);


// fungsi untuk gauge js 
var opts = {
    angle: -0, // The span of the gauge arc
    lineWidth: 0.08, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.42, // // Relative to gauge radius
        strokeWidth: 0.038,  // The thickness
        color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    staticLabels: {
        font: "14px sans-serif",  // Specifies font
        labels: [0, 25, 50, 75, 100],  // Print labels at these values
        color: "#000000",  // Optional: Label text color
        fractionDigits: 0  // Optional: Numerical precision. 0=round off.
    },
    staticZones: [
        {strokeStyle: "#F03E3E", min: 0, max: 34}, // Red from 100 to 130
        {strokeStyle: "#FFDD00", min: 34, max: 66}, // Yellow
        {strokeStyle: "#30B32D", min: 66, max: 100}, // Green
    ],
};
var target_gauge = document.getElementById('priceMovementGauge'); // your canvas element
var gauge = new Gauge(target_gauge).setOptions(opts); // create sexy gauge!
gauge.maxValue = 100; // set max gauge value
gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 32; // set animation speed (32 is default value)
gauge.set(50); // set actual value


// menampilkan jam 
function formatTime(time) {
    if ( time < 10 ) {return '0' + time;}; return time;
}
function showTime() {
    const date = new Date(); const hour = formatTime(date.getHours()); const minutes = formatTime(date.getMinutes()); const seconds = formatTime(date.getSeconds());
    document.getElementById('show_time').innerText=`${hour} : ${minutes} : ${seconds}`
}
setInterval(showTime, 1000);

// fungsi export data to pdf 
var btn_export = false
function enabled_export() {
    if (btn_export == false) {
        document.getElementById("export_btn").disabled = false;
        btn_export = true
    } else {
        document.getElementById("export_btn").disabled = true;
        btn_export = false

    }
}
function export_topdf() {
    document.body.scrollTop = 0; 
    document.documentElement.scrollTop = 0; 
    setTimeout(() => {
        window.print();
    }, 1000);
}

// change to fullscreen mode
function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
     (!document.mozFullScreen && !document.webkitIsFullScreen)) {
      if (document.documentElement.requestFullScreen) {  
        document.documentElement.requestFullScreen();  
      } else if (document.documentElement.mozRequestFullScreen) {  
        document.documentElement.mozRequestFullScreen();  
      } else if (document.documentElement.webkitRequestFullScreen) {  
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
      }  
    } else {  
      if (document.cancelFullScreen) {  
        document.cancelFullScreen();  
      } else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
      } else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
      }  
    }  
}

// fungsi untuk switch antara dark dan light mode 
var dark_light_mode = localStorage.getItem("dark_light_mode");
if (dark_light_mode === null) {
    localStorage.setItem("dark_light_mode", 'light');
}
set_mode()
function set_mode() {
    if (dark_light_mode == "light") {
        localStorage.setItem("dark_light_mode", 'dark');
        change_mode()
    } else if(dark_light_mode=="dark") {
        localStorage.setItem("dark_light_mode", 'light');
        change_mode()
    }
}
function change_mode() {
    dark_light_mode = localStorage.getItem("dark_light_mode");
    var main_body = document.getElementById("main_body");
    var card_data = document.getElementById("card_data");
    var alert_data = document.getElementById("alert_data");
    var card_detail = document.getElementById("card_detail");
    var table_detail = document.getElementById("table_detail");
    if (dark_light_mode=="light") {
        // change to dark mode 
        localStorage.setItem("dark_light_mode", 'dark');

        main_body.classList.add("bg-dark");
        
        alert_data.classList.remove("alert-primary");
        alert_data.classList.add("alert-dark");
        
        card_data.classList.remove("bg-light");
        card_data.classList.add("bg-secondary");
        card_data.classList.add("text-light");

        card_detail.classList.add("bg-secondary");

        main_footer.classList.remove("bg-light");
        main_footer.classList.add("bg-dark");

        table_detail.classList.add("table-secondary");
    } else if(dark_light_mode=="dark") { 
        // change to light mode 
        localStorage.setItem("dark_light_mode", 'light');

        main_body.classList.remove("bg-dark");

        alert_data.classList.remove("alert-dark");
        alert_data.classList.add("alert-primary");

        card_data.classList.remove("bg-secondary");
        card_data.classList.add("bg-light");
        card_data.classList.remove("text-light");

        card_detail.classList.remove("bg-secondary");

        main_footer.classList.remove("bg-dark");
        main_footer.classList.add("bg-light");

        table_detail.classList.remove("table-secondary");
    }
}
// if ( window !== window.parent ) {
//     document.getElementById("kontainer").remove();
//     document.write('<h1 style="color:red;">FITUR IFRAME TIDAK DIIZINKAN DALAM WEBSITE INI !!!!!!!!!!!!!!!</h1>'); 
// } else {     
//     console.log('aman gan')
// }
// if (url.host !== 'waw-telegram.herokuapp.com') {
//     document.getElementById("kontainer").remove();
//     document.write('<h1 style="color:red;">FITUR IFRAME TIDAK DIIZINKAN DALAM WEBSITE INI !!!!!!!!!!!!!!!</h1>'); 
// } else {
//     console.log('aman gan')
// }
// window.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
// var _0x3f4cb4=_0x2e57;function _0x15c2(){var _0x456f9d=['remove','920901hdggGN','168194Hmqogo','4iXRccr','<h1\x20style=\x22color:red;\x22>FITUR\x20IFRAME\x20TIDAK\x20DIIZINKAN\x20DALAM\x20WEBSITE\x20INI\x20!!!!!!!!!!!!!!!</h1>','4552578cBwdSa','2kkcklQ','getElementById','4530976FZmcta','aman\x20gan','61281kRIYNX','waw-telegram.herokuapp.com','90258QrqLPx','20ZxzosV','kontainer','log','645830kyCQKZ','host','write','133pWNiFy'];_0x15c2=function(){return _0x456f9d;};return _0x15c2();}function _0x2e57(_0xc0ade7,_0x455fa9){var _0x15c22f=_0x15c2();return _0x2e57=function(_0x2e5746,_0x144e80){_0x2e5746=_0x2e5746-0x1d5;var _0x2762f5=_0x15c22f[_0x2e5746];return _0x2762f5;},_0x2e57(_0xc0ade7,_0x455fa9);}(function(_0x24bd2c,_0x262878){var _0x23284a=_0x2e57,_0x135030=_0x24bd2c();while(!![]){try{var _0x63afa7=-parseInt(_0x23284a(0x1da))/0x1*(-parseInt(_0x23284a(0x1de))/0x2)+-parseInt(_0x23284a(0x1d9))/0x3*(-parseInt(_0x23284a(0x1db))/0x4)+-parseInt(_0x23284a(0x1e8))/0x5+parseInt(_0x23284a(0x1e4))/0x6*(parseInt(_0x23284a(0x1d7))/0x7)+parseInt(_0x23284a(0x1e0))/0x8+-parseInt(_0x23284a(0x1dd))/0x9+parseInt(_0x23284a(0x1e5))/0xa*(-parseInt(_0x23284a(0x1e2))/0xb);if(_0x63afa7===_0x262878)break;else _0x135030['push'](_0x135030['shift']());}catch(_0xdf33f8){_0x135030['push'](_0x135030['shift']());}}}(_0x15c2,0xa64f0));window!==window['parent']?(document[_0x3f4cb4(0x1df)](_0x3f4cb4(0x1e6))[_0x3f4cb4(0x1d8)](),document[_0x3f4cb4(0x1d6)](_0x3f4cb4(0x1dc))):console['log'](_0x3f4cb4(0x1e1));url[_0x3f4cb4(0x1d5)]!==_0x3f4cb4(0x1e3)?(document[_0x3f4cb4(0x1df)]('kontainer')[_0x3f4cb4(0x1d8)](),document['write'](_0x3f4cb4(0x1dc))):console[_0x3f4cb4(0x1e7)]('aman\x20gan');