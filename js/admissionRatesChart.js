// Enhanced Admission Rates Line Chart with Interactive Features

let admissionData = [];
let selectedSchool = null;
let comparisonMode = false;
let comparisonSchools = [];

const admissionSchools = [{
    name: 'Harvard',
    color: '#A51C30', // Harvard Crimson
    visible: true,
    highlighted: false
  },
  {
    name: 'Yale',
    color: '#00356B', // Yale Blue
    visible: true,
    highlighted: false
  },
  {
    name: 'Princeton',
    color: '#E87722', // Princeton Orange
    visible: true,
    highlighted: false
  },
  {
    name: 'Columbia',
    color: '#9BB8D3', // Columbia Light Blue
    visible: true,
    highlighted: false
  },
  {
    name: 'Brown',
    color: '#4E3629', // Brown seal brown
    visible: true,
    highlighted: false
  },
  {
    name: 'Penn',
    color: '#011F5B', // Penn Blue
    visible: true,
    highlighted: false
  },
  {
    name: 'Dartmouth',
    color: '#00693E', // Dartmouth Green
    visible: true,
    highlighted: false
  },
  {
    name: 'Cornell',
    color: '#B31B1B', // Cornell Red
    visible: true,
    highlighted: false
  }
];

const INSTITUTION_NAME_MAP = {
  'Harvard': 'Harvard',
  'Yale': 'Yale',
  'Princeton': 'Princeton',
  'Columbia': 'Columbia',
  'Brown': 'Brown',
  'Penn': 'Upenn',
  'Dartmouth': 'Dartmouth',
  'Cornell': 'Cornell'
};

let maxYear = 2025;

// Responsive sizing
function getAdmissionDimensions() {
  const admissionContainer = d3.select("#admission-rates-chart");
  const containerRect = admissionContainer.node().getBoundingClientRect();
  const isMobile = containerRect.width < 768;
  const isSmallMobile = containerRect.width < 480;
  const margin = isSmallMobile ? {
      top: 20,
      right: 15,
      bottom: 50,
      left: 45
    } :
    isMobile ? {
      top: 20,
      right: 20,
      bottom: 60,
      left: 50
    } : {
      top: 20,
      right: 30,
      bottom: 60,
      left: 70
    };
  const width = containerRect.width - margin.left - margin.right - (isMobile ? 20 : 40);
  const height = (isSmallMobile ? 350 : isMobile ? 400 : 500) - margin.top - margin.bottom;
  return {
    margin,
    width,
    height,
    isMobile,
    isSmallMobile
  };
}

const {
  margin: admissionMargin,
  width: admissionWidth,
  height: admissionHeight,
  isMobile: admissionIsMobile,
  isSmallMobile: admissionIsSmallMobile
} = getAdmissionDimensions();
const admissionContainer = d3.select("#admission-rates-chart");

admissionContainer.selectAll("*").remove();

const admissionSvg = admissionContainer
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${admissionWidth + admissionMargin.left + admissionMargin.right} ${admissionHeight + admissionMargin.top + admissionMargin.bottom}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("max-height", `${admissionHeight + admissionMargin.top + admissionMargin.bottom}px`)
  .append("g")
  .attr("transform", `translate(${admissionMargin.left},${admissionMargin.top})`);

const admissionXScale = d3.scaleLinear()
  .domain([2020, 2025])
  .range([0, admissionWidth]);

const admissionYScale = d3.scaleLinear()
  .domain([0, 12])
  .range([admissionHeight, 0]);

const admissionXAxis = d3.axisBottom(admissionXScale)
  .tickFormat(d3.format("d"))
  .ticks(6);

const admissionYAxis = d3.axisLeft(admissionYScale)
  .tickFormat(d => d + "%");

admissionSvg.append("g")
  .attr("class", "admission-axis admission-x-axis")
  .attr("transform", `translate(0,${admissionHeight})`)
  .call(admissionXAxis);

admissionSvg.append("g")
  .attr("class", "admission-axis admission-y-axis")
  .call(admissionYAxis);

