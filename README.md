# Ivy League Analysis - Interactive Visualization

An interactive data visualization project exploring the true costs, selectivity, financial aid, and enrollment patterns of Ivy League institutions.

## Overview

This project provides a comprehensive analysis of what it really takes to attend an Ivy League school, moving beyond sticker prices to reveal the complete picture of college decision-making factors.

## Features

- **Cost Analysis**: Interactive radial chart showing tuition costs across all eight Ivy League schools
- **Admission Rates**: Visualization of acceptance rates and selectivity metrics
- **Financial Aid Insights**: Comprehensive breakdown of financial aid distribution and impact
- **Enrollment Patterns**: Analysis of admissions vs. enrollment data
- **Responsive Design**: Fully responsive interface optimized for all devices

## Technology Stack

- **D3.js v7**: Data visualization library
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: No framework dependencies for optimal performance

## Project Structure

```bash
├── index.html                      # Main HTML file
├── css/
│   └── style.css                   # Styling
├── js/
│   ├── main.js                     # Main application logic
│   ├── radialChart.js              # Radial chart visualization
│   ├── admissionRatesChart.js      # Admission rates visualization
│   ├── financialAidChart.js        # Financial aid visualization
│   └── admissionsEnrollmentsChart.js # Enrollment patterns visualization
└── data/
    └── [data files]                # Dataset files
```

## Getting Started

### Local Development

1. Clone the repository:

```bash
git clone git@github.com:Faith-Rounds/Visually-Interactive-CDS.git
cd Visually-Interactive-CDS
```

2.Open `index.html` in your browser or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

3.Navigate to `http://localhost:8000` in your browser

## Deployment

This project is deployed on Vercel and can be accessed at the live URL: https://milestone-10-final-submission.vercel.app

## Data Sources

The visualizations are based on Common Data Set (CDS) information from Ivy League institutions, providing accurate and up-to-date information about costs, admissions, and financial aid.

## Authors

Diramu, Faith, Hyejoo, Isaya


## License

This project is part of an academic submission for data visualization coursework.
