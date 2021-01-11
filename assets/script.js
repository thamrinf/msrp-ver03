// INITIAL MAP ON DIV
const map = L.map("map", {
  //map is a global variable
  center: [-2.03618339014499954, 117.92711693632814],
  zoom: 4.1,
  zoomDelta: 0.5,
  zoomSnap: 0,
  zoomControl: false,
  layerControl: false,
  attributionControl: true,
  minZoom: 2,
  scrollWheelZoom: false,
  maxZoom: 15,
});
let CartoDB_Positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }
);
CartoDB_Positron.addTo(map);
// END OF INITIAL MAP ON DIV

const FF = {
  humReads: d3.format(","),
};
// GLOBAL VARIABLE
let LOCATION_MSRP = 0;
let FUNDING_MSRP = 0;
let GEOJSON = 0;
let TOTAL_PROVINCE_COUNT = [];
let CP = 0;
let BASE_TABLE_GROUP = { org: [], group: [] };
// END OF GLOBAL VARIABLE

function drawMap() {
  CP.forEach(function (d, i) {
    let nmprv = d["Features Properties Provinsi"].toUpperCase();
    if (TOTAL_PROVINCE_COUNT[nmprv]) {
      let act = "activity";
      if (TOTAL_PROVINCE_COUNT[nmprv] > 1) {
        act = "activities";
      }
      let radius = TOTAL_PROVINCE_COUNT[nmprv];
      if (radius < 5) {
        radius = 5;
      }
      L.circleMarker([d["Latitude"], d["Longitude"]], {
        radius: radius,
        fill: "#20BFB3",
        weight: 1,
        fillOpacity: 0.4,
        color: "#20BFB3",
      })
        .bindPopup(
          "<b>" + nmprv + "</b>: " + TOTAL_PROVINCE_COUNT[nmprv] + " " + act
        )
        .on("mouseover", function () {
          this.openPopup();
        })
        .on("mouseout", function () {
          this.closePopup();
        })
        .addTo(map);
    }
  });
}

function drawBaseTable() {
  let thead = "<thead class='fs-07'><tr><th>Agency</th>";
  BASE_TABLE_GROUP.group.forEach(function (c) {
    thead += "<th>" + c + "</th>";
  });
  thead += "</tr></thead>";
  $("#tablevis").append(thead);

  let tbody = "<tbody class='fs-06'>";
  BASE_TABLE_GROUP.org.forEach(function (o) {
    tbody += "<tr>";
    tbody += "<td>" + o + "</td>";
    oname = o.toLowerCase().split(" ").join("");
    BASE_TABLE_GROUP.group.forEach(function (td) {
      tdnmae = td.toLowerCase().split(" ").join("");
      tbody += "<td class='" + oname + "_" + tdnmae + "'></td>";
    });
    tbody += "</tr>";
  });
  tbody += "</tbody>";
  $("#tablevis").append(tbody);
}

function drawTableGroup() {
  LOCATION_MSRP.forEach(function (d) {
    oname = d["Agency"].toLowerCase().split(" ").join("");
    tdnmae = d["Pillar"].toLowerCase().split(" ").join("");
    $("." + oname + "_" + tdnmae).append(
      "<i class='fas fa-square grcol pd-1 tooltiptablevis' attr-pillar='" +
        d["Pillar"] +
        "' attr-agency='" +
        d["Agency"] +
        "' attr-indicator='" +
        d["MSRP Indicator"] +
        "'></i>"
    );
  });
  $(".tooltiptablevis").on("mouseover", function () {
    $("#our_tooltip").html(
      "Agency: <b class='fw-500'>" +
        $(this).attr("attr-agency") +
        "</b><br/>" +
        "Pillar: <b class='fw-500'>" +
        $(this).attr("attr-pillar") +
        "</b><br/>" +
        "MSRP Indicator: <b class='fw-500'>" +
        $(this).attr("attr-indicator") +
        "</b>"
    );
    $("#our_tooltip").show();
  });
  $(".tooltiptablevis").on("mouseout", function () {
    $("#our_tooltip").hide();
  });
}

