// ---------- CONFIG ----------
// Use the CDS_Year strings found in data.csv

const YEARS = [
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025"
];

const COLLEGES = [{
    key: "Harvard",
    short: "Harvard"
  },
  {
    key: "Brown",
    short: "Brown"
  },
  {
    key: "Dartmouth",
    short: "Dartmouth"
  },
  {
    key: "Princeton",
    short: "Princeton"
  },
  {
    key: "Cornell",
    short: "Cornell"
  },
  {
    key: "Penn",
    short: "Penn"
  },
  {
    key: "Columbia",
    short: "Columbia"
  },
  {
    key: "Yale",
    short: "Yale"
  }
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
let allRawData = null; // Store all CSV data
let currentYear = '2024-2025'; // Default selected year
let data = null; // Will store processed data
let color = null; // Will store color scale
let size = null; // Will store size scale

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

  return {
    width,
    height,
    margin,
    innerR,
    outerR,
    isMobile,
    isSmallMobile
  };
}

let dimensions = getRadialDimensions();
let {
  width,
  height,
  innerR,
  outerR
} = dimensions;

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

// Colleges are spokes (angles)
// Avoid placing the last point exactly at 2π (which overlaps the first at 0).
// Compute an arc length slightly shorter than a full circle so all spokes are unique.
const ANGLE_FULL = 2 * Math.PI;
const angleArc = ANGLE_FULL * (COLLEGES.length - 1) / COLLEGES.length; // leave one step gap
const angle = d3.scalePoint()
  .domain(COLLEGES.map(d => d.key))
  .range([0, angleArc]);

// Color and size encode cost — these will be created after we load the data

// Tooltip with proper styling - append to body to prevent container resize
const tooltip = d3.select("body").append("div")
  .attr("class", "radial-tooltip")
  .style("position", "fixed")
  .style("visibility", "hidden")
  .style("background", "rgba(255, 255, 255, 0.95)")
  .style("backdrop-filter", "blur(10px)")
  .style("-webkit-backdrop-filter", "blur(10px)")
  .style("border", "2px solid #6B46C1")
  .style("border-radius", "12px")
  .style("padding", "12px 18px")
  .style("font-size", "14px")
  .style("box-shadow", "0 8px 32px rgba(107, 70, 193, 0.3)")
  .style("pointer-events", "none")
  .style("z-index", "1000")
  .style("color", "#2D3748")
  .style("opacity", 0)
  .style("max-width", "250px");

// ---------- GRID: RINGS & SPOKES ----------
// Grid circles and labels will be updated dynamically based on selected year

// spokes
const gridSpokes = g.append("g").attr("class", "grid-spokes");
gridSpokes.selectAll(".grid-spoke")
  .data(COLLEGES)
  .join("line")
  .attr("class", "grid-spoke")
  .attr("x1", d => Math.cos(angle(d.key)) * innerR)
  .attr("y1", d => Math.sin(angle(d.key)) * innerR)
  .attr("x2", d => Math.cos(angle(d.key)) * outerR)
  .attr("y2", d => Math.sin(angle(d.key)) * outerR)
  .attr("stroke", "#e1e1e1")
  .attr("stroke-width", 1);

// college labels at the end of spokes
const collegeLabels = g.append("g").attr("class", "college-labels");
collegeLabels.selectAll(".college-label")
  .data(COLLEGES)
  .join("text")
  .attr("class", "college-label")
  .attr("text-anchor", d => {
    const a = angle(d.key);
    if (Math.cos(a) > 0.3) return "start";
    if (Math.cos(a) < -0.3) return "end";
    return "middle";
  })
  .attr("dominant-baseline", "middle")
  .attr("x", d => Math.cos(angle(d.key)) * (outerR + 14))
  .attr("y", d => Math.sin(angle(d.key)) * (outerR + 14))
  .style("font-size", dimensions.isSmallMobile ? "11px" : "12px")
  .style("font-weight", "600")
  .style("fill", "#4A5568")
  .text(d => d.short);

// center label
g.append("text")
  .attr("class", "center-text")
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .attr("y", 0)
  .style("font-size", dimensions.isSmallMobile ? "10px" : "12px")
  .style("font-weight", "700")
  .style("fill", "#6B46C1")
  .style("letter-spacing", "0.5px")
  .text("IVY");

