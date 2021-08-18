import React from 'react';
import { NodeProps } from 'react-flow-renderer';
import { PageHistory } from './history';
import { ModelWrapper } from './modelwrapper';
import { DataType } from '../serialize/interface/baseinterface';
import { NormalEdge, SelfLoopEdge } from '../ui/flowui/edgeUI';
import {
  ApprovalComponent,
  Datacube,
  EgateComponent,
  EndComponent,
  ProcessComponent,
  SignalCatchComponent,
  StartComponent,
  TimerComponent,
} from '../ui/flowui/nodeUI';
import { ModelType } from './editormodel';

export interface EditorState {
  dvisible: boolean; // visibility of data nodes
  edgeDeleteVisible: boolean; // visibility of the remove edge buttons
  history: PageHistory;
  modelWrapper: ModelWrapper;
}

export interface MapperState {
  dvisible: boolean; // visibility of data nodes
  history: PageHistory;
  modelWrapper: ModelWrapper;
  modelType: ModelType;
}

export interface MMELtoFlowEntry {
  flowName: string;
  component: React.FC<NodeProps>;
}

export const MMELtoFlowEntries: Record<string, MMELtoFlowEntry> = {
  [DataType.STARTEVENT]: { flowName: 'start', component: StartComponent },
  [DataType.ENDEVENT]: { flowName: 'end', component: EndComponent },
  [DataType.TIMEREVENT]: { flowName: 'timer', component: TimerComponent },
  [DataType.EGATE]: { flowName: 'egate', component: EgateComponent },
  [DataType.SIGNALCATCHEVENT]: {
    flowName: 'signal',
    component: SignalCatchComponent,
  },
  [DataType.PROCESS]: { flowName: 'process', component: ProcessComponent },
  [DataType.APPROVAL]: { flowName: 'approval', component: ApprovalComponent },
  [DataType.DATACLASS]: { flowName: 'data', component: Datacube },
  [DataType.REGISTRY]: { flowName: 'data', component: Datacube },
};

export const NodeTypes = gatherNodeTypes(MMELtoFlowEntries);

export const EdgeTypes = {
  self: SelfLoopEdge,
  normal: NormalEdge,
};

function gatherNodeTypes(
  entries: Record<number, MMELtoFlowEntry>
): Record<string, React.FC<NodeProps>> {
  const obj: Record<string, React.FC<NodeProps>> = {};
  for (const x in entries) {
    const record = entries[x];
    obj[record.flowName] = record.component;
  }
  return obj;
}