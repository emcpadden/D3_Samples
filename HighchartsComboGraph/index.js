$(function () {
    var detailChart;

    $(document).ready(function () {

    // gauge chart
    var gaugeOptions = {
        chart: {
            type: 'solidgauge'
        },
        title: null,
        credits: {
            enabled: false
        },
        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },
        tooltip: {
            enabled: false
        },
        exporting: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.25, '#DDDF0D'], // yellow
                [0.7, '#55BF3B'], // green
                [0.9, '#297317'] // red
            ],
            min: 0,
            max: 42,
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                enabled: false,
                text: 'Received',
                y: -30
            },
            labels: {
                enabled: false,
                y: 16
            }
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        },
        series: [{
            name: 'Speed',
            data: [32],
            dataLabels: {
                y: 5,
                format: '<div class="mx-gauge__info"><div class="mx-gauge__info__value">{y}</div>' +
                       '<div class="mx-gauge__info__label">received</div></div>'
            }
        }]        
    }
    $('#billsReceivedContainer').highcharts(gaugeOptions);

    $('#billGraphContainer').highcharts({
        chart: {
            alignTicks: false,
            zoomType: "x",
            resetZoomButton: {
                relativeTo: "chart",
                position: {
                    align: 'right', // by default
                    verticalAlign: 'top', // by default
                    x: -40,
                    y: 10
                },
                theme: {
                    fill: 'white',
                    stroke: 'silver',
                    r: 0,
                    states: {
                        hover: {
                            fill: '#41739D',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }            
            }        
        },
        title: {
            text: "Invoices"
        },
        subtitle: {
            text: "Invoice Count vs. Staff Count"
        },
        exporting: {
            enabled: false
        },
        xAxis: [{
            categories: [
                '1-Dec', '2-Dec', '3-Dec', '4-Dec', '5-Dec', 
                '6-Dec', '7-Dec', '8-Dec', '9-Dec', '10-Dec', 
                '11-Dec', '12-Dec', '13-Dec', '14-Dec', '15-Dec', 
                '16-Dec', '17-Dec', '18-Dec', '19-Dec', '20-Dec', 
                '21-Dec', '22-Dec', '23-Dec', '24-Dec', '25-Dec', 
                '26-Dec', '27-Dec', '28-Dec', '29-Dec', '30-Dec']
        }],    
        yAxis: [
            { 
                allowDecimals: false,
                maxPadding: 0.005,
                title: {
                    text: 'Invoice Count',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            },
            { 
                allowDecimals: false,
                maxPadding: 0.0005,
                gridLineWidth: 0,
                title: {
                    text: 'Staff Count',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }
        ], 
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<p>{point.key}</p><table style="font-size: 12px;">',
            pointFormat: '<tr><td style="color: {series.color}; white-space: nowrap;">{series.name}: </td><td style="text-align: right"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>'
        },
        plotOptions: {
            areaspline: {
                trackByArea: true,
                marker: {
                    states: {
                        select: {
                            radius: 8,
                            lineWidth: 2,
                            lineColor: '#000',
                            fillColor: Highcharts.getOptions().colors[0]
                        }
                    }
                },
                point: {
                    events: {
                        select: function (e) {
                            console.log("AREA... select" + " category: " + this.category + " index: " + this.index);
                        }
                    }
                },
                cursor: 'pointer'
            },
            column: {
                point: {
                    events: {
                        select: function (e) {
                            console.log("BAR... select" + " category: " + this.category + " index: " + this.index);
                        }
                    }
                },
                cursor: 'pointer',
            }
        },
        series: [
            {
                name: '# of Invoices',
                index: 1,
                allowPointSelect: true,
                type: 'areaspline',
                data: numberOfInvoices
            },
            {
                name: 'Staff Count',
                index: 0,
                yAxis: 1,
                allowPointSelect: true,
                type: 'column',
                data: staffCount
            }
        ]
    });    

 // the button action
    $('#getSelectedButton').click(function () {
        var chart = $('#billGraphContainer').highcharts();
        var selectedPoints = chart.getSelectedPoints();
        alert('You selected ' + selectedPoints.length + ' points');
    });

// BILL GRAPH
/*
    $('#billGraphContainer').highcharts({
        title: {
            text: "Bills"
        },
        subtitle: {
            text: "Expected Qty and Value"
        },
        xAxis: [{
            categories: [
                '1-Dec', '2-Dec', '3-Dec', '4-Dec', '5-Dec', 
                '6-Dec', '7-Dec', '8-Dec', '9-Dec', '10-Dec', 
                '11-Dec', '12-Dec', '13-Dec', '14-Dec', '15-Dec', 
                '16-Dec', '17-Dec', '18-Dec', '19-Dec', '20-Dec', 
                '21-Dec', '22-Dec', '23-Dec', '24-Dec', '25-Dec', 
                '26-Dec', '27-Dec', '28-Dec', '29-Dec', '30-Dec']
        }],    
        yAxis: [
        { // Secondary yAxis
            title: {
                text: 'Staff Count',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        },
        { // Primary yAxis
            title: {
                text: '# of Invoices',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }
        ],   
        tooltip: {
            shared: true
        },
        series: [
            {
                name: 'Staff Count',
                yAxis: 1,
                type: 'column',
                data: staffCount
            },
            {
                name: '# of Invoices',
                type: 'areaspline',
                data: numberOfInvoices,
                tooltip: {
                    valuePrefix: ''
                }
            }
        ]
    });    
*/

// MASTER DETAIL EXAMPLE
        // create the detail chart
        function createDetail(masterChart) {

            // prepare the detail chart
            var detailData = [],
                detailStart = Date.UTC(2014, 0, 1);

            $.each(masterChart.series[0].data, function () {
                if (this.x >= detailStart) {
                    detailData.push(this.y);
                }
            });

            // create a detail chart referenced by a global variable
            detailChart = $('#detail-container').highcharts({
                chart: {
                    marginBottom: 120,
                    reflow: false,
                    marginLeft: 50,
                    marginRight: 20,
                    style: {
                        position: 'absolute'
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Historical USD to EUR Exchange Rate'
                },
                subtitle: {
                    text: 'Select an area by dragging across the lower chart'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    maxZoom: 0.1
                },
                tooltip: {
                    formatter: function () {
                        var point = this.points[0];
                        return '<b>' + point.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%A %B %e %Y', this.x) + ':<br/>' +
                            '1 USD = ' + Highcharts.numberFormat(point.y, 2) + ' EUR';
                    },
                    shared: true
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    radius: 3
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: 'USD to EUR',
                    pointStart: detailStart,
                    pointInterval: 24 * 3600 * 1000,
                    data: detailData
                }],

                exporting: {
                    enabled: false
                }

            }).highcharts(); // return chart
        }

        // create the master chart
        function createMaster() {
            $('#master-container').highcharts({
                chart: {
                    reflow: false,
                    borderWidth: 0,
                    backgroundColor: null,
                    marginLeft: 50,
                    marginRight: 20,
                    zoomType: 'x',
                    events: {

                        // listen to the selection event on the master chart to update the
                        // extremes of the detail chart
                        selection: function (event) {
                            var extremesObject = event.xAxis[0],
                                min = extremesObject.min,
                                max = extremesObject.max,
                                detailData = [],
                                xAxis = this.xAxis[0];

                            // reverse engineer the last part of the data
                            $.each(this.series[0].data, function () {
                                if (this.x > min && this.x < max) {
                                    detailData.push([this.x, this.y]);
                                }
                            });

                            // move the plot bands to reflect the new detail span
                            xAxis.removePlotBand('mask-before');
                            xAxis.addPlotBand({
                                id: 'mask-before',
                                from: Date.UTC(2006, 0, 1),
                                to: min,
                                color: 'rgba(0, 0, 0, 0.2)'
                            });

                            xAxis.removePlotBand('mask-after');
                            xAxis.addPlotBand({
                                id: 'mask-after',
                                from: max,
                                to: Date.UTC(2008, 11, 31),
                                color: 'rgba(0, 0, 0, 0.2)'
                            });


                            detailChart.series[0].setData(detailData);

                            return false;
                        }
                    }
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    showLastTickLabel: true,
                    minRange: 14 * 24 * 3600000, // fourteen days
                    plotBands: [{
                        id: 'mask-before',
                        from: Date.UTC(2014, 0, 1),
                        to: Date.UTC(2014, 0, 30),
                        color: 'rgba(0, 0, 0, 0.2)'
                    }],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    gridLineWidth: 0,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    min: 0.6,
                    showFirstLabel: false
                },
                tooltip: {
                    formatter: function () {
                        return false;
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        fillColor: {
                            linearGradient: [0, 0, 0, 70],
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, 'rgba(255,255,255,0)']
                            ]
                        },
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        },
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        enableMouseTracking: false
                    }
                },

                series: [{
                    type: 'area',
                    name: 'USD to EUR',
                    pointInterval: 60 * 1000 * 60 * 24,//24 * 3600 * 1000,
                    pointStart: Date.UTC(2014, 0, 1),
                    data: data
                }],

                exporting: {
                    enabled: false
                }

            }, function (masterChart) {
                createDetail(masterChart);
            }).highcharts(); // return chart instance
        }

        function resize() {
            createMaster();   
        }

        window.onresize = resize;

        // make the container smaller and add a second container for the master chart
        var $masterDetailContainer = $('#masterDetailContainer')
            .css('position', 'relative');

        $('<div id="detail-container">')
            .appendTo($masterDetailContainer);

        $('<div id="master-container">')
            .css({ position: 'absolute', top: 300, height: 100, width: '100%' })
            .appendTo($masterDetailContainer);

        // create master and in its callback, create the detail chart
        createMaster();
    });

});