// Create groups for grid and data
const gridGroup = g.append("g").attr("class", "grid-group");
const dataGroup = g.append("g").attr("class", "data-group");

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
    return {
      college: c.key,
      year: year,
      cost
    };
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
  size.domain(costExtent).range([dimensions.isSmallMobile ? 4 : 5, dimensions.isSmallMobile ? 10 : 12]);

  // Use the radius scale to map the year to its proper orbital radius
  const displayRadius = r(year);

  // Create a unified transition for smooth updates
  const t = d3.transition().duration(1000).ease(d3.easeCubicInOut);

  // Update grid: show a single ring at the display radius
  const gridCircles = gridGroup.selectAll(".grid-circle")
    .data([year], d => d);

  gridCircles.exit()
    .transition(t)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  gridCircles.enter()
    .append("circle")
    .attr("class", "grid-circle")
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", "#e1e1e1")
    .attr("stroke-width", 1.5)
    .style("opacity", 0)
    .merge(gridCircles)
    .transition(t)
    .attr("r", displayRadius)
    .attr("stroke", "#e1e1e1")
    .attr("stroke-width", 1.5)
    .style("opacity", 1);

  // Update ring label
  const ringLabels = gridGroup.selectAll(".ring-label")
    .data([year], d => d);

  ringLabels.exit()
    .transition(t)
    .style("opacity", 0)
    .remove();

  ringLabels.enter()
    .append("text")
    .attr("class", "ring-label")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "baseline")
    .style("font-size", dimensions.isSmallMobile ? "11px" : "13px")
    .style("font-weight", "600")
    .style("fill", "#6B46C1")
    .style("opacity", 0)
    .merge(ringLabels)
    .transition(t)
    .attr("y", -displayRadius - 8)
    .style("opacity", 1)
    .text(d => d);

  // Update dots: bind year data to college groups
  const colleges = dataGroup.selectAll(".college-group")
    .data(yearData, d => d.college);

  // Remove exiting college groups
  colleges.exit()
    .transition(t)
    .style("opacity", 0)
    .remove();

  // Enter new college groups
  const collegesEnter = colleges.enter()
    .append("g")
    .attr("class", "college-group");

  // Merge enter and update selections
  const collegesMerged = collegesEnter.merge(colleges);

  // Update dots
  const dots = collegesMerged.selectAll(".dot")
    .data(d => (d.cost != null && Number.isFinite(d.cost)) ? [d] : [], d => d.college + '-' + d.year);

  // Remove exiting dots
  dots.exit()
    .transition(t)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  // Enter new dots
  const dotsEnter = dots.enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => Math.cos(angle(d.college)) * displayRadius)
    .attr("cy", d => Math.sin(angle(d.college)) * displayRadius)
    .attr("r", 0)
    .attr("fill", d => color(d.cost))
    .attr("stroke", "#FFFFFF")
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .style("cursor", "pointer");

  // Merge and update all dots
  const dotsMerged = dotsEnter.merge(dots);

  dotsMerged
    .transition(t)
    .attr("cx", d => Math.cos(angle(d.college)) * displayRadius)
    .attr("cy", d => Math.sin(angle(d.college)) * displayRadius)
    .attr("r", d => size(d.cost))
    .attr("fill", d => color(d.cost))
    .style("opacity", 1);

  // Track if tooltip is pinned
  let pinnedDot = null;

  // Attach event listeners
  dotsMerged
    .on("mouseenter", function (event, d) {
      // Don't show hover tooltip if another dot is pinned
      if (pinnedDot && pinnedDot !== this) return;

      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("r", size(d.cost) * 1.4)
        .attr("stroke-width", 3);

      tooltip
        .style("visibility", "visible")
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);

      tooltip.html(`
        <div style="font-weight: 700; color: #6B46C1; font-size: 15px; margin-bottom: 6px;">
          ${d.college}
        </div>
        <div style="margin-bottom: 3px;">
          <span style="color: #718096;">Year:</span> <span style="font-weight: 600;">${d.year}</span>
        </div>
        <div>
          <span style="color: #718096;">Cost:</span> <span style="font-weight: 700; color: #2D3748; font-size: 16px;">${d.cost != null ? '$' + d.cost.toLocaleString() : 'n/a'}</span>
        </div>
      `);
    })
    .on("mousemove", function (event, d) {
      // Don't move tooltip if it's pinned
      if (pinnedDot === this) return;

      tooltip
        .style("left", `${event.clientX + 15}px`)
        .style("top", `${event.clientY - 35}px`);
    })
    .on("mouseleave", function (event, d) {
      // Don't hide if this dot is pinned
      if (pinnedDot === this) return;

      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("r", size(d.cost))
        .attr("stroke-width", 2);

      tooltip
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .style("opacity", 0)
        .on("end", function () {
          tooltip.style("visibility", "hidden");
        });
    })
    .on("click", function (event, d) {
      event.stopPropagation();

      // If clicking the already-pinned dot, unpin it
      if (pinnedDot === this) {
        pinnedDot = null;
        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("r", size(d.cost))
          .attr("stroke-width", 2);
        tooltip
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .style("opacity", 0)
          .on("end", function () {
            tooltip.style("visibility", "hidden");
          });
        return;
      }

      // Unpin previous dot if any
      if (pinnedDot) {
        const prevData = d3.select(pinnedDot).datum();
        d3.select(pinnedDot)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("r", size(prevData.cost))
          .attr("stroke-width", 2);
      }

      // Pin this dot
      pinnedDot = this;

      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("r", size(d.cost) * 1.4)
        .attr("stroke-width", 3);

      // Position tooltip near the click
      tooltip
        .style("visibility", "visible")
        .style("opacity", 1)
        .style("left", `${event.clientX + 15}px`)
        .style("top", `${event.clientY - 35}px`)
        .html(`
          <div style="font-weight: 700; color: #6B46C1; font-size: 15px; margin-bottom: 6px;">
            ${d.college}
          </div>
          <div style="margin-bottom: 3px;">
            <span style="color: #718096;">Year:</span> <span style="font-weight: 600;">${d.year}</span>
          </div>
          <div>
            <span style="color: #718096;">Cost:</span> <span style="font-weight: 700; color: #2D3748; font-size: 16px;">${d.cost != null ? '$' + d.cost.toLocaleString() : 'n/a'}</span>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #A0AEC0; font-style: italic;">
            Click again to unpin
          </div>
        `);
    });

  // Click outside to unpin tooltip
  svg.on("click", function () {
    if (pinnedDot) {
      const data = d3.select(pinnedDot).datum();
      d3.select(pinnedDot)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("r", size(data.cost))
        .attr("stroke-width", 2);
      pinnedDot = null;
      tooltip
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .style("opacity", 0)
        .on("end", function () {
          tooltip.style("visibility", "hidden");
        });
    }
  });
}

