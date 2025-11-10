// Radial Chart - Cost of Attendance visualization
// Each spoke represents one school, rings represent years

const YEARS = [
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025"
];

const COLLEGES = [
  { key: "Harvard", short: "H" },
  { key: "Brown", short: "B" },
  { key: "Dartmouth", short: "Dar" },
  { key: "Princeton", short: "Pri" },
  { key: "Cornell", short: "Cor" },
  { key: "Penn", short: "Penn" },
  { key: "Columbia", short: "Col" },
  { key: "Yale", short: "Y" }
];

const INSTITUTION_MAP = {
  Harvard: ["Harvard"],
  Brown: ["Brown"],
  Dartmouth: ["Dartmouth"],
  Princeton: ["Princeton"],
  Cornell: ["Cornell"],
  Penn: ["Upenn"],
  Columbia: ["Columbia"],
  Yale: ["Yale"]
};

const CSV_PATH = "data/data.csv";

const radialContainer = d3.select("#radial-chart");

// Responsive sizing function
function getRadialDimensions() {
  const containerRect = radialContainer.node().getBoundingClientRect();
  const width = containerRect.width;
  const height = Math.max(containerRect.height, 400);
  const isMobile = width < 768;
  const margin = isMobile ? 20 : 36;
  const innerR = isMobile ? 30 : 40;
  const outerR = Math.min(width, height) / 2 - (isMobile ? 50 : 70);
  
  return { width, height, margin, innerR, outerR, isMobile };
}

let dimensions = getRadialDimensions();
let { width: radialContainerWidth, height: radialContainerHeight, innerR, outerR } = dimensions;

