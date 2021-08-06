import { Elements } from 'react-flow-renderer';
import { MMELNode } from '../serialize/interface/baseinterface';
import { MMELModel } from '../serialize/interface/model';
import {
  MMELDataClass,
  MMELRegistry,
} from '../serialize/interface/datainterface';
import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorRegistry,
  EditorSubprocess,
  isEditorAppproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from './editormodel';
import {
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import { isDataClass, isStartEvent } from '../serialize/util/validation';
import {
  createDataLinkContainer,
  createEdgeContainer,
  createNodeContainer,
  getNodeCallBack,
} from '../ui/flowui/container';
import { fillRDCS } from '../utils/commonfunctions';

export interface ModelWrapper {
  model: EditorModel;
  page: string;
}

function exploreData(
  x: EditorRegistry,
  nodes: Record<string, EditorNode>,
  es: Map<string, MMELRegistry | MMELDataClass>,
  elms: Elements
) {
  const data = nodes[x.data];
  if (data !== undefined && isEditorDataClass(data)) {
    data.rdcs.forEach(id => {
      const e = nodes[id] as EditorDataClass;
      if (e.mother !== '') {
        const m = nodes[e.mother] as EditorRegistry;
        if (!es.has(m.id)) {
          es.set(m.id, m);
          exploreData(m, nodes, es, elms);
        }
        const ne = createDataLinkContainer(x, m);
        elms.push(ne);
      } else {
        if (!es.has(e.id)) {
          es.set(e.id, e);
        }
        const ne = createDataLinkContainer(x, e);
        elms.push(ne);
      }
    });
  }
}

function convertElms(
  elms: Record<string, MMELNode>
): Record<string, EditorNode> {
  const output: Record<string, EditorNode> = {};
  for (const x in elms) {
    const item = elms[x];
    if (isDataClass(item)) {
      const newdc: EditorDataClass = {
        ...item,
        added: false,
        pages: new Set<string>(),
        objectVersion: 'Editor',
        rdcs: new Set<string>(),
        mother: '',
      };
      output[x] = newdc;
    } else {
      output[x] = {
        ...item,
        added: false,
        pages: new Set<string>(),
        objectVersion: 'Editor',
      };
    }
  }
  return output;
}

function convertPages(
  elms: Record<string, MMELSubprocess>,
  nodes: Record<string, EditorNode>
): Record<string, EditorSubprocess> {
  const output: Record<string, EditorSubprocess> = {};
  for (const x in elms) {
    output[x] = {
      ...elms[x],
      start: findStart(elms[x].childs, nodes),
      objectVersion: 'Editor',
    };
  }
  return output;
}

function findStart(
  coms: Record<string, MMELSubprocessComponent>,
  nodes: Record<string, EditorNode>
): string {
  for (const x in coms) {
    const node = nodes[coms[x].element];
    if (isStartEvent(node)) {
      return node.id;
    }
  }
  throw new Error('Start event is not found in subprocess');
}

function resetAdded(model: EditorModel) {
  for (const x in model.elements) {
    model.elements[x].added = false;
  }
}

export function createEditorModelWrapper(m: MMELModel): ModelWrapper {
  const convertedElms = convertElms(m.elements);
  const converedPages = convertPages(m.pages, convertedElms);
  return buildStructure({
    model: { ...m, elements: convertedElms, pages: converedPages },
    page: m.root,
  });
}

function buildStructure(mw: ModelWrapper): ModelWrapper {
  const model = mw.model;
  for (const p in model.pages) {
    const page = model.pages[p];    
    for (const x in page.childs) {
      const com = page.childs[x];
      const elm = model.elements[com.element];
      elm.pages.add(page.id);
    }
  }
  for (const d in model.elements) {
    const data = model.elements[d];
    if (isEditorDataClass(data)) {
      fillRDCS(data, model.elements);
    } else if (isEditorRegistry(data)) {
      const dc = model.elements[data.data];
      if (isEditorDataClass(dc)) {
        dc.mother = data.id;
      }
    }
  }
  return mw;
}

export function getReactFlowElementsFrom(
  mw: ModelWrapper,
  dvisible: boolean,
  edgeDelete: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  removeEdge: (id: string) => void  
): Elements {
  const callback = getNodeCallBack(mw.model, onProcessClick);

  resetAdded(mw.model);
  const elms: Elements = [];
  const datas = new Map<string, EditorRegistry | EditorDataClass>();
  const page = mw.model.pages[mw.page];
  for (const x in page.childs) {
    const com = page.childs[x];
    const child = mw.model.elements[com.element];
    if (child !== undefined && !child.added) {
      const exploreDataNode = (r: string, incoming: boolean) => {
        const reg = mw.model.elements[r];
        if (isEditorRegistry(reg)) {
          if (!datas.has(reg.id)) {
            datas.set(reg.id, reg);
            exploreData(reg, mw.model.elements, datas, elms);
          }
          const ne = incoming
            ? createDataLinkContainer(reg, child)
            : createDataLinkContainer(child, reg);
          elms.push(ne);
        }
      };

      const nn = createNodeContainer(child, { x: com.x, y: com.y }, callback);
      elms.push(nn);
      child.added = true;
      if (dvisible) {
        if (isEditorProcess(child)) {
          child.input.forEach(r => exploreDataNode(r, true));
          child.output.forEach(r => exploreDataNode(r, false));
        }
        if (isEditorAppproval(child)) {
          child.records.forEach(r => exploreDataNode(r, false));
        }
      }
    }
  }
  if (dvisible) {
    for (const x in page.data) {
      const com = page.data[x];
      const elm = mw.model.elements[com.element];
      if (elm !== undefined && datas.has(elm.id)) {
        const nn = createNodeContainer(elm, { x: com.x, y: com.y }, callback);
        elms.push(nn);
        elm.added = true;
      } else {
        delete page.data[x];
      }
    }
    datas.forEach(e => {
      if (!e.added) {
        const nn = createNodeContainer(e, { x: 0, y: 0 }, callback);
        elms.push(nn);
      }
    });
  }
  for (const x in page.edges) {
    const ec = createEdgeContainer(edgeDelete, page.edges[x], removeEdge);    
    elms.push(ec);
  }
  return elms;
}