function fundingPreparation() {
  let categoriesBarAll = [];
  let seriesBarAll = [
    { name: "Funding received", data: [] },
    { name: "Funding still needed/plan", data: [] },
  ];
  FUNDING_MSRP.sort(function (a, b) {
    return parseInt(a.Funding_received) + parseInt(a.Funding_needed) >
      parseInt(b.Funding_received) + parseInt(b.Funding_needed)
      ? -1
      : 1;
  });
  let percentMSRP = 0;
  let totalRequirementsMSRP = 0;
  let totalFundingMSRP = 0;
  let totalNeedMSRP = 0;
  let totalNum = 0;

  FUNDING_MSRP.forEach(function (d) {
    percentMSRP += parseFloat(d["Funding_percentage"]);
    totalRequirementsMSRP += parseInt(d["Resource_requirements"]);
    totalFundingMSRP += parseInt(d["Funding_received"]);
    totalNeedMSRP += parseInt(d["Funding_needed"]);
    totalNum++;

    categoriesBarAll.push(d["Priority_area"]);
    seriesBarAll[0].data.push(d["Funding_received"]);
    seriesBarAll[1].data.push(d["Funding_needed"]);
  });
  percentMSRP = percentMSRP / totalNum;
  $("#percentMSRP").html("$" + percentMSRP.toFixed(2));
  $("#totalRequirementsMSRP").html("$" + FF.humReads(totalRequirementsMSRP));
  $("#totalFundingMSRP").html("$" + FF.humReads(totalFundingMSRP));
  $("#totalNeedMSRP").html("$" + FF.humReads(totalNeedMSRP));

  drawBarFunding(seriesBarAll, categoriesBarAll, "barchart-funding");

  FUNDING_MSRP.forEach(function (d, i) {
    $("#blocksingle").append(
      '<div class="col-sm-3"> <div class="row"> <div class="col-md-12 text-left fs-09 fw-700" style="height: 25px" id="title-stacksingle' +
        i +
        '" ></div><div class="col-md-7 p-0" id="stacksingle' +
        i +
        '"></div><div class="col-md-5 p-0"> <table style="height: 70%; margin-left: -25px;"> <tr> <td style="vertical-align: bottom"> <span class="fs-08 fw-300" >Total requirements</span > <span id="sum-stacksingle' +
        i +
        '" class="fw-700 fs-09" ></span> </td></tr></table> </div></div></div>'
    );

    let fr = (
      (parseInt(d["Funding_received"]) /
        (parseInt(d["Funding_received"]) + parseInt(d["Funding_needed"]))) *
      100
    ).toFixed(2);
    let fn = (100 - fr).toFixed(2);
    drawSingleStackBar(
      [
        { name: "Funding received", data: [fr] },
        { name: "Funding still needed/plan", data: [fn] },
      ],
      d["Priority_area"],
      "$" + FF.humReads(d["Resource_requirements"]),
      "stacksingle" + i
    );
  });
}

function drawSingleStackBar(series, title, requirement, id) {
  $("#title-" + id).html(title);
  $("#sum-" + id).html(requirement);
  var options = {
    series: series,
    chart: {
      type: "bar",
      height: 230,
      width: "100%",
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      offsetY: -25,
      offsetX: -15,
    },
    colors: ["#77b7b2", "#cdcecd"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
      },
    },
    title: {
      text: undefined,
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return val + "%";
      },
      style: {
        colors: ["#434343"],
      },
    },
    xaxis: {
      type: "category",
      categories: ["Health"],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      lines: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      lines: {
        show: false,
      },
    },
    tooltip: {
      y: {
        formatter: function (val, opts) {
          return val + "%";
        },
      },
    },
  };

  var chart = new ApexCharts(document.querySelector("#" + id), options);
  chart.render();
}
function drawBarFunding(series, categories, id) {
  var options = {
    series: series,
    chart: {
      type: "bar",
      height: 480,
      width: "100%",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: ["#77b7b2", "#cdcecd"],
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: undefined,
      align: "left",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily: undefined,
        color: "#263238",
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      lines: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    yaxis: {
      labels: {
        show: true,
      },
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + FF.humReads(val);
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: false,
    },
  };

  var chart = new ApexCharts(document.querySelector("#" + id), options);
  chart.render();
}

async function init() {
  await d3.json("assets/json/indonesia-adm-1.geojson").then(function (data) {
    GEOJSON = data;
  });
  await d3.csv("assets/csv/center-point_province.csv").then(function (data) {
    CP = data;
  });
  await d3.csv("assets/csv/location-msrp.csv").then(function (data) {
    LOCATION_MSRP = data;
    data.forEach(function (d, i) {
      let tempat = d["Province"].toUpperCase();
      if (TOTAL_PROVINCE_COUNT[tempat]) {
        TOTAL_PROVINCE_COUNT[tempat] += 1;
      } else {
        TOTAL_PROVINCE_COUNT[tempat] = 1;
      }

      if (!BASE_TABLE_GROUP.group.includes(d["Pillar"])) {
        if (d["Pillar"] != "") {
          BASE_TABLE_GROUP.group.push(d["Pillar"]);
        }
      }
      if (!BASE_TABLE_GROUP.org.includes(d["Agency"])) {
        if (d["Agency"] != "") {
          BASE_TABLE_GROUP.org.push(d["Agency"]);
        }
      }
    });
    BASE_TABLE_GROUP.org.sort();
  });
  await d3.csv("assets/csv/fundingv2-msrp.csv").then(function (data) {
    FUNDING_MSRP = data;
  });

  drawMap();
  drawBaseTable();
  drawTableGroup();
  fundingPreparation();
}

init();
