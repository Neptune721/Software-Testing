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

    var data = {"OkPercent": 99.99166666666666, "KoPercent": 0.008333333333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.26918333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.27666666666666667, 500, 1500, "SearchByName"], "isController": false}, {"data": [0.26966666666666667, 500, 1500, "getCommodityInfo"], "isController": false}, {"data": [0.2955833333333333, 500, 1500, "AddEvaluation"], "isController": false}, {"data": [0.213, 500, 1500, "AddList"], "isController": false}, {"data": [0.30241666666666667, 500, 1500, "WishListRemove"], "isController": false}, {"data": [0.29025, 500, 1500, "ShoppingCartRemove"], "isController": false}, {"data": [0.19766666666666666, 500, 1500, "AddShoppingCart"], "isController": false}, {"data": [0.29733333333333334, 500, 1500, "Login"], "isController": false}, {"data": [0.2846666666666667, 500, 1500, "AddToGameLibrary "], "isController": false}, {"data": [0.26458333333333334, 500, 1500, "CommodityInfo"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 60000, 5, 0.008333333333333333, 1529.9044333333384, 20, 21062, 1591.0, 2273.0, 2575.0, 3312.0, 380.36553127555584, 174.08479744346818, 76.2907701827498], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SearchByName", 6000, 0, 0.0, 1491.2324999999973, 29, 5227, 1470.0, 2058.9000000000005, 2334.95, 3125.9699999999993, 38.587194196485996, 20.763226564710727, 6.707539616186042], "isController": false}, {"data": ["getCommodityInfo", 6000, 0, 0.0, 1496.8493333333322, 30, 5543, 1473.0, 2052.9000000000005, 2329.8499999999995, 3047.949999999999, 39.44487906857493, 40.253807252598435, 6.972190538488341], "isController": false}, {"data": ["AddEvaluation", 6000, 2, 0.03333333333333333, 1477.2326666666665, 79, 21060, 1457.0, 2041.9000000000005, 2373.8999999999996, 3105.99, 38.2687229727144, 11.763334557135204, 10.871568670831579], "isController": false}, {"data": ["AddList", 6000, 0, 0.0, 1673.309833333335, 21, 8477, 1619.5, 2444.0, 2770.8499999999995, 3613.5699999999906, 39.895739135060374, 12.181518496246476, 7.285647674078408], "isController": false}, {"data": ["WishListRemove", 6000, 2, 0.03333333333333333, 1436.4431666666667, 20, 7042, 1431.0, 2007.9000000000005, 2268.95, 2958.9799999999996, 40.14237161131479, 10.412071375645624, 7.48749314234485], "isController": false}, {"data": ["ShoppingCartRemove", 6000, 0, 0.0, 1463.630000000003, 22, 8772, 1442.5, 2004.0, 2284.95, 2997.99, 39.718790960003176, 10.300923627384782, 7.718788477578742], "isController": false}, {"data": ["AddShoppingCart", 6000, 0, 0.0, 1705.0554999999993, 27, 8138, 1636.0, 2485.0, 2786.8999999999996, 3535.869999999997, 39.583058450982975, 12.084693571463912, 7.537789451114922], "isController": false}, {"data": ["Login", 6000, 1, 0.016666666666666666, 1462.8475000000067, 29, 21062, 1453.5, 2021.0, 2301.0, 3040.949999999999, 38.379612749707356, 9.871918536873213, 9.705725568577972], "isController": false}, {"data": ["AddToGameLibrary ", 6000, 0, 0.0, 1518.9516666666657, 55, 12833, 1455.0, 2151.0, 2503.95, 3595.8399999999965, 38.29705750941469, 11.631235239675753, 7.180698283015255], "isController": false}, {"data": ["CommodityInfo", 6000, 0, 0.0, 1573.4921666666714, 58, 8970, 1486.0, 2244.9000000000005, 2678.8999999999996, 4032.409999999987, 38.16648219533605, 38.9491932559826, 6.7462239036678], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 2, 40.0, 0.0033333333333333335], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 124.70.163.146:8080 [/124.70.163.146] failed: Connection timed out: connect", 3, 60.0, 0.005], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 60000, 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 124.70.163.146:8080 [/124.70.163.146] failed: Connection timed out: connect", 3, "500", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["AddEvaluation", 6000, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 124.70.163.146:8080 [/124.70.163.146] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["WishListRemove", 6000, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 6000, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 124.70.163.146:8080 [/124.70.163.146] failed: Connection timed out: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
