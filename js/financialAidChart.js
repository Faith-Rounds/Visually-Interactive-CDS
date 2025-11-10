// Financial Aid Chart - Horizontal animated chart

const aidSchools = ['Harvard','Yale','Princeton','Columbia','Brown','Dartmouth','Cornell','Penn'];
const aidNameMap = { 'Upenn': 'Penn', 'Penn': 'Penn' };
let aidCurrentYear = '2024-2025';

const aidColorMap = {
  'Harvard': '#A51C30',
  'Yale': '#0F4D92',
  'Princeton': '#FF8F00',
  'Columbia': '#9BD3E7',
  'Brown': '#8B4513',
  'Dartmouth': '#00693E',
  'Cornell': '#B31B1B',
  'Penn': '#001489'
};

const aidMargin = { top: 30, right: 40, bottom: 80, left: 120 };
const aidContainer = d3.select("#financial-aid-chart");
const aidContainerWidth = aidContainer.node().getBoundingClientRect().width;
const aidWidth = Math.min(700, aidContainerWidth - 40) - aidMargin.left - aidMargin.right;
const aidHeight = 450 - aidMargin.top - aidMargin.bottom;

function aidParseNum(v) {
  if (v == null) return null;
  const s = String(v).replace(/\n|\r|\s|,/g, '');
  if (s === '') return null;
  const n = +s;
  return Number.isFinite(n) ? n : null;
}

function aidNormalizeYear(s) {
  if (!s) return '';
  const t = String(s).trim();
  const m = t.match(/^(\d{4})-(\d{2,4})$/);
  if (m) {
    if (m[2].length === 2) return `${m[1]}-${m[1].slice(0,2)}${m[2]}`;
    return t;
  }
  return t;
}

let aidAllData = null;
let aidSvg = null;
let aidX = null;
let aidY = null;
let aidSize = null;
let aidTooltip = null;

function prepareAidYearData(rows, year) {
  const byInst = new Map();
  rows.forEach(r => {
    const inst = r.Institution ? r.Institution.trim() : '';
    const y = aidNormalizeYear(r.CDS_Year);
    if (y !== year) return;
    if (!byInst.has(inst)) byInst.set(inst, r);
  });

  return aidSchools.map(s => {
    const csvKeys = Array.from(byInst.keys());
    const csvKey = csvKeys.find(k => k && (k === s || aidNameMap[k] === s || k.includes(s) || s.includes(k)));
    const row = csvKey ? byInst.get(csvKey) : null;
    const aid = row ? (aidParseNum(row.AvgAidPackage_Freshmen) ?? aidParseNum(row.AvgPackage_Freshmen) ?? aidParseNum(row.AvgNeedGrant_Freshmen)) : null;
    const pct = row ? aidParseNum(row.PctNeedMet_Freshmen) : null;
    return { school: s, aidAmount: aid, pctNeedMet: pct };
  }).filter(d => d.aidAmount != null);
}

