<script>
  import { onMount } from 'svelte';
  import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation
  } from 'd3-force';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {import('$lib/knowledge/graph').KnowledgeGraphNode} KnowledgeGraphNode */
  /** @typedef {import('$lib/knowledge/graph').KnowledgeGraphLink} KnowledgeGraphLink */
  /** @typedef {KnowledgeGraphNode & import('d3-force').SimulationNodeDatum} SimulationNode */
  /** @typedef {KnowledgeGraphLink & import('d3-force').SimulationLinkDatum<SimulationNode>} SimulationLink */
  /** @typedef {KnowledgeGraphNode & { x: number, y: number }} RenderNode */
  /** @typedef {KnowledgeGraphLink & { x1: number, y1: number, x2: number, y2: number }} RenderLink */
  /** @typedef {{ nodes?: KnowledgeGraphNode[], links?: KnowledgeGraphLink[], selectedId?: string | null, focusVersion?: number, onSelect?: (id: string) => void }} Props */

  /** @type {Props} */
  let { nodes = [], links = [], selectedId = null, focusVersion = 0, onSelect } = $props();

  /** @type {HTMLDivElement} */
  let container;
  /** @type {SVGSVGElement} */
  let svg;
  let width = $state(900);
  let height = $state(600);
  /** @type {RenderNode[]} */
  let renderNodes = $state([]);
  /** @type {RenderLink[]} */
  let renderLinks = $state([]);
  let camera = $state({ x: 0, y: 0, k: 1 });
  let mounted = false;
  let reducedMotion = false;
  /** @type {number | null} */
  let lastFocusVersion = null;
  /** @type {import('d3-force').Simulation<SimulationNode, SimulationLink> | null} */
  let simulation = null;
  /** @type {Map<string, SimulationNode>} */
  let simulationNodes = new Map();
  /** @type {Map<string, { x: number, y: number }>} */
  const positions = new Map();
  /** @type {{ pointerId: number, startX: number, startY: number, cameraX: number, cameraY: number } | null} */
  let pan = null;
  /** @type {{ pointerId: number, node: SimulationNode, startX: number, startY: number, moved: boolean } | null} */
  let drag = null;
  /** @type {string | null} */
  let suppressClickId = null;

  function resetCamera() {
    camera = { x: 0, y: 0, k: 1 };
  }

  function resetLayout() {
    simulation?.stop();
    positions.clear();
    pan = null;
    drag = null;
    suppressClickId = null;
    resetCamera();
    restartSimulation();
  }

  function centerSelected() {
    if (!selectedId) return;
    const node = simulationNodes.get(selectedId);
    if (node?.x == null || node.y == null) return;
    camera = {
      x: width / 2 - node.x * camera.k,
      y: height / 2 - node.y * camera.k,
      k: camera.k
    };
  }

  function renderSimulation(simulationLinks) {
    renderNodes = [...simulationNodes.values()].map((node) => {
      const x = node.x ?? width / 2;
      const y = node.y ?? height / 2;
      positions.set(node.id, { x, y });
      return { ...node, x, y };
    });
    renderLinks = simulationLinks.flatMap((link) => {
      const source = typeof link.source === 'object' ? link.source : simulationNodes.get(String(link.source));
      const target = typeof link.target === 'object' ? link.target : simulationNodes.get(String(link.target));
      if (!source || !target) return [];
      return [{
        id: link.id,
        source: typeof link.source === 'object' ? link.source.id : String(link.source),
        target: typeof link.target === 'object' ? link.target.id : String(link.target),
        kind: link.kind,
        weight: link.weight,
        x1: source.x ?? width / 2,
        y1: source.y ?? height / 2,
        x2: target.x ?? width / 2,
        y2: target.y ?? height / 2
      }];
    });
  }

  function restartSimulation() {
    if (!mounted) return;
    simulation?.stop();

    const radius = Math.min(width, height) * 0.28;
    const nextNodes = nodes.map((node, index) => {
      const previous = positions.get(node.id);
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      return {
        ...node,
        x: previous?.x ?? width / 2 + Math.cos(angle) * radius,
        y: previous?.y ?? height / 2 + Math.sin(angle) * radius
      };
    });
    const nextLinks = links.map((link) => ({ ...link }));
    simulationNodes = new Map(nextNodes.map((node) => [node.id, node]));

    const linkForce = /** @type {import('d3-force').ForceLink<SimulationNode, SimulationLink>} */ (
      forceLink(nextLinks)
    )
      .id((node) => node.id)
      .distance((link) => link.kind === 'article' ? 66 : 108)
      .strength((link) => link.kind === 'article' ? 0.55 : Math.min(0.22 + link.weight * 0.08, 0.72));
    const chargeForce = /** @type {import('d3-force').ForceManyBody<SimulationNode>} */ (
      forceManyBody()
    ).strength((node) => node.type === 'category' ? -280 : node.type === 'tag' ? -170 : -75);
    const collisionForce = /** @type {import('d3-force').ForceCollide<SimulationNode>} */ (
      forceCollide()
    ).radius((node) => node.type === 'category' ? 44 : node.type === 'tag' ? 32 : 24).iterations(2);

    simulation = forceSimulation(nextNodes)
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', collisionForce)
      .alpha(1)
      .alphaDecay(0.045)
      .on('tick', () => renderSimulation(nextLinks));

    if (reducedMotion) {
      simulation.tick(180).stop();
      renderSimulation(nextLinks);
      centerSelected();
    } else {
      simulation.restart();
    }
  }

  /** @param {PointerEvent | WheelEvent} event */
  function localPoint(event) {
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width > 0 ? width / rect.width : 1;
    const scaleY = rect.height > 0 ? height / rect.height : 1;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  /** @param {PointerEvent} event */
  function startPan(event) {
    if (event.button !== 0) return;
    if (event.currentTarget instanceof Element) event.currentTarget.setPointerCapture(event.pointerId);
    pan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y
    };
  }

  /** @param {PointerEvent} event */
  function movePan(event) {
    if (!pan || pan.pointerId !== event.pointerId) return;
    camera = {
      ...camera,
      x: pan.cameraX + event.clientX - pan.startX,
      y: pan.cameraY + event.clientY - pan.startY
    };
  }

  /** @param {PointerEvent} event */
  function endPan(event) {
    if (pan?.pointerId === event.pointerId) pan = null;
  }

  /** @param {PointerEvent} event @param {RenderNode} node */
  function startNodeDrag(event, node) {
    if (event.button !== 0) return;
    event.stopPropagation();
    const target = simulationNodes.get(node.id);
    if (!target) return;
    if (event.currentTarget instanceof Element) event.currentTarget.setPointerCapture(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      node: target,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    target.fx = target.x;
    target.fy = target.y;
    simulation?.alphaTarget(0.18).restart();
  }

  /** @param {PointerEvent} event */
  function moveNodeDrag(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const point = localPoint(event);
    drag.node.fx = (point.x - camera.x) / camera.k;
    drag.node.fy = (point.y - camera.y) / camera.k;
    drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
  }

  /** @param {PointerEvent} event */
  function endNodeDrag(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const finished = drag;
    drag = null;
    finished.node.fx = null;
    finished.node.fy = null;
    simulation?.alphaTarget(0);
    if (finished.moved) {
      suppressClickId = finished.node.id;
      setTimeout(() => {
        if (suppressClickId === finished.node.id) suppressClickId = null;
      });
    }
  }

  /** @param {RenderNode} node */
  function clickNode(node) {
    if (suppressClickId === node.id) {
      suppressClickId = null;
      return;
    }
    onSelect?.(node.id);
  }

  /** @param {KeyboardEvent} event @param {RenderNode} node */
  function selectWithKeyboard(event, node) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect?.(node.id);
  }

  /** @param {WheelEvent} event */
  function zoomWithWheel(event) {
    event.preventDefault();
    const point = localPoint(event);
    const nextZoom = Math.min(2.4, Math.max(0.45, camera.k * Math.exp(-event.deltaY * 0.0012)));
    const graphX = (point.x - camera.x) / camera.k;
    const graphY = (point.y - camera.y) / camera.k;
    camera = {
      x: point.x - graphX * nextZoom,
      y: point.y - graphY * nextZoom,
      k: nextZoom
    };
  }

  /** @param {number} factor */
  function zoom(factor) {
    const nextZoom = Math.min(2.4, Math.max(0.45, camera.k * factor));
    camera = {
      x: width / 2 - ((width / 2 - camera.x) / camera.k) * nextZoom,
      y: height / 2 - ((height / 2 - camera.y) / camera.k) * nextZoom,
      k: nextZoom
    };
  }

  $effect(() => {
    nodes;
    links;
    width;
    height;
    if (mounted) restartSimulation();
  });

  $effect(() => {
    const version = focusVersion;
    const targetId = selectedId;
    if (!mounted) {
      lastFocusVersion = version;
      return;
    }
    if (targetId) requestAnimationFrame(centerSelected);
    else if (version !== lastFocusVersion) resetLayout();
    lastFocusVersion = version;
  });

  onMount(() => {
    mounted = true;
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) width = Math.round(rect.width);
      if (rect.height > 0) height = Math.round(rect.height);
    };
    measure();

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(container);
    restartSimulation();

    return () => {
      observer?.disconnect();
      simulation?.stop();
      mounted = false;
    };
  });
