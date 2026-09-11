/** @type {any} */
const w = window;

const controlInit = {
    methods: {},
    events: ['Ready', 'SegmentClicked'],
    properties: {
        Segments: "[]",
        Title: "",
        ShowLegend: true,
        CenterText: ""
    }
};
w.controlInit = controlInit;

let svg = null;
let titleEl = null;
let legendEl = null;
let container = null;

let state = {
    title: "",
    /** @type {{label: string, value: number, color: string}[]} */
    segments: [],
    showLegend: true,
    centerText: ""
};

const SVG_NS = "http://www.w3.org/2000/svg";

function parseSegments(str) {
    if (!str) return [];
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log("[CWC] Fehler beim Parsen von Segments: " + error);
        return [];
    }
}

function onSegmentClicked(index, label) {
    WebCC.Events.fire("SegmentClicked", index, label);
    console.log("[CWC] SegmentClicked: " + index + " / " + label);
}

function polarToCartesian(cx, cy, radius, angleInRadians) {
    return {
        x: cx + radius * Math.cos(angleInRadians),
        y: cy + radius * Math.sin(angleInRadians)
    };
}

function createDonutSlicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    let sweep = endAngle - startAngle;
    if (sweep >= Math.PI * 2 - 0.0001) {
        endAngle = startAngle + Math.PI * 2 - 0.0001;
        sweep = endAngle - startAngle;
    }

    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    return [
        "M", outerStart.x, outerStart.y,
        "A", outerRadius, outerRadius, 0, largeArc, 1, outerEnd.x, outerEnd.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerRadius, innerRadius, 0, largeArc, 0, innerStart.x, innerStart.y,
        "Z"
    ].join(" ");
}

function updateLayoutMode() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width > height * 1.3) {
        container.classList.add("piechart-legend-right");
    } else {
        container.classList.remove("piechart-legend-right");
    }
}

function renderLegend() {
    legendEl.innerHTML = "";
    if (!state.showLegend || state.segments.length === 0) return;

    state.segments.forEach(function(segment) {
        const item = document.createElement("div");
        item.className = "piechart-legend-item";

        const swatch = document.createElement("span");
        swatch.className = "piechart-legend-swatch";
        swatch.style.backgroundColor = segment.color || "#999999";

        const label = document.createElement("span");
        label.className = "piechart-legend-label";
        label.textContent = segment.label || "";

        item.appendChild(swatch);
        item.appendChild(label);
        legendEl.appendChild(item);
    });
}

function renderChart() {
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    const width = svg.clientWidth;
    const height = svg.clientHeight;
    if (!width || !height) return;

    const validSegments = state.segments.filter(function(segment) {
        return segment && typeof segment.value === "number" && segment.value > 0;
    });

    const total = validSegments.reduce(function(sum, segment) { return sum + segment.value; }, 0);
    if (validSegments.length === 0 || total <= 0) return;

    const size = Math.min(width, height);
    const innerRadius = size * 0.35;
    const outerRadius = size * 0.48;
    const cx = width / 2;
    const cy = height / 2;

    let angle = -Math.PI / 2;

    validSegments.forEach(function(segment) {
        const sweep = (segment.value / total) * Math.PI * 2;
        const startAngle = angle;
        const endAngle = angle + sweep;
        angle = endAngle;

        const index = state.segments.indexOf(segment);
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", createDonutSlicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle));
        path.setAttribute("fill", segment.color || "#999999");
        path.setAttribute("class", "piechart-segment");
        path.addEventListener("click", function() {
            onSegmentClicked(index, segment.label || "");
        });

        const titleNode = document.createElementNS(SVG_NS, "title");
        titleNode.textContent = segment.label || "";
        path.appendChild(titleNode);

        svg.appendChild(path);
    });

    if (state.centerText) {
        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", String(cx));
        text.setAttribute("y", String(cy));
        text.setAttribute("class", "piechart-center-text");
        text.setAttribute("font-size", String(Math.max(10, size * 0.12)));
        text.textContent = state.centerText;
        svg.appendChild(text);
    }
}

function render() {
    if (!svg || !container) return;

    titleEl.textContent = state.title || "";
    updateLayoutMode();
    renderLegend();
    renderChart();
}

function setPropertyPiechart(data) {
    switch (data.key) {
        case "Title":
            state.title = data.value;
            render();
            break;
        case "Segments":
            state.segments = parseSegments(data.value);
            render();
            break;
        case "ShowLegend":
            state.showLegend = !!data.value;
            render();
            break;
        case "CenterText":
            state.centerText = data.value;
            render();
            break;
    }
}

function initPiechart() {
    container = document.getElementById("piechart-container");
    titleEl = document.getElementById("piechart-title");
    legendEl = document.getElementById("piechart-legend");
    svg = document.getElementById("piechart-svg");
    if (!container) return;

    setProperty({ key: "Title", value: WebCC.Properties.Title });
    setProperty({ key: "Segments", value: WebCC.Properties.Segments });
    setProperty({ key: "ShowLegend", value: WebCC.Properties.ShowLegend });
    setProperty({ key: "CenterText", value: WebCC.Properties.CenterText });

    window.addEventListener("resize", function() { render(); });

    WebCC.Events.fire("Ready");
    console.log("[CWC] Ready");
}