function updateAidVisualization(year) {
  const data = prepareAidYearData(aidAllData, year);

  if (!data.length) {
    aidSvg.selectAll('*').remove();
    aidSvg.append('text')
      .attr('x', aidWidth/2)
      .attr('y', aidHeight/2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#900')
      .text('No data for ' + year);
    return;
  }

  const aidVals = data.map(d => d.aidAmount);
  const xmin = Math.min(...aidVals) * 0.95;
  const xmax = Math.max(...aidVals) * 1.05;
  aidX.domain([xmin, xmax]);
  aidY.domain(data.map(d => d.school));

  const t = d3.transition().duration(750);

  aidSvg.select('.aid-x-axis').transition(t)
    .call(d3.axisBottom(aidX).ticks(5).tickFormat(d => `$${Math.round(d/1000)}K`));

  aidSvg.select('.aid-y-axis').transition(t)
    .call(d3.axisLeft(aidY).tickSize(0))
    .call(g => g.selectAll('text').attr('font-weight', 600));

  const startX = aidX(xmin);

  const lines = aidSvg.selectAll('.aid-line')
    .data(data, d => d.school);

  lines.exit().remove();

  const linesEnter = lines.enter()
    .append('line')
    .attr('class', 'aid-line')
    .attr('x1', startX)
    .attr('x2', startX)
    .attr('y1', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('y2', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('stroke', d => aidColorMap[d.school])
    .attr('stroke-opacity', 0.3)
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round');

  lines.merge(linesEnter)
    .transition(t)
    .attr('y1', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('y2', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('x1', startX)
    .attr('x2', d => aidX(d.aidAmount))
    .attr('stroke-opacity', 0.85);

  const circles = aidSvg.selectAll('.aid-circle')
    .data(data, d => d.school);

  circles.exit().remove();

  const circlesEnter = circles.enter()
    .append('circle')
    .attr('class', 'aid-circle')
    .attr('cx', startX)
    .attr('cy', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('r', d => d.pctNeedMet != null ? aidSize(d.pctNeedMet) : 6)
    .attr('fill', d => aidColorMap[d.school])
    .attr('fill-opacity', 0.9)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer');

  circles.merge(circlesEnter)
    .transition(t)
    .attr('cy', d => aidY(d.school) + aidY.bandwidth() / 2)
    .attr('cx', d => aidX(d.aidAmount))
    .attr('r', d => d.pctNeedMet != null ? aidSize(d.pctNeedMet) : 6);

  aidSvg.selectAll('.aid-circle')
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .raise()
        .transition()
        .duration(150)
        .attr('r', (d.pctNeedMet != null ? aidSize(d.pctNeedMet) : 6) * 1.15)
        .attr('stroke-width', 2);

      aidTooltip.style('opacity', 1)
        .html(`<strong>${d.school}</strong><br>Avg Aid: $${Math.round(d.aidAmount).toLocaleString()}<br>Pct Need Met: ${d.pctNeedMet != null ? (d.pctNeedMet*100).toFixed(1) + '%' : 'N/A'}`);
    })
    .on('mousemove', event => {
      aidTooltip.style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
    })
    .on('mouseleave', function(event, d) {
      d3.select(this)
        .transition()
        .duration(120)
        .attr('r', d => d.pctNeedMet != null ? aidSize(d.pctNeedMet) : 6)
        .attr('stroke-width', 1.5);
      aidTooltip.style('opacity', 0);
    });

  aidSvg.select('.aid-min-label')
    .transition(t)
    .text(`$${Math.round(xmin/1000)}K`);

  aidSvg.select('.aid-max-label')
    .transition(t)
    .text(`$${Math.round(xmax/1000)}K`);
}

d3.csv('data/data.csv').then(rows => {
  aidAllData = rows;

  aidSvg = aidContainer
    .append('svg')
    .attr('width', aidWidth + aidMargin.left + aidMargin.right)
    .attr('height', aidHeight + aidMargin.top + aidMargin.bottom)
    .append('g')
    .attr('transform', `translate(${aidMargin.left},${aidMargin.top})`);

  aidTooltip = d3.select('body').append('div')
    .attr('class', 'aid-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '8px')
    .style('padding', '8px 12px')
    .style('font-size', '12px')
    .style('box-shadow', '0 4px 16px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '1000');

  aidX = d3.scaleLinear().range([0, aidWidth]);
  aidY = d3.scaleBand().range([0, aidHeight]).padding(0.4);
  aidSize = d3.scaleSqrt().domain([0, 1]).range([4, 22]);

  aidSvg.append('g')
    .attr('class', 'aid-x-axis')
    .attr('transform', `translate(0,${aidHeight})`);

  aidSvg.append('g')
    .attr('class', 'aid-y-axis');

  aidSvg.append('text')
    .attr('x', aidWidth / 2)
    .attr('y', aidHeight + 50)
    .attr('text-anchor', 'middle')
    .attr('fill', '#555')
    .attr('font-size', '12px')
    .text('Line length = Average Aid Amount ($), Circle size = % Need Met');

  aidSvg.append('text')
    .attr('class', 'aid-min-label')
    .attr('x', 0)
    .attr('y', aidHeight + 35)
    .attr('text-anchor', 'start')
    .attr('fill', '#555')
    .attr('font-size', '12px');

  aidSvg.append('text')
    .attr('class', 'aid-max-label')
    .attr('x', aidWidth)
    .attr('y', aidHeight + 35)
    .attr('text-anchor', 'end')
    .attr('fill', '#555')
    .attr('font-size', '12px');

  updateAidVisualization(aidCurrentYear);

  d3.select('#aid-year-select').on('change', function() {
    aidCurrentYear = this.value;
    updateAidVisualization(aidCurrentYear);
  });
});