</script>

<div bind:this={container} class="relative h-[clamp(430px,68vh,720px)] min-h-[430px] overflow-hidden bg-paper max-[640px]:h-[58vh] max-[640px]:min-h-[380px]">
  <svg
    bind:this={svg}
    class="block h-full w-full touch-none select-none"
    viewBox={`0 0 ${width} ${height}`}
    role="group"
    aria-label="Interactive knowledge graph. Drag nodes, drag the background to pan, and use the controls to zoom."
    onpointerdown={startPan}
    onpointermove={movePan}
    onpointerup={endPan}
    onpointercancel={endPan}
    onwheel={zoomWithWheel}
  >
    <rect width={width} height={height} class="fill-paper" />
    <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.k})`}>
      <g aria-hidden="true">
        {#each renderLinks as link (link.id)}
          <line
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            class={link.kind === 'taxonomy' ? 'stroke-paper-ink-muted/40' : 'stroke-crimson-deep/45'}
            stroke-width={link.kind === 'taxonomy' ? Math.min(1 + link.weight * 0.65, 5) : 1}
            stroke-dasharray={link.kind === 'article' ? '4 4' : undefined}
            vector-effect="non-scaling-stroke"
          />
        {/each}
      </g>

      {#each renderNodes as node (node.id)}
        <g
          class="group/node cursor-grab focus:outline-none active:cursor-grabbing"
          class:opacity-60={selectedId && node.id !== selectedId}
          transform={`translate(${node.x} ${node.y})`}
          role="button"
          tabindex="0"
          aria-label={node.type === 'article'
            ? `Article ${node.label}`
            : `${node.type} ${node.label}, ${node.postCount} ${node.postCount === 1 ? 'article' : 'articles'}`}
          aria-pressed={node.id === selectedId}
          onpointerdown={(event) => startNodeDrag(event, node)}
          onpointermove={moveNodeDrag}
          onpointerup={endNodeDrag}
          onpointercancel={endNodeDrag}
          onclick={() => clickNode(node)}
          onkeydown={(event) => selectWithKeyboard(event, node)}
        >
          <title>{node.label}</title>
          <circle r="24" class="fill-transparent" />
          {#if node.id === selectedId}
            <circle r={node.type === 'category' ? 23 : 18} class="fill-none stroke-crimson-deep" stroke-width="2" vector-effect="non-scaling-stroke" />
          {/if}

          {#if node.type === 'category'}
            <rect
              x="-14"
              y="-14"
              width="28"
              height="28"
              class="fill-crimson-deep stroke-paper-ink-strong group-focus/node:stroke-crimson"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
          {:else if node.type === 'tag'}
            <rect
              x="-9"
              y="-9"
              width="18"
              height="18"
              transform="rotate(45)"
              class="fill-paper-ink-strong stroke-paper group-focus/node:stroke-crimson-deep"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
          {:else}
            <circle
              r="7"
              class="fill-paper stroke-crimson-deep group-focus/node:fill-rose"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />
          {/if}

          {#if node.type !== 'article'}
            <foreignObject
              x={node.type === 'category' ? -8 : -6}
              y={node.type === 'category' ? -8 : -6}
              width={node.type === 'category' ? 16 : 12}
              height={node.type === 'category' ? 16 : 12}
              class="pointer-events-none overflow-visible text-paper"
              data-testid="graph-node-icon"
              aria-hidden="true"
            >
              <div class="flex h-full w-full items-center justify-center leading-none">
                <PixelIcon name={node.icon} size={node.type === 'category' ? 16 : 12} />
              </div>
            </foreignObject>
          {/if}

          {#if node.type === 'category' || node.id === selectedId || renderNodes.length <= 36}
            <text
              x={node.type === 'category' ? 20 : 15}
              y="4"
              class="pointer-events-none fill-paper-ink-strong font-mono text-[10px] [paint-order:stroke] stroke-paper stroke-[3px] max-[600px]:text-[11px]"
            >{node.label}</text>
          {/if}
        </g>
      {/each}
    </g>
  </svg>

  <div class="absolute top-3 right-3 flex border border-paper-ink-strong bg-paper" aria-label="Graph zoom controls">
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-r border-paper-ink-strong text-paper-ink-strong hover:bg-paper-ink-strong hover:text-paper"
      onclick={() => zoom(1.22)}
      aria-label="Zoom in"
    ><PixelIcon name="zoom-in" size={15} /></button>
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-r border-paper-ink-strong text-paper-ink-strong hover:bg-paper-ink-strong hover:text-paper"
      onclick={() => zoom(0.82)}
      aria-label="Zoom out"
    ><PixelIcon name="zoom-out" size={15} /></button>
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-paper-ink-strong hover:bg-paper-ink-strong hover:text-paper"
      onclick={resetCamera}
      aria-label="Fit graph"
    ><PixelIcon name="target" size={15} /></button>
  </div>
</div>
