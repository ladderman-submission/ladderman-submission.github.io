(function () {
  const METHOD1 = [
    [0.61, 0.82, 0.98, 0.97, 0.95, 0.74],
    [0.77, 0.96, 1.0, 1.0, 0.99, 0.83],
    [0.65, 0.91, 0.99, 1.0, 0.97, 0.9],
    [0.43, 0.62, 0.9, 0.92, 0.81, 0.5],
  ];

  const METHOD2 = [
    [0.0, 0.0, 0.0, 0.05, 0.0, 0.0],
    [0.0, 0.0, 0.12, 0.24, 0.02, 0.0],
    [0.0, 0.0, 0.49, 0.3, 0.02, 0.0],
    [0.0, 0.0, 0.03, 0.0, 0.0, 0.0],
  ];

  const X_LABELS = [20, 22, 24, 26, 28, 30];
  const Y_LABELS = [55, 60, 65, 70];
  const X_HALF = 1;
  const Y_HALF = 2.5;

  function cellBounds(x, y) {
    return {
      x0: x - X_HALF,
      x1: x + X_HALF,
      y0: y - Y_HALF,
      y1: y + Y_HALF,
    };
  }

  function buildHoverShape(point) {
    const bounds = cellBounds(point.x, point.y);
    return {
      type: "rect",
      xref: point.fullData.xaxis,
      yref: point.fullData.yaxis,
      x0: bounds.x0,
      x1: bounds.x1,
      y0: bounds.y0,
      y1: bounds.y1,
      line: { color: "#2c3e50", width: 2.5 },
      fillcolor: "rgba(44, 62, 80, 0.15)",
      layer: "above",
    };
  }

  // Matplotlib Greens sampled from linspace(0.05, 0.68, 256) — matches heatmap script
  const GREENS_CMAP = [
    [0.0, "#f0f9ed"],
    [0.125, "#e3f4de"],
    [0.25, "#d1edca"],
    [0.375, "#bbe4b5"],
    [0.5, "#a4da9e"],
    [0.625, "#88cd86"],
    [0.75, "#69be70"],
    [0.875, "#49af61"],
    [1.0, "#339c51"],
  ];

  function formatMatrix(matrix) {
    return matrix.map((row) => row.map((value) => value.toFixed(2)));
  }

  function isMobileView(container) {
    return (
      (container && container.dataset.layout === "mobile") ||
      document.body.classList.contains("is-mobile-page") ||
      /index-mobile\.html/i.test(window.location.pathname) ||
      window.innerWidth <= 768
    );
  }

  function buildHeatmapTrace(matrix, textColor, showScale, colorbar, showCellText) {
    const trace = {
      type: "heatmap",
      z: matrix,
      x: X_LABELS,
      y: Y_LABELS,
      colorscale: GREENS_CMAP,
      zmin: 0,
      zmax: 1,
      showscale: showScale,
      colorbar: colorbar,
      xgap: 2,
      ygap: 2,
      hoverongaps: false,
      hovertemplate:
        "Inclination: %{y} deg<br>" +
        "Spacing: %{x} cm<br>" +
        "Success rate: %{z:.2f}<extra></extra>",
      texttemplate: "",
    };

    if (showCellText) {
      trace.text = formatMatrix(matrix);
      trace.texttemplate = "%{text}";
      trace.textfont = {
        family: "IBM Plex Mono, monospace",
        size: 16,
        color: textColor,
      };
    }

    return trace;
  }

  function renderSuccessRateHeatmap(containerId) {
    const container = document.getElementById(containerId);
    if (!container || typeof Plotly === "undefined") {
      return;
    }

    const mobile = isMobileView(container);
    const showCellText = !mobile;
    const spacingAxisTitle = "Spacing, <i>z</i> (cm)";

    const traces = [
      Object.assign(
        buildHeatmapTrace(METHOD1, "white", false, undefined, showCellText),
        { xaxis: "x", yaxis: "y" }
      ),
      Object.assign(
        buildHeatmapTrace(METHOD2, "black", true, {
          title: {
            text: "Success rate",
            font: { family: "IBM Plex Mono, monospace", size: 16 },
            side: "right",
            pad: 28,
          },
          tickfont: { family: "IBM Plex Mono, monospace", size: 12 },
          len: 0.85,
          thickness: 18,
          xpad: 8,
        }, showCellText),
        { xaxis: "x2", yaxis: "y2" }
      ),
    ];

    const axisStyle = {
      titlefont: { family: "IBM Plex Mono, monospace", size: mobile ? 13 : 16 },
      tickfont: { family: "IBM Plex Mono, monospace", size: mobile ? 11 : 13 },
      showgrid: false,
      zeroline: false,
      ticks: "outside",
      mirror: false,
      showline: false,
    };

    const annotations = [
      {
        text: "<b>LadderMan</b>",
        x: 0.5,
        y: 1.08,
        xref: "x domain",
        yref: "paper",
        xanchor: "center",
        showarrow: false,
        font: { family: "IBM Plex Mono, monospace", size: mobile ? 15 : 18 },
      },
      {
        text: "<b>Baseline</b>",
        x: 0.5,
        y: 1.08,
        xref: "x2 domain",
        yref: "paper",
        xanchor: "center",
        showarrow: false,
        font: { family: "IBM Plex Mono, monospace", size: mobile ? 15 : 18 },
      },
    ];

    if (mobile) {
      annotations.push({
        text: spacingAxisTitle,
        x: 0.5,
        y: -0.28,
        xref: "paper",
        yref: "paper",
        xanchor: "center",
        yanchor: "top",
        showarrow: false,
        font: { family: "IBM Plex Mono, monospace", size: 13 },
      });
    }

    const layout = {
      font: { family: "IBM Plex Mono, monospace" },
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "#ffffff",
        bordercolor: "#2c3e50",
        font: {
          family: "IBM Plex Mono, monospace",
          size: 13,
          color: "#2c3e50",
        },
      },
      paper_bgcolor: "white",
      plot_bgcolor: "white",
      margin: mobile
        ? { l: 52, r: 72, t: 56, b: 118 }
        : { l: 65, r: 90, t: 60, b: 65 },
      xaxis: Object.assign({}, axisStyle, {
        domain: [0.0, 0.46],
        title: mobile ? undefined : { text: spacingAxisTitle },
        tickmode: "array",
        tickvals: X_LABELS,
        ticktext: X_LABELS.map((value) => value.toFixed(2)),
        anchor: "y",
      }),
      yaxis: Object.assign({}, axisStyle, {
        domain: [0.0, 1.0],
        title: { text: "Inclination, φ (deg)" },
        tickmode: "array",
        tickvals: Y_LABELS,
        ticktext: Y_LABELS.map(String),
        autorange: "reversed",
        anchor: "x",
      }),
      xaxis2: Object.assign({}, axisStyle, {
        domain: [0.50, 0.98],
        title: mobile ? undefined : { text: spacingAxisTitle },
        tickmode: "array",
        tickvals: X_LABELS,
        ticktext: X_LABELS.map((value) => value.toFixed(2)),
        anchor: "y2",
      }),
      yaxis2: Object.assign({}, axisStyle, {
        domain: [0.0, 1.0],
        showticklabels: false,
        autorange: "reversed",
        anchor: "x2",
      }),
      annotations: annotations,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(container, traces, layout, config);

    container.on("plotly_hover", function (event) {
      const point = event.points[0];
      if (!point) {
        return;
      }
      Plotly.relayout(container, { shapes: [buildHoverShape(point)] });
    });

    container.on("plotly_unhover", function () {
      Plotly.relayout(container, { shapes: [] });
    });

    window.addEventListener("resize", function () {
      Plotly.Plots.resize(container);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSuccessRateHeatmap("success-rate-heatmap");
  });
})();
