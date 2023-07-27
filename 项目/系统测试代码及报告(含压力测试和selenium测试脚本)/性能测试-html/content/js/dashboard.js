/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8604444444444445, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8494444444444444, 500, 1500, "SearchByName"], "isController": false}, {"data": [0.8805555555555555, 500, 1500, "getCommodityInfo"], "isController": false}, {"data": [0.875, 500, 1500, "AddEvaluation"], "isController": false}, {"data": [0.8083333333333333, 500, 1500, "AddList"], "isController": false}, {"data": [0.8583333333333333, 500, 1500, "WishListRemove"], "isController": false}, {"data": [0.8761111111111111, 500, 1500, "ShoppingCartRemove"], "isController": false}, {"data": [0.8227777777777778, 500, 1500, "AddShoppingCart"], "isController": false}, {"data": [0.8816666666666667, 500, 1500, "Login"], "isController": false}, {"data": [0.8905555555555555, 500, 1500, "AddToGameLibrary "], "isController": false}, {"data": [0.8616666666666667, 500, 1500, "CommodityInfo"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9000, 0, 0.0, 386.909333333333, 16, 4701, 221.0, 957.0, 1302.949999999999, 2140.99, 573.577209865528, 262.494411107482, 115.05152236951118], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SearchByName", 900, 0, 0.0, 406.92888888888905, 26, 3351, 244.5, 960.1999999999998, 1311.3999999999978, 2348.7700000000004, 58.22981366459627, 31.332643876164596, 10.121979328416149], "isController": false}, {"data": ["getCommodityInfo", 900, 0, 0.0, 363.2466666666667, 25, 3574, 206.0, 909.2999999999998, 1178.85, 2013.880000000001, 58.214747736093145, 59.40860486739974, 10.289911465071151], "isController": false}, {"data": ["AddEvaluation", 900, 0, 0.0, 358.56111111111113, 23, 3405, 190.0, 826.6999999999999, 1258.8499999999972, 2051.5000000000014, 58.40363400389358, 17.908926833225177, 16.59712646009085], "isController": false}, {"data": ["AddList", 900, 0, 0.0, 484.66999999999996, 16, 3426, 287.0, 1174.1999999999998, 1595.4499999999994, 2475.7400000000002, 58.39226626873418, 17.882378106144163, 10.663431437747356], "isController": false}, {"data": ["WishListRemove", 900, 0, 0.0, 382.68333333333294, 17, 2596, 230.5, 946.5999999999999, 1216.9499999999998, 1996.810000000001, 58.430175939752, 15.15196664205025, 10.898597270012335], "isController": false}, {"data": ["ShoppingCartRemove", 900, 0, 0.0, 362.1199999999996, 18, 3473, 216.5, 820.8, 1190.7999999999997, 1769.97, 58.339275296557986, 15.127888097977571, 11.337417757827186], "isController": false}, {"data": ["AddShoppingCart", 900, 0, 0.0, 451.28000000000003, 17, 3921, 262.0, 1112.4999999999995, 1518.4999999999993, 2366.8900000000012, 58.2448873932177, 17.781185789056433, 11.091555704763138], "isController": false}, {"data": ["Login", 900, 0, 0.0, 342.3344444444449, 22, 2860, 192.5, 805.9, 1145.5999999999995, 2031.4400000000014, 58.32793259883344, 14.9807092514582, 14.752865764744005], "isController": false}, {"data": ["AddToGameLibrary ", 900, 0, 0.0, 326.43444444444486, 18, 4701, 177.0, 801.1999999999998, 1111.299999999999, 1822.1200000000017, 58.65102639296188, 17.812958211143695, 10.997067448680351], "isController": false}, {"data": ["CommodityInfo", 900, 0, 0.0, 390.83444444444467, 25, 3074, 211.0, 1010.6999999999999, 1359.4499999999994, 2170.96, 58.97385492431689, 60.18327968350698, 10.424089591114607], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
