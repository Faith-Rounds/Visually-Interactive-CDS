# Ivy League Analysis - Interactive Visualization

An interactive data visualization project exploring the true costs, selectivity, financial aid, and enrollment patterns of Ivy League institutions.

## Overview

This project provides a comprehensive analysis of what it really takes to attend an Ivy League school, moving beyond sticker prices to reveal the complete picture of college decision-making factors.

## Features

- **Cost Analysis**: Interactive radial chart showing total costs across all eight Ivy League schools with year selector
- **Admission Rates**: Line chart with school-specific colors, interactive legend, toggle buttons, and year slider
- **Financial Aid**: Bubble chart showing aid packages and percentage of demonstrated need met
- **Yield Rates**: Mirrored bar chart comparing admitted vs. enrolled students with click interactions and particle effects
- **Scroll Animations**: GSAP-powered progressive reveals as you scroll through the data story
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

- **D3.js v7**: Data visualization library
- **GSAP v3.12.2**: Animation library
- **ScrollTrigger v3.12.2**: Scroll-based animation triggers
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: No framework dependencies

## Project Structure

```bash
├── index.html                      # Main HTML file
├── css/
│   └── style.css                   # Styling
├── js/
│   ├── main.js                     # Main application logic
│   ├── parallax.js                 # Parallax scroll effects
│   ├── radialChart.js              # Cost analysis radial chart
│   ├── admissionRatesChart.js      # Admission rates line chart
│   ├── financialAidChart.js        # Financial aid bubble chart
│   └── admissionsEnrollmentsChart.js # Yield rate mirrored bar chart
└── data/
    └── data.csv                    # Common Data Set information (2020-2025)
```

## Getting Started

### Local Development

1. Clone the repository:

```bash
git clone git@github.com:Faith-Rounds/Visually-Interactive-CDS.git
cd Visually-Interactive-CDS
```

2. Open `index.html` in your browser or use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Or simply open the file directly
open index.html
```

3. Navigate to `http://localhost:8000` in your browser

## Deployment

This project is deployed on Vercel and can be accessed at the live URL: [https://milestone-10-final-submission.vercel.app](https://milestone-10-final-submission.vercel.app)

## Data Sources

The visualizations are based on Common Data Set reports from all eight Ivy League institutions covering academic years 2020-2021 through 2024-2025. Data includes acceptance rates, yield rates, costs of attendance, financial aid packages, and enrollment statistics.

## Authors

Diramu, Faith, Hyejoo, Isaya

## License

This project is part of an academic submission for data visualization coursework.