admissionSvg.append("text")
  .attr("class", "admission-x-label")
  .attr("x", admissionWidth / 2)
  .attr("y", admissionHeight + (admissionIsSmallMobile ? 35 : 45))
  .attr("text-anchor", "middle")
  .style("font-size", admissionIsSmallMobile ? "11px" : "14px")
  .style("fill", "#4A5568")
  .style("font-weight", "600")
  .text("Year");

admissionSvg.append("text")
  .attr("class", "admission-y-label")
  .attr("x", -admissionHeight / 2)
  .attr("y", admissionIsSmallMobile ? -35 : -50)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .style("font-size", admissionIsSmallMobile ? "11px" : "14px")
  .style("fill", "#4A5568")
  .style("font-weight", "600")
  .text("Admission Rate (%)");

admissionSvg.selectAll(".admission-grid-line")
  .data(admissionYScale.ticks(12))
  .join("line")
  .attr("class", "admission-grid-line")
  .attr("x1", 0)
  .attr("x2", admissionWidth)
  .attr("y1", d => admissionYScale(d))
  .attr("y2", d => admissionYScale(d))
  .attr("stroke", "#E2E8F0")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "4");

const admissionTooltip = d3.select("body")
  .append("div")
  .attr("class", "admission-tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "rgba(255, 255, 255, 0.95)")
  .style("backdrop-filter", "blur(10px)")
  .style("-webkit-backdrop-filter", "blur(10px)")
  .style("border", "2px solid rgba(255, 255, 255, 0.3)")
  .style("border-radius", "12px")
  .style("padding", "12px 18px")
  .style("font-size", "14px")
  .style("box-shadow", "0 8px 32px rgba(102, 126, 234, 0.3)")
  .style("pointer-events", "none")
  .style("z-index", "1000")
  .style("color", "#2d3748");

const admissionLine = d3.line()
  .x(d => admissionXScale(d.year))
  .y(d => admissionYScale(d.value))
  .defined(d => d.value != null && Number.isFinite(d.value))
  .curve(d3.curveMonotoneX);

function updateAdmissionChart() {
  const filteredData = admissionData.filter(d => d.year <= maxYear);

  const lineData = admissionSchools
    .filter(s => s.visible)
    .map(s => ({
      name: s.name,
      color: s.color,
      highlighted: s.highlighted,
      values: filteredData.map(d => ({
        year: d.year,
        value: d[s.name]
      }))
    }));

  const lines = admissionSvg.selectAll(".admission-line-path")
    .data(lineData, d => d.name);

  lines.enter()
    .append("path")
    .attr("class", "admission-line-path")
    .attr("stroke", d => d.color)
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .attr("opacity", 0.7)
    .style("cursor", "pointer")
    .on("click", function (event, d) {
      handleLineClick(d.name);
    })
    .merge(lines)
    .transition()
    .duration(500)
    .attr("d", d => admissionLine(d.values))
    .attr("stroke-width", d => d.highlighted ? 5 : 3)
    .attr("opacity", d => {
      if (selectedSchool) {
        return d.name === selectedSchool ? 1 : 0.2;
      }
      return d.highlighted ? 1 : 0.7;
    });

  lines.exit().remove();

  lineData.forEach(school => {
    const validValues = school.values.filter(d => d.value != null && Number.isFinite(d.value));
    const points = admissionSvg.selectAll(`.admission-point-${school.name}`)
      .data(validValues, d => d.year);

    points.enter()
      .append("circle")
      .attr("class", `admission-point-${school.name} admission-point`)
      .attr("r", 5)
      .attr("fill", school.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .merge(points)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8);

        admissionTooltip.style("visibility", "visible")
          .html(`<strong style="color:${school.color}; font-weight: 700;">${school.name}</strong><br><span style="font-weight: 600;">Year:</span> ${d.year}<br><span style="font-weight: 600;">Rate:</span> ${d.value.toFixed(1)}%<br><em style="font-size: 12px; color: #718096;">Click line to highlight</em>`);
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        handleLineClick(school.name);
      })
      .on("mousemove", event => {
        admissionTooltip
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 5);

        admissionTooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(500)
      .attr("cx", d => admissionXScale(d.year))
      .attr("cy", d => admissionYScale(d.value));

    points.exit().remove();
  });
}

