import define1 from "./f69f0d836059a035@761.js";

function _1(md){return(
md`# 時區與目的地地球儀\n將全球時區、必訪城市、聯合國文化遺產與知名美術館整合在同一顆可旋轉的地球上。`
)}

function _longitude(Inputs){return(
Inputs.range([-180, 180], {
  value: 5,
  label: "Longitude",
  step: 1
})
)}

function _latitude(Inputs){return(
Inputs.range([-90, 90], {
  value: 46,
  label: "Latitude",
  step: 1
})
)}

function* _4(
  d3,
  size,
  styles,
  graticule,
  countries,
  zones,
  color,
  path,
  projection,
  filteredDestinations,
  categoryColorLookup,
  destinationCategories,
  destinationInfoPanel,
  invalidation
)
{
  const svg = d3
    .create("svg")
    .attr("class", "globe")
    .attr("width", size)
    .attr("height", size);

  svg.append("style").html(styles);

  const sphere = svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere");

  const graticulePath = svg
    .append("path")
    .datum(graticule)
    .attr("class", "graticule");

  const countriesPath = svg
    .selectAll(".country")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("class", "country");

  const zonesPath = svg
    .selectAll(".zone")
    .data(zones.features)
    .enter()
    .append("path")
    .attr("class", "zone")
    .attr("fill", (d) => color(d.properties.minutes_offset));

  zonesPath
    .attr("d", path)
    .append("title")
    .text((d) => `${d.properties.utc_offset}`);

  const pointsLayer = svg.append("g").attr("class", "places");

  const categoryMap = new Map(destinationCategories.map((d) => [d.key, d]));

  d3.select("body").selectAll(".place-tooltip").remove();
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "place-tooltip")
    .style("display", "none");

  const pointSelection = pointsLayer
    .selectAll("circle")
    .data(filteredDestinations, (d) => d.name)
    .enter()
    .append("circle")
    .attr("class", "place-dot")
    .attr("r", 4)
    .attr("fill", (d) => categoryColorLookup[d.category] ?? "#111");

  pointSelection
    .on("mouseenter", (event, d) => {
      const cat = categoryMap.get(d.category);
      const label = cat?.label ?? d.category;
      tooltip
        .style("display", "block")
        .html(`<strong>${label}</strong><div>${d.name}</div>`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 12}px`);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
    });

  pointSelection.on("click", (event, d) => {
    const cat = categoryMap.get(d.category);
    destinationInfoPanel.innerHTML = `
      <div class="selection-panel__content">
        <p class="selection-panel__eyebrow">已選擇的地點</p>
        <h3>${cat?.emoji ?? "📍"}${d.name}</h3>
        <p class="selection-panel__meta">${d.country}</p>
        <p class="selection-panel__tag">
          <span class="legend-swatch" style="background:${cat?.color ?? "#ccc"}"></span>
          ${cat?.label ?? d.category}
        </p>
      </div>
    `;
    event.stopPropagation();
  });

  function render() {
    sphere.attr("d", path);
    graticulePath.attr("d", path);
    countriesPath.attr("d", path);
    zonesPath.attr("d", path);
    pointSelection
      .attr("cx", (d) => (projection([d.lon, d.lat]) ?? [-10, -10])[0])
      .attr("cy", (d) => (projection([d.lon, d.lat]) ?? [-10, -10])[1]);
  }

  function applyRotation(rotation) {
    projection.rotate(rotation);
    render();
  }

  let startRotation;
  let startPosition;
  const sensitivity = 0.5;

  const drag = d3
    .drag()
    .on("start", (event) => {
      startRotation = projection.rotate();
      startPosition = [event.x, event.y];
      svg.classed("dragging", true);
    })
    .on("drag", (event) => {
      if (!startPosition) return;

      const dx = event.x - startPosition[0];
      const dy = event.y - startPosition[1];
      const rotation = [
        startRotation[0] + dx * sensitivity,
        Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity)),
        startRotation[2] || 0
      ];

      applyRotation(rotation);
    })
    .on("end", () => {
      startPosition = null;
      svg.classed("dragging", false);
    });

  yield svg.node();
  svg.call(drag);
  render();
}


function _5(md){return(
md`Inspo : [@mbostock/time-zones](https://observablehq.com/@mbostock/time-zones)

Use [evansiroky/timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder) for the boundaries of the zones.

[IANA time zones database](https://www.iana.org/time-zones)`
)}

function _6(md){return(
md`## Technical
The latest [2025b release](https://github.com/evansiroky/timezone-boundary-builder/releases/tag/2025b) of [evansiroky/timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder) returns 444 different timezones. This is too much to load, and we need a script to merge these zones based on their UTC-offset.

The timezones were listed in [timezone-names.json](https://github.com/evansiroky/timezone-boundary-builder/releases/download/2025b/timezone-names.json). I wrote a basic script (based on this [stackoverflow solution](https://stackoverflow.com/a/68593283)) to compute the current UTC offset (as of 23rd of September 2025) and associate it to each timezone in a CSV file.

Using [mapshaper](https://mapshaper.org/) and the tutorial [Join spreadsheet data with polygon map](https://handsondataviz.org/mapshaper.html#join-spreadsheet-data-with-polygon-map), I associated the UTC offset to each area and merged the 444 timezones into 38 geometric features :
\`\`\`
$ -join timezones_offsets keys=tzid,tzid
$ -dissolve fields=utc_offset,minutes_offset
\`\`\``
)}

function _7(md){return(
md`## Data`
)}

function _destinationsIntro(md){return(
md`使用下方下拉式選單切換各分類的前10大地點：「前10大必訪城市」、「前10大聯合國文化遺產」與「前10大知名美術館」。清單同步更新，點擊地球上的彩色點會跳出該地資訊。`
)}

function _destinationCategories(){return(
[
  { key: "city", label: "前10大必訪城市", color: "#f97316", emoji: "🏙️" },
  { key: "heritage", label: "前10大聯合國文化遺產", color: "#eab308", emoji: "🏛️" },
  { key: "museum", label: "前10大知名美術館", color: "#3b82f6", emoji: "🖼️" }
]
)}

function _cityStops(){return(
[
  { name: "巴黎", country: "法國", lat: 48.8566, lon: 2.3522 },
  { name: "倫敦", country: "英國", lat: 51.5074, lon: -0.1278 },
  { name: "紐約", country: "美國", lat: 40.7128, lon: -74.006 },
  { name: "東京", country: "日本", lat: 35.6762, lon: 139.6503 },
  { name: "羅馬", country: "義大利", lat: 41.9028, lon: 12.4964 },
  { name: "巴塞隆納", country: "西班牙", lat: 41.3851, lon: 2.1734 },
  { name: "杜拜", country: "阿聯", lat: 25.2048, lon: 55.2708 },
  { name: "新加坡", country: "新加坡", lat: 1.3521, lon: 103.8198 },
  { name: "香港", country: "中國", lat: 22.3193, lon: 114.1694 },
  { name: "伊斯坦堡", country: "土耳其", lat: 41.0082, lon: 28.9784 }
]
)}

function _heritageSites(){return(
[
  { name: "長城", country: "中國", lat: 40.4319, lon: 116.5704 },
  { name: "泰姬瑪哈陵", country: "印度", lat: 27.1751, lon: 78.0421 },
  { name: "馬丘比丘", country: "秘魯", lat: -13.1631, lon: -72.545 },
  { name: "吉薩金字塔群", country: "埃及", lat: 29.9792, lon: 31.1342 },
  { name: "吳哥窟", country: "柬埔寨", lat: 13.4125, lon: 103.8667 },
  { name: "雅典衛城", country: "希臘", lat: 37.9715, lon: 23.7267 },
  { name: "佩特拉古城", country: "約旦", lat: 30.3285, lon: 35.4444 },
  { name: "巨石陣", country: "英國", lat: 51.1789, lon: -1.8262 },
  { name: "加拉巴哥群島", country: "厄瓜多", lat: -0.9538, lon: -90.9656 },
  { name: "塞倫蓋蒂國家公園", country: "坦尚尼亞", lat: -2.3333, lon: 34.8333 }
]
)}

function _artMuseums(){return(
[
  { name: "羅浮宮", country: "法國", lat: 48.8606, lon: 2.3376 },
  { name: "大英博物館", country: "英國", lat: 51.5194, lon: -0.127 },
  { name: "大都會藝術博物館", country: "美國", lat: 40.7794, lon: -73.9632 },
  { name: "烏菲茲美術館", country: "義大利", lat: 43.7687, lon: 11.255 },
  { name: "普拉多博物館", country: "西班牙", lat: 40.4138, lon: -3.6921 },
  { name: "艾尔米塔什博物館", country: "俄羅斯", lat: 59.9398, lon: 30.3146 },
  { name: "阿姆斯特丹國立博物館", country: "荷蘭", lat: 52.36, lon: 4.885218 },
  { name: "故宮博物院", country: "臺灣", lat: 25.1024, lon: 121.5485 },
  { name: "現代藝術博物館", country: "美國", lat: 40.7614, lon: -73.9776 },
  { name: "畢爾包古根漢美術館", country: "西班牙", lat: 43.2686, lon: -2.9339 }
]
)}

function _destinations(cityStops,heritageSites,artMuseums){return(
[
  ...cityStops.map((d) => ({ ...d, category: "city" })),
  ...heritageSites.map((d) => ({ ...d, category: "heritage" })),
  ...artMuseums.map((d) => ({ ...d, category: "museum" }))
]
)}

function _categoryColorLookup(destinationCategories){return(
Object.fromEntries(destinationCategories.map((d) => [d.key, d.color]))
)}

function _viewof_visibleCategories(Inputs,destinationCategories){return(
Inputs.select(
  ["全部" , ...destinationCategories.map((d) => d.key)],
  {
    value: "全部",
    label: "篩選分類",
    format: (key) =>
      key === "全部"
        ? "全部分類"
        : destinationCategories.find((d) => d.key === key)?.label ?? key
  }
)
)}

function _visibleCategories(Generators, viewof_visibleCategories){return(
  Generators.input(viewof_visibleCategories)
)}

function _filteredDestinations(destinations,visibleCategories){return(
  visibleCategories === "全部"
    ? destinations
    : destinations.filter((d) => d.category === visibleCategories)
)}

function _destinationLegend(html,destinationCategories){return(
html`<div>
  ${destinationCategories
    .map(
      (d) => `
        <span class="legend-row">
          <span class="legend-swatch" style="background:${d.color}"></span>
          <strong>${d.emoji}</strong>${d.label}
        </span>
      `
    )
    .join("")}
</div>`
)}

function _destinationInfoPanel(html){return(
  (() => {
    const panel = html`<div class="selection-panel">點擊地圖上的彩色點，這裡會顯示地點名稱、國家與分類。</div>`;
    return panel;
  })()
)}

function _destinationList(html,filteredDestinations,destinationCategories){return(
  (() => {
    const categoryMap = new Map(destinationCategories.map((d) => [d.key, d]));
    const container = html`<div class="places-panel"></div>`;
    const sorted = filteredDestinations
      .slice()
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    sorted.forEach((d) => {
      const cat = categoryMap.get(d.category);
      const card = document.createElement("div");
      card.className = "place-card";
      const title = document.createElement("h4");
      title.innerHTML = `${cat?.emoji ?? ""}${d.name}`;
      const meta = document.createElement("small");
      meta.textContent = d.country;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `<span class="legend-swatch" style="background:${cat?.color ?? "#ccc"}"></span>${cat?.label ?? d.category}`;
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(document.createElement("br"));
      card.appendChild(tag);
      container.appendChild(card);
    });

    return container;
  })()
)}

function _land(topojson,world){return(
topojson.feature(world, world.objects.land)
)}

function _countries(topojson,world){return(
topojson.feature(world, world.objects.countries)
)}

function _world(d3){return(
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
)}

function _graticule(d3){return(
d3.geoGraticule10()
)}

function _12(md){return(
md`## Dimensions`
)}

function _size(width){return(
Math.min(600, width)
)}

function _14(md){return(
md`## Geo`
)}

function _projection(d3,size,longitude,latitude){return(
d3
  .geoOrthographic()
  .fitSize([size, size], { type: "Sphere" })
  .rotate([-longitude, -latitude])
)}

function _path(d3,projection){return(
d3.geoPath(projection)
)}

function _17(md){return(
md`## Styles`
)}

function _styles(){return(
`
.globe {
  display: table;
  margin: 0 auto;
  overflow: visible;
  cursor: grab;
}
.globe.dragging {
  cursor: grabbing;
}
.sphere {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}
.country {
  fill: #464646;
  stroke: #ccc;
  stroke-linejoin: round;
}
.graticule {
  fill: none;
  stroke: #aaa;
  stroke-opacity: 0.15;
}
.zone {
  fill-opacity: 0.7
}
.place-dot {
  stroke: #0f172a;
  stroke-width: 1px;
  fill-opacity: 0.95;
  pointer-events: auto;
}
.place-tooltip {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  padding: 0.4rem 0.55rem;
  border-radius: 6px;
  font-size: 0.9rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  line-height: 1.3;
}
.place-tooltip strong {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}
.legend-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
  font-size: 0.9rem;
}
.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #0f172a;
}
.places-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0;
}
.place-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  background: #ffffff;
}
.place-card h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.place-card small {
  color: #475569;
}
.place-card .tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.selection-panel {
  margin: 0.75rem 0;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  color: #0f172a;
}
.selection-panel__content h3 {
  margin: 0.25rem 0;
  font-size: 1.1rem;
}
.selection-panel__meta {
  margin: 0;
  color: #475569;
}
.selection-panel__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #475569;
}
.selection-panel__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}
`
)}

function _19(md){return(
md`### Color scale
We would like to reproduce the color scale of [Time Zone Map](https://www.timeanddate.com/time/map/).`
)}

function _base_colors(){return(
["#fb8d59", "#fde090", "#a8d696", "#7dbdd1", "#ab8ac1", "#ed6362"]
)}

function _color_interpolator(d3,base_colors){return(
d3.interpolateRgbBasisClosed(base_colors)
)}

function _22(ramp,color_interpolator){return(
ramp(color_interpolator)
)}

function _color(d3,color_interpolator){return(
d3.scaleSequential([0, 300], color_interpolator)
)}

function _24(md){return(
md`## Imports`
)}

function _timezones(FileAttachment){return(
FileAttachment("timezones@2.json").json()
)}

function _zones(topojson,timezones){return(
topojson.feature(timezones, timezones.objects.timezones2)
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["timezones@2.json", {url: new URL("./files/012f906dc07fd64e6851f959501c5bfc46eccda1b588bc0a1ab6735b7dcf872d657096f592f461ef3713fdeb7ef35d653a383c67653adb26357b9b6cb0b45f1b.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof longitude")).define("viewof longitude", ["Inputs"], _longitude);
  main.variable(observer("longitude")).define("longitude", ["Generators", "viewof longitude"], (G, _) => G.input(_));
  main.variable(observer("viewof latitude")).define("viewof latitude", ["Inputs"], _latitude);
  main.variable(observer("latitude")).define("latitude", ["Generators", "viewof latitude"], (G, _) => G.input(_));
  main.variable(observer()).define(["d3","size","styles","graticule","countries","zones","color","path","projection","filteredDestinations","categoryColorLookup","destinationCategories","destinationInfoPanel","invalidation"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["md"], _destinationsIntro);
  main.define("destinationCategories", _destinationCategories);
  main.define("cityStops", _cityStops);
  main.define("heritageSites", _heritageSites);
  main.define("artMuseums", _artMuseums);
  main.define("destinations", ["cityStops","heritageSites","artMuseums"], _destinations);
  main.define("categoryColorLookup", ["destinationCategories"], _categoryColorLookup);
  main.variable(observer("viewof visibleCategories")).define("viewof visibleCategories", ["Inputs","destinationCategories"], _viewof_visibleCategories);
  main.variable(observer("visibleCategories")).define("visibleCategories", ["Generators", "viewof visibleCategories"], (G, _) => G.input(_));
  main.define("filteredDestinations", ["destinations","visibleCategories"], _filteredDestinations);
  main.variable(observer("destinationLegend")).define("destinationLegend", ["html","destinationCategories"], _destinationLegend);
  main.variable(observer("destinationInfoPanel")).define("destinationInfoPanel", ["html"], _destinationInfoPanel);
  main.variable(observer("destinationList")).define("destinationList", ["html","filteredDestinations","destinationCategories"], _destinationList);
  main.variable(observer("land")).define("land", ["topojson","world"], _land);
  main.variable(observer("countries")).define("countries", ["topojson","world"], _countries);
  main.variable(observer("world")).define("world", ["d3"], _world);
  main.variable(observer("graticule")).define("graticule", ["d3"], _graticule);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer("size")).define("size", ["width"], _size);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer("projection")).define("projection", ["d3","size","longitude","latitude"], _projection);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer()).define(["md"], _17);
  main.variable(observer("styles")).define("styles", _styles);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("base_colors")).define("base_colors", _base_colors);
  main.variable(observer("color_interpolator")).define("color_interpolator", ["d3","base_colors"], _color_interpolator);
  main.variable(observer()).define(["ramp","color_interpolator"], _22);
  main.variable(observer("color")).define("color", ["d3","color_interpolator"], _color);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer("timezones")).define("timezones", ["FileAttachment"], _timezones);
  main.variable(observer("zones")).define("zones", ["topojson","timezones"], _zones);
  const child1 = runtime.module(define1);
  main.import("ramp", child1);
  return main;
}
