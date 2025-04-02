let canvas, ctx;
const nodes = [];
const edges = [];
let adjList = {};
let isCreatingEdge = false;
let selectedNode = null;

const COLORS = {
    NODE: "#4b6cb7",
    NODE_BORDER: "#ffffff",
    NODE_SELECTED: "#7FB3D5",
    NODE_HOVER: "#5DADE2",
    EDGE: "#95a5a6",
    TEXT: "#ffffff",
    ARTICULATION_POINT: "#ff6b6b"
};

const NODE_RADIUS = 15;

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById("graphCanvas");
    ctx = canvas.getContext("2d");
    
    setCanvasDimensions();
    setupEventListeners();
    showStatusMessage('Click on canvas to add nodes');
});

window.addEventListener('resize', setCanvasDimensions);

function setCanvasDimensions() {
    if (!canvas) return;
    
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = 500; 
    canvas.style.height = '500px';
    drawGraph();
}

function setupEventListeners() {
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleMouseMove);
    
    document.getElementById("add-edge-btn").addEventListener("click", startEdgeCreation);
    document.getElementById("clear-btn").addEventListener("click", clearGraph);
    document.getElementById("find-ap-btn").addEventListener("click", findArticulationPoints);
}

function showStatusMessage(message, duration = 3000) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.classList.add('visible');
    
    setTimeout(() => {
        statusElement.classList.remove('visible');
    }, duration);
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedNodeIndex = getNodeAtPosition(x, y);
    
    if (isCreatingEdge) {
        if (clickedNodeIndex !== -1) {
            if (selectedNode === null) {
                selectedNode = clickedNodeIndex;
                showStatusMessage('First node selected. Now select second node.');
                nodes[clickedNodeIndex].selected = true;
            } else if (selectedNode !== clickedNodeIndex) {
                addEdge(selectedNode, clickedNodeIndex);
                showStatusMessage('Edge created!');
                exitEdgeCreationMode();
            }
        }
    } else {
        if (clickedNodeIndex === -1) {
            addNode(x, y);
            showStatusMessage(`Node ${nodes.length - 1} created`);
        }
    }
    
    drawGraph();
}

function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let hoveredNode = getNodeAtPosition(x, y);
    let cursorChanged = false;
    
    nodes.forEach((node, index) => {
        const wasHovered = node.hovered;
        node.hovered = index === hoveredNode;
        
        if (wasHovered !== node.hovered) {
            cursorChanged = true;
        }
    });
    
    if (cursorChanged) {
        drawGraph();
        
        if (hoveredNode !== -1) {
            canvas.style.cursor = isCreatingEdge ? 'pointer' : 'default';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function getNodeAtPosition(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= NODE_RADIUS) {
            return i;
        }
    }
    return -1;
}

function addNode(x, y) {
    nodes.push({ 
        x, 
        y, 
        id: nodes.length, 
        selected: false, 
        hovered: false 
    });
    adjList[nodes.length - 1] = [];
    updateNodeCount();
    
}


function startEdgeCreation() {
    if (nodes.length < 2) {
        showStatusMessage('Need at least 2 nodes to create an edge');
        return;
    }
    
    isCreatingEdge = true;
    selectedNode = null;
    nodes.forEach(node => node.selected = false);
    
    const edgeButton = document.getElementById("add-edge-btn");
    edgeButton.textContent = "Cancel Edge Creation";
    edgeButton.style.backgroundColor = "#dc3545";
    
    showStatusMessage('Select first node to connect');
}

function exitEdgeCreationMode() {
    isCreatingEdge = false;
    selectedNode = null;
    nodes.forEach(node => node.selected = false);
    
    const edgeButton = document.getElementById("add-edge-btn");
    edgeButton.textContent = "Create Edge";
    edgeButton.style.backgroundColor = "#4b6cb7";
}


