export type LayerId = 'interface' | 'agents' | 'code' | 'infra';
export type OutStyle = 'explode' | 'scan' | 'scatter' | 'undraw' | 'flicker';
export interface Part { code: string; name: string; state: string }
export interface Layer {
  id: LayerId; n: string; name: string; title: string; blurb: string;
  status: 'active' | 'reserved' | 'undocumented';
  parts: Part[]; out: OutStyle; figCaption: string; figNote: string;
}

export const LAYERS: Layer[] = [
  {
    id: 'interface', n: '01', name: 'interface', status: 'reserved', out: 'scan',
    title: 'Where people touch the system.',
    blurb: 'Front ends, bots, the surfaces that hide every layer below them.',
    parts: [
      { code: '01.a', name: 'web front ends', state: 'reserved' },
      { code: '01.b', name: 'chat surfaces', state: 'reserved' },
      { code: '01.c', name: 'dashboards', state: 'reserved' },
    ],
    figCaption: 'fig. 01 — interface, wireframe', figNote: 'dashed = not yet shipped',
  },
  {
    id: 'agents', n: '02', name: 'agents / llm', status: 'active', out: 'scatter',
    title: 'Models wired to tools, and where the wiring fails quietly.',
    blurb: 'Field notes from running agents outside a demo.',
    parts: [],
    figCaption: 'fig. 02 — agent loop, one request', figNote: '● = message in flight',
  },
  {
    id: 'code', n: '03', name: 'code', status: 'active', out: 'undraw',
    title: 'The part everyone ships and nobody measures the same way twice.',
    blurb: 'Measuring code health in the open.',
    parts: [],
    figCaption: 'fig. 03 — stackhealth, repo to score', figNote: 'dial values illustrative',
  },
  {
    id: 'infra', n: '04', name: 'infra', status: 'undocumented', out: 'flicker',
    title: 'Containers, tunnels, the box under the desk.',
    blurb: 'Plenty running here. None of it written up yet.',
    parts: [
      { code: '04.a', name: 'host', state: 'running' },
      { code: '04.b', name: 'shared db / cache', state: 'running' },
      { code: '04.c', name: 'tunnel · per-app tokens', state: 'running' },
      { code: '04.d', name: 'observability', state: 'running' },
    ],
    figCaption: 'fig. 04 — infra, request path', figNote: 'dashed = undocumented',
  },
];

export const LAYER_IDS = LAYERS.map((l) => l.id);
export function getLayer(id: LayerId): Layer {
  const l = LAYERS.find((x) => x.id === id);
  if (!l) throw new Error(`unknown layer ${id}`);
  return l;
}