// Load CSV data and initialize chart
d3.csv('data/data.csv').then(rows => {
  // Parse CSV and build admissionData
  const yearMap = new Map();

  rows.forEach(row => {
    const inst = row.Institution ? row.Institution.trim() : '';
    const cdsYear = row.CDS_Year ? row.CDS_Year.trim() : '';
    const rate = row.AcceptanceRate_FTFY ? parseFloat(row.AcceptanceRate_FTFY) : null;

    if (!cdsYear || rate === null || !Number.isFinite(rate)) return;

    // Extract first year from CDS_Year (e.g., "2020-2021" -> 2020)
    const yearMatch = cdsYear.match(/^(\d{4})/);
    if (!yearMatch) return;
    const year = parseInt(yearMatch[1]);

    // Find matching school name
    let schoolName = null;
    for (const [displayName, csvName] of Object.entries(INSTITUTION_NAME_MAP)) {
      if (inst === csvName) {
        schoolName = displayName;
        break;
      }
    }

    if (!schoolName) return;

    // Initialize year entry if needed
    if (!yearMap.has(year)) {
      yearMap.set(year, {
        year
      });
    }

    // Store rate as percentage (multiply by 100)
    yearMap.get(year)[schoolName] = rate * 100;
  });

  // Convert map to array and sort by year
  admissionData = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

  // Update maxYear based on available data
  if (admissionData.length > 0) {
    maxYear = Math.max(...admissionData.map(d => d.year));
    d3.select('#year-slider').attr('max', maxYear).property('value', maxYear);
    d3.select('#year-display').text(maxYear);
  }

  updateAdmissionChart();
}).catch(err => {
  console.error('Failed to load admission rates data:', err);
});

// Handle line click for highlighting
function handleLineClick(schoolName) {
  if (selectedSchool === schoolName) {
    selectedSchool = null;
    admissionSchools.forEach(s => s.highlighted = false);
  } else {
    selectedSchool = schoolName;
    admissionSchools.forEach(s => {
      s.highlighted = s.name === schoolName;
    });
  }
  updateAdmissionChart();
}

// Create legend items dynamically
const legendContainer = d3.select("#admission-legend-items");
admissionSchools.forEach(school => {
  const legendItem = legendContainer.append("div")
    .attr("class", "legend-item");
  
  legendItem.append("div")
    .attr("class", "legend-color-box")
    .style("background-color", school.color);
  
  legendItem.append("span")
    .text(school.name);
});

// Add visible class to legend after a short delay for animation
setTimeout(() => {
  d3.select("#admission-legend").classed("visible", true);
}, 300);

// Style toggle buttons with school colors for additional clarity
d3.selectAll(".school-toggle-btn").each(function() {
  const schoolName = d3.select(this).attr("data-school");
  const school = admissionSchools.find(s => s.name === schoolName);
  
  if (school) {
    d3.select(this)
      .style("border-left", `4px solid ${school.color}`)
      .style("border-left-width", "5px")
      .style("position", "relative")
      .style("padding-left", "12px");
  }
});

d3.selectAll(".school-toggle-btn").on("click", function () {
  const schoolName = d3.select(this).attr("data-school");
  const school = admissionSchools.find(s => s.name === schoolName);

  if (school) {
    school.visible = !school.visible;
    d3.select(this)
      .classed("active", school.visible)
      .transition()
      .duration(200)
      .style("transform", school.visible ? "scale(1)" : "scale(0.95)")
      .style("opacity", school.visible ? "1" : "0.5");
    updateAdmissionChart();
  }
});

d3.select("#reset-schools-btn").on("click", function () {
  admissionSchools.forEach(s => s.visible = true);
  d3.selectAll(".school-toggle-btn").classed("active", true);
  updateAdmissionChart();
});

d3.select("#year-slider").on("input", function () {
  maxYear = +this.value;
  d3.select("#year-display").text(maxYear);
  updateAdmissionChart();
});