const radialSvg = radialContainer.append("svg")
  .attr("width", radialContainerWidth)
  .attr("height", radialContainerHeight)
  .attr("viewBox", `0 0 ${radialContainerWidth} ${radialContainerHeight}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const radialG = radialSvg.append("g")
  .attr("transform", `translate(${radialContainerWidth/2},${radialContainerHeight/2})`);

const radialRScale = d3.scalePoint()
  .domain(YEARS)
  .range([innerR, outerR]);

const ANGLE_FULL = 2 * Math.PI;
const angleArc = ANGLE_FULL * (COLLEGES.length - 1) / COLLEGES.length;
const radialAngleScale = d3.scalePoint()
  .domain(COLLEGES.map(d => d.key))
  .range([0, angleArc]);

const radialTooltip = d3.select("body").append("div")
  .attr("class", "radial-tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "white")
  .style("border", "1px solid #ddd")
  .style("border-radius", "8px")
  .style("padding", "8px 10px")
  .style("font-size", "12px")
  .style("box-shadow", "0 8px 24px rgba(0,0,0,0.08)")
  .style("z-index", "1000")
  .style("pointer-events", "none");

// Grid: rings
radialG.selectAll(".grid-circle")
  .data(YEARS)
  .join("circle")
  .attr("class", "grid-circle")
  .attr("r", d => radialRScale(d))
  .attr("fill", "none")
  .attr("stroke", "#f0f0f0")
  .attr("stroke-dasharray", "4 6");

radialG.selectAll(".ring-label")
  .data(YEARS)
  .join("text")
  .attr("class", "axis-label")
  .attr("text-anchor", "middle")
  .attr("y", d => -radialRScale(d) - 6)
  .attr("fill", "#777")
  .attr("font-size", "11px")
  .text(d => d);

// Spokes
radialG.selectAll(".grid-spoke")
  .data(COLLEGES)
  .join("line")
  .attr("class", "grid-spoke")
  .attr("x1", d => Math.cos(radialAngleScale(d.key)) * innerR)
  .attr("y1", d => Math.sin(radialAngleScale(d.key)) * innerR)
  .attr("x2", d => Math.cos(radialAngleScale(d.key)) * outerR)
  .attr("y2", d => Math.sin(radialAngleScale(d.key)) * outerR)
  .attr("stroke", "#e1e1e1");

// College labels
radialG.selectAll(".college-label")
  .data(COLLEGES)
  .join("text")
  .attr("class", "college-label")
  .attr("text-anchor", d => {
    const a = radialAngleScale(d.key);
    if (Math.cos(a) > 0.3) return "start";
    if (Math.cos(a) < -0.3) return "end";
    return "middle";
  })
  .attr("x", d => Math.cos(radialAngleScale(d.key)) * (outerR + 14))
  .attr("y", d => Math.sin(radialAngleScale(d.key)) * (outerR + 14))
  .attr("fill", "#111")
  .attr("font-weight", "600")
  .attr("font-size", "12px")
  .text(d => d.short);

// Center label
radialG.append("text")
  .attr("class", "center-text")
  .attr("text-anchor", "middle")
  .attr("y", 6)
  .attr("fill", "#444")
  .attr("font-weight", "700")
  .attr("font-size", "14px")
  .text("IVY");

// Load and render
d3.csv(CSV_PATH).then(raw => {
  function normalizeYearString(s) {
    if (!s) return '';
    const t = String(s).trim();
    if (/^\d{4}-\d{4}$/.test(t)) return t;
    const m = t.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const y1 = m[1];
      const y2 = m[2];
      const y1prefix = y1.slice(0, 2);
      return `${y1}-${y1prefix}${y2}`;
    }
    return t;
  }

  const data = COLLEGES.map(c => {
    const values = YEARS.map(y => {
      const candidates = INSTITUTION_MAP[c.key] || [];
      const row = raw.find(r => r.Institution && r.CDS_Year &&
        candidates.includes(r.Institution.trim()) && normalizeYearString(r.CDS_Year) === y);
      let cost = null;
      if (row && row.StickerCOA) {
        const cleaned = String(row.StickerCOA).replace(/\s+/g, '').replace(/,/g, '');
        const n = +cleaned;
        cost = Number.isFinite(n) ? n : null;
      }
      return { year: y, cost };
    });
    return { college: c.key, values };
  });

  const allCosts = data.flatMap(d => d.values.map(v => v.cost).filter(c => Number.isFinite(c)));
  const costExtent = d3.extent(allCosts.length ? allCosts : [0, 1]);
  const radialColor = d3.scaleSequential(d3.interpolateTurbo).domain(costExtent);
  const radialSize = d3.scaleSqrt().domain(costExtent).range([3, 9]);

  const lineRadial = d3.lineRadial()
    .curve(d3.curveCardinal.tension(0.4))
    .angle(d => radialAngleScale(d.college))
    .radius(d => (d.rpos != null ? d.rpos : radialRScale(d.year)));

  const collegeColor = d3.scaleOrdinal()
    .domain(COLLEGES.map(d => d.key))
    .range(d3.schemeTableau10);

  const college = radialG.selectAll(".college")
    .data(data)
    .join("g")
    .attr("class", "college");

  college.append("path")
    .attr("class", "path-college")
    .attr("stroke", d => collegeColor(d.college))
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("opacity", 0.95)
    .attr("stroke-linecap", "round")
    .attr("d", d => {
      const pts = d.values.map(v => ({ ...v, rpos: radialRScale(v.year), college: d.college }))
                     .filter(p => Number.isFinite(p.rpos));
      return pts.length ? lineRadial(pts) : '';
    });

  radialG.selectAll('.path-college')
    .on('mouseenter', function (event, d) {
      d3.select(this.parentNode).raise();
      d3.select(this)
        .transition().duration(140)
        .attr('stroke-width', 3.6)
        .attr('opacity', 1);
      radialG.selectAll('.path-college').filter(p => p.college !== d.college)
        .transition().duration(140)
        .attr('opacity', 0.4);
    })
    .on('mouseleave', function (event, d) {
      d3.select(this)
        .transition().duration(140)
        .attr('stroke-width', 2)
        .attr('opacity', 0.95);
      radialG.selectAll('.path-college').filter(p => p.college !== d.college)
        .transition().duration(140)
        .attr('opacity', 0.95);
    });

  college.selectAll(".dot")
    .data(d => d.values
      .filter(v => Number.isFinite(v.cost))
      .map(v => ({ ...v, college: d.college })))
    .join("circle")
    .attr("class", "dot")
    .attr("cx", d => Math.cos(radialAngleScale(d.college)) * radialRScale(d.year))
    .attr("cy", d => Math.sin(radialAngleScale(d.college)) * radialRScale(d.year))
    .attr("r", d => radialSize(d.cost))
    .attr("fill", d => radialColor(d.cost))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).classed('dot--hover', true);
      radialTooltip
        .style("visibility", "visible")
        .html(`<strong>${d.college}</strong><br/>Year: ${d.year}<br/>Cost: ${d.cost != null ? ('$' + (d.cost/1000).toFixed(2) + 'K') : 'n/a'}`);
    })
    .on("mousemove", function (event) {
      radialTooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top",  `${event.pageY - 20}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).classed('dot--hover', false);
      radialTooltip.style("visibility", "hidden");
    });

}).catch(err => {
  console.error('Failed to load CSV', err);
});
