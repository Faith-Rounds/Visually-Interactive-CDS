// ---------- CONFIG ----------
// Use the CDS_Year strings found in data.csv

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

// Explicit mapping to exact Institution strings found in data/data.csv
// Use arrays for keys like Columbia which have multiple exact strings across years
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

// We'll fetch the CSV and build the `data` structure from the rows.
// CSV path is relative to this file when served from index.html
const CSV_PATH = "data/data.csv";

// Global variables for year selection
let allRawData = null;  // Store all CSV data
let currentYear = '2024-2025';  // Default selected year
let data = null;  // Will store processed data
let color = null;  // Will store color scale
let size = null;  // Will store size scale

// ---------- SCAFFOLD ----------
const container = d3.select("#radial-chart");

// Responsive sizing function
function getRadialDimensions() {
  const containerRect = container.node().getBoundingClientRect();
  const width = containerRect.width;
  const isMobile = width < 768;
  const isSmallMobile = width < 480;
  
  // Set height based on screen size to maintain aspect ratio
  const height = isMobile ? (isSmallMobile ? 450 : 550) : Math.max(containerRect.height, 680);
  const margin = isSmallMobile ? 15 : (isMobile ? 20 : 36);
  const innerR = isSmallMobile ? 25 : (isMobile ? 35 : 40);
  const outerR = Math.min(width, height) / 2 - (isSmallMobile ? 40 : (isMobile ? 55 : 70));
  
  return { width, height, margin, innerR, outerR, isMobile, isSmallMobile };
}

let dimensions = getRadialDimensions();
let { width, height, innerR, outerR } = dimensions;

const svg = container.append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("max-height", `${height}px`);

const g = svg.append("g")
  .attr("transform", `translate(${width/2},${height/2})`);

// Years are concentric rings (categorical → evenly spaced radii)
const r = d3.scalePoint()
  .domain(YEARS)
  .range([innerR, outerR]);

// Fixed radius for single year display (middle of the range)
const singleYearRadius = (innerR + outerR) / 2;

// Colleges are spokes (angles)
// Avoid placing the last point exactly at 2π (which overlaps the first at 0).
// Compute an arc length slightly shorter than a full circle so all spokes are unique.
const ANGLE_FULL = 2 * Math.PI;
const angleArc = ANGLE_FULL * (COLLEGES.length - 1) / COLLEGES.length; // leave one step gap
const angle = d3.scalePoint()
  .domain(COLLEGES.map(d => d.key))
  .range([0, angleArc]);

// Color and size encode cost — these will be created after we load the data

// Tooltip
const tooltip = container.append("div")
  .attr("class", "tooltip");

// ---------- GRID: RINGS & SPOKES ----------
// Grid circles and labels will be updated dynamically based on selected year

// spokes
g.selectAll(".grid-spoke")
  .data(COLLEGES)
  .join("line")
  .attr("class", "grid-spoke")
  .attr("x1", d => Math.cos(angle(d.key)) * innerR)
  .attr("y1", d => Math.sin(angle(d.key)) * innerR)
  .attr("x2", d => Math.cos(angle(d.key)) * outerR)
  .attr("y2", d => Math.sin(angle(d.key)) * outerR)
  .attr("stroke", "#e1e1e1");

// college labels at the end of spokes
g.selectAll(".college-label")
  .data(COLLEGES)
  .join("text")
  .attr("class", "college-label")
  .attr("text-anchor", d => {
    const a = angle(d.key);
    if (Math.cos(a) > 0.3) return "start";
    if (Math.cos(a) < -0.3) return "end";
    return "middle";
  })
  .attr("x", d => Math.cos(angle(d.key)) * (outerR + 14))
  .attr("y", d => Math.sin(angle(d.key)) * (outerR + 14))
  .text(d => d.short);

// center label
g.append("text")
  .attr("class", "center-text")
  .attr("text-anchor", "middle")
  .attr("y", 6)
  .text("IVY");

// Function to prepare data for a specific year
function prepareYearData(raw, year) {
  // helper: normalize CDS_Year strings to canonical form 'YYYY-YYYY'
  function normalizeYearString(s) {
    if (!s) return '';
    const t = String(s).trim();
    // already in long form
    if (/^\d{4}-\d{4}$/.test(t)) return t;
    // short form like 2024-25 -> expand to 2024-2025
    const m = t.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const y1 = m[1];
      const y2 = m[2];
      const y1prefix = y1.slice(0, 2);
      return `${y1}-${y1prefix}${y2}`;
    }
    return t;
  }

  // Build data array for the colleges and the selected year only
  return COLLEGES.map(c => {
    // find a row where Institution mentions the college key and CDS_Year matches
    const candidates = INSTITUTION_MAP[c.key] || [];
    const row = raw.find(r => r.Institution && r.CDS_Year &&
      candidates.includes(r.Institution.trim()) && normalizeYearString(r.CDS_Year) === year);
    // clean StickerCOA: remove internal whitespace/newlines and commas, then parse
    let cost = null;
    if (row && row.StickerCOA) {
      const cleaned = String(row.StickerCOA).replace(/\s+/g, '').replace(/,/g, '');
      const n = +cleaned;
      cost = Number.isFinite(n) ? n : null;
    }
    return { college: c.key, year: year, cost };
  });
}

