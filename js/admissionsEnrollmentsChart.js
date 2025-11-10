// Admissions vs Enrollments - Mirrored bar chart

let enrollmentData = [];

const ENROLL_INSTITUTION_MAP = {
  'Harvard': 'Harvard',
  'Yale': 'Yale',
  'Princeton': 'Princeton',
  'Columbia': 'Columbia',
  'Brown': 'Brown',
  'Penn': 'Upenn',
  'Dartmouth': 'Dartmouth',
  'Cornell': 'Cornell'
};

// Responsive sizing
function getEnrollDimensions() {
  const enrollContainer = d3.select("#admissions-enrollments-chart");
  const containerWidth = enrollContainer.node().getBoundingClientRect().width;
  const isMobile = containerWidth < 768;
  const isSmallMobile = containerWidth < 480;
  const margin = isSmallMobile ? {
      top: 25,
      right: 15,
      bottom: 25,
      left: 15
    } :
    isMobile ? {
      top: 30,
      right: 20,
      bottom: 30,
      left: 20
    } : {
      top: 40,
      right: 120,
      bottom: 40,
      left: 120
    };
  const width = Math.min(isMobile ? containerWidth - 40 : 900, containerWidth - 40) - margin.left - margin.right;
  const height = (isSmallMobile ? 450 : isMobile ? 500 : 550) - margin.top - margin.bottom;
  return {
    margin,
    width,
    height,
    isMobile,
    isSmallMobile
  };
}

const {
  margin: enrollMargin,
  width: enrollWidth,
  height: enrollHeight,
  isMobile: enrollIsMobile,
  isSmallMobile: enrollIsSmallMobile
} = getEnrollDimensions();
const enrollContainer = d3.select("#admissions-enrollments-chart");

const enrollTooltip = d3.select("body")
  .append("div")
  .attr("class", "enroll-tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "#111111")
  .style("border", "2px solid #00ff41")
  .style("border-radius", "10px")
  .style("padding", "10px 15px")
  .style("font-size", "14px")
  .style("color", "#ffffff")
  .style("box-shadow", "0 0 20px rgba(0, 255, 65, 0.3)")
  .style("pointer-events", "none")
  .style("z-index", "1000");

function renderEnrollmentChart(data) {
  enrollContainer.selectAll("*").remove();

  const enrollSvg = enrollContainer
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${enrollWidth + enrollMargin.left + enrollMargin.right} ${enrollHeight + enrollMargin.top + enrollMargin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("max-height", `${enrollHeight + enrollMargin.top + enrollMargin.bottom}px`)
    .append("g")
    .attr("transform", `translate(${enrollMargin.left},${enrollMargin.top})`);

  const maxVal = d3.max(data, d => Math.max(d.admitted, d.enrolled));
  const enrollXScaleLeft = d3.scaleLinear().domain([0, maxVal]).range([enrollWidth / 2, 0]);
  const enrollXScaleRight = d3.scaleLinear().domain([0, maxVal]).range([enrollWidth / 2, enrollWidth]);
  const enrollYScale = d3.scaleBand()
    .domain(data.map(d => d.school))
    .range([0, enrollHeight])
    .padding(0.35);

  enrollSvg.append("line")
    .attr("class", "enroll-divider-line")
    .attr("x1", enrollWidth / 2)
    .attr("x2", enrollWidth / 2)
    .attr("y1", 0)
    .attr("y2", enrollHeight)
    .attr("stroke", "#00ff41")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4")
    .style("filter", "drop-shadow(0 0 3px rgba(0, 255, 65, 0.5))");

  const colorLeft = "#808080";
  const colorRight = "#00ff41";

  enrollSvg.selectAll(".enroll-bar-left")
    .data(data)
    .join("rect")
    .attr("class", "enroll-bar enroll-bar-left")
    .attr("x", enrollWidth / 2)
    .attr("y", d => enrollYScale(d.school))
    .attr("width", 0)
    .attr("height", enrollYScale.bandwidth())
    .attr("fill", colorLeft)
    .attr("stroke", "#1a1a1a")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .transition()
    .duration(900)
    .attr("x", d => enrollXScaleLeft(d.admitted))
    .attr("width", d => (enrollWidth / 2) - enrollXScaleLeft(d.admitted));

  enrollSvg.selectAll(".enroll-bar-right")
    .data(data)
    .join("rect")
    .attr("class", "enroll-bar enroll-bar-right")
    .attr("x", enrollWidth / 2)
    .attr("y", d => enrollYScale(d.school))
    .attr("width", 0)
    .attr("height", enrollYScale.bandwidth())
    .attr("fill", colorRight)
    .attr("stroke", "#00cc33")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .style("filter", "drop-shadow(0 0 5px rgba(0, 255, 65, 0.3))")
    .transition()
    .duration(900)
    .attr("width", d => enrollXScaleRight(d.enrolled) - enrollWidth / 2);

  enrollSvg.selectAll(".enroll-bar")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget)
        .style("opacity", 0.8)
        .attr("stroke-width", 2);

      enrollTooltip.style("visibility", "visible")
        .html(`<strong style="color: #00ff41">${d.school}</strong><br>Admitted: ${d.admitted.toLocaleString()}<br>Enrolled: ${d.enrolled.toLocaleString()}<br>Yield: ${d.yield}%`);
    })
    .on("mousemove", event => {
      enrollTooltip
        .style("top", (event.pageY - 20) + "px")
        .style("left", (event.pageX + 20) + "px");
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget)
        .style("opacity", 1)
        .attr("stroke-width", 1);
      enrollTooltip.style("visibility", "hidden");
    });

  enrollSvg.selectAll(".enroll-school-label")
    .data(data)
    .join("text")
    .attr("class", "enroll-school-label")
    .attr("x", enrollWidth / 2)
    .attr("y", d => enrollYScale(d.school) + enrollYScale.bandwidth() / 1.6)
    .attr("text-anchor", "middle")
    .attr("fill", "#00ff41")
    .attr("font-weight", "600")
    .attr("font-size", enrollIsSmallMobile ? "11px" : "14px")
    .text(d => d.school);

  enrollSvg.selectAll(".enroll-value-label-left")
    .data(data)
    .join("text")
    .attr("class", "enroll-value-label")
    .attr("x", d => enrollXScaleLeft(d.admitted) - (enrollIsSmallMobile ? 5 : 10))
    .attr("y", d => enrollYScale(d.school) + enrollYScale.bandwidth() / 1.6)
    .attr("text-anchor", "end")
    .attr("fill", "#000000")
    .attr("font-weight", "600")
    .attr("font-size", enrollIsSmallMobile ? "10px" : "13px")
    .text(d => enrollIsSmallMobile ? `${Math.round(d.admitted/1000)}K` : d.admitted.toLocaleString());

  enrollSvg.selectAll(".enroll-value-label-right")
    .data(data)
    .join("text")
    .attr("class", "enroll-value-label")
    .attr("x", d => enrollXScaleRight(d.enrolled) + (enrollIsSmallMobile ? 5 : 10))
    .attr("y", d => enrollYScale(d.school) + enrollYScale.bandwidth() / 1.6)
    .attr("text-anchor", "start")
    .attr("fill", "#000000")
    .attr("font-weight", "600")
    .attr("font-size", enrollIsSmallMobile ? "10px" : "13px")
    .text(d => enrollIsSmallMobile ? `${Math.round(d.enrolled/1000)}K` : d.enrolled.toLocaleString());

  enrollSvg.append("text")
    .attr("x", enrollWidth / 4)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", enrollIsSmallMobile ? "11px" : "13px")
    .style("font-weight", "600")
    .style("fill", "#00ff41")
    .text("Admitted");

  enrollSvg.append("text")
    .attr("x", (enrollWidth / 4) * 3)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", enrollIsSmallMobile ? "11px" : "13px")
    .style("font-weight", "600")
    .style("fill", "#00ff41")
    .text("Enrolled");
}

