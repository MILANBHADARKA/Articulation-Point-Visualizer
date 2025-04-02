// Global variables
let canvas, ctx;
const nodes = [];
const edges = [];
let adjList = {};
let isCreatingEdge = false;
let selectedNode = null;

// Constants for styling
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

// Event listeners setup
document.addEventListener('DOMContentLoaded', function() {
    // Initialize canvas reference after DOM is loaded
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
    canvas.height = 500; // Fixed height
    canvas.style.height = '500px';
    drawGraph();
}

function setupEventListeners() {
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleMouseMove);
    
    // Removed add-node-btn since it's commented out in HTML
    document.getElementById("add-edge-btn").addEventListener("click", startEdgeCreation);
    // Removed connect-btn since it's commented out in HTML
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

// Canvas event handlers
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicking on a node
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
            // Add a new node if not clicking on existing node
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
    
    // Highlight node under cursor
    let hoveredNode = getNodeAtPosition(x, y);
    let cursorChanged = false;
    
    nodes.forEach((node, index) => {
        const wasHovered = node.hovered;
        node.hovered = index === hoveredNode;
        
        if (wasHovered !== node.hovered) {
            cursorChanged = true;
        }
    });
    
    // Only redraw if hover state changed
    if (cursorChanged) {
        drawGraph();
        
        // Change cursor style
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

// Graph manipulation functions
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
    
    // Removed updateNodeSelects() since the select elements are commented out
}

// Removed addRandomNode() since the add-node-btn is commented out

function startEdgeCreation() {
    if (nodes.length < 2) {
        showStatusMessage('Need at least 2 nodes to create an edge');
        return;
    }
    
    isCreatingEdge = true;
    selectedNode = null;
    // Reset any previously selected nodes
    nodes.forEach(node => node.selected = false);
    
    const edgeButton = document.getElementById("add-edge-btn");
    edgeButton.textContent = "Cancel Edge Creation";
    edgeButton.style.backgroundColor = "#dc3545";
    
    showStatusMessage('Select first node to connect');
}

function exitEdgeCreationMode() {
    isCreatingEdge = false;
    selectedNode = null;
    // Reset any selected nodes
    nodes.forEach(node => node.selected = false);
    
    const edgeButton = document.getElementById("add-edge-btn");
    edgeButton.textContent = "Create Edge";
    edgeButton.style.backgroundColor = "#4b6cb7";
}

// Removed connectSelectedNodes() since the connect-btn and select elements are commented out

function addEdge(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    // Check if edge already exists
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
    
    // Removed updateNodeSelects() since the select elements are commented out
    clearArticulationPoints();
    drawGraph();
    showStatusMessage('Graph cleared');
}

// Drawing functions
function drawGraph() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    edges.forEach(([a, b]) => {
        if (nodes[a] && nodes[b]) { // Make sure nodes exist
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.strokeStyle = COLORS.EDGE;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Draw nodes
    nodes.forEach((node, index) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        
        // Determine node color
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
        
        // Draw node ID
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.id, node.x, node.y);
    });
}

// UI updates
function updateNodeCount() {
    document.getElementById("node-count").textContent = nodes.length;
}

function updateEdgeCount() {
    document.getElementById("edge-count").textContent = edges.length;
}

// Removed updateNodeSelects() since the select elements are commented out

// Simplified articulation points algorithm with clearer structure
function findArticulationPoints() {
    // Reset previous articulation points
    nodes.forEach(node => node.articulationPoint = false);
    clearArticulationPoints();
    
    if (nodes.length === 0) {
        document.getElementById("ap-list").textContent = "No nodes in the graph";
        showStatusMessage('No nodes to analyze');
        return;
    }
    
    showStatusMessage('Finding articulation points...');
    
    // Step 1: Initialize arrays needed for the algorithm
    const visited = new Array(nodes.length).fill(false);
    const discovery = new Array(nodes.length).fill(0);  // Discovery time
    const low = new Array(nodes.length).fill(0);        // Earliest reachable vertex
    const parent = new Array(nodes.length).fill(-1);    // Parent in DFS tree
    const artPoints = new Set();                        // Store articulation points
    let time = 0;
    
    // Step 2: Run DFS on each unvisited node (for disconnected graphs)
    for (let i = 0; i < nodes.length; i++) {
        if (!visited[i]) {
            // Simple DFS to find articulation points
            dfsForArticulationPoints(i, visited, discovery, low, parent, artPoints, time);
        }
    }
    
    // Step 3: Highlight articulation points in the graph
    artPoints.forEach(point => nodes[point].articulationPoint = true);
    
    // Step 4: Display results in the UI
    displayArticulationPoints(artPoints);
    drawGraph();
    
    // Show success message
    const count = artPoints.size;
    showStatusMessage(count > 0 ? `Found ${count} articulation point(s)` : 'No articulation points found');
}

// Simple DFS to find articulation points
function dfsForArticulationPoints(u, visited, discovery, low, parent, artPoints, time) {
    // Mark current node as visited
    visited[u] = true;
    
    // Set discovery and low times
    discovery[u] = low[u] = ++time;
    
    // Count children in DFS tree
    let children = 0;
    
    // Visit all neighbors
    for (const v of adjList[u]) {
        // If not visited yet
        if (!visited[v]) {
            children++;
            parent[v] = u;
            
            // Recursive DFS
            time = dfsForArticulationPoints(v, visited, discovery, low, parent, artPoints, time);
            
            // Calculate low value - core of articulation point logic
            low[u] = Math.min(low[u], low[v]);
            
            // Check if u is an articulation point
            
            // Case 1: Root with multiple children
            if (parent[u] === -1 && children > 1) {
                artPoints.add(u);
            }
            
            // Case 2: Non-root node where child's low value >= discovery time
            if (parent[u] !== -1 && low[v] >= discovery[u]) {
                artPoints.add(u);
            }
        }
        // Back edge (v is already visited and not parent)
        else if (v !== parent[u]) {
            // Update low value
            low[u] = Math.min(low[u], discovery[v]);
        }
    }
    
    return time;
}

// Simple display function for articulation points
function displayArticulationPoints(points) {
    const apList = document.getElementById("ap-list");
    apList.innerHTML = '';
    
    if (points.size === 0) {
        apList.textContent = "No articulation points found";
        return;
    }
    
    // Create nice visual badges for each articulation point
    Array.from(points).sort((a, b) => a - b).forEach(point => {
        const apNode = document.createElement('div');
        apNode.className = 'ap-node';
        apNode.textContent = point;
        apList.appendChild(apNode);
    });
}

// Clear articulation points from display
function clearArticulationPoints() {
    document.getElementById("ap-list").innerHTML = '';
    nodes.forEach(node => node.articulationPoint = false);
}