function addEdge(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const edgeExists = edges.some(([a, b]) => 
        (a === fromIndex && b === toIndex) || (a === toIndex && b === fromIndex)
    );
    
    if (!edgeExists) {
        edges.push([fromIndex, toIndex]);
        adjList[fromIndex].push(toIndex);
        adjList[toIndex].push(fromIndex);
        updateEdgeCount();
    } else {
        showStatusMessage('Edge already exists');
    }
}

function clearGraph() {
    nodes.length = 0;
    edges.length = 0;
    adjList = {};
    selectedNode = null;
    isCreatingEdge = false;
    exitEdgeCreationMode();
    updateNodeCount();
    updateEdgeCount();
    
    clearArticulationPoints();
    drawGraph();
    showStatusMessage('Graph cleared');
}

function drawGraph() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    edges.forEach(([a, b]) => {
        if (nodes[a] && nodes[b]) {
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.strokeStyle = COLORS.EDGE;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    nodes.forEach((node, index) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        
        if (node.articulationPoint) {
            ctx.fillStyle = COLORS.ARTICULATION_POINT;
        } else if (node.selected || index === selectedNode) {
            ctx.fillStyle = COLORS.NODE_SELECTED;
        } else if (node.hovered) {
            ctx.fillStyle = COLORS.NODE_HOVER;
        } else {
            ctx.fillStyle = COLORS.NODE;
        }
        
        ctx.fill();
        ctx.strokeStyle = COLORS.NODE_BORDER;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.id, node.x, node.y);
    });
}

function updateNodeCount() {
    document.getElementById("node-count").textContent = nodes.length;
}

function updateEdgeCount() {
    document.getElementById("edge-count").textContent = edges.length;
}

function findArticulationPoints() {
    nodes.forEach(node => node.articulationPoint = false);
    clearArticulationPoints();
    
    if (nodes.length === 0) {
        document.getElementById("ap-list").textContent = "No nodes in the graph";
        showStatusMessage('No nodes to analyze');
        return;
    }
    
    showStatusMessage('Finding articulation points...');
    
    const visited = new Array(nodes.length).fill(false);
    const discovery = new Array(nodes.length).fill(0);  
    const low = new Array(nodes.length).fill(0);       
    const parent = new Array(nodes.length).fill(-1);   
    const artPoints = new Set();                      
    let time = 0;
    
    for (let i = 0; i < nodes.length; i++) {
        if (!visited[i]) {
            dfsForArticulationPoints(i, visited, discovery, low, parent, artPoints, time);
        }
    }
    
    artPoints.forEach(point => nodes[point].articulationPoint = true);
    
    displayArticulationPoints(artPoints);
    drawGraph();
    
    const count = artPoints.size;
    showStatusMessage(count > 0 ? `Found ${count} articulation point(s)` : 'No articulation points found');
}

function dfsForArticulationPoints(u, visited, discovery, low, parent, artPoints, time) {
    visited[u] = true;
    
    discovery[u] = low[u] = ++time;
    
    let children = 0;
    
    for (const v of adjList[u]) {
        if (!visited[v]) {
            children++;
            parent[v] = u;
            
            time = dfsForArticulationPoints(v, visited, discovery, low, parent, artPoints, time);
            
            low[u] = Math.min(low[u], low[v]);
            
            if (parent[u] === -1 && children > 1) {
                artPoints.add(u);
            }
            
            if (parent[u] !== -1 && low[v] >= discovery[u]) {
                artPoints.add(u);
            }
        }
        else if (v !== parent[u]) {
            low[u] = Math.min(low[u], discovery[v]);
        }
    }
    
    return time;
}

function displayArticulationPoints(points) {
    const apList = document.getElementById("ap-list");
    apList.innerHTML = '';
    
    if (points.size === 0) {
        apList.textContent = "No articulation points found";
        return;
    }
    
    Array.from(points).sort((a, b) => a - b).forEach(point => {
        const apNode = document.createElement('div');
        apNode.className = 'ap-node';
        apNode.textContent = point;
        apList.appendChild(apNode);
    });
}

function clearArticulationPoints() {
    document.getElementById("ap-list").innerHTML = '';
    nodes.forEach(node => node.articulationPoint = false);
}