// Function to update the visualization for a selected year
function updateVisualization(year) {
  if (!allRawData) return;
  
  // Prepare data for the selected year
  const yearData = prepareYearData(allRawData, year);
  
  // Update color and size scales based on current year's data
  const allCosts = yearData.map(d => d.cost).filter(c => Number.isFinite(c));
  const costExtent = allCosts.length ? d3.extent(allCosts) : [0, 1];
  color.domain(costExtent);
  size.domain(costExtent).range([3, 9]);
  
  // Create a unified transition for smooth updates (matching viz_2's 750ms duration)
  const t = d3.transition().duration(750);
  
  // Update grid: show the selected year's ring at its designated orbit
  const yearRadius = r(year);
  const gridCircles = g.selectAll(".grid-circle")
    .data([year]);
    
  gridCircles.exit()
    .transition(t)
    .attr("r", 0)
    .remove();
  
  gridCircles.enter()
    .append("circle")
    .attr("class", "grid-circle")
    .attr("r", 0)
    .attr("fill", "none")
    .merge(gridCircles)
    .transition(t)
    .attr("r", yearRadius);
  
  // Update ring label
  const ringLabels = g.selectAll(".ring-label")
    .data([year]);
    
  ringLabels.exit()
    .transition(t)
    .style("opacity", 0)
    .remove();
  
  ringLabels.enter()
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .style("opacity", 0)
    .merge(ringLabels)
    .transition(t)
    .attr("y", -yearRadius - 6)
    .style("opacity", 1)
    .text(d => d);
  
  // Update paths: remove paths since we're only showing one year
  g.selectAll(".path-college")
    .transition(t)
    .style("opacity", 0)
    .remove();
  
  // Update dots: show only dots for the selected year
  // Update college groups with new year data - each group gets one data point for the selected year
  const collegeGroups = g.selectAll(".college")
    .data(yearData, d => d.college);
    
  // Remove exiting groups and their dots
  collegeGroups.exit()
    .selectAll(".dot")
    .transition(t)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();
  
  collegeGroups.exit().remove();
  
  // Enter new college groups
  const collegeGroupsEnter = collegeGroups.enter()
    .append("g")
    .attr("class", "college");
  
  // Merge enter and update selections - this ensures each group has the new year's data
  const collegeGroupsMerged = collegeGroupsEnter.merge(collegeGroups);
  
  // Update dots within each college group
  // Each college group now has the updated data for the selected year
  // We bind an array with the data point if cost is valid, empty array otherwise
  const dots = collegeGroupsMerged.selectAll(".dot")
    .data(function(d) {
      // 'd' here is the college's data for the selected year
      // Return array with the data point if cost is valid, empty array otherwise
      return (d.cost != null && Number.isFinite(d.cost)) ? [d] : [];
    }, function(d) {
      // Key function: use college name to match dots across updates
      return d ? d.college : null;
    });
    
  // Remove exiting dots
  dots.exit()
    .transition(t)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();
  
  // Enter new dots - position them on the selected year's orbit
  const dotsEnter = dots.enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => Math.cos(angle(d.college)) * yearRadius)
    .attr("cy", d => Math.sin(angle(d.college)) * yearRadius)
    .attr("r", 0)
    .attr("fill", d => color(d.cost))
    .attr("stroke", "#222")
    .attr("stroke-width", 1.5)
    .style("opacity", 0);
  
  // Merge and update ALL dots (both new and existing) with new data
  // The merge ensures existing dots get the new data bound to them
  // This is critical: existing dots will now have the new year's cost values
  // And they'll transition to the selected year's orbit
  dotsEnter.merge(dots)
    .transition(t)
    .attr("cx", d => Math.cos(angle(d.college)) * yearRadius)
    .attr("cy", d => Math.sin(angle(d.college)) * yearRadius)
    .attr("r", d => size(d.cost))
    .attr("fill", d => color(d.cost))
    .style("opacity", 1);
  
  // Reattach event listeners for dots
  collegeGroupsMerged.selectAll(".dot")
    .on("mouseenter", function (event, d) {
      d3.select(this).classed('dot--hover', true);
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.college}</strong><br/>Year: ${d.year}<br/>Cost: ${d.cost != null ? ('$' + (d.cost/1000).toFixed(2) + 'K') : 'n/a'}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.clientX}px`)
        .style("top",  `${event.clientY}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).classed('dot--hover', false);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      // pin tooltip near the point
      const yearRadius = r(d.year);
      const [x, y] = [Math.cos(angle(d.college)) * yearRadius, Math.sin(angle(d.college)) * yearRadius];
      const pt = this.ownerSVGElement.createSVGPoint();
      pt.x = x + width/2;
      pt.y = y + height/2;
      tooltip
        .style("opacity", 1)
        .style("left", `${pt.x}px`)
        .style("top", `${pt.y}px`)
        .html(`<strong>${d.college}</strong><br/>${d.year}: <strong>${d.cost != null ? ('$' + d.cost.toLocaleString()) : 'n/a'}</strong>`);
    });
}

// Load CSV and render
d3.csv(CSV_PATH).then(raw => {
  allRawData = raw;  // Store all data globally
  // Initialize color and size scales (will be updated per year)
  const initialCosts = [0, 100000]; // placeholder
  color = d3.scaleSequential(d3.interpolateTurbo).domain(initialCosts);
  size = d3.scaleSqrt().domain(initialCosts).range([3, 9]);

  // Create initial college groups (empty, will be populated by updateVisualization)
  g.selectAll(".college")
    .data(COLLEGES.map(c => ({ college: c.key })))
    .join("g")
    .attr("class", "college");

  // Initial visualization with default year
  updateVisualization(currentYear);
  
  // Set up year selector
  d3.select('#radial-year-select').on('change', function() {
    currentYear = this.value;
    updateVisualization(currentYear);
  });

}).catch(err => {
  console.error('Failed to load CSV', err);
});
