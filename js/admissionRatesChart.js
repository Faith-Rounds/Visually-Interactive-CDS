// Admission Rates Line Chart with toggle and slider controls

let admissionData = [];

const admissionSchools = [
  { name: 'Harvard', color: '#e11d48', visible: true },
  { name: 'Yale', color: '#2563eb', visible: true },
  { name: 'Princeton', color: '#f97316', visible: true },
  { name: 'Columbia', color: '#10b981', visible: true },
  { name: 'Brown', color: '#78350f', visible: true },
  { name: 'Penn', color: '#7c3aed', visible: true },
  { name: 'Dartmouth', color: '#0d9488', visible: true },
  { name: 'Cornell', color: '#be123c', visible: true }
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
    const margin = isSmallMobile
      ? { top: 20, right: 15, bottom: 50, left: 45 }
      : isMobile 
      ? { top: 20, right: 20, bottom: 60, left: 50 }
      : { top: 20, right: 30, bottom: 60, left: 70 };
    const width = containerRect.width - margin.left - margin.right - (isMobile ? 20 : 40);
    const height = (isSmallMobile ? 350 : isMobile ? 400 : 500) - margin.top - margin.bottom;
    return { margin, width, height, isMobile, isSmallMobile };
  }

  const { margin: admissionMargin, width: admissionWidth, height: admissionHeight, isMobile, isSmallMobile } = getAdmissionDimensions();
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
    .attr("y", admissionHeight + (isSmallMobile ? 35 : 45))
    .attr("text-anchor", "middle")
    .style("font-size", isSmallMobile ? "11px" : "14px")
    .style("fill", "#00ff41")
    .style("font-weight", "600")
    .text("Year");

  admissionSvg.append("text")
    .attr("class", "admission-y-label")
    .attr("x", -admissionHeight / 2)
    .attr("y", isSmallMobile ? -35 : -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", isSmallMobile ? "11px" : "14px")
    .style("fill", "#00ff41")
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
    .attr("stroke", "#e2e8f0")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4");

  const admissionTooltip = d3.select("body")
    .append("div")
    .attr("class", "admission-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "2px solid #94a3b8")
    .style("border-radius", "10px")
    .style("padding", "10px 15px")
    .style("font-size", "14px")
    .style("box-shadow", "0 5px 10px rgba(0,0,0,0.15)")
    .style("pointer-events", "none")
    .style("z-index", "1000");

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
        values: filteredData.map(d => ({ year: d.year, value: d[s.name] }))
      }));

    const lines = admissionSvg.selectAll(".admission-line-path")
      .data(lineData, d => d.name);

    lines.enter()
      .append("path")
      .attr("class", "admission-line-path")
      .attr("stroke", d => d.color)
      .attr("fill", "none")
      .attr("stroke-width", 3)
      .merge(lines)
      .transition()
      .duration(500)
      .attr("d", d => admissionLine(d.values));

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
            .attr("r", 7);

          admissionTooltip.style("visibility", "visible")
            .html(`<strong style="color:${school.color}">${school.name}</strong><br>Year: ${d.year}<br>Rate: ${d.value}%`);
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
        yearMap.set(year, { year });
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

  d3.selectAll(".school-toggle-btn").on("click", function() {
    const schoolName = d3.select(this).attr("data-school");
    const school = admissionSchools.find(s => s.name === schoolName);

    if (school) {
      school.visible = !school.visible;
      d3.select(this).classed("active", school.visible);
      updateAdmissionChart();
    }
  });

  d3.select("#reset-schools-btn").on("click", function() {
    admissionSchools.forEach(s => s.visible = true);
    d3.selectAll(".school-toggle-btn").classed("active", true);
    updateAdmissionChart();
  });

  d3.select("#year-slider").on("input", function() {
    maxYear = +this.value;
    d3.select("#year-display").text(maxYear);
    updateAdmissionChart();
  });