// Function to handle window resize
function handleResize() {
  const newDimensions = getRadialDimensions();

  // Update global dimensions
  dimensions = newDimensions;
  width = newDimensions.width;
  height = newDimensions.height;
  innerR = newDimensions.innerR;
  outerR = newDimensions.outerR;

  // Update SVG viewBox
  svg.attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-height", `${height}px`);

  // Update transform of main group
  g.attr("transform", `translate(${width/2},${height/2})`);

  // Update scales
  r.range([innerR, outerR]);

  // Update grid spokes
  gridSpokes.selectAll(".grid-spoke")
    .attr("x1", d => Math.cos(angle(d.key)) * innerR)
    .attr("y1", d => Math.sin(angle(d.key)) * innerR)
    .attr("x2", d => Math.cos(angle(d.key)) * outerR)
    .attr("y2", d => Math.sin(angle(d.key)) * outerR);

  // Update college labels
  collegeLabels.selectAll(".college-label")
    .attr("x", d => Math.cos(angle(d.key)) * (outerR + 14))
    .attr("y", d => Math.sin(angle(d.key)) * (outerR + 14))
    .style("font-size", dimensions.isSmallMobile ? "11px" : "12px");

  // Update center text
  g.select(".center-text")
    .style("font-size", dimensions.isSmallMobile ? "10px" : "12px");

  // Update size scale range based on new dimensions
  if (size) {
    size.range([dimensions.isSmallMobile ? 4 : 5, dimensions.isSmallMobile ? 10 : 12]);
  }

  // Re-render the current visualization
  updateVisualization(currentYear);
}

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250);
});

// Load CSV and render
d3.csv(CSV_PATH).then(raw => {
  allRawData = raw; // Store all data globally

  // Initialize color and size scales (will be updated per year)
  const initialCosts = [0, 100000]; // placeholder

  // Custom purple gradient interpolator
  const purpleInterpolator = t => {
    const colors = ['#E9D8FD', '#D6BCFA', '#B794F4', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A'];
    const index = t * (colors.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;
    return d3.interpolateRgb(colors[lower], colors[upper])(fraction);
  };

  color = d3.scaleSequential(purpleInterpolator).domain(initialCosts);
  size = d3.scaleSqrt().domain(initialCosts).range([dimensions.isSmallMobile ? 4 : 5, dimensions.isSmallMobile ? 10 : 12]);

  // Add event listener for year selector
  const yearSelect = d3.select("#radial-year-select");
  if (!yearSelect.empty()) {
    yearSelect.on("change", function () {
      const selectedYear = this.value;
      currentYear = selectedYear;
      updateVisualization(selectedYear);
    });
  }

  // Initial visualization with default year
  updateVisualization(currentYear);

}).catch(err => {
  console.error('Failed to load CSV', err);
  // Display error message in the container
  container.append("div")
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("text-align", "center")
    .style("color", "#E53E3E")
    .style("font-weight", "600")
    .html(`
      <div style="font-size: 18px; margin-bottom: 8px;">⚠️ Error Loading Data</div>
      <div style="font-size: 14px; color: #718096;">Please check that data/data.csv exists</div>
    `);
});