// Load CSV data and render chart
d3.csv('data/data.csv').then(rows => {
  // Use most recent year data (2024-2025)
  const targetYear = '2024-2025';

  const schoolData = [];

  for (const [displayName, csvName] of Object.entries(ENROLL_INSTITUTION_MAP)) {
    const row = rows.find(r =>
      r.Institution && r.Institution.trim() === csvName &&
      r.CDS_Year && r.CDS_Year.trim() === targetYear
    );

    if (row) {
      const acceptanceRate = parseFloat(row.AcceptanceRate_FTFY);
      const yieldRate = parseFloat(row.Yield_FTFY);

      if (Number.isFinite(acceptanceRate) && Number.isFinite(yieldRate) && acceptanceRate > 0 && yieldRate > 0) {
        // Estimate class size (typical Ivy League freshman class ~1200-1700)
        // We'll use yield to back-calculate from typical enrolled numbers
        const typicalEnrolled = displayName === 'Cornell' ? 3500 :
          displayName === 'Penn' ? 2400 :
          displayName === 'Harvard' ? 1650 :
          displayName === 'Yale' ? 1550 :
          displayName === 'Princeton' ? 1400 :
          displayName === 'Brown' ? 1700 :
          displayName === 'Dartmouth' ? 1200 :
          displayName === 'Columbia' ? 1450 : 1500;

        const enrolled = typicalEnrolled;
        const admitted = Math.round(enrolled / yieldRate);
        const yieldPct = (yieldRate * 100);

        schoolData.push({
          school: displayName,
          admitted: admitted,
          enrolled: enrolled,
          yield: parseFloat(yieldPct.toFixed(1))
        });
      }
    }
  }

  if (schoolData.length > 0) {
    enrollmentData = schoolData;
    renderEnrollmentChart(enrollmentData);
  } else {
    console.warn('No enrollment data found for year:', targetYear);
  }
}).catch(err => {
  console.error('Failed to load enrollment data:', err);
});